-- Adds a "closed lead" flow: a sales person can remove a lead from their
-- active list with a reason, without deleting it from the database.

alter table public.clients add column if not exists closed_reason text;
alter table public.clients add column if not exists closed_note text;

alter table public.clients drop constraint if exists clients_stage_check;
alter table public.clients add constraint clients_stage_check check (stage in (
  'new_lead','options_sent','meeting_generated','meeting_done','follow_up_after_meeting',
  'second_meeting','negotiation','to_be_contracted','contracted','deal_done',
  'not_qualified','not_responding','closed'
));
