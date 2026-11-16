-- Clients (buyer leads) module

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  budget numeric,
  notes text,
  source text check (source in (
    'personal_referral','repeat_client','facebook_campaign','whatsapp_campaign',
    'data_owners','company_campaign','colleague_referral'
  )),
  referral_name text, -- colleague's name, used only when source = 'colleague_referral'
  stage text not null default 'new' check (stage in (
    'new','contacted','not_qualified','qualified','options_sent','meeting_generated',
    'meeting_done','follow_up_after_meeting','second_meeting','negotiation',
    'promise_of_sale','contracted','transfer_done','not_responding'
  )),
  previous_stage text,
  meeting_at timestamptz,
  broker_interest text,
  assigned_to uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_clients_updated_at on public.clients;
create trigger trg_clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- Which projects/units a client is interested in
create table public.client_projects (
  client_id uuid references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  primary key (client_id, project_id)
);

create table public.client_units (
  client_id uuid references public.clients(id) on delete cascade,
  unit_id uuid references public.units(id) on delete cascade,
  primary key (client_id, unit_id)
);

-- Full history / audit log — every change to a client is logged here,
-- not just stage moves, so the CRM can show a complete timeline per client
-- and the daily/weekly reports can be built accurately from real timestamps.
create table public.client_activity (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  action text not null,       -- 'created' | 'stage_change' | 'field_update' | 'project_link' | 'unit_link' | 'note'
  field_name text,            -- e.g. 'stage', 'phone', 'assigned_to', 'budget'
  old_value text,
  new_value text,
  note text,                  -- feedback text: required by the app on every stage_change, optional standalone "Add Feedback"
  changed_by uuid references public.profiles(id),
  changed_at timestamptz not null default now()
);

create index if not exists idx_client_activity_client on public.client_activity(client_id, changed_at desc);

-- Row Level Security
alter table public.clients enable row level security;
alter table public.client_projects enable row level security;
alter table public.client_units enable row level security;
alter table public.client_activity enable row level security;

create policy "read clients" on public.clients for select using (auth.role() = 'authenticated');
create policy "write clients" on public.clients for insert with check (auth.role() = 'authenticated');
create policy "update clients" on public.clients for update using (auth.role() = 'authenticated');
create policy "admin delete clients" on public.clients for delete using (public.is_admin());

create policy "read client_projects" on public.client_projects for select using (auth.role() = 'authenticated');
create policy "write client_projects" on public.client_projects for insert with check (auth.role() = 'authenticated');
create policy "delete client_projects" on public.client_projects for delete using (auth.role() = 'authenticated');

create policy "read client_units" on public.client_units for select using (auth.role() = 'authenticated');
create policy "write client_units" on public.client_units for insert with check (auth.role() = 'authenticated');
create policy "delete client_units" on public.client_units for delete using (auth.role() = 'authenticated');

create policy "read client_activity" on public.client_activity for select using (auth.role() = 'authenticated');
create policy "write client_activity" on public.client_activity for insert with check (auth.role() = 'authenticated');
