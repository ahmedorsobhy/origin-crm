-- =====================================================================
-- Cold calls: sales can upload their own sheets → any manager above them (or Admin/CEO) approves.
-- A sheet uploaded by a manager for their team is active right away, as before.
-- Safe to run more than once. Run the whole file in Supabase → SQL Editor.
-- =====================================================================

alter table public.cold_sheets add column if not exists status text not null default 'active';
alter table public.cold_sheets drop constraint if exists cold_sheets_status_check;
alter table public.cold_sheets add constraint cold_sheets_status_check check (status in ('active', 'pending', 'rejected'));
alter table public.cold_sheets add column if not exists review_note text;
alter table public.cold_sheets add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;
alter table public.cold_sheets add column if not exists reviewed_at timestamptz;
alter table public.cold_sheets add column if not exists batch_id uuid;
alter table public.cold_sheets add column if not exists batch_part int;
alter table public.cold_sheets alter column created_by set default auth.uid();

-- Can I approve / hand out sheets for this person? (Admin/CEO, or a manager anywhere above them)
create or replace function public.can_manage_cold_for(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_finance_admin()
      or (public.is_manager_role() and p_user is distinct from auth.uid() and public.is_self_or_manager_of(p_user));
$$;
grant execute on function public.can_manage_cold_for(uuid) to authenticated;

create or replace function public.cold_sheet_open(p_sheet uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select status = 'active' from public.cold_sheets where id = p_sheet), false);
$$;
create or replace function public.cold_sheet_mine_waiting(p_sheet uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.cold_sheets where id = p_sheet and assigned_to = auth.uid() and status <> 'active');
$$;
grant execute on function public.cold_sheet_open(uuid), public.cold_sheet_mine_waiting(uuid) to authenticated;

-- Sheets
drop policy if exists "add sheets" on public.cold_sheets;
drop policy if exists "edit sheets" on public.cold_sheets;
drop policy if exists "remove sheets" on public.cold_sheets;
create policy "add sheets" on public.cold_sheets for insert
  with check (public.is_approved() and (public.can_manage_cold_for(assigned_to) or assigned_to = auth.uid()));
create policy "edit sheets" on public.cold_sheets for update
  using (public.can_manage_cold_for(assigned_to) or (assigned_to = auth.uid() and status <> 'active'))
  with check (public.can_manage_cold_for(assigned_to) or assigned_to = auth.uid());
create policy "remove sheets" on public.cold_sheets for delete
  using (public.can_manage_cold_for(assigned_to) or (assigned_to = auth.uid() and status <> 'active'));

-- Only someone above the sales person can make a sheet active; any change by the sales person sends it back for approval
create or replace function public.cold_sheets_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.can_manage_cold_for(new.assigned_to) then
    if new.status is distinct from coalesce(old.status, '') and new.status in ('active', 'rejected') and tg_op = 'UPDATE' then
      new.reviewed_by := auth.uid(); new.reviewed_at := now();
    end if;
    return new;
  end if;
  if auth.uid() is not null then
    new.status := 'pending'; new.reviewed_by := null; new.reviewed_at := null; new.review_note := null;
    if tg_op = 'INSERT' then new.created_by := auth.uid(); end if;
  end if;
  return new;
end $$;
revoke execute on function public.cold_sheets_guard() from public, anon, authenticated;
drop trigger if exists trg_cold_sheets_guard on public.cold_sheets;
create trigger trg_cold_sheets_guard before insert or update on public.cold_sheets
  for each row execute function public.cold_sheets_guard();

-- Leads: the sales person can add numbers to their own waiting sheet, and can only call from approved sheets
drop policy if exists "add leads" on public.cold_leads;
drop policy if exists "work leads" on public.cold_leads;
drop policy if exists "remove leads" on public.cold_leads;
create policy "add leads" on public.cold_leads for insert
  with check (public.can_manage_cold_for(assigned_to) or (assigned_to = auth.uid() and public.cold_sheet_mine_waiting(sheet_id)));
create policy "work leads" on public.cold_leads for update
  using (public.can_manage_cold_for(assigned_to) or (assigned_to = auth.uid() and public.cold_sheet_open(sheet_id)))
  with check (public.can_manage_cold_for(assigned_to) or assigned_to = auth.uid());
create policy "remove leads" on public.cold_leads for delete
  using (public.can_manage_cold_for(assigned_to) or (assigned_to = auth.uid() and public.cold_sheet_mine_waiting(sheet_id)));

-- Phone notifications
create or replace function public.cold_sheets_notify() returns trigger
language plpgsql security definer set search_path = public as $$
declare who text; v_mgr uuid; v_guard int := 0;
begin
  if coalesce(new.batch_part, 1) <> 1 then return null; end if; -- one message per upload
  select name, manager_id into who, v_mgr from public.profiles where id = new.assigned_to;
  if new.status = 'pending' and (tg_op = 'INSERT' or old.status is distinct from 'pending') then
    -- everyone above the sales person, plus Admin/CEO
    while v_mgr is not null and v_guard < 10 loop
      insert into public.notification_queue (user_id, title, body, url)
      values (v_mgr, 'Cold-call sheet to approve 📞', coalesce(who, 'Sales') || ' uploaded “' || new.name || '”', '?open=cold:' || new.id);
      select manager_id into v_mgr from public.profiles where id = v_mgr;
      v_guard := v_guard + 1;
    end loop;
    insert into public.notification_queue (user_id, title, body, url)
    select p.id, 'Cold-call sheet to approve 📞', coalesce(who, 'Sales') || ' uploaded “' || new.name || '”', '?open=cold:' || new.id
      from public.profiles p
     where p.role in ('admin', 'ceo') and p.id <> new.assigned_to
       and not exists (select 1 from public.notification_queue q where q.user_id = p.id and q.url = '?open=cold:' || new.id);
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status and new.status in ('active', 'rejected') and old.status = 'pending' then
    insert into public.notification_queue (user_id, title, body, url)
    values (new.assigned_to,
            case when new.status = 'active' then 'Your cold-call sheet is approved ✅' else 'Your cold-call sheet was not approved' end,
            '“' || new.name || '”' || coalesce(' · ' || nullif(new.review_note, ''), ''), '?open=cold:' || new.id);
  end if;
  return null;
end $$;
revoke execute on function public.cold_sheets_notify() from public, anon, authenticated;
drop trigger if exists trg_cold_sheets_notify on public.cold_sheets;
create trigger trg_cold_sheets_notify after insert or update of status on public.cold_sheets
  for each row execute function public.cold_sheets_notify();

select 'Cold sheets approval installed ✓' as result;
