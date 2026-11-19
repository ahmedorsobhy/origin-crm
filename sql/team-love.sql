-- =====================================================================
-- Team update: attendance report, leaderboard, WhatsApp templates,
-- celebrations, phone notifications. Run once in Supabase → SQL Editor.
-- Safe to run again.
-- =====================================================================

-- ---------- Settings ----------
alter table public.finance_settings add column if not exists late_after text not null default '11:00';
alter table public.finance_settings add column if not exists work_days int[] not null default '{0,1,2,3,4}'; -- Sun..Thu
alter table public.finance_settings add column if not exists wa_templates jsonb;
alter table public.finance_settings add column if not exists celebration_media jsonb not null default '[]'::jsonb;

-- ---------- Attendance: each person sees their own, managers their team ----------
drop policy if exists "read attendance" on public.attendance;
create policy "read attendance" on public.attendance for select
  using (public.is_finance_admin() or public.is_self_or_manager_of(user_id));

-- ---------- Leaderboard: totals only (no client or money details) ----------
create or replace function public.leaderboard(p_from timestamptz, p_to timestamptz)
returns table (user_id uuid, name text, deals_done int, deals_sent int, meetings int, contacts int, updates int)
language sql stable security definer set search_path = public as $$
  select p.id, p.name,
    (select count(distinct d.id)::int from public.deals d join public.deal_agents a on a.deal_id = d.id
      where a.agent_id = p.id and d.status in ('approved', 'reserved')
        and coalesce(d.reviewed_at, d.created_at) >= p_from and coalesce(d.reviewed_at, d.created_at) < p_to),
    (select count(*)::int from public.deals d where d.created_by = p.id and d.created_at >= p_from and d.created_at < p_to),
    (select count(*)::int from public.client_activity c where c.changed_by = p.id and c.changed_at >= p_from and c.changed_at < p_to
      and c.action = 'stage_change' and c.new_value = 'meeting_generated'),
    (select count(*)::int from public.client_activity c where c.changed_by = p.id and c.changed_at >= p_from and c.changed_at < p_to
      and c.action in ('call', 'whatsapp', 'unit_sent')),
    (select count(*)::int from public.client_activity c where c.changed_by = p.id and c.changed_at >= p_from and c.changed_at < p_to
      and c.action in ('quick_reply', 'note', 'stage_change'))
  from public.profiles p
  where public.is_approved() and p.role in ('sales_agent', 'team_leader', 'sales_manager');
$$;
revoke execute on function public.leaderboard(timestamptz, timestamptz) from public, anon;
grant execute on function public.leaderboard(timestamptz, timestamptz) to authenticated;

-- ---------- Phone notifications ----------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "own subscriptions" on public.push_subscriptions;
create policy "own subscriptions" on public.push_subscriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.is_approved());

-- Messages waiting to be sent (filled by the triggers below, emptied by the "notify" function)
create table if not exists public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  url text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
alter table public.notification_queue enable row level security; -- no policies: only the server reads it
create index if not exists idx_notification_queue_unsent on public.notification_queue (created_at) where sent_at is null;

-- Remembers scheduled reminders already sent (so nobody gets the same one twice)
create table if not exists public.notification_log (
  user_id uuid not null,
  key text not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.notification_log enable row level security;

create or replace function public.queue_notification(p_user uuid, p_title text, p_body text, p_url text) returns void
language sql security definer set search_path = public as $$
  insert into public.notification_queue (user_id, title, body, url)
  select p_user, p_title, p_body, p_url where p_user is not null and p_user is distinct from auth.uid();
$$;
revoke execute on function public.queue_notification(uuid, text, text, text) from public, anon, authenticated;

-- New lead given to someone (added, imported, or moved to them)
create or replace function public.notify_lead_assigned() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.assigned_to is not null and (tg_op = 'INSERT' or new.assigned_to is distinct from old.assigned_to) then
    perform public.queue_notification(new.assigned_to, 'New lead for you',
      coalesce(new.name, new.phone) || coalesce(' · ' || new.phone, '') || ' — call them now', '?open=client:' || new.id);
  end if;
  return new;
end; $$;
drop trigger if exists trg_notify_lead_assigned on public.clients;
create trigger trg_notify_lead_assigned after insert or update of assigned_to on public.clients
  for each row execute function public.notify_lead_assigned();

-- Deal sent for approval → admins/CEO · deal approved or done → the team on it
create or replace function public.notify_deal() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_title text := coalesce(new.unit_label, new.client_label, 'Deal'); v_by text; r record;
begin
  select name into v_by from public.profiles where id = new.created_by;
  if new.status = 'pending' and (tg_op = 'INSERT' or old.status is distinct from 'pending') then
    for r in select id from public.profiles where role in ('admin', 'ceo') loop
      perform public.queue_notification(r.id, 'Deal waiting for your approval', coalesce(v_by, 'Sales') || ' · ' || v_title, '?open=approvals');
    end loop;
  end if;
  if tg_op = 'UPDATE' and new.status in ('reserved', 'approved') and old.status in ('pending', 'returned') then
    for r in select distinct u from (select new.created_by as u union select agent_id from public.deal_agents where deal_id = new.id) x loop
      perform public.queue_notification(r.u, 'Your deal was approved 🎉', v_title, '?open=deal:' || new.id);
    end loop;
  end if;
  if tg_op = 'UPDATE' and new.status = 'returned' and old.status is distinct from 'returned' then
    perform public.queue_notification(new.created_by, 'Your deal needs a change', v_title || coalesce(' — ' || new.review_note, ''), '?open=deal:' || new.id);
  end if;
  return new;
end; $$;
drop trigger if exists trg_notify_deal on public.deals;
create trigger trg_notify_deal after insert or update of status on public.deals
  for each row execute function public.notify_deal();

revoke execute on function public.notify_lead_assigned() from public, anon, authenticated;
revoke execute on function public.notify_deal() from public, anon, authenticated;

-- Every minute, wake up the "notify" function (it sends what's due and does nothing otherwise).
-- The key below is the site's public key (already visible in the website), not a secret.
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.unschedule(jobid) from cron.job where jobname = 'origin-notify';
select cron.schedule('origin-notify', '* * * * *', $$
  select net.http_post(
    url := 'https://sinfiowpvosyfgopmfka.supabase.co/functions/v1/notify',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbmZpb3dwdm9zeWZnb3BtZmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NjU2MDYsImV4cCI6MjEwNDQ0MTYwNn0.Atv_b_hWN8zSF5GgDPgwFL1rO2xzrUthYX7w2InMM9U", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbmZpb3dwdm9zeWZnb3BtZmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NjU2MDYsImV4cCI6MjEwNDQ0MTYwNn0.Atv_b_hWN8zSF5GgDPgwFL1rO2xzrUthYX7w2InMM9U"}'::jsonb,
    body := '{}'::jsonb
  );
$$);

select 'Team update installed ✓' as result;
