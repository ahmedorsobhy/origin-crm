-- Adds a new "Long Term" stage: a lead that's parked for the long run.
-- It needs no meeting/timing, and the app excludes it from "delayed leads" counts.

alter table public.clients drop constraint if exists clients_stage_check;
alter table public.clients add constraint clients_stage_check check (stage in (
  'new_lead','options_sent','meeting_generated','meeting_done','follow_up_after_meeting',
  'second_meeting','negotiation','to_be_contracted','contracted','deal_done',
  'not_qualified','not_responding','long_term','closed'
));
