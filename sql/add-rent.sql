-- =====================================================================
-- Rent: units for rent, clients looking to rent, and rent deals.
--   * units.listing_type: 'sale' | 'rent' | 'both', with rent_price
--     (monthly) and furnished. Rent-only units don't need a sale price.
--   * clients.interest: 'buy' | 'rent'.
--   * deals.deal_type: 'sale' | 'rent' (rent_monthly, lease_months).
--     Rent commissions use exactly the same scheme as sales: same rates,
--     same tiers, same targets, same cash out. Buyer side = tenant,
--     seller side = landlord.
--   * A done rent deal puts the unit on hold as "Rented" (reactivate it
--     when it's back on the market) instead of marking it sold.
-- Run once in Supabase SQL Editor after add-deal-sides.sql. Safe to re-run.
-- =====================================================================

-- Units
alter table public.units add column if not exists listing_type text not null default 'sale';
alter table public.units drop constraint if exists units_listing_type_check;
alter table public.units add constraint units_listing_type_check check (listing_type in ('sale','rent','both'));
alter table public.units add column if not exists rent_price numeric;
alter table public.units add column if not exists furnished text;
alter table public.units alter column total_price drop not null;

-- Clients
alter table public.clients add column if not exists interest text not null default 'buy';
alter table public.clients drop constraint if exists clients_interest_check;
alter table public.clients add constraint clients_interest_check check (interest in ('buy','rent'));

-- Deals
alter table public.deals add column if not exists deal_type text not null default 'sale';
alter table public.deals drop constraint if exists deals_deal_type_check;
alter table public.deals add constraint deals_deal_type_check check (deal_type in ('sale','rent'));
alter table public.deals add column if not exists rent_monthly numeric;
alter table public.deals add column if not exists lease_months int;

-- Done: same as before, but a rental puts the unit on hold as "Rented"
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
    values ('commission_in', 'in', v_b, p_account, coalesce(p_collected_at, now()), p_deal, 'buyer',
            case when d.deal_type = 'rent' then 'Commission collected (tenant)' else 'Commission collected (buyer)' end);
  end if;
  if v_s > 0 then
    insert into public.finance_transactions (kind, direction, amount, account_id, occurred_at, deal_id, side, description)
    values ('commission_in', 'in', v_s, p_account, coalesce(p_collected_at, now()), p_deal, 'seller',
            case when d.deal_type = 'rent' then 'Commission collected (landlord)' else 'Commission collected (seller)' end);
  end if;
  if d.unit_id is not null then
    if d.deal_type = 'rent' then
      update public.units set status = 'hold', hold_reason = 'Rented' where id = d.unit_id;
    else
      update public.units set status = 'sold', hold_reason = null where id = d.unit_id;
    end if;
  end if;
  if d.client_id is not null then
    select stage into v_old_stage from public.clients where id = d.client_id;
    if v_old_stage is distinct from 'deal_done' then
      update public.clients set previous_stage = stage, stage = 'deal_done' where id = d.client_id;
      insert into public.client_activity (client_id, action, field_name, old_value, new_value, note, changed_by)
      values (d.client_id, 'stage_change', 'stage', v_old_stage, 'deal_done',
              case when d.deal_type = 'rent' then 'Rent deal done (lease + commission)' else 'Deal done (transfer + commission)' end, auth.uid());
    end if;
  end if;
end;
$$;

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
    update public.units
       set status = 'hold',
           hold_reason = case when d.deal_type = 'rent' then 'Reserved — rental' else 'Reserved — promise of sale' end
     where id = d.unit_id and status = 'active';
  end if;
  if d.client_id is not null then
    select stage into v_old_stage from public.clients where id = d.client_id;
    if v_old_stage not in ('contracted','deal_done') then
      update public.clients set previous_stage = stage, stage = 'contracted' where id = d.client_id;
      insert into public.client_activity (client_id, action, field_name, old_value, new_value, note, changed_by)
      values (d.client_id, 'stage_change', 'stage', v_old_stage, 'contracted',
              case when d.deal_type = 'rent' then 'Rental reserved' else 'Promise of sale (deal reserved)' end, auth.uid());
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
     where id = d.unit_id
       and (status = 'sold' or (status = 'hold' and hold_reason in ('Reserved — promise of sale', 'Reserved — rental', 'Rented')));
  end if;
end;
$$;

grant execute on function public.approve_deal(uuid, uuid, timestamptz, boolean, numeric, numeric, date) to authenticated;
grant execute on function public.complete_deal(uuid, uuid, numeric, numeric, timestamptz, date) to authenticated;
grant execute on function public.cancel_deal(uuid, text) to authenticated;
