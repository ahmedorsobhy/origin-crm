-- =====================================================================
-- Security fix: owner contacts, unit editing, photo uploads, activity names
-- Safe to run more than once. Run the whole file in Supabase → SQL Editor.
-- =====================================================================

-- 1) Who may edit a unit (and see its owner): Admin/CEO, whoever added it,
--    a sales person on the unit, or that sales person's manager chain.
create or replace function public.can_edit_unit(p_unit uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_finance_admin()
      or exists (select 1 from public.units u where u.id = p_unit and u.created_by = auth.uid())
      or exists (select 1 from public.unit_sales s where s.unit_id = p_unit and public.is_self_or_manager_of(s.sales_id));
$$;
grant execute on function public.can_edit_unit(uuid) to authenticated;

-- 2) Owner contacts move to their own protected table
create table if not exists public.unit_owners (
  unit_id uuid primary key references public.units(id) on delete cascade deferrable initially deferred,
  owner_name text,
  owner_number text,
  new_owner_name text,
  new_owner_phone text,
  updated_at timestamptz not null default now()
);
do $$ begin
  alter table public.unit_owners alter constraint unit_owners_unit_id_fkey deferrable initially deferred;
exception when others then null; end $$;
alter table public.unit_owners enable row level security;
drop policy if exists "read unit owners" on public.unit_owners;
create policy "read unit owners" on public.unit_owners for select using (public.can_edit_unit(unit_id));
grant select on public.unit_owners to authenticated;
revoke all on public.unit_owners from anon;

-- the open columns on units must allow empty values
do $$ begin
  begin alter table public.units alter column owner_name drop not null; exception when others then null; end;
  begin alter table public.units alter column owner_number drop not null; exception when others then null; end;
end $$;

-- Copy what is there today, then blank the open columns on units
insert into public.unit_owners (unit_id, owner_name, owner_number, new_owner_name, new_owner_phone)
select id, owner_name, owner_number, new_owner_name, new_owner_phone from public.units
where owner_name is not null or owner_number is not null or new_owner_name is not null or new_owner_phone is not null
on conflict (unit_id) do update set
  owner_name = coalesce(excluded.owner_name, unit_owners.owner_name),
  owner_number = coalesce(excluded.owner_number, unit_owners.owner_number),
  new_owner_name = coalesce(excluded.new_owner_name, unit_owners.new_owner_name),
  new_owner_phone = coalesce(excluded.new_owner_phone, unit_owners.new_owner_phone);

-- Every write to units (app, deals, anything) is caught here: the contact goes
-- into unit_owners and the units row keeps them empty.
create or replace function public.units_owner_split() returns trigger
language plpgsql security definer set search_path = public as $$
declare o public.unit_owners;
begin
  if tg_op = 'INSERT' then
    if new.owner_name is not null or new.owner_number is not null or new.new_owner_name is not null or new.new_owner_phone is not null then
      insert into public.unit_owners (unit_id, owner_name, owner_number, new_owner_name, new_owner_phone)
      values (new.id, new.owner_name, new.owner_number, new.new_owner_name, new.new_owner_phone)
      on conflict (unit_id) do update set owner_name = excluded.owner_name, owner_number = excluded.owner_number,
        new_owner_name = excluded.new_owner_name, new_owner_phone = excluded.new_owner_phone, updated_at = now();
    end if;
  else
    insert into public.unit_owners (unit_id) values (new.id) on conflict (unit_id) do nothing;
    select * into o from public.unit_owners where unit_id = new.id;
    if new.owner_name is not null then o.owner_name := nullif(new.owner_name, ''); end if;  -- empty text clears, null = not sent
    if new.owner_number is not null then o.owner_number := nullif(new.owner_number, ''); end if;  -- empty text clears, null = not sent
    if new.new_owner_name is not null then o.new_owner_name := nullif(new.new_owner_name, ''); end if;  -- empty text clears, null = not sent
    if new.new_owner_phone is not null then o.new_owner_phone := nullif(new.new_owner_phone, ''); end if;  -- empty text clears, null = not sent
    if old.status = 'sold' and new.status is distinct from 'sold' then o.new_owner_name := null; o.new_owner_phone := null; end if;
    update public.unit_owners set owner_name = o.owner_name, owner_number = o.owner_number,
      new_owner_name = o.new_owner_name, new_owner_phone = o.new_owner_phone, updated_at = now()
    where unit_id = new.id;
  end if;
  new.owner_name := null; new.owner_number := null; new.new_owner_name := null; new.new_owner_phone := null;
  return new;
