-- Updates the Clients module to the new pipeline design:
--   10 main stages (New Lead -> ... -> Deal Is Done)
--   Not Qualified / Not Responding become "exception" stages usable from any point
--   a separate "qualified" Yes/No flag that gates New Lead -> the rest of the pipeline

-- 1. Add the qualified flag
alter table public.clients add column if not exists qualified boolean not null default false;

-- 2. Drop the old stage check constraint FIRST (so we can freely update existing rows)
alter table public.clients drop constraint if exists clients_stage_check;

-- 3. Migrate any existing rows from the old stage names to the new ones
update public.clients set stage = 'new_lead' where stage = 'new';
update public.clients set stage = 'new_lead', qualified = true where stage = 'contacted';
update public.clients set stage = 'new_lead', qualified = true where stage = 'qualified';
update public.clients set stage = 'to_be_contracted', qualified = true where stage = 'promise_of_sale';
update public.clients set stage = 'deal_done', qualified = true where stage = 'transfer_done';
-- 'options_sent','meeting_generated','meeting_done','follow_up_after_meeting','second_meeting',
-- 'negotiation','contracted','not_qualified','not_responding' already match the new names,
-- but mark them qualified too since they were already past New Lead:
update public.clients set qualified = true
  where stage in ('options_sent','meeting_generated','meeting_done','follow_up_after_meeting','second_meeting','negotiation','contracted');

-- 4. Now that every row uses a valid new stage name, re-add the constraint
alter table public.clients add constraint clients_stage_check check (stage in (
  'new_lead','options_sent','meeting_generated','meeting_done','follow_up_after_meeting',
  'second_meeting','negotiation','to_be_contracted','contracted','deal_done',
  'not_qualified','not_responding'
));
