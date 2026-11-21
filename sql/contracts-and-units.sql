-- =====================================================================
-- Promise-of-sale contracts + richer unit details for descriptions
-- Safe to run more than once. Run the whole file in Supabase → SQL Editor.
-- National ID numbers are NEVER stored: they're typed when the Word file is made.
-- =====================================================================

-- 1) Unit details used by the description
alter table public.units add column if not exists bedrooms int;
alter table public.units add column if not exists bathrooms int;
alter table public.units add column if not exists next_installment numeric;
alter table public.units add column if not exists next_installment_date date;
alter table public.units add column if not exists next_maintenance numeric;
alter table public.units add column if not exists next_maintenance_date date;
alter table public.units add column if not exists next_club numeric;
alter table public.units add column if not exists next_club_date date;
alter table public.units add column if not exists buyer_commission_pct numeric default 1.5;

-- 2) Contracts
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'promise_of_sale' check (kind in ('promise_of_sale')),
  deal_id uuid references public.deals(id) on delete set null,
  unit_id uuid references public.units(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  title text,
  data jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'returned', 'approved')),
  review_note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_by uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_contracts_created_by on public.contracts (created_by);
alter table public.contracts enable row level security;

drop policy if exists "read contracts" on public.contracts;
create policy "read contracts" on public.contracts for select
  using (public.is_approved() and (public.is_finance_admin() or created_by = auth.uid() or public.is_self_or_manager_of(created_by)));
drop policy if exists "add contracts" on public.contracts;
create policy "add contracts" on public.contracts for insert
  with check (public.is_approved() and created_by = auth.uid());
drop policy if exists "edit contracts" on public.contracts;
create policy "edit contracts" on public.contracts for update
  using (public.is_finance_admin() or (created_by = auth.uid() and status in ('pending', 'returned')))
  with check (public.is_finance_admin() or created_by = auth.uid());
drop policy if exists "delete contracts" on public.contracts;
create policy "delete contracts" on public.contracts for delete
  using (public.is_finance_admin() or (created_by = auth.uid() and status <> 'approved'));
grant select, insert, update, delete on public.contracts to authenticated;
revoke all on public.contracts from anon;

-- Guard: only Admin/CEO approve; any change by sales sends it back for approval;
-- a national ID can never be saved inside the data.
create or replace function public.contracts_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.data := new.data - 'seller_id' - 'buyer_id' - 's_id' - 'b_id';
  new.updated_at := now();
  if public.is_finance_admin() then
    if new.status = 'approved' and (tg_op = 'INSERT' or old.status is distinct from 'approved') then
      new.reviewed_by := auth.uid(); new.reviewed_at := now();
    end if;
    return new;
  end if;
  new.status := 'pending'; new.reviewed_by := null; new.reviewed_at := null;
  if tg_op = 'UPDATE' then new.created_by := old.created_by; end if;
  return new;
end $$;
revoke execute on function public.contracts_guard() from public, anon, authenticated;
drop trigger if exists trg_contracts_guard on public.contracts;
create trigger trg_contracts_guard before insert or update on public.contracts
  for each row execute function public.contracts_guard();

-- Phone notifications: new/edited → Admin & CEO; approved/returned → the sales person
create or replace function public.contracts_notify() returns trigger
language plpgsql security definer set search_path = public as $$
declare who text;
begin
  select name into who from public.profiles where id = new.created_by;
  if new.status = 'pending' and (tg_op = 'INSERT' or old.status is distinct from 'pending' or old.data is distinct from new.data) then
    insert into public.notification_queue (user_id, title, body, url)
    select p.id, 'Promise of sale to approve 📄', coalesce(who, 'Sales') || ' · ' || coalesce(new.title, 'contract'), '?open=contract:' || new.id
      from public.profiles p where p.role in ('admin', 'ceo') and p.id <> new.created_by;
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status and new.status in ('approved', 'returned') then
    insert into public.notification_queue (user_id, title, body, url)
    values (new.created_by,
            case when new.status = 'approved' then 'Contract approved ✅ — download it now' else 'Contract returned for changes' end,
            coalesce(new.title, '') || coalesce(' · ' || nullif(new.review_note, ''), ''), '?open=contract:' || new.id);
  end if;
  return null;
end $$;
revoke execute on function public.contracts_notify() from public, anon, authenticated;
drop trigger if exists trg_contracts_notify on public.contracts;
create trigger trg_contracts_notify after insert or update on public.contracts
  for each row execute function public.contracts_notify();

select 'Contracts installed ✓' as result;
