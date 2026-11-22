-- =====================================================================
-- Cold sheets: move / split / delete numbers, without touching anyone's history
--  * Calls, WhatsApps and outcomes already made stay counted for the person who made them
--    (cold_activity no longer disappears when numbers are deleted).
--  * Units that came out of cold calls are untouched (they belong to whoever added them).
-- Safe to run more than once. Run the whole file in Supabase → SQL Editor.
-- =====================================================================

-- 1) Keep the history when numbers are deleted
alter table public.cold_activity alter column lead_id drop not null;
alter table public.cold_activity drop constraint if exists cold_activity_lead_id_fkey;
alter table public.cold_activity add constraint cold_activity_lead_id_fkey
  foreign key (lead_id) references public.cold_leads(id) on delete set null;
-- history rows whose number is gone stay visible to the person and their managers
create or replace function public.can_see_cold_activity(p_lead uuid, p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select case when p_lead is null then public.is_finance_admin() or public.is_self_or_manager_of(p_user)
              else public.can_see_cold_lead(p_lead) end;
$$;
grant execute on function public.can_see_cold_activity(uuid, uuid) to authenticated;
drop policy if exists "read cold activity" on public.cold_activity;
create policy "read cold activity" on public.cold_activity for select using (public.can_see_cold_activity(lead_id, user_id));

-- Who may move or delete numbers on a sheet: someone above the person, or a team leader / manager on their own sheet
create or replace function public.can_handle_cold_sheet(p_sheet uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.cold_sheets s where s.id = p_sheet
                  and (public.can_manage_cold_for(s.assigned_to) or (s.assigned_to = auth.uid() and public.is_manager_role())));
$$;
grant execute on function public.can_handle_cold_sheet(uuid) to authenticated;

-- Which numbers a choice covers
--   all   = every number except owners who said they're selling (those stay with whoever found them)
--   new   = numbers nobody called yet
--   retry = called but no deal: no answer, call later, not selling  (they go back to "to call")
--   called = every number that was called (for delete)
create or replace function public.cold_mode_match(p_status text, p_mode text) returns boolean
language sql immutable as $$
  select case p_mode
    when 'all' then p_status <> 'selling'
    when 'everything' then true
    when 'new' then p_status = 'new'
    when 'retry' then p_status in ('no_answer', 'call_later', 'not_selling')
    when 'called' then p_status <> 'new'
    else false end;
$$;

-- 2) Move (or split) numbers to someone else → they get their own sheet
create or replace function public.cold_move_leads(p_sheet uuid, p_to uuid, p_mode text, p_count int default null, p_due date default null)
returns int language plpgsql security definer set search_path = public as $$
declare s public.cold_sheets; v_new uuid; v_n int; v_from text; v_to text;
begin
  select * into s from public.cold_sheets where id = p_sheet;
  if not found then raise exception 'Sheet not found'; end if;
  if not public.can_handle_cold_sheet(p_sheet) then raise exception 'You can''t move numbers from this sheet'; end if;
  if p_to is null or not public.can_manage_cold_for(p_to) then raise exception 'You can only move numbers to someone in your team'; end if;
  if p_mode not in ('all', 'new', 'retry') then raise exception 'Unknown choice'; end if;
  select name into v_from from public.profiles where id = s.assigned_to;
  select name into v_to from public.profiles where id = p_to;
  insert into public.cold_sheets (name, assigned_to, due_date, created_by, status)
  values (s.name || ' (from ' || coalesce(v_from, '—') || ')', p_to, coalesce(p_due, greatest(s.due_date, current_date)), auth.uid(), 'active')
  returning id into v_new;
  with pick as (
    select id from public.cold_leads where sheet_id = p_sheet and public.cold_mode_match(status, p_mode)
    order by position limit coalesce(nullif(p_count, 0), 1000000)
  )
  update public.cold_leads l
     set sheet_id = v_new, assigned_to = p_to,
         status = case when p_mode = 'retry' then 'new' else l.status end,
         attempts = case when p_mode = 'retry' then 0 else l.attempts end,
         callback_at = case when p_mode = 'retry' then null else l.callback_at end
    from pick where l.id = pick.id;
  get diagnostics v_n = row_count;
  if v_n = 0 then delete from public.cold_sheets where id = v_new; raise exception 'No numbers match that choice'; end if;
  -- a sheet left with no numbers goes away
  delete from public.cold_sheets x where x.id = p_sheet and not exists (select 1 from public.cold_leads where sheet_id = p_sheet);
  insert into public.notification_queue (user_id, title, body, url)
  values (p_to, 'New cold-call numbers for you 📞', v_n || ' numbers · ' || s.name, '?open=cold:' || v_new);
  return v_n;
end $$;
revoke execute on function public.cold_move_leads(uuid, uuid, text, int, date) from public, anon;
grant execute on function public.cold_move_leads(uuid, uuid, text, int, date) to authenticated;

-- 3) Delete numbers (or the whole sheet); history and units stay
create or replace function public.cold_delete_leads(p_sheet uuid, p_mode text)
returns int language plpgsql security definer set search_path = public as $$
declare v_n int;
begin
  if not (public.can_handle_cold_sheet(p_sheet)
          or exists (select 1 from public.cold_sheets where id = p_sheet and assigned_to = auth.uid() and status <> 'active')) then
    raise exception 'You can''t delete numbers from this sheet';
  end if;
  if p_mode not in ('everything', 'new', 'called') then raise exception 'Unknown choice'; end if;
  delete from public.cold_leads where sheet_id = p_sheet and public.cold_mode_match(status, p_mode);
  get diagnostics v_n = row_count;
  delete from public.cold_sheets x where x.id = p_sheet and not exists (select 1 from public.cold_leads where sheet_id = p_sheet);
  return v_n;
end $$;
revoke execute on function public.cold_delete_leads(uuid, text) from public, anon;
grant execute on function public.cold_delete_leads(uuid, text) to authenticated;

select 'Cold sheet move / delete installed ✓' as result;
