-- =====================================================================
-- "Floos Rabna": 1% of every collected commission goes automatically into
-- its own treasury account. It comes out of the COMPANY's share only —
-- sales / managers' commissions are not affected and they never see it.
-- Run once in Supabase SQL Editor after add-finance-module.sql.
-- Safe to re-run.
-- =====================================================================

alter table public.finance_settings add column if not exists charity_pct numeric not null default 1
  check (charity_pct >= 0 and charity_pct <= 100);
alter table public.finance_settings add column if not exists charity_account_id uuid
  references public.finance_accounts(id);

-- links the automatic 1% transfer to the collection it came from
alter table public.finance_transactions add column if not exists source_tx_id uuid
  references public.finance_transactions(id) on delete cascade;
create index if not exists idx_fin_tx_source on public.finance_transactions(source_tx_id);

insert into public.finance_accounts (name) values ('Floos Rabna') on conflict (name) do nothing;
update public.finance_settings
   set charity_account_id = (select id from public.finance_accounts where name = 'Floos Rabna')
 where id = 1 and charity_account_id is null;

-- Moves charity_pct% of a collection into the Floos Rabna account
create or replace function public.charity_for_collection(c public.finance_transactions) returns void
language plpgsql security definer set search_path = public as $$
declare
  s public.finance_settings;
  v_amount numeric;
  v_group uuid := gen_random_uuid();
begin
  select * into s from public.finance_settings where id = 1;
  if s.charity_account_id is null or coalesce(s.charity_pct, 0) <= 0 then return; end if;
  if c.account_id = s.charity_account_id then return; end if;
  v_amount := round(c.amount * s.charity_pct / 100, 2);
  if v_amount <= 0 then return; end if;
  insert into public.finance_transactions
    (kind, direction, amount, account_id, occurred_at, deal_id, transfer_group, source_tx_id, description, created_by)
  values
    ('transfer', 'out', v_amount, c.account_id, c.occurred_at, c.deal_id, v_group, c.id, 'Floos Rabna ' || s.charity_pct || '%', c.created_by),
    ('transfer', 'in',  v_amount, s.charity_account_id, c.occurred_at, c.deal_id, v_group, c.id, 'Floos Rabna ' || s.charity_pct || '%', c.created_by);
end;
$$;

create or replace function public.charity_trg() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.kind = 'commission_in' then
    perform public.charity_for_collection(new);
  end if;
  return null;
end;
$$;

drop trigger if exists trg_charity on public.finance_transactions;
create trigger trg_charity after insert on public.finance_transactions
  for each row execute function public.charity_trg();

-- Backfill: collections recorded before this file was run
do $$
declare c public.finance_transactions;
begin
  for c in
    select * from public.finance_transactions t
    where t.kind = 'commission_in'
      and not exists (select 1 from public.finance_transactions x where x.source_tx_id = t.id)
  loop
    perform public.charity_for_collection(c);
  end loop;
end $$;
