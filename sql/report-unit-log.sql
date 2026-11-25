-- =====================================================================
-- Daily report: who changed which unit, and when
--  * Every time someone adds or edits a unit, a line is saved (who, when, which fields)
--  * The Daily report counts "Unit updates" from here (from the day you run this file)
-- Safe to run more than once. Run the whole file in Supabase → SQL Editor.
-- =====================================================================

create table if not exists public.unit_activity (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references public.units(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null check (action in ('created', 'updated')),
  fields text[],
  created_at timestamptz not null default now()
);
create index if not exists unit_activity_created_idx on public.unit_activity (created_at desc);
create index if not exists unit_activity_user_idx on public.unit_activity (user_id, created_at desc);
alter table public.unit_activity enable row level security;
grant select on public.unit_activity to authenticated;

drop policy if exists "read unit activity" on public.unit_activity;
create policy "read unit activity" on public.unit_activity for select
  using (public.is_finance_admin() or public.is_self_or_manager_of(user_id));
-- no insert / update / delete policies: lines are only written by the trigger below

create or replace function public.log_unit_activity() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_fields text[];
begin
  if auth.uid() is null then return null; end if;            -- SQL editor / system jobs
  if tg_op = 'INSERT' then
    insert into public.unit_activity (unit_id, user_id, action) values (new.id, auth.uid(), 'created');
    return null;
  end if;
  select array_agg(n.key order by n.key) into v_fields
    from jsonb_each(to_jsonb(new)) n join jsonb_each(to_jsonb(old)) o using (key)
   where n.value is distinct from o.value and n.key not in ('updated_at', 'created_at', 'created_by');
  if v_fields is null then return null; end if;               -- nothing really changed
  -- several saves of the same unit by the same person within 2 minutes count once
  if exists (select 1 from public.unit_activity a where a.unit_id = new.id and a.user_id = auth.uid()
               and a.created_at > now() - interval '2 minutes') then
    update public.unit_activity a set fields = (select array_agg(distinct f) from unnest(coalesce(a.fields, '{}') || v_fields) f)
     where a.id = (select id from public.unit_activity b where b.unit_id = new.id and b.user_id = auth.uid() order by b.created_at desc limit 1);
    return null;
  end if;
  insert into public.unit_activity (unit_id, user_id, action, fields) values (new.id, auth.uid(), 'updated', v_fields);
  return null;
end $$;
revoke execute on function public.log_unit_activity() from public, anon, authenticated;
drop trigger if exists trg_log_unit_activity on public.units;
create trigger trg_log_unit_activity after insert or update on public.units
  for each row execute function public.log_unit_activity();

select 'Unit activity log installed ✓' as result;
