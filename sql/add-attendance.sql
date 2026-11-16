-- Location-gated attendance ("check in" only, no check-out).
-- The app only lets someone insert a row when the browser's GPS position
-- is within OFFICE_RADIUS_METERS of the office coordinates (checked in
-- the app itself); this table just stores the result so admins/CEO can
-- see who checked in and where from.

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  lat double precision,
  lng double precision,
  distance_meters double precision
);

create index if not exists idx_attendance_user_day on public.attendance(user_id, checked_in_at);

alter table public.attendance enable row level security;

-- Everyone authenticated can read (the app itself only shows other people's
-- attendance to admin/CEO, same pattern used everywhere else in this CRM).
create policy "read attendance" on public.attendance for select using (auth.role() = 'authenticated');

-- A person can only ever insert their OWN check-in row (never someone else's).
create policy "self insert attendance" on public.attendance for insert
  with check (auth.role() = 'authenticated' and user_id = auth.uid());
