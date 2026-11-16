-- =====================================================================
-- Deal sides: Origin can represent the BUYER, the SELLER, or BOTH.
--   * Each side has its own commission (commission_buyer / commission_seller).
--   * Each side has its own team; shares add up to 100% per side. The same
--     person can be on both sides.
--   * Money collected can be tagged with the side it came from; untagged
--     money on a two-sided deal is split by the sides' commissions.
-- Existing deals become one-sided (Seller if their label says "Seller",
-- otherwise Buyer) with their whole commission on that side.
-- Run once in Supabase SQL Editor after add-deal-stages.sql. Safe to re-run.
-- =====================================================================

alter table public.deals add column if not exists sides text not null default 'buyer';
alter table public.deals drop constraint if exists deals_sides_check;
alter table public.deals add constraint deals_sides_check check (sides in ('buyer','seller','both'));
alter table public.deals add column if not exists commission_buyer numeric not null default 0;
alter table public.deals add column if not exists commission_seller numeric not null default 0;

alter table public.deal_agents add column if not exists side text not null default 'buyer';
alter table public.deal_agents drop constraint if exists deal_agents_side_check;
alter table public.deal_agents add constraint deal_agents_side_check check (side in ('buyer','seller'));
alter table public.deal_agents drop constraint if exists deal_agents_pkey;
alter table public.deal_agents add constraint deal_agents_pkey primary key (deal_id, agent_id, side);

alter table public.finance_transactions add column if not exists side text;
alter table public.finance_transactions drop constraint if exists finance_transactions_side_check;
alter table public.finance_transactions add constraint finance_transactions_side_check check (side is null or side in ('buyer','seller'));

-- Existing deals -> one side
update public.deals
   set sides = case when unit_label ilike '%seller%' then 'seller' else 'buyer' end
 where commission_buyer = 0 and commission_seller = 0;
update public.deals
   set commission_buyer  = case when sides = 'buyer'  then commission_total else 0 end,
       commission_seller = case when sides = 'seller' then commission_total else 0 end
 where commission_buyer = 0 and commission_seller = 0;
update public.deal_agents da set side = d.sides
  from public.deals d
 where d.id = da.deal_id and d.sides in ('buyer','seller') and da.side <> d.sides;

-- Keep the total in step with the two sides
create or replace function public.deals_sync_total() returns trigger
language plpgsql as $$
begin
  if new.sides = 'buyer' then new.commission_seller := 0; end if;
  if new.sides = 'seller' then new.commission_buyer := 0; end if;
  if coalesce(new.commission_buyer, 0) + coalesce(new.commission_seller, 0) > 0 then
    new.commission_total := coalesce(new.commission_buyer, 0) + coalesce(new.commission_seller, 0);
  end if;
  return new;
end;
$$;
drop trigger if exists trg_deals_sync_total on public.deals;
create trigger trg_deals_sync_total before insert or update on public.deals
  for each row execute function public.deals_sync_total();

-- Each side the deal has must have a team adding up to 100%, and no team on a side it doesn't have
create or replace function public.check_deal_teams(p_deal uuid) returns void
language plpgsql security definer set search_path = public as $$
declare d public.deals; s text; v_sum numeric;
begin
  select * into d from public.deals where id = p_deal;
  foreach s in array (case d.sides when 'both' then array['buyer','seller'] else array[d.sides] end) loop
    select coalesce(sum(split_pct), 0) into v_sum from public.deal_agents where deal_id = p_deal and side = s;
    if v_sum <> 100 then raise exception '% side shares must add up to 100%% (now %)', initcap(s), v_sum; end if;
  end loop;
  if d.sides <> 'both' and exists (select 1 from public.deal_agents where deal_id = p_deal and side <> d.sides) then
    raise exception 'This deal is % side only, but it has a team on the other side', d.sides;
  end if;
end;
$$;

-- Done: transfer done + commission collected (per side)
drop function if exists public.complete_deal(uuid, uuid, numeric, timestamptz, date);
create or replace function public.complete_deal(
  p_deal uuid, p_account uuid, p_amount_buyer numeric default null, p_amount_seller numeric default null,
  p_collected_at timestamptz default now(), p_transfer_date date default null
) returns void
language plpgsql security definer set search_path = public as $$
declare d public.deals; v_old_stage text; v_b numeric; v_s numeric;
begin
  if not public.is_finance_admin() then raise exception 'Only Admin / CEO can close deals'; end if;
  select * into d from public.deals where id = p_deal for update;
  if not found then raise exception 'Deal not found'; end if;
  if d.status not in ('reserved','pending','returned') then raise exception 'This deal is not open'; end if;
  v_b := case when d.sides in ('buyer','both')  then coalesce(p_amount_buyer,  d.commission_buyer)  else 0 end;
  v_s := case when d.sides in ('seller','both') then coalesce(p_amount_seller, d.commission_seller) else 0 end;
  if v_b < 0 or v_s < 0 then raise exception 'Amounts can''t be negative'; end if;
  if v_b + v_s > 0 and p_account is null then raise exception 'Choose the account that received the money'; end if;
  if d.status <> 'reserved' then
    perform public.check_deal_teams(p_deal);
    perform public.freeze_deal_rates(p_deal);
  end if;
  update public.deals
     set status = 'approved', commission_collected = v_b + v_s,
         transfer_date = coalesce(p_transfer_date, (coalesce(p_collected_at, now()) at time zone 'Africa/Cairo')::date),
         reviewed_by = auth.uid(), reviewed_at = now(), review_note = null
   where id = p_deal;
  if v_b > 0 then
    insert into public.finance_transactions (kind, direction, amount, account_id, occurred_at, deal_id, side, description)
    values ('commission_in', 'in', v_b, p_account, coalesce(p_collected_at, now()), p_deal, 'buyer', 'Commission collected (buyer)');
  end if;
  if v_s > 0 then
    insert into public.finance_transactions (kind, direction, amount, account_id, occurred_at, deal_id, side, description)
    values ('commission_in', 'in', v_s, p_account, coalesce(p_collected_at, now()), p_deal, 'seller', 'Commission collected (seller)');
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

-- Approve what sales submitted: as Reserved (default) or straight to Done
drop function if exists public.approve_deal(uuid, uuid, timestamptz, boolean, numeric, date);
create or replace function public.approve_deal(
  p_deal uuid, p_account uuid default null, p_collected_at timestamptz default now(),
  p_as_done boolean default false, p_amount_buyer numeric default null, p_amount_seller numeric default null,
  p_transfer_date date default null
) returns void
language plpgsql security definer set search_path = public as $$
declare d public.deals; v_old_stage text;
begin
  if not public.is_finance_admin() then raise exception 'Only Admin / CEO can approve deals'; end if;
  select * into d from public.deals where id = p_deal for update;
  if not found then raise exception 'Deal not found'; end if;
  if d.status not in ('pending','returned') then raise exception 'Deal is not waiting for approval'; end if;
  perform public.check_deal_teams(p_deal);
  perform public.freeze_deal_rates(p_deal);
  if p_as_done then
    update public.deals set status = 'reserved' where id = p_deal;
    perform public.complete_deal(p_deal, p_account, p_amount_buyer, p_amount_seller, p_collected_at, p_transfer_date);
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

-- freeze_deal_rates: one chain per person even if they are on both sides
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
    from (select distinct agent_id from public.deal_agents where deal_id = p_deal) da
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
end;
$$;

grant execute on function public.approve_deal(uuid, uuid, timestamptz, boolean, numeric, numeric, date) to authenticated;
grant execute on function public.complete_deal(uuid, uuid, numeric, numeric, timestamptz, date) to authenticated;
