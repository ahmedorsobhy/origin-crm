-- =====================================================================
-- Origin CRM — Finance module (deals, commissions, targets, expenses,
-- treasury). Run once in Supabase: SQL Editor > New query > paste > Run.
-- Safe to re-run: every statement is idempotent.
--
-- Visibility rules (enforced here in the database, not just in the app):
--   * Admin / CEO ("finance admins") see and manage everything.
--   * Everyone else sees: deals they created, deals they or anyone in
--     their reporting line took part in, and ONLY their own commission
--     rates / payouts / salary. Nobody but finance admins can read other
--     people's rates, salaries or the company's share.
-- =====================================================================

-- ---------- 0. Helpers ----------
create or replace function public.is_finance_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','ceo')
  );
$$;

-- true when the logged-in user IS `target` or sits anywhere above them
-- in the manager chain (direct manager, manager's manager, ...)
create or replace function public.is_self_or_manager_of(target uuid) returns boolean
language sql stable security definer set search_path = public as $$
  with recursive chain as (
    select id, manager_id, 0 as depth from public.profiles where id = target
    union all
    select p.id, p.manager_id, c.depth + 1
    from public.profiles p join chain c on p.id = c.manager_id
    where c.depth < 20
  )
  select auth.uid() is not null and exists (select 1 from chain where id = auth.uid());
$$;

-- Units can now be marked as sold
alter table public.units drop constraint if exists units_status_check;
alter table public.units add constraint units_status_check
  check (status in ('active','hold','pending_delete','sold'));

-- ---------- 1. Settings & dropdown lists ----------
create table if not exists public.finance_settings (
  id int primary key default 1 check (id = 1),
  -- % of target at which each commission tier starts. First must be 0.
  tier_thresholds numeric[] not null default '{0,70,100}',
  updated_at timestamptz not null default now()
);
insert into public.finance_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.finance_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
insert into public.finance_accounts (name) values ('Cash'), ('Bank'), ('InstaPay')
  on conflict (name) do nothing;

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
insert into public.expense_categories (name) values
  ('Rent'), ('Bills & utilities'), ('Facebook ads'), ('Transportation'),
  ('Office supplies'), ('Subscriptions'), ('Other')
  on conflict (name) do nothing;

-- Fixed monthly items (rent, internet, ...). Salaries come from staff_salaries.
create table if not exists public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references public.expense_categories(id),
  default_amount numeric not null default 0 check (default_amount >= 0),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- 2. People: targets, salaries, commission plans ----------
create table if not exists public.staff_targets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  quarterly_target numeric not null default 1000000 check (quarterly_target >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_salaries (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  monthly_salary numeric not null default 0 check (monthly_salary >= 0),
  updated_at timestamptz not null default now()
);

-- "When <seller> closes a deal, <beneficiary> gets rates[i]% of the total
-- commission", where i is the seller's tier this quarter.
-- beneficiary = the seller themself, their manager, the manager's manager...
create table if not exists public.commission_rates (
  seller_id uuid not null references public.profiles(id) on delete cascade,
  beneficiary_id uuid not null references public.profiles(id) on delete cascade,
  rates numeric[] not null,
  updated_at timestamptz not null default now(),
  primary key (seller_id, beneficiary_id)
);

-- ---------- 3. Deals ----------
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  unit_label text,
  client_label text,
  sale_price numeric not null check (sale_price >= 0),
  commission_total numeric not null check (commission_total >= 0),
  commission_collected numeric not null default 0 check (commission_collected >= 0),
  deal_date date not null default current_date,
  notes text,
  status text not null default 'pending'
    check (status in ('pending','returned','approved','rejected','cancelled')),
  review_note text,
  created_by uuid references public.profiles(id) default auth.uid(),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_deals_status on public.deals(status);

-- Who sold it, and how the deal is split between colleagues (sums to 100)
create table if not exists public.deal_agents (
  deal_id uuid not null references public.deals(id) on delete cascade,
  agent_id uuid not null references public.profiles(id),
  split_pct numeric not null check (split_pct > 0 and split_pct <= 100),
  primary key (deal_id, agent_id)
);

-- Frozen copy of each agent's commission chain at approval time, so later
-- changes to rates or to the org chart never rewrite old deals.
create table if not exists public.deal_rates (
  deal_id uuid not null references public.deals(id) on delete cascade,
  agent_id uuid not null references public.profiles(id),
  beneficiary_id uuid not null references public.profiles(id),
  level int not null default 0,
  rates numeric[] not null,
  primary key (deal_id, agent_id, beneficiary_id)
);

-- ---------- 4. The ledger: every money movement is one row ----------
create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in
    ('commission_in','payout','expense','salary','transfer','adjustment')),
  direction text not null check (direction in ('in','out')),
  amount numeric not null check (amount > 0),
  account_id uuid not null references public.finance_accounts(id),
  occurred_at timestamptz not null default now(),
  deal_id uuid references public.deals(id),
  beneficiary_id uuid references public.profiles(id),
  category_id uuid references public.expense_categories(id),
  recurring_id uuid references public.recurring_expenses(id),
  period text,             -- 'YYYY-MM' for salaries and fixed monthly items
  transfer_group uuid,     -- links the two legs of an account-to-account transfer
  description text,
  created_by uuid references public.profiles(id) default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists idx_fin_tx_occurred on public.finance_transactions(occurred_at);
create index if not exists idx_fin_tx_deal on public.finance_transactions(deal_id);

-- ---------- 5. Audit log ----------
create table if not exists public.finance_audit (
  id bigserial primary key,
  table_name text not null,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  changed_by uuid default auth.uid(),
  changed_at timestamptz not null default now()
);

create or replace function public.finance_audit_trg() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.finance_audit (table_name, action, old_data, new_data, changed_by)
  values (tg_table_name, tg_op,
          case when tg_op <> 'INSERT' then to_jsonb(old) end,
          case when tg_op <> 'DELETE' then to_jsonb(new) end,
          auth.uid());
  return null;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['finance_settings','finance_accounts','expense_categories',
    'recurring_expenses','staff_targets','staff_salaries','commission_rates','deals',
    'deal_agents','deal_rates','finance_transactions']
  loop
    execute format('drop trigger if exists trg_audit on public.%I', t);
    execute format('create trigger trg_audit after insert or update or delete on public.%I
                    for each row execute function public.finance_audit_trg()', t);
  end loop;
end $$;

-- ---------- 6. Who can see a deal ----------
create or replace function public.can_see_deal(p_deal uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_finance_admin()
      or exists (select 1 from public.deals d where d.id = p_deal and d.created_by = auth.uid())
      or exists (select 1 from public.deal_agents da
                 where da.deal_id = p_deal and public.is_self_or_manager_of(da.agent_id));
$$;

-- Non-admins: a new deal is always 'pending', and they can only edit their
-- own deal while it is pending or returned for changes.
create or replace function public.deals_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if public.is_finance_admin() then return new; end if;
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
drop trigger if exists trg_deals_guard on public.deals;
create trigger trg_deals_guard before insert or update on public.deals
  for each row execute function public.deals_guard();

create or replace function public.deal_is_editable_by_me(p_deal uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_finance_admin() or exists (
    select 1 from public.deals d
    where d.id = p_deal and d.created_by = auth.uid() and d.status in ('pending','returned'));
$$;

-- ---------- 7. Approve / cancel (atomic, admin only) ----------
create or replace function public.approve_deal(
  p_deal uuid, p_account uuid, p_collected_at timestamptz default now()
) returns void
language plpgsql security definer set search_path = public as $$
declare
  d public.deals;
  v_split numeric;
  v_zero numeric[];
  v_old_stage text;
begin
  if not public.is_finance_admin() then raise exception 'Only Admin / CEO can approve deals'; end if;
  select * into d from public.deals where id = p_deal for update;
  if not found then raise exception 'Deal not found'; end if;
  if d.status not in ('pending','returned') then raise exception 'Deal is not waiting for approval'; end if;
  select coalesce(sum(split_pct), 0) into v_split from public.deal_agents where deal_id = p_deal;
  if v_split <> 100 then raise exception 'Agent shares must add up to 100%% (now %)', v_split; end if;
  if d.commission_collected > 0 and p_account is null then raise exception 'Choose the account that received the money'; end if;

  select array_fill(0::numeric, array[coalesce(array_length(tier_thresholds, 1), 1)])
    into v_zero from public.finance_settings where id = 1;

  -- freeze each agent's chain (agent -> manager -> manager's manager ...)
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
  from chain c
  group by c.agent_id, c.person_id;

  update public.deals
     set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(), review_note = null
   where id = p_deal;

  if d.commission_collected > 0 then
    insert into public.finance_transactions
      (kind, direction, amount, account_id, occurred_at, deal_id, description)
    values ('commission_in', 'in', d.commission_collected, p_account,
            coalesce(p_collected_at, now()), p_deal, 'Commission collected');
  end if;

  if d.unit_id is not null then
    update public.units set status = 'sold' where id = d.unit_id;
  end if;

  if d.client_id is not null then
    select stage into v_old_stage from public.clients where id = d.client_id;
    if v_old_stage is distinct from 'deal_done' then
      update public.clients set previous_stage = stage, stage = 'deal_done' where id = d.client_id;
      insert into public.client_activity (client_id, action, field_name, old_value, new_value, note, changed_by)
      values (d.client_id, 'stage_change', 'stage', v_old_stage, 'deal_done', 'Deal approved', auth.uid());
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
    update public.units set status = 'active' where id = d.unit_id and status = 'sold';
  end if;
end;
$$;

-- ---------- 8. Row Level Security ----------
alter table public.finance_settings      enable row level security;
alter table public.finance_accounts      enable row level security;
alter table public.expense_categories    enable row level security;
alter table public.recurring_expenses    enable row level security;
alter table public.staff_targets         enable row level security;
alter table public.staff_salaries        enable row level security;
alter table public.commission_rates      enable row level security;
alter table public.deals                 enable row level security;
alter table public.deal_agents           enable row level security;
alter table public.deal_rates            enable row level security;
alter table public.finance_transactions  enable row level security;
alter table public.finance_audit         enable row level security;

do $$
declare r record;
begin
  -- start clean so re-running this file never duplicates policies
  for r in select policyname, tablename from pg_policies
           where schemaname = 'public' and tablename in ('finance_settings','finance_accounts',
             'expense_categories','recurring_expenses','staff_targets','staff_salaries',
             'commission_rates','deals','deal_agents','deal_rates','finance_transactions','finance_audit')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Lists everyone needs to read (tier thresholds are needed to show a person their own tier)
create policy "read" on public.finance_settings   for select using (auth.role() = 'authenticated');
create policy "read" on public.finance_accounts   for select using (public.is_finance_admin());
create policy "read" on public.expense_categories for select using (public.is_finance_admin());
create policy "read" on public.recurring_expenses for select using (public.is_finance_admin());

create policy "admin write" on public.finance_settings   for all using (public.is_finance_admin()) with check (public.is_finance_admin());
create policy "admin write" on public.finance_accounts   for all using (public.is_finance_admin()) with check (public.is_finance_admin());
create policy "admin write" on public.expense_categories for all using (public.is_finance_admin()) with check (public.is_finance_admin());
create policy "admin write" on public.recurring_expenses for all using (public.is_finance_admin()) with check (public.is_finance_admin());

-- Targets: you, your managers, and Admin/CEO
create policy "read" on public.staff_targets for select
  using (public.is_finance_admin() or public.is_self_or_manager_of(user_id));
create policy "admin write" on public.staff_targets for all
  using (public.is_finance_admin()) with check (public.is_finance_admin());

-- Salaries: only you and Admin/CEO
create policy "read" on public.staff_salaries for select
  using (public.is_finance_admin() or user_id = auth.uid());
create policy "admin write" on public.staff_salaries for all
  using (public.is_finance_admin()) with check (public.is_finance_admin());

-- Commission rates: only the rows that pay YOU (and Admin/CEO sees all)
create policy "read" on public.commission_rates for select
  using (public.is_finance_admin() or beneficiary_id = auth.uid());
create policy "admin write" on public.commission_rates for all
  using (public.is_finance_admin()) with check (public.is_finance_admin());

-- Deals
create policy "read" on public.deals for select
  using (created_by = auth.uid() or public.can_see_deal(id));
create policy "insert" on public.deals for insert with check (auth.role() = 'authenticated');
create policy "update" on public.deals for update
  using (public.is_finance_admin() or (created_by = auth.uid() and status in ('pending','returned')));
create policy "delete" on public.deals for delete
  using (public.is_finance_admin() or (created_by = auth.uid() and status in ('pending','returned')));

create policy "read" on public.deal_agents for select using (public.can_see_deal(deal_id));
create policy "insert" on public.deal_agents for insert with check (public.deal_is_editable_by_me(deal_id));
create policy "update" on public.deal_agents for update using (public.deal_is_editable_by_me(deal_id));
create policy "delete" on public.deal_agents for delete using (public.deal_is_editable_by_me(deal_id));

-- Frozen rates: only your own line (Admin/CEO sees and can adjust all)
create policy "read" on public.deal_rates for select
  using (public.is_finance_admin() or beneficiary_id = auth.uid());
create policy "admin write" on public.deal_rates for all
  using (public.is_finance_admin()) with check (public.is_finance_admin());

-- Ledger: Admin/CEO everything; others see money collected on deals they
-- can see (needed for target progress) and their own payouts / salary.
create policy "read" on public.finance_transactions for select using (
  public.is_finance_admin()
  or (kind in ('payout','salary') and beneficiary_id = auth.uid())
  or (kind = 'commission_in' and deal_id is not null and public.can_see_deal(deal_id))
);
create policy "admin write" on public.finance_transactions for all
  using (public.is_finance_admin()) with check (public.is_finance_admin());

create policy "read" on public.finance_audit for select using (public.is_finance_admin());

grant execute on function public.approve_deal(uuid, uuid, timestamptz) to authenticated;
grant execute on function public.cancel_deal(uuid, text) to authenticated;
