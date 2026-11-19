-- =====================================================================
-- Sold units: a "Sold" list, who bought it (when we sold it) — run once
-- Run AFTER sales-ux.sql and security-fix.sql. Safe to run again.
-- =====================================================================

alter table public.units add column if not exists sold_via text;
alter table public.units add column if not exists sold_at timestamptz;
alter table public.units add column if not exists sold_price numeric;
alter table public.units add column if not exists new_owner_name text;
alter table public.units add column if not exists new_owner_phone text;
alter table public.units add column if not exists sold_note text;
alter table public.units drop constraint if exists units_sold_via_check;
alter table public.units add constraint units_sold_via_check check (sold_via is null or sold_via in ('us', 'outside'));

-- The buyer of a deal (filled from our client, or typed when we only had the seller)
alter table public.deals add column if not exists buyer_name text;
alter table public.deals add column if not exists buyer_phone text;

-- When a sale is done, the unit moves to Sold with the new owner
CREATE OR REPLACE FUNCTION public.complete_deal(p_deal uuid, p_account uuid, p_amount_buyer numeric DEFAULT NULL::numeric, p_amount_seller numeric DEFAULT NULL::numeric, p_collected_at timestamp with time zone DEFAULT now(), p_transfer_date date DEFAULT NULL::date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      update public.units u
         set status = 'sold', hold_reason = null, sold_via = 'us', sold_at = coalesce(p_collected_at, now()), sold_price = d.sale_price,
             new_owner_name  = coalesce(nullif(d.buyer_name, ''),  (select c.name  from public.clients c where c.id = d.client_id and d.sides <> 'seller'), u.new_owner_name),
             new_owner_phone = coalesce(nullif(d.buyer_phone, ''), (select c.phone from public.clients c where c.id = d.client_id and d.sides <> 'seller'), u.new_owner_phone)
       where u.id = d.unit_id;
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
$function$;

-- Cancelling a done sale clears the Sold details too
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
    update public.units set status = 'active', hold_reason = null,
           sold_via = null, sold_at = null, sold_price = null, new_owner_name = null, new_owner_phone = null, sold_note = null
     where id = d.unit_id
       and (status = 'sold' or (status = 'hold' and hold_reason in ('Reserved — promise of sale', 'Reserved — rental', 'Rented')));
  end if;
end; $$;
revoke execute on function public.cancel_deal(uuid, text) from public, anon;
grant execute on function public.cancel_deal(uuid, text) to authenticated;
revoke execute on function public.complete_deal(uuid, uuid, numeric, numeric, timestamptz, date) from public, anon;
grant execute on function public.complete_deal(uuid, uuid, numeric, numeric, timestamptz, date) to authenticated;

-- Units already sold before today: fill from their done deal
update public.units u set
  sold_via = 'us',
  sold_at = coalesce(u.sold_at, x.done_at),
  sold_price = coalesce(u.sold_price, x.sale_price),
  new_owner_name = coalesce(u.new_owner_name, x.cname),
  new_owner_phone = coalesce(u.new_owner_phone, x.cphone)
from (
  select distinct on (d.unit_id) d.unit_id, d.sale_price, coalesce(d.reviewed_at, d.created_at) as done_at,
         case when d.sides <> 'seller' then c.name end as cname, case when d.sides <> 'seller' then c.phone end as cphone
  from public.deals d left join public.clients c on c.id = d.client_id
  where d.status = 'approved' and coalesce(d.deal_type, 'sale') = 'sale' and d.unit_id is not null
  order by d.unit_id, d.created_at desc
) x
where u.id = x.unit_id and u.status = 'sold' and u.sold_via is null;

select 'Sold units: ' || count(*) || ' (through us: ' || count(*) filter (where sold_via = 'us') || ')' as result
from public.units where status = 'sold';
