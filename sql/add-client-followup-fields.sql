-- Adds the "next action" reminder fields used by the in-app notifications
-- (follow-up reminders + meeting-done prompts) on the Clients module.

alter table public.clients add column if not exists next_action text;
alter table public.clients add column if not exists next_action_at timestamptz;
alter table public.clients add column if not exists next_action_done boolean not null default false;

create index if not exists idx_clients_next_action
  on public.clients(next_action_at)
  where next_action_done = false;
