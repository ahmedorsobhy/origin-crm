-- =====================================================================
-- Sales experience update: shorter pipeline + defaults for faster deals.
-- Run once in Supabase SQL Editor after add-rent.sql. Safe to re-run.
--
-- New pipeline:  New -> Interested -> Meeting -> Negotiation -> Reserved -> Done
--   side states: No answer, Later      end: Closed (with a reason)
-- Existing clients are moved automatically and every move is written to the
-- client's timeline, so nothing about their history is lost.
-- =====================================================================

-- 1. Map old stages to the new ones (one timeline entry per client moved)
create temp table if not exists stage_map (old_stage text primary key, new_stage text, clear_meeting boolean);
truncate stage_map;
insert into stage_map values
  ('meeting_done',            'meeting_generated', true),
  ('follow_up_after_meeting', 'meeting_generated', true),
  ('second_meeting',          'meeting_generated', false),
  ('to_be_contracted',        'negotiation',       false),
  ('not_qualified',           'closed',            false);

insert into public.client_activity (client_id, action, field_name, old_value, new_value, note)
select c.id, 'stage_change', 'stage', c.stage, m.new_stage, 'Pipeline simplified'
  from public.clients c join stage_map m on m.old_stage = c.stage;

update public.clients c
   set stage = m.new_stage,
       meeting_at = case when m.clear_meeting then null else c.meeting_at end,
       closed_reason = case when m.new_stage = 'closed' then coalesce(c.closed_reason, 'not_qualified') else c.closed_reason end
  from stage_map m
 where m.old_stage = c.stage;

-- previous_stage pointing at a removed stage (used for "resume") -> its new stage
update public.clients c set previous_stage = m.new_stage
  from stage_map m where c.previous_stage = m.old_stage and m.new_stage <> 'closed';

drop table if exists stage_map;

alter table public.clients drop constraint if exists clients_stage_check;
alter table public.clients add constraint clients_stage_check check (stage in (
  'new_lead','options_sent','meeting_generated','negotiation','contracted','deal_done',
  'not_responding','long_term','closed'
));

-- 2. Defaults that pre-fill the deal form (editable in Finance -> Settings)
alter table public.finance_settings add column if not exists default_sale_commission_pct numeric not null default 2.5;
alter table public.finance_settings add column if not exists default_rent_commission_months numeric not null default 1;

-- 3. Duplicate numbers: when someone adds a phone that's already in the CRM,
--    it becomes a request for Admin / CEO to decide: keep with the current sales,
--    move to the new one, or let both work it (a copy for the new sales).
alter table public.clients add column if not exists duplicate_of uuid references public.clients(id) on delete set null;

create table if not exists public.lead_duplicates (
  id uuid primary key default gen_random_uuid(),
  existing_client_id uuid not null references public.clients(id) on delete cascade,
  phone text not null,
  payload jsonb not null,               -- what the new person entered (name, interest, source, notes...)
  requested_by uuid references public.profiles(id) default auth.uid(),
  requested_for uuid references public.profiles(id),   -- who it would be assigned to
  status text not null default 'pending' check (status in ('pending','kept_old','moved_new','both')),
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.lead_duplicates enable row level security;
drop policy if exists "read" on public.lead_duplicates;
drop policy if exists "insert" on public.lead_duplicates;
drop policy if exists "decide" on public.lead_duplicates;
create policy "read" on public.lead_duplicates for select
  using (public.is_finance_admin() or requested_by = auth.uid() or requested_for = auth.uid());
create policy "insert" on public.lead_duplicates for insert
  with check (auth.role() = 'authenticated' and requested_by = auth.uid());
create policy "decide" on public.lead_duplicates for update
  using (public.is_finance_admin()) with check (public.is_finance_admin());

-- =====================================================================
-- 4. Security: lock client data to the people who should see it.
--    Before this, ANY account that signed up on the site (even one not yet
--    approved) could read every client, phone number and unit owner through
--    the database API, and edit any client. Now:
--      * Not-yet-approved accounts ("pending") can only read their own profile.
--      * Clients, their timeline and links: Admin / CEO see all; everyone else
--        sees and edits only clients assigned to them or to people under them.
--      * Units, projects, developers, attendance: approved accounts only.
--    Duplicate checks use phone_owners(), which only says WHO has a number and
--    its stage, never the client's details.
-- =====================================================================
create or replace function public.is_approved() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role <> 'pending');
$$;

