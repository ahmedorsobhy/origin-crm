-- =====================================================================
-- Reservations with money + editable dates
--  * Commission can be collected (part or all) at reservation; the rest at transfer.
--  * Every amount counts toward targets in the quarter it came in.
--  * Sales commission is paid only after the transfer (deal done).
--  * Cancelling a reservation can refund money back out of a treasury account.
-- Safe to run more than once. Run the whole file in Supabase → SQL Editor.
-- =====================================================================

-- 1) Refunds are their own kind of money movement
alter table public.finance_transactions drop constraint if exists finance_transactions_kind_check;
alter table public.finance_transactions add constraint finance_transactions_kind_check
  check (kind in ('commission_in', 'payout', 'expense', 'salary', 'transfer', 'adjustment', 'refund'));

-- 2) Mark as done: default to what's LEFT on each side, and add it to what was collected before
create or replace function public.complete_deal(p_deal uuid, p_account uuid, p_amount_buyer numeric default null, p_amount_seller numeric default null,
                                                p_collected_at timestamptz default now(), p_transfer_date date default null)
returns void language plpgsql security definer set search_path = public as $$
declare d public.deals; v_old_stage text; v_b numeric; v_s numeric; v_paid_b numeric; v_paid_s numeric; v_side_b numeric; v_side_s numeric;
begin
  if not public.is_finance_admin() then raise exception 'Only Admin / CEO can close deals'; end if;
  select * into d from public.deals where id = p_deal for update;
  if not found then raise exception 'Deal not found'; end if;
  if d.status not in ('reserved','pending','returned') then raise exception 'This deal is not open'; end if;
  -- what each side owes in total, and what came in already (at reservation)
  v_side_b := case when coalesce(d.commission_buyer, 0) + coalesce(d.commission_seller, 0) > 0 then coalesce(d.commission_buyer, 0)
                   when d.sides in ('buyer','both') then d.commission_total else 0 end;
  v_side_s := case when coalesce(d.commission_buyer, 0) + coalesce(d.commission_seller, 0) > 0 then coalesce(d.commission_seller, 0)
                   when d.sides = 'seller' then d.commission_total else 0 end;
  select coalesce(sum(amount) filter (where side = 'buyer' or (side is null and d.sides <> 'seller')), 0),
         coalesce(sum(amount) filter (where side = 'seller' or (side is null and d.sides = 'seller')), 0)
    into v_paid_b, v_paid_s
    from public.finance_transactions where deal_id = p_deal and kind = 'commission_in';
  v_b := case when d.sides in ('buyer','both')  then coalesce(p_amount_buyer,  greatest(v_side_b - v_paid_b, 0)) else 0 end;
  v_s := case when d.sides in ('seller','both') then coalesce(p_amount_seller, greatest(v_side_s - v_paid_s, 0)) else 0 end;
  if v_b < 0 or v_s < 0 then raise exception 'Amounts can''t be negative'; end if;
  if v_b + v_s > 0 and p_account is null then raise exception 'Choose the account that received the money'; end if;
  if d.status <> 'reserved' then
    perform public.check_deal_teams(p_deal);
    perform public.freeze_deal_rates(p_deal);
  end if;
  update public.deals
     set status = 'approved', commission_collected = v_paid_b + v_paid_s + v_b + v_s,
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
             new_owner_name  = coalesce(nullif(d.buyer_name, ''),  (select c.name  from public.clients c where c.id = d.client_id and d.sides <> 'seller')),
             new_owner_phone = coalesce(nullif(d.buyer_phone, ''), (select c.phone from public.clients c where c.id = d.client_id and d.sides <> 'seller'))
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
end $$;

revoke execute on function public.complete_deal(uuid, uuid, numeric, numeric, timestamptz, date) from public, anon;
grant execute on function public.complete_deal(uuid, uuid, numeric, numeric, timestamptz, date) to authenticated;

