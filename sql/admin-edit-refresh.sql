-- =====================================================================
-- Admin edit + managers' sheets + owner WhatsApp messages
--  1) A sheet a manager uploads (for himself or his team) is active right away
--  2) Owner "is the unit still available?" messages (Arabic + English), editable in Settings
--  3) Admin / CEO edits a live deal → new people get their rate chain, hand-adjusted rates are kept
--  4) Admin / CEO edits a commission collected → Floos Rabna follows the new amount / date / account
--  5) Admin / CEO can fix check-ins (add / change / remove)
-- Safe to run more than once. Run the whole file in Supabase → SQL Editor.
-- =====================================================================

-- 1) Managers (team leader / sales manager) handle their own sheets too — no approval needed
create or replace function public.can_manage_cold_for(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_finance_admin()
      or (public.is_manager_role() and public.is_self_or_manager_of(p_user));
$$;
grant execute on function public.can_manage_cold_for(uuid) to authenticated;

-- 2) Owner WhatsApp messages
alter table public.finance_settings add column if not exists wa_owner_ar text;
alter table public.finance_settings add column if not exists wa_owner_en text;

-- 3) Keep the rate chains right after Admin / CEO changes the people on a reserved / done deal
create or replace function public.admin_sync_deal_rates(p_deal uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_zero numeric[];
begin
  if not public.is_finance_admin() then raise exception 'Only Admin / CEO can do this'; end if;
  if not exists (select 1 from public.deals where id = p_deal and status in ('reserved', 'approved')) then return; end if;
  select array_fill(0::numeric, array[coalesce(array_length(tier_thresholds, 1), 1)])
    into v_zero from public.finance_settings where id = 1;
  -- people no longer on the deal
  delete from public.deal_rates r
   where r.deal_id = p_deal
     and not exists (select 1 from public.deal_agents a where a.deal_id = p_deal and a.agent_id = r.agent_id);
  -- people newly added: same chain as when a deal is approved
  insert into public.deal_rates (deal_id, agent_id, beneficiary_id, level, rates)
  with recursive chain as (
    select da.agent_id, p.id as person_id, p.manager_id, 0 as lvl
    from (select distinct a.agent_id from public.deal_agents a
           where a.deal_id = p_deal
             and not exists (select 1 from public.deal_rates r where r.deal_id = p_deal and r.agent_id = a.agent_id)) da
    join public.profiles p on p.id = da.agent_id
    union all
    select c.agent_id, p.id, p.manager_id, c.lvl + 1
    from chain c join public.profiles p on p.id = c.manager_id
    where c.lvl < 20
  )
  select p_deal, c.agent_id, c.person_id, min(c.lvl),
         coalesce((select cr.rates from public.commission_rates cr
                   where cr.seller_id = c.agent_id and cr.beneficiary_id = c.person_id), v_zero)
  from chain c group by c.agent_id, c.person_id;
end $$;
revoke execute on function public.admin_sync_deal_rates(uuid) from public, anon;
grant execute on function public.admin_sync_deal_rates(uuid) to authenticated;

-- 4) Floos Rabna follows an edited collection
create or replace function public.charity_follow_edit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.kind <> 'commission_in' and old.kind <> 'commission_in' then return null; end if;
  if new.kind = old.kind and new.amount = old.amount and new.account_id is not distinct from old.account_id
     and new.occurred_at = old.occurred_at and new.deal_id is not distinct from old.deal_id then
    return null;
  end if;
  delete from public.finance_transactions where source_tx_id = new.id;
  if new.kind = 'commission_in'
     and (new.deal_id is null or exists (select 1 from public.deals d where d.id = new.deal_id and d.status = 'approved')) then
    perform public.charity_for_collection(new);
  end if;
  return null;
end $$;
revoke execute on function public.charity_follow_edit() from public, anon, authenticated;
drop trigger if exists trg_charity_follow_edit on public.finance_transactions;
create trigger trg_charity_follow_edit after update on public.finance_transactions
  for each row execute function public.charity_follow_edit();

-- 5) Admin / CEO fix check-ins
drop policy if exists "admin insert attendance" on public.attendance;
drop policy if exists "admin update attendance" on public.attendance;
drop policy if exists "admin delete attendance" on public.attendance;
create policy "admin insert attendance" on public.attendance for insert with check (public.is_finance_admin());
create policy "admin update attendance" on public.attendance for update using (public.is_finance_admin()) with check (public.is_finance_admin());
create policy "admin delete attendance" on public.attendance for delete using (public.is_finance_admin());

select 'Admin edit + managers'' sheets + owner messages installed ✓' as result;
