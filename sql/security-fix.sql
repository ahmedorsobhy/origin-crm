-- =====================================================================
-- Security fix — run once in Supabase → SQL Editor (safe to run again)
-- 1) A new sign-up could create his own profile already as admin/CEO
-- 2) Internal finance helpers could be called directly from the API
--    (fake Floos Rabna transfers, re-freezing a deal's commission %)
-- 3) Not-yet-approved accounts could submit deals / read settings
-- =====================================================================

-- 1) New profiles always start as "pending" with no manager --------------
drop policy if exists "self insert profile" on public.profiles;
create policy "self insert profile" on public.profiles for insert
  with check (auth.uid() = id and role = 'pending' and manager_id is null);

create or replace function public.prevent_role_escalation() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_admin() then return new; end if;   -- SQL editor / admins
  if tg_op = 'INSERT' then
    new.role := 'pending'; new.manager_id := null;
    return new;
  end if;
  if new.role is distinct from old.role or new.manager_id is distinct from old.manager_id then
    raise exception 'Only admins can change role or manager';
  end if;
  return new;
end; $$;
drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
  before insert or update on public.profiles
  for each row execute function public.prevent_role_escalation();
alter table public.profiles enable trigger trg_prevent_role_escalation;

-- 2) Internal helpers: only callable from inside the database -----------
revoke execute on function public.charity_for_collection(public.finance_transactions) from public, anon, authenticated;
revoke execute on function public.freeze_deal_rates(uuid)  from public, anon, authenticated;
revoke execute on function public.check_deal_teams(uuid)   from public, anon, authenticated;
revoke execute on function public.charity_trg()            from public, anon, authenticated;
revoke execute on function public.finance_audit_trg()      from public, anon, authenticated;
revoke execute on function public.deals_guard()            from public, anon, authenticated;
revoke execute on function public.prevent_role_escalation() from public, anon, authenticated;

-- Actions need a signed-in user (they also check Admin/CEO inside)
revoke execute on function public.approve_deal(uuid, uuid, timestamptz, boolean, numeric, numeric, date) from public, anon;
revoke execute on function public.complete_deal(uuid, uuid, numeric, numeric, timestamptz, date)        from public, anon;
revoke execute on function public.cancel_deal(uuid, text)  from public, anon;
revoke execute on function public.phone_owners(text[])     from public, anon;
grant  execute on function public.approve_deal(uuid, uuid, timestamptz, boolean, numeric, numeric, date) to authenticated;
grant  execute on function public.complete_deal(uuid, uuid, numeric, numeric, timestamptz, date)        to authenticated;
grant  execute on function public.cancel_deal(uuid, text)  to authenticated;
grant  execute on function public.phone_owners(text[])     to authenticated;

-- 3) Only approved team members can submit deals or check in -------------
drop policy if exists "insert" on public.deals;
create policy "insert" on public.deals for insert with check (public.is_approved());
drop policy if exists "read" on public.finance_settings;
create policy "read" on public.finance_settings for select using (public.is_approved());
drop policy if exists "self insert attendance" on public.attendance;
create policy "self insert attendance" on public.attendance for insert
  with check (public.is_approved() and user_id = auth.uid());

-- ---------------------------------------------------------------------
-- CHECK: every line below must say OK
-- ---------------------------------------------------------------------
select check_name, case when ok then 'OK' else '*** PROBLEM ***' end as result from (
  select 'Row security ON for every table' as check_name,
         not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
                     where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity) as ok
  union all
  select 'Role guard trigger is ON',
         exists (select 1 from pg_trigger where tgname = 'trg_prevent_role_escalation' and tgenabled <> 'D')
  union all
  select 'Deals guard trigger is ON',
         exists (select 1 from pg_trigger where tgname = 'trg_deals_guard' and tgenabled <> 'D')
  union all
  select 'Internal finance helpers not callable from the site',
         not has_function_privilege('authenticated', 'public.charity_for_collection(public.finance_transactions)', 'execute')
     and not has_function_privilege('anon', 'public.charity_for_collection(public.finance_transactions)', 'execute')
     and not has_function_privilege('authenticated', 'public.freeze_deal_rates(uuid)', 'execute')
  union all
  select 'Salaries / accounts / expenses readable by Admin & CEO only',
         (select bool_and(qual like '%is_finance_admin()%') from pg_policies
          where schemaname = 'public' and cmd = 'SELECT'
            and tablename in ('finance_accounts', 'expense_categories', 'recurring_expenses', 'finance_audit'))
  union all
  select 'New sign-ups start as pending',
         exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'self insert profile' and with_check like '%pending%')
  union all
  select 'No pending account was promoted (check the list of admins/CEOs below)', true
) x;

-- Who has full finance access right now — make sure you know every name:
select name, role, created_at from public.profiles where role in ('admin', 'ceo') order by created_at;