end $$;
drop trigger if exists trg_units_owner_split on public.units;
create trigger trg_units_owner_split before insert or update on public.units
  for each row execute function public.units_owner_split();
-- AFTER the trigger exists, blank the old columns (goes through the trigger, values already copied)
update public.units set owner_name = null, owner_number = null, new_owner_name = null, new_owner_phone = null
where owner_name is not null or owner_number is not null or new_owner_name is not null or new_owner_phone is not null;

-- 3) Editing units and their sales links: only people who handle the unit
drop policy if exists "authenticated update units" on public.units;
drop policy if exists "update units" on public.units;
create policy "update units" on public.units for update
  using (public.is_approved() and public.can_edit_unit(id)) with check (public.is_approved());

drop policy if exists "authenticated write unit_sales" on public.unit_sales;
drop policy if exists "write unit_sales" on public.unit_sales;
create policy "write unit_sales" on public.unit_sales for insert with check (public.is_approved() and public.can_edit_unit(unit_id));
drop policy if exists "authenticated delete unit_sales" on public.unit_sales;
drop policy if exists "delete unit_sales" on public.unit_sales;
create policy "delete unit_sales" on public.unit_sales for delete using (public.is_approved() and public.can_edit_unit(unit_id));

-- 4) Duplicate-number checks read the protected table
create or replace function public.known_phones(p_phones text[]) returns table (phone_key text, kind text)
language sql stable security definer set search_path = public as $$
  with k as (select distinct right(regexp_replace(x, '\D', '', 'g'), 10) as key from unnest(p_phones) x)
  select k.key, 'client' from k where public.is_approved() and exists (select 1 from public.clients c where right(regexp_replace(c.phone, '\D', '', 'g'), 10) = k.key)
  union
  select k.key, 'owner' from k where public.is_approved() and exists (select 1 from public.unit_owners u where right(regexp_replace(coalesce(u.owner_number, ''), '\D', '', 'g'), 10) = k.key)
  union
  select k.key, 'cold' from k where public.is_approved() and exists (select 1 from public.cold_leads l where right(regexp_replace(l.phone, '\D', '', 'g'), 10) = k.key);
$$;
revoke execute on function public.known_phones(text[]) from public, anon;
grant execute on function public.known_phones(text[]) to authenticated;

-- 5) Photo uploads: approved accounts only (pending sign-ups can't upload)
do $$ begin
  if to_regclass('storage.objects') is not null then
    execute 'drop policy if exists "authenticated upload unit photos" on storage.objects';
    execute $p$create policy "authenticated upload unit photos" on storage.objects for insert to authenticated
      with check (bucket_id = 'unit-photos' and public.is_approved())$p$;
  end if;
end $$;

-- 6) Activity is always written under the real person's name
create or replace function public.activity_set_author() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_finance_admin() then new.changed_by := auth.uid(); end if;
  return new;
end $$;
drop trigger if exists trg_activity_author on public.client_activity;
create trigger trg_activity_author before insert on public.client_activity
  for each row execute function public.activity_set_author();

-- 7) Small hardening
drop policy if exists "insert" on public.lead_duplicates;
create policy "insert" on public.lead_duplicates for insert with check (public.is_approved() and requested_by = auth.uid());

-- =====================================================================
-- 8) Deals vs reservations
--    Deal        = done (transfer + commission), counted in the month it was closed
--    Reservation = promise of sale / rental approved, counted in the month it was approved
--    Cancelled ones count as neither.
-- =====================================================================
alter table public.deals add column if not exists reserved_at timestamptz;
alter table public.deals add column if not exists done_at timestamptz;

-- Fill in what's there today (reservation date from the finance history when it exists)
update public.deals d set reserved_at = coalesce(
    (select min(a.changed_at) from public.finance_audit a
      where a.table_name = 'deals' and a.new_data->>'id' = d.id::text and a.new_data->>'status' = 'reserved'),
    case when d.status = 'reserved' then d.reviewed_at end,
    d.created_at)
 where d.reserved_at is null and d.status in ('reserved', 'approved');
update public.deals set done_at = coalesce((transfer_date + time '12:00') at time zone 'Africa/Cairo', reviewed_at, created_at)
 where status = 'approved';

-- From now on the dates are stamped automatically and never move
create or replace function public.deals_stamp_dates() returns trigger
language plpgsql as $$
begin
  if new.status in ('reserved', 'approved') and new.reserved_at is null then new.reserved_at := now(); end if;
  if new.status = 'approved' then
    if new.transfer_date is not null then new.done_at := (new.transfer_date + time '12:00') at time zone 'Africa/Cairo';
    elsif new.done_at is null then new.done_at := now(); end if;
  end if;
  if new.status in ('pending', 'returned', 'rejected') then new.reserved_at := null; new.done_at := null; end if;
  return new;
