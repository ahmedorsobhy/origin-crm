-- =====================================================================
-- Integrity fix: nobody but Admin/CEO can back-date or re-credit records
--  * check-ins are stamped with the real time and the real person
--  * new clients / units are stamped "now" and credited to whoever added them (and that never changes)
--  * calls / WhatsApps / notes (client and cold) are stamped with the real time
-- Imports and fixes done by Admin/CEO (or from the SQL editor) are not affected.
-- Safe to run more than once. Run the whole file in Supabase → SQL Editor.
-- =====================================================================

create or replace function public.stamp_real_time() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_finance_admin() then return new; end if;
  if tg_table_name = 'attendance' then
    new.user_id := auth.uid(); new.checked_in_at := now();
  elsif tg_table_name = 'client_activity' then
    new.changed_by := auth.uid(); new.changed_at := now();
  elsif tg_table_name = 'cold_activity' then
    new.user_id := auth.uid(); new.created_at := now();
  elsif tg_table_name in ('clients', 'units') then
    if tg_op = 'INSERT' then
      new.created_by := auth.uid(); new.created_at := now();
    else
      new.created_by := old.created_by; new.created_at := old.created_at;
    end if;
  end if;
  return new;
end $$;
revoke execute on function public.stamp_real_time() from public, anon, authenticated;

drop trigger if exists trg_stamp_real_time on public.attendance;
create trigger trg_stamp_real_time before insert on public.attendance for each row execute function public.stamp_real_time();
drop trigger if exists trg_stamp_real_time on public.client_activity;
create trigger trg_stamp_real_time before insert on public.client_activity for each row execute function public.stamp_real_time();
drop trigger if exists trg_stamp_real_time on public.cold_activity;
create trigger trg_stamp_real_time before insert on public.cold_activity for each row execute function public.stamp_real_time();
drop trigger if exists trg_stamp_real_time on public.clients;
create trigger trg_stamp_real_time before insert or update on public.clients for each row execute function public.stamp_real_time();
drop trigger if exists trg_stamp_real_time on public.units;
create trigger trg_stamp_real_time before insert or update on public.units for each row execute function public.stamp_real_time();

-- the older author-only trigger is now covered by the one above
drop trigger if exists trg_activity_author on public.client_activity;

-- tidy: pin the search path of the last helper that didn't have one
alter function public.is_admin() set search_path = public;

select 'Integrity fix installed ✓' as result;
