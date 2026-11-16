-- Origin Real Estate CRM — database schema
-- Run this in Supabase: Project > SQL Editor > New query > paste > Run

-- 1. Profiles (one row per employee, linked to their auth account)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  phone text,
  role text not null default 'pending'
    check (role in ('pending','admin','ceo','sales_manager','team_leader','sales_agent')),
  manager_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- 2. Developers (dropdown source)
create table public.developers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- 3. Projects (dropdown source, linked to a developer)
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  developer_id uuid references public.developers(id)
);

-- 4. Units
create table public.units (
  id uuid primary key default gen_random_uuid(),
  destination text not null,
  project_id uuid references public.projects(id),
  phase text,
  type text not null,
  land_area numeric,
  bua numeric,
  extra_area numeric,
  floor int not null,
  finishing text not null,
  downpayment numeric,
  remaining numeric,
  total_price numeric not null,
  delivery_date text not null,
  unit_number text not null,
  owner_name text not null,
  owner_number text not null,
  status text not null default 'active'
    check (status in ('active','hold','pending_delete')),
  hold_reason text,
  previous_status text,
  photos text[] not null default '{}',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- 5. Which sales reps a unit is assigned to (many-to-many)
create table public.unit_sales (
  unit_id uuid references public.units(id) on delete cascade,
  sales_id uuid references public.profiles(id) on delete cascade,
  primary key (unit_id, sales_id)
);

-- Helper: is the current logged-in user an admin?
create or replace function public.is_admin() returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.developers enable row level security;
alter table public.projects enable row level security;
alter table public.units enable row level security;
alter table public.unit_sales enable row level security;

-- Anyone logged in can read everything (fine-grained visibility is handled in the app)
create policy "read profiles" on public.profiles for select using (auth.role() = 'authenticated');
create policy "read developers" on public.developers for select using (auth.role() = 'authenticated');
create policy "read projects" on public.projects for select using (auth.role() = 'authenticated');
create policy "read units" on public.units for select using (auth.role() = 'authenticated');
create policy "read unit_sales" on public.unit_sales for select using (auth.role() = 'authenticated');

-- A brand-new signup can create their own pending profile row
create policy "self insert profile" on public.profiles for insert
  with check (auth.uid() = id);

-- Only admin can edit roles / team placement, or remove a user
create policy "admin update profiles" on public.profiles for update using (public.is_admin());
create policy "admin delete profiles" on public.profiles for delete using (public.is_admin());

-- Only admin manages developers and projects (the dropdown lists)
create policy "admin write developers" on public.developers for insert with check (public.is_admin());
create policy "admin update developers" on public.developers for update using (public.is_admin());
create policy "admin delete developers" on public.developers for delete using (public.is_admin());
create policy "admin write projects" on public.projects for insert with check (public.is_admin());
create policy "admin update projects" on public.projects for update using (public.is_admin());
create policy "admin delete projects" on public.projects for delete using (public.is_admin());

-- Any authenticated user can add a unit and update it (hold / request-delete flows)
create policy "authenticated insert units" on public.units for insert with check (auth.role() = 'authenticated');
create policy "authenticated update units" on public.units for update using (auth.role() = 'authenticated');
-- Only admin can actually delete a unit (enforces the approval requirement)
create policy "admin delete units" on public.units for delete using (public.is_admin());

create policy "authenticated write unit_sales" on public.unit_sales for insert with check (auth.role() = 'authenticated');
create policy "authenticated delete unit_sales" on public.unit_sales for delete using (auth.role() = 'authenticated');

-- First admin account: after your admin signs up once through the app,
-- run this once (replace the email) to promote them from 'pending' to 'admin':
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL_HERE');
