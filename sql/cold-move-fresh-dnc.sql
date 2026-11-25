-- 1) Moving numbers to another sales person: they arrive NEW (no feedback, 0 tries, no callback, no note),
--    like nobody called them. Calls and feedback already made stay counted for whoever made them.
--    "All numbers" moves everything except Selling and Don't call again.
-- 2) Don't call again list: once a number is marked Don't call again it stays on the list for good
--    (even if the sheet is deleted or the number moved). The app warns on uploads and on the number itself.
-- Safe to run more than once.

-- ---------- Don't call again list ----------
create table if not exists public.cold_dnc (
  phone_key  text primary key,                 -- last 10 digits, so 010…, +2010… and 2010… match
  phone      text,
  marked_by  uuid references public.profiles(id) on delete set null,
  marked_at  timestamptz not null default now()
);
alter table public.cold_dnc enable row level security;
revoke all on public.cold_dnc from anon;
grant select, delete on public.cold_dnc to authenticated;
drop policy if exists "read dnc" on public.cold_dnc;
create policy "read dnc" on public.cold_dnc for select using (public.is_approved());
drop policy if exists "admin remove dnc" on public.cold_dnc;
create policy "admin remove dnc" on public.cold_dnc for delete using (public.is_finance_admin());

create or replace function public.phone_key(p text) returns text
language sql immutable as $$ select nullif(right(regexp_replace(coalesce(p, ''), '\D', '', 'g'), 10), '') $$;

create or replace function public.cold_mark_dnc() returns trigger
language plpgsql security definer set search_path = public as $$
declare x text;
begin
  if new.status = 'dnc' and (tg_op = 'INSERT' or old.status is distinct from 'dnc') then
    foreach x in array (array[new.phone] || coalesce(new.other_phones, '{}'::text[])) loop
      if public.phone_key(x) is not null then
        insert into public.cold_dnc (phone_key, phone, marked_by, marked_at)
        values (public.phone_key(x), x, coalesce(auth.uid(), new.assigned_to), now())
        on conflict (phone_key) do nothing;
      end if;
    end loop;
  end if;
  return new;
end $$;
drop trigger if exists trg_cold_mark_dnc on public.cold_leads;
create trigger trg_cold_mark_dnc after insert or update of status on public.cold_leads
  for each row execute function public.cold_mark_dnc();

-- fill the list with everything marked so far
insert into public.cold_dnc (phone_key, phone, marked_by, marked_at)
select distinct on (public.phone_key(l.phone)) public.phone_key(l.phone), l.phone,
       coalesce(a.user_id, l.assigned_to), coalesce(a.created_at, l.updated_at)
from public.cold_leads l
left join lateral (select user_id, created_at from public.cold_activity x
                   where x.lead_id = l.id and x.action = 'outcome' and x.value = 'dnc' order by created_at desc limit 1) a on true
where l.status = 'dnc' and public.phone_key(l.phone) is not null
order by public.phone_key(l.phone), coalesce(a.created_at, l.updated_at)
on conflict (phone_key) do nothing;
-- numbers whose sheet was deleted but whose phone was saved on the feedback
insert into public.cold_dnc (phone_key, phone, marked_by, marked_at)
select distinct on (public.phone_key(a.phone)) public.phone_key(a.phone), a.phone, a.user_id, a.created_at
from public.cold_activity a
where a.action = 'outcome' and a.value = 'dnc' and public.phone_key(a.phone) is not null
order by public.phone_key(a.phone), a.created_at
on conflict (phone_key) do nothing;

-- uploads: tell the app which numbers are on the list
create or replace function public.known_phones(p_phones text[]) returns table (phone_key text, kind text)
language sql stable security definer set search_path = public as $$
  with k as (select distinct right(regexp_replace(x, '\D', '', 'g'), 10) as key from unnest(p_phones) x)
  select k.key, 'dnc' from k where public.is_approved() and exists (select 1 from public.cold_dnc d where d.phone_key = k.key)
  union
  select k.key, 'client' from k where public.is_approved() and exists (select 1 from public.clients c where right(regexp_replace(c.phone, '\D', '', 'g'), 10) = k.key)
  union
  select k.key, 'owner' from k where public.is_approved() and exists (select 1 from public.unit_owners u where right(regexp_replace(coalesce(u.owner_number, ''), '\D', '', 'g'), 10) = k.key)
  union
  select k.key, 'cold' from k where public.is_approved() and exists (select 1 from public.cold_leads l where right(regexp_replace(l.phone, '\D', '', 'g'), 10) = k.key);
$$;
revoke execute on function public.known_phones(text[]) from public, anon;
grant execute on function public.known_phones(text[]) to authenticated;

-- ---------- Move: numbers arrive new ----------
create or replace function public.cold_mode_match(p_status text, p_mode text) returns boolean
language sql immutable as $$
  select case p_mode
    when 'all' then p_status not in ('selling', 'dnc')
    when 'everything' then p_status <> 'later'
    when 'new' then p_status = 'new'
    when 'retry' then p_status in ('no_answer', 'off_busy', 'call_later', 'not_selling')
    when 'called' then p_status not in ('new', 'later')
    else false end;
$$;

create or replace function public.cold_move_leads(p_sheet uuid, p_to uuid, p_mode text, p_count int default null, p_due date default null)
returns int language plpgsql security definer set search_path = public as $$
declare s public.cold_sheets; v_new uuid; v_n int; v_from text;
begin
  select * into s from public.cold_sheets where id = p_sheet;
  if not found then raise exception 'Sheet not found'; end if;
  if not public.can_handle_cold_sheet(p_sheet) then raise exception 'You can''t move numbers from this sheet'; end if;
  if p_to is null or not public.can_manage_cold_for(p_to) then raise exception 'You can only move numbers to someone in your team'; end if;
  if p_mode not in ('all', 'new', 'retry') then raise exception 'Unknown choice'; end if;
  select name into v_from from public.profiles where id = s.assigned_to;
  insert into public.cold_sheets (name, assigned_to, due_date, created_by, status)
  values (s.name || ' (from ' || coalesce(v_from, '—') || ')', p_to, coalesce(p_due, greatest(s.due_date, current_date)), auth.uid(), 'active')
  returning id into v_new;
  with pick as (
    select id from public.cold_leads where sheet_id = p_sheet and public.cold_mode_match(status, p_mode)
    order by position limit coalesce(nullif(p_count, 0), 1000000)
  )
  update public.cold_leads l
     set sheet_id = v_new, assigned_to = p_to,
         status = 'new', attempts = 0, callback_at = null, note = null,
         unit_pending = false, unit_id = null, last_contact_at = null, updated_at = now()
    from pick where l.id = pick.id;
  get diagnostics v_n = row_count;
  if v_n = 0 then delete from public.cold_sheets where id = v_new; raise exception 'No numbers match that choice'; end if;
  delete from public.cold_sheets x where x.id = p_sheet and not exists (select 1 from public.cold_leads where sheet_id = p_sheet);
  insert into public.notification_queue (user_id, title, body, url)
  values (p_to, 'New cold-call numbers for you 📞', v_n || ' numbers · ' || s.name, '?open=cold:' || v_new);
  return v_n;
end $$;
revoke execute on function public.cold_move_leads(uuid, uuid, text, int, date) from public, anon;
grant execute on function public.cold_move_leads(uuid, uuid, text, int, date) to authenticated;

select 'Moved numbers arrive new + Don''t call again list ✓' as result;
