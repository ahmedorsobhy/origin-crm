-- =====================================================================
-- Deal stages: Reserved (promise of sale / وعد بيع) -> Done deal.
--   * A reserved deal has no money: it doesn't count toward targets and
--     earns no commission. The unit goes on hold and the client moves to
--     "Contracted".
--   * Marking it Done records the collected commission, the transfer
--     (تنازل) date, sells the unit and moves the client to "Deal Is Done".
--     Only Done deals count toward targets, commissions and the treasury.
-- Run once in Supabase SQL Editor. Safe to re-run.
-- =====================================================================
alter table public.deals drop constraint if exists deals_status_check;
alter table public.deals add constraint deals_status_check
  check (status in ('pending','returned','reserved','approved','rejected','cancelled'));
alter table public.deals add column if not exists transfer_date date;

-- Edit protection for deals. Requests from the site always carry a logged-in
-- user; no user means the SQL editor / server side, which is trusted.
create or replace function public.deals_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if public.is_finance_admin() or auth.uid() is null then return new; end if;
  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.created_by := auth.uid();
    new.reviewed_by := null; new.reviewed_at := null; new.review_note := null;
    return new;
  end if;
  if old.created_by is distinct from auth.uid() or old.status not in ('pending','returned') then
    raise exception 'This deal can no longer be edited';
  end if;
  new.status := 'pending';
  new.created_by := old.created_by;
  new.reviewed_by := old.reviewed_by;
  new.reviewed_at := old.reviewed_at;
  new.review_note := old.review_note;
  return new;
end;
$$;

