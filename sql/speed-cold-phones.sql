-- =====================================================================
-- Cold calls: owners with more than one number (2nd column, or several numbers in one cell)
-- Safe to run more than once. Run the whole file in Supabase → SQL Editor.
-- =====================================================================
alter table public.cold_leads add column if not exists other_phones text[];

-- Faster cold-call pages: the lists load by these columns
create index if not exists cold_leads_sheet_idx on public.cold_leads (sheet_id, position);
create index if not exists cold_leads_assigned_idx on public.cold_leads (assigned_to, status);
create index if not exists cold_activity_created_idx on public.cold_activity (created_at desc);
create index if not exists client_activity_changed_idx on public.client_activity (changed_at desc);

select 'Second numbers for cold calls installed ✓' as result;
