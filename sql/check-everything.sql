-- Checks that every update is in the database, in its latest version.
-- Read-only: changes nothing. Every line must say OK (20 lines).
with fn as (
  select p.proname, p.prosrc from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public'
), col as (
  select table_name || '.' || column_name as c from information_schema.columns where table_schema = 'public'
), checks(step, ok) as (values
  ('01 Finance module (deals, commissions, treasury)', (select count(*) from information_schema.tables where table_schema = 'public' and table_name in
      ('deals','deal_agents','deal_rates','commission_rates','finance_accounts','finance_transactions','expense_categories','recurring_expenses','staff_salaries','staff_targets','finance_settings','finance_audit')) = 12),
  ('02 Floos Rabna 1%', exists (select 1 from col where c = 'finance_settings.charity_pct') and exists (select 1 from pg_trigger where tgname = 'trg_charity' and tgenabled <> 'D')),
  ('03 Deal stages Reserved → Done', exists (select 1 from col where c = 'deals.transfer_date')),
  ('04 Deal sides buyer / seller / both', exists (select 1 from col where c = 'deals.sides') and exists (select 1 from col where c = 'deal_agents.side') and exists (select 1 from fn where proname = 'check_deal_teams')),
  ('05 Rent', exists (select 1 from col where c = 'units.listing_type') and exists (select 1 from col where c = 'deals.rent_monthly') and exists (select 1 from col where c = 'clients.interest')),
  ('06 Sales can submit deals (fix)', exists (select 1 from pg_policies where tablename = 'deals' and policyname = 'read' and qual like '%created_by = auth.uid()%')),
  ('07 Shorter pipeline stages', exists (select 1 from pg_constraint where conname = 'clients_stage_check' and pg_get_constraintdef(oid) like '%options_sent%' and pg_get_constraintdef(oid) not like '%meeting_done%')),
  ('08 Duplicate numbers', exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'lead_duplicates') and exists (select 1 from fn where proname = 'phone_owners')),
  ('09 Deal defaults (commission %)', exists (select 1 from col where c = 'finance_settings.default_sale_commission_pct')),
  ('10 Clients locked to owner & managers', exists (select 1 from fn where proname = 'can_see_client') and exists (select 1 from fn where proname = 'is_approved')),
  ('11 Security fix (sign-ups, helpers)', exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'self insert profile' and with_check like '%pending%')
      and not has_function_privilege('authenticated', 'public.charity_for_collection(public.finance_transactions)', 'execute')),
  ('12 Sold units', exists (select 1 from col where c = 'units.sold_via') and exists (select 1 from col where c = 'deals.buyer_name')),
  ('13 approve_deal is the latest version', exists (select 1 from fn where proname = 'approve_deal' and prosrc like '%Reserved — rental%' and prosrc like '%check_deal_teams%')),
  ('14 complete_deal is the latest version', exists (select 1 from fn where proname = 'complete_deal' and prosrc like '%sold_via%' and prosrc like '%Rented%' and prosrc like '%commission_buyer%')),
  ('15 cancel_deal is the latest version', exists (select 1 from fn where proname = 'cancel_deal' and prosrc like '%sold_via%' and prosrc like '%Reserved — rental%')),
  ('16 Guards are ON', not exists (select 1 from pg_trigger where tgname in ('trg_deals_guard','trg_prevent_role_escalation','trg_audit') and tgenabled = 'D')
      and exists (select 1 from pg_trigger where tgname = 'trg_prevent_role_escalation')),
  ('18 Attendance report and settings', exists (select 1 from col where c = 'finance_settings.late_after') and exists (select 1 from pg_policies where tablename = 'attendance' and policyname = 'read attendance' and qual like '%is_self_or_manager_of%')),
  ('19 Leaderboard, WhatsApp templates, celebrations', exists (select 1 from fn where proname = 'leaderboard') and exists (select 1 from col where c = 'finance_settings.celebration_media')),
  ('20 Phone notifications (tables, triggers, every-minute job)', exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'push_subscriptions')
      and exists (select 1 from pg_trigger where tgname = 'trg_notify_deal') and exists (select 1 from pg_trigger where tgname = 'trg_notify_lead_assigned')
      and exists (select 1 from pg_extension where extname = 'pg_cron')),
  ('17 Row security ON for every table', not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity))
)
select step, case when ok then 'OK' else '*** MISSING ***' end as result from checks order by step;
