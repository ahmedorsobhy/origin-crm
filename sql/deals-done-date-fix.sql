-- =====================================================================
-- Fix: a deal is "done" on its TRANSFER date (التنازل), not the day it was entered/approved.
-- Safe to run more than once. Run the whole file in Supabase → SQL Editor.
-- =====================================================================

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

select to_char(done_at at time zone 'Africa/Cairo', 'YYYY-MM') as month_done, count(*) as deals_done
from public.deals where status = 'approved' group by 1 order by 1;