-- 3) Cancel: optionally refund money out of a treasury account
drop function if exists public.cancel_deal(uuid, text);
create or replace function public.cancel_deal(p_deal uuid, p_note text, p_refund numeric default null,
                                              p_refund_account uuid default null, p_refund_at timestamptz default null)
returns void language plpgsql security definer set search_path = public as $$
declare d public.deals;
begin
  if not public.is_finance_admin() then raise exception 'Only Admin / CEO can cancel deals'; end if;
  select * into d from public.deals where id = p_deal for update;
  if not found then raise exception 'Deal not found'; end if;
  if coalesce(p_refund, 0) > 0 then
    if p_refund_account is null then raise exception 'Choose the account the refund is paid from'; end if;
    insert into public.finance_transactions (kind, direction, amount, account_id, occurred_at, deal_id, description)
    values ('refund', 'out', p_refund, p_refund_account, coalesce(p_refund_at, now()), p_deal,
            'Refund — ' || case when d.status = 'reserved' then 'reservation' else 'deal' end || ' cancelled' || coalesce(' · ' || nullif(p_note, ''), ''));
  end if;
  update public.deals set status = 'cancelled', review_note = p_note,
         reviewed_by = auth.uid(), reviewed_at = now() where id = p_deal;
  if d.unit_id is not null then
    update public.units set status = 'active', hold_reason = null,
           sold_via = null, sold_at = null, sold_price = null, new_owner_name = null, new_owner_phone = null, sold_note = null
     where id = d.unit_id
       and (status = 'sold' or (status = 'hold' and hold_reason in ('Reserved — promise of sale', 'Reserved — rental', 'Rented')));
  end if;
end $$;
revoke execute on function public.cancel_deal(uuid, text, numeric, uuid, timestamptz) from public, anon;
grant execute on function public.cancel_deal(uuid, text, numeric, uuid, timestamptz) to authenticated;

-- 4) Ranking money: collections on reserved and done deals (cancelled ones drop out)
do $$
declare src text;
begin
  select pg_get_functiondef('public.sales_ranking(timestamptz, timestamptz)'::regprocedure) into src;
  if src not like '%dm.status in%' then
    src := replace(src,
      'from public.finance_transactions t join public.deal_agents a on a.deal_id = t.deal_id and (t.side is null or a.side = t.side)',
      'from public.finance_transactions t join public.deals dm on dm.id = t.deal_id and dm.status in (''reserved'', ''approved'') join public.deal_agents a on a.deal_id = t.deal_id and (t.side is null or a.side = t.side)');
    execute src;
  end if;
end $$;

-- 5) Dates: Reserved on (editable) and Done on = transfer date (editable). Same as deals-done-date-fix.sql, safe to repeat.
alter table public.deals add column if not exists reserved_at timestamptz;
alter table public.deals add column if not exists done_at timestamptz;
-- Done date follows the transfer date (noon Cairo time), falling back to the approval time
create or replace function public.deals_stamp_dates() returns trigger
language plpgsql as $$
begin
  if new.status in ('reserved', 'approved') and new.reserved_at is null then new.reserved_at := now(); end if;
  if new.status = 'approved' then
    if new.transfer_date is not null then
      new.done_at := (new.transfer_date + time '12:00') at time zone 'Africa/Cairo';
    elsif new.done_at is null then
      new.done_at := now();
    end if;
  end if;
  if new.status in ('pending', 'returned', 'rejected') then new.reserved_at := null; new.done_at := null; end if;
  return new;
end $$;
drop trigger if exists trg_deals_stamp_dates on public.deals;
create trigger trg_deals_stamp_dates before insert or update of status, transfer_date on public.deals
  for each row execute function public.deals_stamp_dates();

-- Re-date every done deal from its transfer date
update public.deals
   set done_at = coalesce((transfer_date + time '12:00') at time zone 'Africa/Cairo', reviewed_at, created_at)
 where status = 'approved';

-- A reservation can't be after the deal was done
update public.deals set reserved_at = least(reserved_at, done_at) where status = 'approved' and reserved_at > done_at;


select 'Reservations with money installed ✓' as result;
