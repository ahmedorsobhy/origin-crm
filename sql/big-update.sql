-- =====================================================================
-- Big update: cold calls, sales ranking, unit links & shortlists,
-- voice notes, campaigns, price-drop alerts, backups, celebrations v2.
-- Run once in Supabase → SQL Editor (after team-love.sql). Safe to run again.
-- =====================================================================

-- ---------- Settings ----------
alter table public.finance_settings add column if not exists wa_cold_template text;
alter table public.finance_settings add column if not exists late_lead_hours int not null default 2;
alter table public.finance_settings add column if not exists auto_reassign boolean not null default false;

-- ---------- Campaigns (which Facebook campaign brought the lead) ----------
alter table public.clients add column if not exists campaign text;
create table if not exists public.campaign_spend (
  id uuid primary key default gen_random_uuid(),
  campaign text not null,
  month date not null,               -- first day of the month
  amount numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (campaign, month)
);
alter table public.campaign_spend enable row level security;
drop policy if exists "admin campaign spend" on public.campaign_spend;
create policy "admin campaign spend" on public.campaign_spend for all using (public.is_finance_admin()) with check (public.is_finance_admin());

-- ---------- Cold calls ----------
create table if not exists public.cold_sheets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  assigned_to uuid not null references public.profiles(id) on delete cascade,
  due_date date not null,
  created_by uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.cold_leads (
  id uuid primary key default gen_random_uuid(),
  sheet_id uuid not null references public.cold_sheets(id) on delete cascade,
  assigned_to uuid not null references public.profiles(id) on delete cascade,
  owner_name text,
  phone text not null,
  project_name text,
  project_id uuid references public.projects(id) on delete set null,
  unit_number text,
  extra text,
  status text not null default 'new',
  attempts int not null default 0,
  callback_at timestamptz,
  unit_id uuid references public.units(id) on delete set null,
  unit_pending boolean not null default false,
  last_contact_at timestamptz,
  position int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.cold_leads drop constraint if exists cold_leads_status_check;
alter table public.cold_leads add constraint cold_leads_status_check check (status in ('new', 'no_answer', 'call_later', 'not_selling', 'dnc', 'wrong', 'selling'));
create index if not exists idx_cold_leads_sheet on public.cold_leads (sheet_id, position);
create index if not exists idx_cold_leads_phone on public.cold_leads (phone);
create table if not exists public.cold_activity (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.cold_leads(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  action text not null check (action in ('call', 'whatsapp', 'outcome')),
  value text,
  created_at timestamptz not null default now()
);
create index if not exists idx_cold_activity_user on public.cold_activity (user_id, created_at);

create or replace function public.is_manager_role() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role not in ('pending', 'sales_agent'));
$$;
create or replace function public.can_see_cold_lead(p_lead uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.cold_leads l where l.id = p_lead and (public.is_finance_admin() or public.is_self_or_manager_of(l.assigned_to)));
$$;

alter table public.cold_sheets enable row level security;
alter table public.cold_leads enable row level security;
alter table public.cold_activity enable row level security;
drop policy if exists "read sheets" on public.cold_sheets;
drop policy if exists "add sheets" on public.cold_sheets;
drop policy if exists "edit sheets" on public.cold_sheets;
drop policy if exists "remove sheets" on public.cold_sheets;
create policy "read sheets" on public.cold_sheets for select using (public.is_finance_admin() or public.is_self_or_manager_of(assigned_to));
create policy "add sheets" on public.cold_sheets for insert with check (public.is_manager_role() and (public.is_finance_admin() or public.is_self_or_manager_of(assigned_to)));
create policy "edit sheets" on public.cold_sheets for update using (public.is_manager_role() and (public.is_finance_admin() or public.is_self_or_manager_of(assigned_to)));
create policy "remove sheets" on public.cold_sheets for delete using (public.is_manager_role() and (public.is_finance_admin() or public.is_self_or_manager_of(assigned_to)));
drop policy if exists "read leads" on public.cold_leads;
drop policy if exists "add leads" on public.cold_leads;
drop policy if exists "work leads" on public.cold_leads;
drop policy if exists "remove leads" on public.cold_leads;
create policy "read leads" on public.cold_leads for select using (public.is_finance_admin() or public.is_self_or_manager_of(assigned_to));
create policy "add leads" on public.cold_leads for insert with check (public.is_manager_role() and (public.is_finance_admin() or public.is_self_or_manager_of(assigned_to)));
create policy "work leads" on public.cold_leads for update using (public.is_finance_admin() or public.is_self_or_manager_of(assigned_to)) with check (public.is_finance_admin() or public.is_self_or_manager_of(assigned_to));
create policy "remove leads" on public.cold_leads for delete using (public.is_manager_role() and (public.is_finance_admin() or public.is_self_or_manager_of(assigned_to)));
drop policy if exists "read cold activity" on public.cold_activity;
drop policy if exists "log cold activity" on public.cold_activity;
create policy "read cold activity" on public.cold_activity for select using (public.can_see_cold_lead(lead_id));
create policy "log cold activity" on public.cold_activity for insert with check (user_id = auth.uid() and public.can_see_cold_lead(lead_id));

grant select, insert, update, delete on public.cold_sheets, public.cold_leads, public.cold_activity, public.campaign_spend to authenticated;

-- Is a phone already known (client, unit owner, or another cold sheet)? Last 10 digits.
create or replace function public.known_phones(p_phones text[]) returns table (phone_key text, kind text)
language sql stable security definer set search_path = public as $$
  with k as (select distinct right(regexp_replace(x, '\D', '', 'g'), 10) as key from unnest(p_phones) x)
  select k.key, 'client' from k where public.is_approved() and exists (select 1 from public.clients c where right(regexp_replace(c.phone, '\D', '', 'g'), 10) = k.key)
  union
  select k.key, 'owner' from k where public.is_approved() and exists (select 1 from public.units u where right(regexp_replace(coalesce(u.owner_number, ''), '\D', '', 'g'), 10) = k.key)
  union
  select k.key, 'cold' from k where public.is_approved() and exists (select 1 from public.cold_leads l where right(regexp_replace(l.phone, '\D', '', 'g'), 10) = k.key);
$$;
revoke execute on function public.known_phones(text[]) from public, anon;
grant execute on function public.known_phones(text[]) to authenticated;

-- ---------- Sales ranking: deals and money are ranks only, never amounts ----------
create or replace function public.sales_ranking(p_from timestamptz, p_to timestamptz)
returns table (user_id uuid, name text, avatar_url text, deals_rank int, money_rank int, calls int, cold_calls int, client_calls int,
               whatsapp int, meetings int, units_added int, new_clients int, reply_minutes int)
language sql stable security definer set search_path = public as $$
  with s as (select id, name, avatar_url from public.profiles where role = 'sales_agent'),
  d as (
    select a.agent_id as uid, count(distinct dl.id) as n from public.deals dl join public.deal_agents a on a.deal_id = dl.id
    where dl.status in ('approved', 'reserved') and coalesce(dl.reviewed_at, dl.created_at) >= p_from and coalesce(dl.reviewed_at, dl.created_at) < p_to
    group by a.agent_id),
  m as (
    select a.agent_id as uid, sum(t.amount * a.split_pct / 100.0) as amt
    from public.finance_transactions t join public.deal_agents a on a.deal_id = t.deal_id and (t.side is null or a.side = t.side)
    where t.kind = 'commission_in' and t.occurred_at >= p_from and t.occurred_at < p_to group by a.agent_id),
  ca as (
    select changed_by as uid, count(*) filter (where action = 'call') as calls, count(*) filter (where action in ('whatsapp', 'unit_sent')) as wa,
           count(*) filter (where action = 'stage_change' and new_value = 'meeting_generated') as meetings
    from public.client_activity where changed_at >= p_from and changed_at < p_to group by changed_by),
  co as (
    select user_id as uid, count(*) filter (where action = 'call') as calls, count(*) filter (where action = 'whatsapp') as wa
    from public.cold_activity where created_at >= p_from and created_at < p_to group by user_id),
  un as (select created_by as uid, count(*) as n from public.units where created_at >= p_from and created_at < p_to group by created_by),
  cl as (select created_by as uid, count(*) as n from public.clients where created_at >= p_from and created_at < p_to group by created_by),
  rp as (
    select c.assigned_to as uid, percentile_cont(0.5) within group (order by extract(epoch from (f.first_at - c.created_at)) / 60) as mins
    from public.clients c
    join lateral (select min(x.changed_at) as first_at from public.client_activity x
                  where x.client_id = c.id and x.action in ('call', 'whatsapp', 'unit_sent', 'quick_reply', 'note', 'stage_change')) f on f.first_at is not null
    where c.created_at >= p_from and c.created_at < p_to and f.first_at >= c.created_at group by c.assigned_to)
  select s.id, s.name, s.avatar_url,
    case when coalesce(d.n, 0) > 0 then (rank() over (order by coalesce(d.n, 0) desc))::int end,
    case when coalesce(m.amt, 0) > 0 then (rank() over (order by coalesce(m.amt, 0) desc))::int end,
    (coalesce(ca.calls, 0) + coalesce(co.calls, 0))::int, coalesce(co.calls, 0)::int, coalesce(ca.calls, 0)::int,
    (coalesce(ca.wa, 0) + coalesce(co.wa, 0))::int, coalesce(ca.meetings, 0)::int, coalesce(un.n, 0)::int, coalesce(cl.n, 0)::int,
    round(rp.mins)::int
  from s left join d on d.uid = s.id left join m on m.uid = s.id left join ca on ca.uid = s.id left join co on co.uid = s.id
    left join un on un.uid = s.id left join cl on cl.uid = s.id left join rp on rp.uid = s.id
  where public.is_approved();
$$;
revoke execute on function public.sales_ranking(timestamptz, timestamptz) from public, anon;
grant execute on function public.sales_ranking(timestamptz, timestamptz) to authenticated;

-- ---------- Unit links & shortlists (public pages) ----------
create table if not exists public.share_links (
  token text primary key default substr(replace(gen_random_uuid()::text, '-', ''), 1, 14),
  kind text not null default 'unit' check (kind in ('unit', 'list')),
  unit_ids uuid[] not null,
  client_id uuid references public.clients(id) on delete set null,
  created_by uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  views int not null default 0,
  last_viewed_at timestamptz,
  last_notified_at timestamptz,
  liked uuid[] not null default '{}'
);
alter table public.share_links enable row level security;
drop policy if exists "own links" on public.share_links;
create policy "own links" on public.share_links for select using (public.is_finance_admin() or public.is_self_or_manager_of(created_by));
drop policy if exists "make links" on public.share_links;
create policy "make links" on public.share_links for insert with check (created_by = auth.uid() and public.is_approved());

grant select, insert on public.share_links to authenticated;

-- What the client sees: the unit(s) and the sales person — never the owner's details
create or replace function public.public_share(p_token text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'kind', l.kind, 'liked', l.liked,
    'sales', (select jsonb_build_object('name', p.name, 'phone', p.phone, 'avatar_url', p.avatar_url) from public.profiles p where p.id = l.created_by),
    'client', (select split_part(c.name, ' ', 1) from public.clients c where c.id = l.client_id),
    'units', coalesce((select jsonb_agg(jsonb_build_object(
        'id', u.id, 'type', u.type, 'project', pr.name, 'destination', pr.destination, 'phase', u.phase, 'bua', u.bua, 'land_area', u.land_area,
        'extra_area', u.extra_area, 'floor', u.floor, 'finishing', u.finishing, 'delivery_date', u.delivery_date, 'listing_type', u.listing_type,
        'total_price', u.total_price, 'rent_price', u.rent_price, 'furnished', u.furnished, 'description', u.description, 'photos', u.photos,
        'available', u.status = 'active') order by array_position(l.unit_ids, u.id))
      from public.units u left join public.projects pr on pr.id = u.project_id where u.id = any (l.unit_ids)), '[]'::jsonb))
  from public.share_links l where l.token = p_token;
$$;
create or replace function public.share_viewed(p_token text) returns void
language plpgsql security definer set search_path = public as $$
declare l public.share_links; v_name text;
begin
  update public.share_links set views = views + 1, last_viewed_at = now() where token = p_token returning * into l;
  if not found then return; end if;
  if l.last_notified_at is null or l.last_notified_at < now() - interval '30 minutes' then
    update public.share_links set last_notified_at = now() where token = p_token;
    select name into v_name from public.clients where id = l.client_id;
    insert into public.notification_queue (user_id, title, body, url)
    values (l.created_by, coalesce(v_name, 'Someone') || ' just opened your link 👀',
            case when l.kind = 'list' then 'The shortlist you sent' else 'The unit you sent' end || ' — a good moment to call',
            case when l.client_id is not null then '?open=client:' || l.client_id else '?open=unit:' || l.unit_ids[1] end);
    if l.client_id is not null then
      insert into public.client_activity (client_id, action, note, changed_by)
      values (l.client_id, 'link_opened', case when l.kind = 'list' then 'Opened the shortlist' else 'Opened the unit link' end, l.created_by);
    end if;
  end if;
end; $$;
create or replace function public.share_like(p_token text, p_unit uuid) returns void
language plpgsql security definer set search_path = public as $$
declare l public.share_links; v_name text; v_unit text;
begin
  select * into l from public.share_links where token = p_token;
  if not found or not (p_unit = any (l.unit_ids)) or p_unit = any (l.liked) then return; end if;
  update public.share_links set liked = array_append(liked, p_unit) where token = p_token;
  select name into v_name from public.clients where id = l.client_id;
  select u.type || coalesce(' · ' || pr.name, '') into v_unit from public.units u left join public.projects pr on pr.id = u.project_id where u.id = p_unit;
  insert into public.notification_queue (user_id, title, body, url)
  values (l.created_by, coalesce(v_name, 'Your client') || ' is interested ❤️', coalesce(v_unit, 'A unit') || ' — call them now',
          case when l.client_id is not null then '?open=client:' || l.client_id else '?open=unit:' || p_unit end);
  if l.client_id is not null then
    insert into public.client_activity (client_id, action, new_value, note, changed_by)
    values (l.client_id, 'liked_unit', p_unit::text, 'Interested in ' || coalesce(v_unit, 'a unit'), l.created_by);
  end if;
end; $$;
grant execute on function public.public_share(text) to anon, authenticated;
grant execute on function public.share_viewed(text) to anon, authenticated;
grant execute on function public.share_like(text, uuid) to anon, authenticated;

-- ---------- Price drop → tell the sales whose clients may want it ----------
create or replace function public.notify_price_drop() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_new numeric; v_old numeric; v_rent boolean; v_label text; r record;
begin
  if new.status <> 'active' then return new; end if;
  if coalesce(new.listing_type, 'sale') <> 'rent' and new.total_price is not null and old.total_price is not null and new.total_price < old.total_price then
    v_new := new.total_price; v_old := old.total_price; v_rent := false;
  elsif new.listing_type in ('rent', 'both') and new.rent_price is not null and old.rent_price is not null and new.rent_price < old.rent_price then
    v_new := new.rent_price; v_old := old.rent_price; v_rent := true;
  else
    return new;
  end if;
  v_label := coalesce(new.type, 'Unit') || coalesce(' · ' || (select pr.name from public.projects pr where pr.id = new.project_id), '');
  for r in
    select c.assigned_to as uid, count(*) as n from public.clients c
    where c.assigned_to is not null and c.stage not in ('closed', 'deal_done')
      and coalesce(c.interest, 'buy') = case when v_rent then 'rent' else 'buy' end
      and ((c.budget >= v_new * 0.85 and c.budget <= v_new * 1.5)
           or exists (select 1 from public.client_projects cp where cp.client_id = c.id and cp.project_id = new.project_id))
    group by c.assigned_to
  loop
    perform public.queue_notification(r.uid, 'Price dropped 📉 ' || coalesce(v_label, 'a unit'),
      'Now ' || to_char(v_new, 'FM999,999,999') || ' (was ' || to_char(v_old, 'FM999,999,999') || ') — ' || r.n || ' of your clients may want it',
      '?open=unit:' || new.id);
  end loop;
  return new;
end; $$;
drop trigger if exists trg_notify_price_drop on public.units;
create trigger trg_notify_price_drop after update of total_price, rent_price on public.units
  for each row execute function public.notify_price_drop();
revoke execute on function public.notify_price_drop() from public, anon, authenticated;

-- ---------- Private storage: voice notes and backups ----------
insert into storage.buckets (id, name, public) values ('voice-notes', 'voice-notes', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('backups', 'backups', false) on conflict (id) do nothing;
drop policy if exists "voice notes upload" on storage.objects;
create policy "voice notes upload" on storage.objects for insert to authenticated
  with check (case when bucket_id = 'voice-notes' and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
    then public.is_approved() and public.can_see_client(((storage.foldername(name))[1])::uuid) else false end);
drop policy if exists "voice notes listen" on storage.objects;
create policy "voice notes listen" on storage.objects for select to authenticated
  using (case when bucket_id = 'voice-notes' and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
    then public.can_see_client(((storage.foldername(name))[1])::uuid) else false end);
drop policy if exists "backups admin read" on storage.objects;
create policy "backups admin read" on storage.objects for select to authenticated
  using (bucket_id = 'backups' and public.is_finance_admin());

select 'Big update installed ✓' as result;
