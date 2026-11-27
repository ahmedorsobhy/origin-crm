-- =====================================================================
-- New look release:
--   1) Villas (townhouse / twin / standalone / quattro / palace / mansion) have no floor
--   2) Featured units: managers pin a unit with a star
--   3) Phone notifications: "Send me a test" + admin view of who has them on
-- Run once in Supabase SQL Editor. Safe to re-run.
-- =====================================================================

-- 1) Floor is optional (villas have none). Villas can note how many floors they have.
alter table public.units alter column floor drop not null;
alter table public.units add column if not exists villa_floors text;

-- 2) Featured pin (the automatic "Good price" is worked out in the app from the prices)
alter table public.units add column if not exists featured_pinned boolean not null default false;
alter table public.units add column if not exists featured_by uuid references public.profiles(id) on delete set null;
alter table public.units add column if not exists featured_at timestamptz;

create or replace function public.set_unit_featured(p_unit uuid, p_on boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not (public.is_manager_role() or public.is_finance_admin()) then raise exception 'Only managers can pin featured units'; end if;
  update public.units set featured_pinned = coalesce(p_on, false),
         featured_by = case when p_on then auth.uid() end, featured_at = case when p_on then now() end
   where id = p_unit;
  if not found then raise exception 'Unit not found'; end if;
end; $$;
revoke execute on function public.set_unit_featured(uuid, boolean) from public, anon;
grant execute on function public.set_unit_featured(uuid, boolean) to authenticated;

-- 3a) A test notification to yourself (goes out with the next minute's send)
create or replace function public.send_test_push() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.is_approved() then raise exception 'Not signed in'; end if;
  if not exists (select 1 from public.push_subscriptions where user_id = auth.uid()) then
    raise exception 'Turn on notifications on this device first';
  end if;
  insert into public.notification_queue (user_id, title, body, url)
  values (auth.uid(), 'Test notification ✅', 'Notifications work on this device. Each one stays until you open it.', '?open=today');
end; $$;
revoke execute on function public.send_test_push() from public, anon;
grant execute on function public.send_test_push() to authenticated;

-- 3b) Who has notifications on (admin / CEO only)
create or replace function public.push_status() returns table (user_id uuid, name text, role text, devices int, phones int, last_on timestamptz)
language sql stable security definer set search_path = public as $$
  select p.id, p.name, p.role,
         count(s.id)::int,
         count(s.id) filter (where s.user_agent ~* '(iphone|ipad|android)')::int,
         max(s.created_at)
    from public.profiles p left join public.push_subscriptions s on s.user_id = p.id
   where public.is_finance_admin() and p.role not in ('pending', 'guest')
   group by p.id, p.name, p.role
   order by count(s.id), p.name;
$$;
revoke execute on function public.push_status() from public, anon;
grant execute on function public.push_status() to authenticated;

select 'New look release ✓ (villas, featured, notifications)' as result;
