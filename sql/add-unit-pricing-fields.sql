alter table public.units add column if not exists remaining_maintenance numeric;
alter table public.units add column if not exists remaining_club_payment numeric;
alter table public.units add column if not exists extras_price numeric;
