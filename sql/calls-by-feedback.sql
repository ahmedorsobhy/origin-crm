-- =====================================================================
-- Calls are counted by FEEDBACK (ranking + Daily report)
--  * Cold calls     = every feedback on a cold number (No answer, Selling, …) — also from deleted sheets
--  * Client calls   = every feedback on a client (quick update, feedback note, stage change, voice note, close)
--  * Seller updates = every update on a unit / its owner (edit, "still available", price changed, sold)
--  * Total          = the three together
--  * Tries          = every tap on Call (cold + clients); taps on the same cold number within 2 minutes count once
-- Safe to run more than once. Run the whole file in Supabase → SQL Editor.
-- =====================================================================

-- 1) Unit history stays when a unit is deleted, and "still available" counts as an update
alter table public.unit_activity alter column unit_id drop not null;
alter table public.unit_activity drop constraint if exists unit_activity_unit_id_fkey;
alter table public.unit_activity add constraint unit_activity_unit_id_fkey
  foreign key (unit_id) references public.units(id) on delete set null;
alter table public.unit_activity drop constraint if exists unit_activity_action_check;
alter table public.unit_activity add constraint unit_activity_action_check check (action in ('created', 'updated', 'checked'));

create or replace function public.log_unit_activity() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_fields text[]; v_action text := 'updated';
begin
  if auth.uid() is null then return null; end if;            -- SQL editor / system jobs
  if tg_op = 'INSERT' then
    insert into public.unit_activity (unit_id, user_id, action) values (new.id, auth.uid(), 'created');
    return null;
  end if;
  select array_agg(n.key order by n.key) into v_fields
    from jsonb_each(to_jsonb(new)) n join jsonb_each(to_jsonb(old)) o using (key)
   where n.value is distinct from o.value and n.key not in ('updated_at', 'created_at', 'created_by');
  if v_fields is null then
    if new.updated_at is distinct from old.updated_at then v_action := 'checked';   -- "still available" from Check with the owner
    else return null; end if;
  end if;
  -- several saves of the same unit by the same person within 2 minutes count once
  if exists (select 1 from public.unit_activity a where a.unit_id = new.id and a.user_id = auth.uid() and a.action <> 'created'
               and a.created_at > now() - interval '2 minutes') then
    update public.unit_activity a set fields = (select array_agg(distinct f) from unnest(coalesce(a.fields, '{}') || coalesce(v_fields, '{}')) f)
     where a.id = (select id from public.unit_activity b where b.unit_id = new.id and b.user_id = auth.uid() and b.action <> 'created' order by b.created_at desc limit 1);
    return null;
  end if;
  insert into public.unit_activity (unit_id, user_id, action, fields) values (new.id, auth.uid(), v_action, v_fields);
  return null;
end $$;
revoke execute on function public.log_unit_activity() from public, anon, authenticated;

-- 2) What counts as a feedback on a client (not the automatic lines)
create or replace function public.is_client_feedback(p_action text, p_note text) returns boolean
language sql immutable as $$
  select p_action in ('quick_reply', 'stage_change', 'note', 'voice', 'closed', 'outcome')
     and coalesce(p_note, '') not like 'Sent a unit%'
     and coalesce(p_note, '') not like 'Lead came in again%'
     and coalesce(p_note, '') not like 'Changed by Admin%';
$$;
grant execute on function public.is_client_feedback(text, text) to authenticated;

-- 3) Ranking
drop function if exists public.sales_ranking(timestamptz, timestamptz);
create function public.sales_ranking(p_from timestamptz, p_to timestamptz)
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
           count(*) filter (where action = 'outcome') as fb,
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

-- 4) One-time clean-up: sheets left with no numbers by uploads that failed (e.g. the 7 empty "Estates" sheets).
--    Only sheets older than 10 minutes, so an upload running right now is never touched.
delete from public.cold_sheets s
 where s.created_at < now() - interval '10 minutes'
   and not exists (select 1 from public.cold_leads l where l.sheet_id = s.id);

select 'Calls counted by feedback ✓ + empty sheets removed' as result;
