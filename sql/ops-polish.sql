-- =====================================================================
-- Ops polish:
--   1) Deal count follows the sides: one deal where we have the buyer AND the
--      seller counts as 2 (ranking, leaderboard). Same side twice = 1.
--   2) Merge duplicate deals (from the Excel import) into one, keeping each
--      sales person's money share. Admin / CEO only.
--   3) "Not duplicate" answers are remembered.
-- Run once in Supabase SQL Editor. Safe to re-run.
-- =====================================================================

-- 1a) Ranking: deals and reservations counted per side
create or replace function public.sales_ranking(p_from timestamptz, p_to timestamptz)
returns table (user_id uuid, name text, avatar_url text, deals_rank int, money_rank int,
               calls int, cold_calls int, client_calls int, seller_updates int, tries int,
               whatsapp int, meetings int, units_added int, new_clients int, reply_minutes int, reservations_rank int)
language sql stable security definer set search_path = public as $$
  with s as (select id, name, avatar_url from public.profiles where role = 'sales_agent'),
  d as (
    select a.agent_id as uid, count(distinct (dl.id, a.side)) as n from public.deals dl join public.deal_agents a on a.deal_id = dl.id
    where dl.status = 'approved' and dl.done_at >= p_from and dl.done_at < p_to
    group by a.agent_id),
  r as (
    select a.agent_id as uid, count(distinct (dl.id, a.side)) as n from public.deals dl join public.deal_agents a on a.deal_id = dl.id
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

-- 1b) Leaderboard on Home: same rule
create or replace function public.leaderboard(p_from timestamptz, p_to timestamptz)
returns table (user_id uuid, name text, deals_done int, deals_sent int, meetings int, contacts int, updates int)
language sql stable security definer set search_path = public as $$
  select p.id, p.name,
    (select count(distinct (d.id, a.side))::int from public.deals d join public.deal_agents a on a.deal_id = d.id
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

-- 2) "Not duplicate" answers (key = the sorted deal ids of the group)
create table if not exists public.deal_dup_dismissed (
  key          text primary key,
  dismissed_by uuid default auth.uid() references public.profiles(id) on delete set null,
  dismissed_at timestamptz not null default now()
);
alter table public.deal_dup_dismissed enable row level security;
revoke all on public.deal_dup_dismissed from anon;
drop policy if exists "finance admin dup answers" on public.deal_dup_dismissed;
create policy "finance admin dup answers" on public.deal_dup_dismissed for all
  using ((select public.is_finance_admin())) with check ((select public.is_finance_admin()));

