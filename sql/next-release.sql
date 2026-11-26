-- Next release: AI analyst, expected transfer dates, new stage "Follow-up after meeting",
-- reassigning "No answer" clients, job titles + appraisals + promotion suggestions,
-- attendance exemption + late permissions, Facebook Lead Ads into the CRM.
-- Safe to run more than once.

-- ---------- 2. reserved deals: expected transfer date ----------
alter table public.deals add column if not exists expected_transfer_date date;

-- ---------- 7. clients ----------
alter table public.clients drop constraint if exists clients_stage_check;
alter table public.clients add constraint clients_stage_check check (stage in
  ('new_lead', 'options_sent', 'meeting_generated', 'follow_up_after_meeting', 'negotiation', 'contracted', 'deal_done', 'not_responding', 'long_term', 'closed'));
alter table public.clients add column if not exists stage_since timestamptz;
alter table public.clients add column if not exists original_assignee uuid references public.profiles(id) on delete set null;
update public.clients set stage_since = coalesce(stage_since, updated_at, created_at) where stage_since is null;

create or replace function public.clients_stage_since() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' or new.stage is distinct from old.stage then new.stage_since := now(); end if;
  return new;
end $$;
drop trigger if exists trg_clients_stage_since on public.clients;
create trigger trg_clients_stage_since before insert or update of stage on public.clients
  for each row execute function public.clients_stage_since();

-- The first sales a client was given is kept, so if someone else closes it later the first one gets 20% of the sales share
create or replace function public.clients_keep_original() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then new.original_assignee := coalesce(new.original_assignee, new.assigned_to);
  elsif new.assigned_to is distinct from old.assigned_to and new.original_assignee is null then new.original_assignee := old.assigned_to;
  end if;
  return new;
end $$;
drop trigger if exists trg_clients_keep_original on public.clients;
create trigger trg_clients_keep_original before insert or update of assigned_to on public.clients
  for each row execute function public.clients_keep_original();
update public.clients set original_assignee = assigned_to where original_assignee is null and assigned_to is not null;

-- ---------- 8. job titles, appraisals, promotions ----------
alter table public.profiles add column if not exists job_title text;
alter table public.profiles add column if not exists job_title_since date;
alter table public.profiles drop constraint if exists profiles_job_title_check;
alter table public.profiles add constraint profiles_job_title_check check (job_title is null or job_title in
  ('Property Consultant', 'Junior Sales', 'Senior Sales', 'Acting As Team Leader', 'Team Leader', 'Sales Manager'));

-- ---------- 9. attendance exemption ----------
alter table public.profiles add column if not exists attendance_exempt boolean not null default false;

-- only admin / CEO change role, manager, title or exemption
create or replace function public.prevent_role_escalation() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_finance_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.role := 'pending'; new.manager_id := null; new.job_title := null; new.job_title_since := null; new.attendance_exempt := false;
    return new;
  end if;
  if new.role is distinct from old.role or new.manager_id is distinct from old.manager_id
     or new.job_title is distinct from old.job_title or new.job_title_since is distinct from old.job_title_since
     or new.attendance_exempt is distinct from old.attendance_exempt then
    raise exception 'Only Admin / CEO can change role, manager, title or attendance settings';
  end if;
  return new;
end $$;

create table if not exists public.appraisals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  quarter       text not null check (quarter ~ '^\d{4}-Q[1-4]$'),
  auto          jsonb not null default '{}'::jsonb,      -- the numbers from the CRM and their points
  ratings       jsonb not null default '{}'::jsonb,      -- manager ratings 1-5
  auto_score    numeric,                                 -- out of 60
  manager_score numeric,                                 -- out of 40
  score         numeric,                                 -- out of 100
  grade         text check (grade in ('A', 'B+', 'B', 'C', 'D')),
  notes         text,
  goals         text,
  by_user       uuid references public.profiles(id) on delete set null,
  updated_at    timestamptz not null default now(),
  unique (user_id, quarter)
);
alter table public.appraisals enable row level security;
revoke all on public.appraisals from anon;
grant select, insert, update, delete on public.appraisals to authenticated;
drop policy if exists "see appraisals" on public.appraisals;
create policy "see appraisals" on public.appraisals for select using (user_id = auth.uid() or public.can_manage_person(user_id));
drop policy if exists "write appraisals" on public.appraisals;
create policy "write appraisals" on public.appraisals for all using (public.can_manage_person(user_id)) with check (public.can_manage_person(user_id));

create table if not exists public.promotions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  from_title  text,
  to_title    text not null,
  status      text not null default 'approved' check (status in ('approved', 'rejected')),
  criteria    jsonb not null default '{}'::jsonb,
  decided_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
alter table public.promotions enable row level security;
revoke all on public.promotions from anon;
grant select, insert on public.promotions to authenticated;
drop policy if exists "see promotions" on public.promotions;
-- approved promotions are good news for everyone; rejected ones only admin sees
create policy "see promotions" on public.promotions for select using ((status = 'approved' and public.is_approved()) or public.is_finance_admin());
drop policy if exists "decide promotions" on public.promotions;
create policy "decide promotions" on public.promotions for insert with check (public.is_finance_admin());

create or replace function public.promotion_apply() returns trigger
language plpgsql security definer set search_path = public as $$
declare who text;
begin
  if new.status = 'approved' then
    update public.profiles set job_title = new.to_title, job_title_since = current_date where id = new.user_id;
    select name into who from public.profiles where id = new.user_id;
    insert into public.notification_queue (user_id, title, body, url)
    select p.id, 'Congratulations 🎉', coalesce(who, 'A teammate') || ' is now ' || new.to_title, '?open=home'
      from public.profiles p where p.role not in ('pending', 'guest');
  end if;
  return new;