-- Freeze each agent's chain (seller -> managers) for a deal
create or replace function public.freeze_deal_rates(p_deal uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_zero numeric[];
begin
  select array_fill(0::numeric, array[coalesce(array_length(tier_thresholds, 1), 1)])
    into v_zero from public.finance_settings where id = 1;
  delete from public.deal_rates where deal_id = p_deal;
  insert into public.deal_rates (deal_id, agent_id, beneficiary_id, level, rates)
  with recursive chain as (
    select da.agent_id, p.id as person_id, p.manager_id, 0 as lvl
    from public.deal_agents da join public.profiles p on p.id = da.agent_id
    where da.deal_id = p_deal
    union all
    select c.agent_id, p.id, p.manager_id, c.lvl + 1
    from chain c join public.profiles p on p.id = c.manager_id
    where c.lvl < 20
  )
  select p_deal, c.agent_id, c.person_id, min(c.lvl),
         coalesce((select cr.rates from public.commission_rates cr
                   where cr.seller_id = c.agent_id and cr.beneficiary_id = c.person_id), v_zero)
  from chain c group by c.agent_id, c.person_id;
end;
$$;

-- Done: money collected + transfer done
create or replace function public.complete_deal(
  p_deal uuid, p_account uuid, p_amount numeric, p_collected_at timestamptz default now(), p_transfer_date date default null
) returns void
language plpgsql security definer set search_path = public as $$
declare d public.deals; v_old_stage text;
begin
  if not public.is_finance_admin() then raise exception 'Only Admin / CEO can close deals'; end if;
  select * into d from public.deals where id = p_deal for update;
  if not found then raise exception 'Deal not found'; end if;
  if d.status not in ('reserved','pending','returned') then raise exception 'This deal is not open'; end if;
  if coalesce(p_amount, 0) > 0 and p_account is null then raise exception 'Choose the account that received the money'; end if;
  if d.status <> 'reserved' then
    if (select coalesce(sum(split_pct), 0) from public.deal_agents where deal_id = p_deal) <> 100 then
      raise exception 'Agent shares must add up to 100%%';
    end if;
    perform public.freeze_deal_rates(p_deal);
  end if;
  update public.deals
     set status = 'approved', commission_collected = coalesce(p_amount, 0),
         transfer_date = coalesce(p_transfer_date, (coalesce(p_collected_at, now()) at time zone 'Africa/Cairo')::date),
         reviewed_by = auth.uid(), reviewed_at = now(), review_note = null
   where id = p_deal;
  if coalesce(p_amount, 0) > 0 then
    insert into public.finance_transactions (kind, direction, amount, account_id, occurred_at, deal_id, description)
    values ('commission_in', 'in', p_amount, p_account, coalesce(p_collected_at, now()), p_deal, 'Commission collected');
  end if;
  if d.unit_id is not null then
    update public.units set status = 'sold', hold_reason = null where id = d.unit_id;
  end if;
  if d.client_id is not null then
    select stage into v_old_stage from public.clients where id = d.client_id;
    if v_old_stage is distinct from 'deal_done' then
      update public.clients set previous_stage = stage, stage = 'deal_done' where id = d.client_id;
      insert into public.client_activity (client_id, action, field_name, old_value, new_value, note, changed_by)
      values (d.client_id, 'stage_change', 'stage', v_old_stage, 'deal_done', 'Deal done (transfer + commission)', auth.uid());
    end if;
  end if;
end;
$$;

-- Approve what sales submitted: as a reservation (default) or straight to Done
drop function if exists public.approve_deal(uuid, uuid, timestamptz);
create or replace function public.approve_deal(
  p_deal uuid, p_account uuid default null, p_collected_at timestamptz default now(),
  p_as_done boolean default false, p_amount numeric default null, p_transfer_date date default null
) returns void
language plpgsql security definer set search_path = public as $$
declare d public.deals; v_old_stage text;
begin
  if not public.is_finance_admin() then raise exception 'Only Admin / CEO can approve deals'; end if;
  select * into d from public.deals where id = p_deal for update;
  if not found then raise exception 'Deal not found'; end if;
  if d.status not in ('pending','returned') then raise exception 'Deal is not waiting for approval'; end if;
  if (select coalesce(sum(split_pct), 0) from public.deal_agents where deal_id = p_deal) <> 100 then
    raise exception 'Agent shares must add up to 100%%';
  end if;
  perform public.freeze_deal_rates(p_deal);
  if p_as_done then
    update public.deals set status = 'reserved' where id = p_deal;
    perform public.complete_deal(p_deal, p_account, coalesce(p_amount, d.commission_total), p_collected_at, p_transfer_date);
    return;
  end if;
  update public.deals set status = 'reserved', commission_collected = 0,
         reviewed_by = auth.uid(), reviewed_at = now(), review_note = null where id = p_deal;
  if d.unit_id is not null then
    update public.units set status = 'hold', hold_reason = 'Reserved — promise of sale' where id = d.unit_id and status = 'active';
  end if;
  if d.client_id is not null then
    select stage into v_old_stage from public.clients where id = d.client_id;
    if v_old_stage not in ('contracted','deal_done') then
      update public.clients set previous_stage = stage, stage = 'contracted' where id = d.client_id;
      insert into public.client_activity (client_id, action, field_name, old_value, new_value, note, changed_by)
      values (d.client_id, 'stage_change', 'stage', v_old_stage, 'contracted', 'Promise of sale (deal reserved)', auth.uid());
    end if;
  end if;
end;
$$;

create or replace function public.cancel_deal(p_deal uuid, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
declare d public.deals;
begin
  if not public.is_finance_admin() then raise exception 'Only Admin / CEO can cancel deals'; end if;
  select * into d from public.deals where id = p_deal for update;
  if not found then raise exception 'Deal not found'; end if;
  update public.deals set status = 'cancelled', review_note = p_note,
         reviewed_by = auth.uid(), reviewed_at = now() where id = p_deal;
  if d.unit_id is not null then
    update public.units set status = 'active', hold_reason = null
     where id = d.unit_id and (status = 'sold' or (status = 'hold' and hold_reason = 'Reserved — promise of sale'));
  end if;
end;
$$;

grant execute on function public.approve_deal(uuid, uuid, timestamptz, boolean, numeric, date) to authenticated;
grant execute on function public.complete_deal(uuid, uuid, numeric, timestamptz, date) to authenticated;
grant execute on function public.cancel_deal(uuid, text) to authenticated;

-- Existing data: approved deals with no money collected are reservations;
-- the others get their transfer date from their last collection.
update public.deals d set status = 'reserved'
 where d.status = 'approved'
   and not exists (select 1 from public.finance_transactions t where t.deal_id = d.id and t.kind = 'commission_in');
update public.deals d set transfer_date = (
    select (max(t.occurred_at) at time zone 'Africa/Cairo')::date from public.finance_transactions t
     where t.deal_id = d.id and t.kind = 'commission_in')
 where d.status = 'approved' and d.transfer_date is null;
