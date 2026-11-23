-- =====================================================================
-- Cold calls: new results + reminders
--  * New results: phone off / busy, for sale later (with a date to call again), already sold, already with us
--  * "For sale later" numbers are never deleted with a sheet — they stay with whoever called them
--  * Phone reminders: a unit still not added a day after "Selling", and owners due to be called again
-- Safe to run more than once. Run the whole file in Supabase → SQL Editor.
-- =====================================================================

-- 1) New results
alter table public.cold_leads drop constraint if exists cold_leads_status_check;
alter table public.cold_leads add constraint cold_leads_status_check
  check (status in ('new', 'no_answer', 'off_busy', 'call_later', 'not_selling', 'dnc', 'wrong', 'selling', 'later', 'sold', 'with_us'));
alter table public.cold_leads add column if not exists note text;

-- Which numbers a move / delete choice covers ("later" numbers are kept when deleting)
create or replace function public.cold_mode_match(p_status text, p_mode text) returns boolean
language sql immutable as $$
  select case p_mode
    when 'all' then p_status <> 'selling'
    when 'everything' then p_status <> 'later'
    when 'new' then p_status = 'new'
    when 'retry' then p_status in ('no_answer', 'off_busy', 'call_later', 'not_selling')
    when 'called' then p_status not in ('new', 'later')
    else false end;
$$;

-- 2) Reminders (every 15 minutes, 9:00–21:00 Cairo). Each one is sent once.
create or replace function public.cold_reminders() returns int
language plpgsql security definer set search_path = public as $$
declare r record; v_n int := 0; v_now timestamp := now() at time zone 'Africa/Cairo'; v_key text;
begin
  if extract(hour from v_now) < 9 or extract(hour from v_now) >= 21 then return 0; end if;
  -- a) said "Selling" more than a day ago and the unit is still not in the CRM → once a day
  for r in select l.id, l.assigned_to, l.owner_name, l.phone, l.project_name
             from public.cold_leads l
            where l.status = 'selling' and l.unit_pending and l.unit_id is null
              and coalesce(l.last_contact_at, l.updated_at) < now() - interval '1 day'
  loop
    v_key := 'cold-unit:' || r.id || ':' || to_char(v_now, 'YYYY-MM-DD');
    insert into public.notification_log (user_id, key) values (r.assigned_to, v_key) on conflict do nothing;
    if found then
      insert into public.notification_queue (user_id, title, body, url)
      values (r.assigned_to, 'Unit not added yet 🏠',
              coalesce(nullif(r.owner_name, ''), r.phone) || coalesce(' · ' || nullif(r.project_name, ''), '') || ' said they''re selling — add the unit when you have the details',
              '?open=cold');
      v_n := v_n + 1;
    end if;
  end loop;
  -- b) "For sale later" / "Call back later" whose day has come
  for r in select l.id, l.assigned_to, l.owner_name, l.phone, l.project_name, l.status, l.callback_at, l.note
             from public.cold_leads l
            where l.status in ('later', 'call_later') and l.callback_at <= now() and l.callback_at > now() - interval '3 days'
  loop
    v_key := 'cold-again:' || r.id || ':' || r.callback_at;
    insert into public.notification_log (user_id, key) values (r.assigned_to, v_key) on conflict do nothing;
    if found then
      insert into public.notification_queue (user_id, title, body, url)
      values (r.assigned_to,
              case when r.status = 'later' then 'Time to call again 📅' else 'Call back now 📞' end,
              coalesce(nullif(r.owner_name, ''), r.phone) || coalesce(' · ' || nullif(r.project_name, ''), '')
                || case when r.status = 'later' then ' — said they''d sell later' else '' end || coalesce(' · ' || nullif(r.note, ''), ''),
              '?open=cold');
      v_n := v_n + 1;
    end if;
  end loop;
  return v_n;
end $$;
revoke execute on function public.cold_reminders() from public, anon, authenticated;

do $$
begin
  perform cron.unschedule(jobid) from cron.job where jobname = 'origin-cold-reminders';
  perform cron.schedule('origin-cold-reminders', '*/15 * * * *', 'select public.cold_reminders();');
exception when others then
  raise notice 'pg_cron not available here: %', sqlerrm;
end $$;

-- 3) Settings page: the CEO manages users and developers / projects too (like the admin)
create or replace function public.prevent_role_escalation() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_finance_admin() then return new; end if;   -- SQL editor / admin / CEO
  if tg_op = 'INSERT' then
    new.role := 'pending'; new.manager_id := null;
    return new;
  end if;
  if new.role is distinct from old.role or new.manager_id is distinct from old.manager_id then
    raise exception 'Only Admin / CEO can change role or manager';
  end if;
  return new;
end; $$;
revoke execute on function public.prevent_role_escalation() from public, anon, authenticated;

drop policy if exists "admin update profiles" on public.profiles;
drop policy if exists "admin delete profiles" on public.profiles;
create policy "admin update profiles" on public.profiles for update using (public.is_finance_admin());
create policy "admin delete profiles" on public.profiles for delete using (public.is_finance_admin());
drop policy if exists "admin write developers" on public.developers;
drop policy if exists "admin update developers" on public.developers;
drop policy if exists "admin delete developers" on public.developers;
create policy "admin write developers" on public.developers for insert with check (public.is_finance_admin());
create policy "admin update developers" on public.developers for update using (public.is_finance_admin());
create policy "admin delete developers" on public.developers for delete using (public.is_finance_admin());
drop policy if exists "admin write projects" on public.projects;
drop policy if exists "admin update projects" on public.projects;
drop policy if exists "admin delete projects" on public.projects;
create policy "admin write projects" on public.projects for insert with check (public.is_finance_admin());
create policy "admin update projects" on public.projects for update using (public.is_finance_admin());
create policy "admin delete projects" on public.projects for delete using (public.is_finance_admin());

select 'Cold results + reminders + settings installed ✓' as result;