end $$;
drop trigger if exists trg_promotion_apply on public.promotions;
create trigger trg_promotion_apply after insert on public.promotions for each row execute function public.promotion_apply();

-- ---------- 9. late permission requests ----------
create table if not exists public.late_permissions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  day         date not null,
  until_time  time not null,
  reason      text,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  decided_by  uuid references public.profiles(id) on delete set null,
  decided_at  timestamptz,
  created_at  timestamptz not null default now()
);
alter table public.late_permissions enable row level security;
revoke all on public.late_permissions from anon;
grant select, insert, update, delete on public.late_permissions to authenticated;
drop policy if exists "see late" on public.late_permissions;
create policy "see late" on public.late_permissions for select using (user_id = auth.uid() or public.can_manage_person(user_id));
drop policy if exists "ask late" on public.late_permissions;
create policy "ask late" on public.late_permissions for insert
  with check (public.is_approved() and ((user_id = auth.uid() and status = 'pending') or public.can_manage_person(user_id)));
drop policy if exists "decide late" on public.late_permissions;
create policy "decide late" on public.late_permissions for update using (public.can_manage_person(user_id)) with check (public.can_manage_person(user_id));
drop policy if exists "cancel late" on public.late_permissions;
create policy "cancel late" on public.late_permissions for delete using ((user_id = auth.uid() and status = 'pending') or public.can_manage_person(user_id));

create or replace function public.late_notify() returns trigger
language plpgsql security definer set search_path = public as $$
declare who text; mgr uuid;
begin
  select name, manager_id into who, mgr from public.profiles where id = new.user_id;
  if tg_op = 'INSERT' and new.status = 'pending' and mgr is not null then
    insert into public.notification_queue (user_id, title, body, url)
    values (mgr, 'Late permission ⏰', coalesce(who, 'Someone') || ' · ' || to_char(new.day, 'DD Mon') || ' until ' || to_char(new.until_time, 'HH24:MI'), '?open=leave');
  elsif tg_op = 'UPDATE' and new.status <> old.status and new.status in ('approved', 'rejected') then
    insert into public.notification_queue (user_id, title, body, url)
    values (new.user_id, case when new.status = 'approved' then 'Late permission approved ✅' else 'Late permission not approved' end,
            to_char(new.day, 'DD Mon') || ' until ' || to_char(new.until_time, 'HH24:MI'), '?open=leave');
  end if;
  return new;
end $$;
drop trigger if exists trg_late_notify on public.late_permissions;
create trigger trg_late_notify after insert or update on public.late_permissions for each row execute function public.late_notify();

-- ---------- 1. AI analyst ----------
create table if not exists public.ai_reports (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  trigger     text not null default 'manual' check (trigger in ('manual', 'weekly')),
  requested_by uuid references public.profiles(id) on delete set null,
  status      text not null default 'done' check (status in ('done', 'failed')),
  snapshot    jsonb,
  report_md   text,
  forecast    jsonb,
  model       text,
  input_tokens  integer,
  output_tokens integer,
  error       text
);
alter table public.ai_reports enable row level security;
revoke all on public.ai_reports from anon;
grant select on public.ai_reports to authenticated;
drop policy if exists "admin reads ai reports" on public.ai_reports;
create policy "admin reads ai reports" on public.ai_reports for select using (public.is_finance_admin());

-- token the weekly job sends so the function knows the call is really from the database (only the service role can read it)
create table if not exists public.ai_cron_token (id integer primary key default 1 check (id = 1), token text not null);
alter table public.ai_cron_token enable row level security;
revoke all on public.ai_cron_token from anon, authenticated;
insert into public.ai_cron_token (id, token) values (1, md5(random()::text || clock_timestamp()::text) || md5(random()::text)) on conflict (id) do nothing;

-- every Sunday 07:30 Cairo (05:30 UTC)
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') and exists (select 1 from pg_extension where extname = 'pg_net') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'origin-ai-weekly';
    perform cron.schedule('origin-ai-weekly', '30 5 * * 0', $job$
      select net.http_post(
        url := 'https://sinfiowpvosyfgopmfka.supabase.co/functions/v1/ai-analyst',
        headers := jsonb_build_object('Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbmZpb3dwdm9zeWZnb3BtZmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NjU2MDYsImV4cCI6MjEwNDQ0MTYwNn0.Atv_b_hWN8zSF5GgDPgwFL1rO2xzrUthYX7w2InMM9U',
          'x-cron-token', (select token from public.ai_cron_token where id = 1)),
        body := '{"trigger":"weekly"}'::jsonb, timeout_milliseconds := 120000);
    $job$);
  end if;
end $$;

-- ---------- 10. Facebook Lead Ads ----------
alter table public.finance_settings add column if not exists lead_assignees uuid[] not null default '{}';
alter table public.finance_settings add column if not exists lead_rr_index integer not null default 0;
create table if not exists public.fb_leads (
  leadgen_id  text primary key,
  client_id   uuid references public.clients(id) on delete set null,
  campaign    text,
  ad          text,
  form        text,
  status      text not null default 'new',
  error       text,
  created_at  timestamptz not null default now()
);
alter table public.fb_leads enable row level security;
revoke all on public.fb_leads from anon;
grant select on public.fb_leads to authenticated;
drop policy if exists "admin reads fb leads" on public.fb_leads;
create policy "admin reads fb leads" on public.fb_leads for select using (public.is_finance_admin());

select 'Next release ready ✓' as result;
