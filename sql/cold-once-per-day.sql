-- Cold calls: each number counts ONCE per day in the ranking (however many feedbacks it gets that day).
-- The phone number is now saved on every cold call / feedback, so numbers from sheets that get deleted
-- later still count once (from today on). Tries stay the same: every Call tap.
-- Safe to run more than once.

-- 1) Save the phone on every cold activity row
alter table public.cold_activity add column if not exists phone text;

create or replace function public.cold_activity_phone() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.phone is null and new.lead_id is not null then
    select l.phone into new.phone from public.cold_leads l where l.id = new.lead_id;
  end if;
  return new;
end $$;
drop trigger if exists trg_cold_activity_phone on public.cold_activity;
create trigger trg_cold_activity_phone before insert on public.cold_activity
  for each row execute function public.cold_activity_phone();

-- fill it in for everything that still has its number
update public.cold_activity a set phone = l.phone
  from public.cold_leads l where l.id = a.lead_id and a.phone is null;

-- 2) Ranking: cold calls = different numbers given feedback, per day
create or replace function public.sales_ranking(p_from timestamptz, p_to timestamptz)
returns table (user_id uuid, name text, avatar_url text, deals_rank int, money_rank int,
               calls int, cold_calls int, client_calls int, seller_updates int, tries int,
               whatsapp int, meetings int, units_added int, new_clients int, reply_minutes int, reservations_rank int)
language sql stable security definer set search_path = public as $$
  with s as (select id, name, avatar_url from public.profiles where role = 'sales_agent'),
  d as (
    select a.agent_id as uid, count(distinct dl.id) as n from public.deals dl join public.deal_agents a on a.deal_id = dl.id
    where dl.status = 'approved' and dl.done_at >= p_from and dl.done_at < p_to
    group by a.agent_id),
  r as (
    select a.agent_id as uid, count(distinct dl.id) as n from public.deals dl join public.deal_agents a on a.deal_id = dl.id
    where dl.status in ('reserved', 'approved') and dl.reserved_at >= p_from and dl.reserved_at < p_to
    group by a.agent_id),
  m as (
    select a.agent_id as uid, sum(t.amount * a.split_pct / 100.0) as amt
    from public.finance_transactions t join public.deals dm on dm.id = t.deal_id and dm.status in ('reserved', 'approved')
      join public.deal_agents a on a.deal_id = t.deal_id and (t.side is null or a.side = t.side)
    where t.kind = 'commission_in' and t.occurred_at >= p_from and t.occurred_at < p_to group by a.agent_id),
  ca as (
    select changed_by as uid,
           count(*) filter (where public.is_client_feedback(action, note)) as fb,
           count(*) filter (where action = 'call') as taps,
           count(*) filter (where action in ('whatsapp', 'unit_sent')) as wa,
           count(*) filter (where action = 'stage_change' and new_value = 'meeting_generated') as meetings
    from public.client_activity where changed_at >= p_from and changed_at < p_to group by changed_by),
  co as (
    select user_id as uid,
           count(distinct (coalesce(phone, lead_id::text, id::text) || ':' || ((created_at at time zone 'Africa/Cairo')::date)::text)) filter (where action = 'outcome') as fb,
           count(distinct (coalesce(lead_id::text, id::text) || ':' || floor(extract(epoch from created_at) / 120)::text)) filter (where action = 'call') as taps,
           count(*) filter (where action = 'whatsapp') as wa
    from public.cold_activity where created_at >= p_from and created_at < p_to group by user_id),
  su as (select user_id as uid, count(*) as n from public.unit_activity
         where action in ('updated', 'checked') and created_at >= p_from and created_at < p_to group by user_id),
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
    (coalesce(co.fb, 0) + coalesce(ca.fb, 0) + coalesce(su.n, 0))::int,
    coalesce(co.fb, 0)::int, coalesce(ca.fb, 0)::int, coalesce(su.n, 0)::int,
    (coalesce(co.taps, 0) + coalesce(ca.taps, 0))::int,
    (coalesce(ca.wa, 0) + coalesce(co.wa, 0))::int, coalesce(ca.meetings, 0)::int, coalesce(un.n, 0)::int, coalesce(cl.n, 0)::int,
    round(rp.mins)::int,
    case when coalesce(r.n, 0) > 0 then (rank() over (order by coalesce(r.n, 0) desc))::int end
  from s left join d on d.uid = s.id left join r on r.uid = s.id left join m on m.uid = s.id left join ca on ca.uid = s.id left join co on co.uid = s.id
    left join su on su.uid = s.id left join un on un.uid = s.id left join cl on cl.uid = s.id left join rp on rp.uid = s.id
  where public.is_approved();
$$;
revoke execute on function public.sales_ranking(timestamptz, timestamptz) from public, anon;
grant execute on function public.sales_ranking(timestamptz, timestamptz) to authenticated;

select 'Cold numbers count once per day ✓' as result;