create or replace function public.can_see_client(p_client uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_finance_admin() or exists (
    select 1 from public.clients c
     where c.id = p_client
       and (public.is_self_or_manager_of(c.assigned_to) or c.created_by = auth.uid()));
$$;

-- Who already has these numbers? (compares the last 10 digits)
create or replace function public.phone_owners(p_phones text[])
returns table (phone_key text, client_id uuid, assigned_to uuid, stage text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select right(regexp_replace(c.phone, '[^0-9]', '', 'g'), 10), c.id, c.assigned_to, c.stage, c.created_at
    from public.clients c
   where public.is_approved()
     and right(regexp_replace(c.phone, '[^0-9]', '', 'g'), 10) = any (
       select right(regexp_replace(x, '[^0-9]', '', 'g'), 10) from unnest(p_phones) x)
   order by (c.stage = 'closed'), c.created_at;
$$;
grant execute on function public.phone_owners(text[]) to authenticated;

-- clients
drop policy if exists "read clients" on public.clients;
drop policy if exists "write clients" on public.clients;
drop policy if exists "update clients" on public.clients;
create policy "read clients" on public.clients for select using (
  public.is_finance_admin() or public.is_self_or_manager_of(assigned_to) or created_by = auth.uid());
create policy "write clients" on public.clients for insert with check (
  public.is_approved() and (public.is_finance_admin() or public.is_self_or_manager_of(assigned_to)));
create policy "update clients" on public.clients for update
  using (public.is_finance_admin() or public.is_self_or_manager_of(assigned_to))
  with check (public.is_finance_admin() or public.is_self_or_manager_of(assigned_to));

-- timeline + links follow the client
drop policy if exists "read client_activity" on public.client_activity;
drop policy if exists "write client_activity" on public.client_activity;
create policy "read client_activity" on public.client_activity for select using (public.can_see_client(client_id));
create policy "write client_activity" on public.client_activity for insert with check (public.is_approved() and public.can_see_client(client_id));

drop policy if exists "read client_projects" on public.client_projects;
drop policy if exists "write client_projects" on public.client_projects;
drop policy if exists "delete client_projects" on public.client_projects;
create policy "read client_projects" on public.client_projects for select using (public.can_see_client(client_id));
create policy "write client_projects" on public.client_projects for insert with check (public.can_see_client(client_id));
create policy "delete client_projects" on public.client_projects for delete using (public.can_see_client(client_id));

drop policy if exists "read client_units" on public.client_units;
drop policy if exists "write client_units" on public.client_units;
drop policy if exists "delete client_units" on public.client_units;
create policy "read client_units" on public.client_units for select using (public.can_see_client(client_id));
create policy "write client_units" on public.client_units for insert with check (public.can_see_client(client_id));
create policy "delete client_units" on public.client_units for delete using (public.can_see_client(client_id));

-- approved accounts only for the rest of the CRM
drop policy if exists "read profiles" on public.profiles;
create policy "read profiles" on public.profiles for select using (public.is_approved() or id = auth.uid());
drop policy if exists "read developers" on public.developers;
create policy "read developers" on public.developers for select using (public.is_approved());
drop policy if exists "read projects" on public.projects;
create policy "read projects" on public.projects for select using (public.is_approved());
drop policy if exists "read units" on public.units;
create policy "read units" on public.units for select using (public.is_approved());
drop policy if exists "read unit_sales" on public.unit_sales;
create policy "read unit_sales" on public.unit_sales for select using (public.is_approved());
drop policy if exists "authenticated insert units" on public.units;
create policy "authenticated insert units" on public.units for insert with check (public.is_approved());
drop policy if exists "authenticated update units" on public.units;
create policy "authenticated update units" on public.units for update using (public.is_approved());
drop policy if exists "authenticated write unit_sales" on public.unit_sales;
create policy "authenticated write unit_sales" on public.unit_sales for insert with check (public.is_approved());
drop policy if exists "authenticated delete unit_sales" on public.unit_sales;
create policy "authenticated delete unit_sales" on public.unit_sales for delete using (public.is_approved());
drop policy if exists "read attendance" on public.attendance;
create policy "read attendance" on public.attendance for select using (public.is_approved());
