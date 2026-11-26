-- Team & operations release:
--   policies (work regulation + employment contract) with acceptance — OFF until the admin turns it on
--   leave requests, lateness/absence deductions, monthly evaluations, onboarding checklist,
--   deal checklist.
-- Safe to run more than once.

-- helper: a manager (team leader / sales manager) acting on someone in their line, or admin/CEO
create or replace function public.can_manage_person(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_finance_admin()
      or (public.is_manager_role() and p_user <> auth.uid() and public.is_self_or_manager_of(p_user));
$$;

-- ---------- settings ----------
alter table public.finance_settings add column if not exists policies_required boolean not null default false;
alter table public.finance_settings add column if not exists annual_leave_days integer not null default 15;

-- ---------- policies acceptance ----------
create table if not exists public.policy_acceptances (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  version     integer not null,
  accepted_at timestamptz not null default now(),
  unique (user_id, version)
);
alter table public.policy_acceptances enable row level security;
revoke all on public.policy_acceptances from anon;
grant select, insert on public.policy_acceptances to authenticated;
drop policy if exists "see acceptances" on public.policy_acceptances;
create policy "see acceptances" on public.policy_acceptances for select using (user_id = auth.uid() or public.can_manage_person(user_id));
drop policy if exists "accept own" on public.policy_acceptances;
create policy "accept own" on public.policy_acceptances for insert with check (user_id = auth.uid() and public.is_approved());

-- ---------- leave requests ----------
create table if not exists public.leave_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  from_date   date not null,
  to_date     date not null,
  days        numeric not null check (days > 0),
  kind        text not null default 'annual' check (kind in ('annual', 'unpaid', 'other')),
  reason      text,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  decided_by  uuid references public.profiles(id) on delete set null,
  decided_at  timestamptz,
  created_at  timestamptz not null default now(),
  check (to_date >= from_date)
);
alter table public.leave_requests enable row level security;
revoke all on public.leave_requests from anon;
grant select, insert, update, delete on public.leave_requests to authenticated;
drop policy if exists "see leave" on public.leave_requests;
create policy "see leave" on public.leave_requests for select using (user_id = auth.uid() or public.can_manage_person(user_id));
drop policy if exists "ask leave" on public.leave_requests;
create policy "ask leave" on public.leave_requests for insert
  with check (public.is_approved() and ((user_id = auth.uid() and status = 'pending') or public.can_manage_person(user_id)));
drop policy if exists "decide leave" on public.leave_requests;
create policy "decide leave" on public.leave_requests for update using (public.can_manage_person(user_id)) with check (public.can_manage_person(user_id));
drop policy if exists "cancel leave" on public.leave_requests;
create policy "cancel leave" on public.leave_requests for delete using ((user_id = auth.uid() and status = 'pending') or public.can_manage_person(user_id));

create or replace function public.leave_notify() returns trigger
language plpgsql security definer set search_path = public as $$
declare who text; mgr uuid;
begin
  select name, manager_id into who, mgr from public.profiles where id = new.user_id;
  if tg_op = 'INSERT' and new.status = 'pending' and mgr is not null then
    insert into public.notification_queue (user_id, title, body, url)
    values (mgr, 'Leave request 🌴', coalesce(who, 'Someone') || ' · ' || new.days || ' day(s) from ' || to_char(new.from_date, 'DD Mon'), '?open=leave');
  elsif tg_op = 'UPDATE' and new.status <> old.status and new.status in ('approved', 'rejected') then
    insert into public.notification_queue (user_id, title, body, url)
    values (new.user_id, case when new.status = 'approved' then 'Leave approved ✅' else 'Leave not approved' end,
            new.days || ' day(s) from ' || to_char(new.from_date, 'DD Mon'), '?open=leave');
  end if;
  return new;
end $$;
drop trigger if exists trg_leave_notify on public.leave_requests;
create trigger trg_leave_notify after insert or update on public.leave_requests for each row execute function public.leave_notify();

-- ---------- deductions (only decisions are stored; suggestions are worked out by the app) ----------
create table if not exists public.deduction_decisions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  day         date not null,
  kind        text not null check (kind in ('late', 'absent', 'manual')),
  status      text not null check (status in ('confirmed', 'excused')),
  days        numeric not null default 0,          -- deduction in days of pay (0.1 = 10% of a day)
  note        text,
  decided_by  uuid references public.profiles(id) on delete set null,
  decided_at  timestamptz not null default now()
);
create unique index if not exists deduction_one_per_day on public.deduction_decisions (user_id, day, kind) where kind <> 'manual';
alter table public.deduction_decisions enable row level security;
revoke all on public.deduction_decisions from anon;
grant select, insert, update, delete on public.deduction_decisions to authenticated;
drop policy if exists "see deductions" on public.deduction_decisions;
create policy "see deductions" on public.deduction_decisions for select using ((user_id = auth.uid() and status = 'confirmed') or public.can_manage_person(user_id));
drop policy if exists "decide deductions" on public.deduction_decisions;
create policy "decide deductions" on public.deduction_decisions for all using (public.can_manage_person(user_id)) with check (public.can_manage_person(user_id));

-- ---------- monthly evaluation ----------
create table if not exists public.evaluations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  month       text not null check (month ~ '^\d{4}-\d{2}$'),
  rating      integer check (rating between 1 and 5),
  strengths   text,
  improve     text,
  goals       text,
  by_user     uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now(),
  unique (user_id, month)
);
alter table public.evaluations enable row level security;
revoke all on public.evaluations from anon;
grant select, insert, update, delete on public.evaluations to authenticated;
drop policy if exists "see evaluations" on public.evaluations;
create policy "see evaluations" on public.evaluations for select using (user_id = auth.uid() or public.can_manage_person(user_id));
drop policy if exists "write evaluations" on public.evaluations;
create policy "write evaluations" on public.evaluations for all using (public.can_manage_person(user_id)) with check (public.can_manage_person(user_id));

-- ---------- onboarding checklist ----------
create table if not exists public.onboarding (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  items       jsonb not null default '{}'::jsonb,   -- { item_id: "done date" }
  updated_at  timestamptz not null default now()
);
alter table public.onboarding enable row level security;
revoke all on public.onboarding from anon;
grant select, insert, update, delete on public.onboarding to authenticated;
drop policy if exists "see onboarding" on public.onboarding;
create policy "see onboarding" on public.onboarding for select using (user_id = auth.uid() or public.can_manage_person(user_id));
drop policy if exists "write onboarding" on public.onboarding;
create policy "write onboarding" on public.onboarding for all using (public.can_manage_person(user_id)) with check (public.can_manage_person(user_id));

-- ---------- deal checklist ----------
create table if not exists public.deal_checklists (
  deal_id     uuid primary key references public.deals(id) on delete cascade,
  items       jsonb not null default '{}'::jsonb,
  updated_by  uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now()
);
alter table public.deal_checklists enable row level security;
revoke all on public.deal_checklists from anon;
grant select, insert, update on public.deal_checklists to authenticated;
drop policy if exists "see deal checklist" on public.deal_checklists;
create policy "see deal checklist" on public.deal_checklists for select using (public.can_see_deal(deal_id));
drop policy if exists "write deal checklist" on public.deal_checklists;
create policy "write deal checklist" on public.deal_checklists for all using (public.can_see_deal(deal_id) and public.is_approved()) with check (public.can_see_deal(deal_id) and public.is_approved());

select 'Team & operations tables ready ✓' as result;