-- 3) Merge: p_drop deals go into p_keep. Same side(s), same type, same status only.
--    p_same = false (rows hold parts of one commission): commissions are added
--      up and each person keeps the same money (his % is recalculated).
--    p_same = true (rows are copies of the same deal): the kept commission
--      stays and the people share it equally between the copies.
--    Money movements, contracts and frozen rates move to the kept deal.
drop function if exists public.merge_deals(uuid, uuid[]);
create or replace function public.merge_deals(p_keep uuid, p_drop uuid[], p_same boolean default false) returns void
language plpgsql security definer set search_path = public as $$
declare k public.deals; x public.deals; s text; v_tot numeric; v_n int; v_fix numeric;
begin
  if not public.is_finance_admin() then raise exception 'Only Admin / CEO can merge deals'; end if;
  if p_drop is null or array_length(p_drop, 1) is null then raise exception 'Choose the deals to merge'; end if;
  if p_keep = any(p_drop) then raise exception 'The kept deal can''t also be merged away'; end if;
  select * into k from public.deals where id = p_keep for update;
  if not found then raise exception 'Deal not found'; end if;
  select count(*) into v_n from public.deals where id = any(p_drop);
  if v_n <> array_length(p_drop, 1) then raise exception 'Some of these deals no longer exist — refresh'; end if;
  for x in select * from public.deals where id = any(p_drop) for update loop
    if x.sides <> k.sides then raise exception 'Different sides (% / %): these are separate deals', k.sides, x.sides; end if;
    if coalesce(x.deal_type, 'sale') <> coalesce(k.deal_type, 'sale') then raise exception 'One is a sale and one is a rent'; end if;
    if x.status <> k.status then raise exception 'Different status (% / %): bring them to the same status first', k.status, x.status; end if;
    if x.status in ('cancelled', 'rejected') then raise exception 'Cancelled deals can''t be merged'; end if;
  end loop;

  if p_same and exists (select 1 from public.finance_transactions where deal_id = any(p_drop)) then
    raise exception 'The copies have money recorded on them. Merge them as parts (add up), or fix the money in Treasury first';
  end if;

  -- each person's money on each side, before the merge
  create temp table _merge_shares on commit drop as
    select a.agent_id, a.side,
           sum(a.split_pct / 100.0 * case when a.side = 'buyer' then d.commission_buyer else d.commission_seller end) as amt,
           sum(a.split_pct) as pct
      from public.deal_agents a join public.deals d on d.id = a.deal_id
     where a.deal_id = p_keep or a.deal_id = any(p_drop)
     group by a.agent_id, a.side;

  if p_same then -- copies: everyone's share counts equally
    update _merge_shares set amt = pct;
  end if;
  update public.deals k2 set
    commission_buyer     = case when p_same then k2.commission_buyer else (select sum(commission_buyer) from public.deals where id = p_keep or id = any(p_drop)) end,
    commission_seller    = case when p_same then k2.commission_seller else (select sum(commission_seller) from public.deals where id = p_keep or id = any(p_drop)) end,
    commission_total     = case when p_same then k2.commission_total else (select sum(commission_total) from public.deals where id = p_keep or id = any(p_drop)) end,
    commission_collected = case when p_same then greatest(k2.commission_collected, (select max(commission_collected) from public.deals where id = any(p_drop))) else (select sum(commission_collected) from public.deals where id = p_keep or id = any(p_drop)) end,
    expected_transfer_date = coalesce(k2.expected_transfer_date, (select min(expected_transfer_date) from public.deals where id = any(p_drop))),
    reserved_at          = coalesce(least(k2.reserved_at, (select min(reserved_at) from public.deals where id = any(p_drop))), k2.reserved_at),
    notes                = nullif(concat_ws(E'\n', k2.notes, 'Merged from the Excel duplicates on ' || to_char(now() at time zone 'Africa/Cairo', 'YYYY-MM-DD')), '')
   where k2.id = p_keep;

  delete from public.deal_agents where deal_id = p_keep;
  foreach s in array (case k.sides when 'both' then array['buyer', 'seller'] else array[k.sides] end) loop
    select coalesce(sum(amt), 0) into v_tot from _merge_shares where side = s;
    if v_tot > 0 then
      insert into public.deal_agents (deal_id, agent_id, side, split_pct)
      select p_keep, agent_id, s, round(amt * 100.0 / v_tot, 4) from _merge_shares where side = s and amt > 0;
    else -- no commission written on this side: average the shares
      select coalesce(sum(pct), 0) into v_tot from _merge_shares where side = s;
      if v_tot > 0 then
        insert into public.deal_agents (deal_id, agent_id, side, split_pct)
        select p_keep, agent_id, s, round(pct * 100.0 / v_tot, 4) from _merge_shares where side = s and pct > 0;
      end if;
    end if;
    -- rounding: make the side add up to exactly 100
    select 100 - coalesce(sum(split_pct), 0) into v_fix from public.deal_agents where deal_id = p_keep and side = s;
    if v_fix <> 0 then
      update public.deal_agents set split_pct = split_pct + v_fix
       where deal_id = p_keep and side = s
         and agent_id = (select agent_id from public.deal_agents where deal_id = p_keep and side = s order by split_pct desc limit 1);
    end if;
  end loop;

  insert into public.deal_rates (deal_id, agent_id, beneficiary_id, level, rates)
  select p_keep, agent_id, beneficiary_id, level, rates from public.deal_rates where deal_id = any(p_drop)
  on conflict do nothing;
  update public.finance_transactions set deal_id = p_keep where deal_id = any(p_drop);
  update public.contracts set deal_id = p_keep where deal_id = any(p_drop);
  delete from public.deal_dup_dismissed where key like '%' || p_keep::text || '%';
  delete from public.deals where id = any(p_drop);

  if k.status <> 'pending' then perform public.check_deal_teams(p_keep); end if;
end;
$$;
revoke execute on function public.merge_deals(uuid, uuid[], boolean) from public, anon;
grant execute on function public.merge_deals(uuid, uuid[], boolean) to authenticated;

select 'Ops polish ✓ (deal count by side, merge duplicates)' as result;
