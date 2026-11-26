-- 1) Guest (demo) role: for people outside the company you want to show the system to.
--    On the server a guest is exactly like a pending account: it can read and change NOTHING except its own name.
--    In the app it opens a demo with sample data (all in the browser; nothing is saved).
-- 2) Don't call again list: the phone numbers are only readable by admin/CEO, by managers for their team,
--    and by a sales person for numbers that are in their own sheets.
-- Safe to run more than once.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('pending', 'guest', 'admin', 'ceo', 'sales_manager', 'team_leader', 'sales_agent'));

create or replace function public.is_approved() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role not in ('pending', 'guest'));
$$;

create or replace function public.is_manager_role() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role not in ('pending', 'guest', 'sales_agent'));
$$;

-- ---------- Don't call again: who can read the numbers ----------
create index if not exists cold_leads_phone_key_idx on public.cold_leads (public.phone_key(phone));

drop policy if exists "read dnc" on public.cold_dnc;
create policy "read dnc" on public.cold_dnc for select using (
  public.is_finance_admin()
  or exists (select 1 from public.cold_leads l               -- cold_leads' own row security applies here,
             where public.phone_key(l.phone) = cold_dnc.phone_key)  -- so each person only matches numbers they can see
);

select 'Guest (demo) role + Don''t call again list locked down ✓' as result;