end $$;
drop trigger if exists trg_deals_stamp_dates on public.deals;
create trigger trg_deals_stamp_dates before insert or update of status, transfer_date on public.deals
  for each row execute function public.deals_stamp_dates();

-- Ranking: Deals (done) and Reservations — positions only
drop function if exists public.sales_ranking(timestamptz, timestamptz);
create or replace function public.sales_ranking(p_from timestamptz, p_to timestamptz)
returns table (user_id uuid, name text, avatar_url text, deals_rank int, money_rank int, calls int, cold_calls int, client_calls int,
               whatsapp int, meetings int, units_added int, new_clients int, reply_minutes int, reservations_rank int)
language sql stable security definer set search_path = public as $$
  with s as (select id, name, avatar_url from public.profiles where role = 'sales_agent'),
  d as (
    select a.agent_id as uid, count(distinct dl.id) as n from public.deals dl join public.deal_agents a on a.deal_id = dl.id
    where dl.status = 'approved' and dl.done_at >= p_from and dl.done_at < p_to
    group by a.agent_id),
  r as (
    select a.agent_id as uid, count(distinct dl.id) as n from public.deals dl join public.deal_agents a on a.deal_id = dl.id
    where dl.status in ('reserved', 'approved') and dl.reserved_at >= p_from and dl.reserved_at < p_to
    group by a.agent_id),
  m as (
    select a.agent_id as uid, sum(t.amount * a.split_pct / 100.0) as amt
    from public.finance_transactions t join public.deal_agents a on a.deal_id = t.deal_id and (t.side is null or a.side = t.side)
    where t.kind = 'commission_in' and t.occurred_at >= p_from and t.occurred_at < p_to group by a.agent_id),
  ca as (
    select changed_by as uid, count(*) filter (where action = 'call') as calls, count(*) filter (where action in ('whatsapp', 'unit_sent')) as wa,
           count(*) filter (where action = 'stage_change' and new_value = 'meeting_generated') as meetings
    from public.client_activity where changed_at >= p_from and changed_at < p_to group by changed_by),
  co as (
    select user_id as uid, count(*) filter (where action = 'call') as calls, count(*) filter (where action = 'whatsapp') as wa
    from public.cold_activity where created_at >= p_from and created_at < p_to group by user_id),
  un as (select created_by as uid, count(*) as n from public.units where created_at >= p_from and created_at < p_to group by created_by),
  cl as (select created_by as uid, count(*) as n from public.clients where created_at >= p_from and created_at < p_to group by created_by),
  rp as (
    select c.assigned_to as uid, percentile_cont(0.5) within group (order by extract(epoch from (f.first_at - c.created_at)) / 60) as mins
    from public.clients c
    join lateral (select min(x.changed_at) as first_at from public.client_activity x
                  where x.client_id = c.id and x.action in ('call', 'whatsapp', 'unit_sent', 'quick_reply', 'note', 'stage_change')) f on f.first_at is not null
    where c.created_at >= p_from and c.created_at < p_to and f.first_at >= c.created_at group by c.assigned_to)
  select s.id, s.name, s.avatar_url,
    case when coalesce(d.n, 0) > 0 then (rank() over (order by coalesce(d.n, 0) desc))::int end,
    case when coalesce(m.amt, 0) > 0 then (rank() over (order by coalesce(m.amt, 0) desc))::int end,
    (coalesce(ca.calls, 0) + coalesce(co.calls, 0))::int, coalesce(co.calls, 0)::int, coalesce(ca.calls, 0)::int,
    (coalesce(ca.wa, 0) + coalesce(co.wa, 0))::int, coalesce(ca.meetings, 0)::int, coalesce(un.n, 0)::int, coalesce(cl.n, 0)::int,
    round(rp.mins)::int,
    case when coalesce(r.n, 0) > 0 then (rank() over (order by coalesce(r.n, 0) desc))::int end
  from s left join d on d.uid = s.id left join r on r.uid = s.id left join m on m.uid = s.id left join ca on ca.uid = s.id left join co on co.uid = s.id
    left join un on un.uid = s.id left join cl on cl.uid = s.id left join rp on rp.uid = s.id
  where public.is_approved();
$$;
revoke execute on function public.sales_ranking(timestamptz, timestamptz) from public, anon;
grant execute on function public.sales_ranking(timestamptz, timestamptz) to authenticated;

select 'Security fix installed ✓' as result;
