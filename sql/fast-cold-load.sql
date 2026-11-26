-- Fix: "Couldn't load the sheets (statement timeout)".
-- The cold-call tables checked "is this person me or in my team?" once PER ROW (a walk up the
-- reporting chain for every one of thousands of numbers and feedbacks). As the feedback log grew,
-- loading the cold calls page passed the database time limit.
-- Now the team is worked out ONCE per request and every row is checked against that list.
-- Who can see what does not change. Safe to run more than once.

-- everyone I'm allowed to see: me + everyone under me (any depth)
create or replace function public.my_team_ids() returns uuid[]
language sql stable security definer set search_path = public as $$
  with recursive t as (
    select id, 0 as depth from public.profiles where id = auth.uid()
    union
    select p.id, t.depth + 1 from public.profiles p join t on p.manager_id = t.id where t.depth < 20
  )
  select coalesce(array_agg(id), '{}') from t;
$$;
revoke execute on function public.my_team_ids() from public, anon;
grant execute on function public.my_team_ids() to authenticated;

-- "(select f())" makes Postgres run the function once per request, not once per row
drop policy if exists "read sheets" on public.cold_sheets;
create policy "read sheets" on public.cold_sheets for select
  using ((select public.is_finance_admin()) or assigned_to in (select unnest(public.my_team_ids())));

drop policy if exists "read leads" on public.cold_leads;
create policy "read leads" on public.cold_leads for select
  using ((select public.is_finance_admin()) or assigned_to in (select unnest(public.my_team_ids())));

drop policy if exists "read cold activity" on public.cold_activity;
create policy "read cold activity" on public.cold_activity for select
  using (
    (select public.is_finance_admin())
    or user_id in (select unnest(public.my_team_ids()))
    or (lead_id is not null and exists (select 1 from public.cold_leads l where l.id = cold_activity.lead_id and l.assigned_to in (select unnest(public.my_team_ids()))))
  );

drop policy if exists "read dnc" on public.cold_dnc;
create policy "read dnc" on public.cold_dnc for select
  using (
    (select public.is_finance_admin())
    or exists (select 1 from public.cold_leads l where public.phone_key(l.phone) = cold_dnc.phone_key and l.assigned_to in (select unnest(public.my_team_ids())))
  );

create index if not exists cold_activity_lead_idx on public.cold_activity (lead_id);

select 'Cold calls load fast again ✓' as result;
