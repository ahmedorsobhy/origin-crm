-- Checks that every update is in the database, in its latest version.
-- Read-only: changes nothing. Every line must say OK (33 lines).
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
  ('21 Cold calls', (select count(*) from information_schema.tables where table_schema = 'public' and table_name in ('cold_sheets','cold_leads','cold_activity')) = 3
      and exists (select 1 from fn where proname = 'can_see_cold_lead') and exists (select 1 from col where c = 'finance_settings.wa_cold_template')),
  ('22 Sales ranking', exists (select 1 from fn where proname = 'sales_ranking' and prosrc like '%sales_agent%') and exists (select 1 from fn where proname = 'known_phones')),
  ('23 Share links, price-drop alerts', exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'share_links')
      and has_function_privilege('anon', 'public.public_share(text)', 'execute') and exists (select 1 from pg_trigger where tgname = 'trg_notify_price_drop')),
  ('24 Campaigns, late leads, voice notes, backups', exists (select 1 from col where c = 'clients.campaign') and exists (select 1 from col where c = 'finance_settings.late_lead_hours')
      and (select count(*) from storage.buckets where id in ('voice-notes','backups')) = 2),
  ('25 Owner phones protected', exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'unit_owners')
      and exists (select 1 from pg_trigger where tgname = 'trg_units_owner_split')
      and not exists (select 1 from public.units where owner_number is not null or owner_name is not null)),
  ('26 Only handlers can edit units', exists (select 1 from fn where proname = 'can_edit_unit')
      and not exists (select 1 from pg_policies where schemaname = 'public' and tablename in ('units','unit_sales') and cmd in ('UPDATE','INSERT','DELETE')
                      and coalesce(qual, with_check) not like '%can_edit_unit%' and coalesce(qual, with_check) not like '%is_admin%' and not (tablename = 'units' and cmd = 'INSERT'))),
  ('27 Photo upload approved only, activity under real name', (exists (select 1 from pg_trigger where tgname = 'trg_activity_author') or exists (select 1 from pg_trigger where tgname = 'trg_stamp_real_time' and tgrelid = 'public.client_activity'::regclass))
      and exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and cmd = 'INSERT' and coalesce(with_check, '') like '%unit-photos%' and coalesce(with_check, '') like '%is_approved%')
      and not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and cmd in ('INSERT', 'ALL')
                      and coalesce(with_check, qual, '') like '%unit-photos%' and coalesce(with_check, qual, '') not like '%is_approved%')),
  ('28 Deals (done) and reservations counted apart', exists (select 1 from col where c = 'deals.reserved_at') and exists (select 1 from col where c = 'deals.done_at')
      and exists (select 1 from pg_trigger where tgname = 'trg_deals_stamp_dates') and exists (select 1 from fn where proname = 'sales_ranking' and prosrc like '%reserved_at%')),
  ('29 Money at reservation, refunds, editable dates, Floos Rabna on done', exists (select 1 from pg_constraint where conname = 'finance_transactions_kind_check' and pg_get_constraintdef(oid) like '%refund%')
      and exists (select 1 from pg_proc where proname = 'cancel_deal' and pronargs = 5)
      and exists (select 1 from pg_proc where proname = 'complete_deal' and prosrc like '%v_paid_b%')
      and exists (select 1 from pg_proc where proname = 'deals_stamp_dates' and prosrc like '%transfer_date%')
      and exists (select 1 from pg_trigger where tgname = 'trg_deal_done_charity')),
  ('30 Contracts (no national IDs stored) + unit description fields', exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'contracts')
      and exists (select 1 from pg_trigger where tgname = 'trg_contracts_guard') and exists (select 1 from pg_trigger where tgname = 'trg_contracts_notify')
      and exists (select 1 from col where c = 'units.bedrooms') and exists (select 1 from col where c = 'units.next_club_date')),
  ('31 Cold sheets: sales upload, managers approve', exists (select 1 from col where c = 'cold_sheets.status') and exists (select 1 from col where c = 'cold_sheets.batch_id')
      and exists (select 1 from fn where proname = 'can_manage_cold_for') and exists (select 1 from pg_trigger where tgname = 'trg_cold_sheets_guard')
      and exists (select 1 from pg_trigger where tgname = 'trg_cold_sheets_notify')),
  ('32 Cold sheets: move / delete keep history', exists (select 1 from fn where proname = 'cold_move_leads') and exists (select 1 from fn where proname = 'cold_delete_leads')
      and exists (select 1 from pg_constraint where conname = 'cold_activity_lead_id_fkey' and confdeltype = 'n')),
  ('33 No back-dating (check-ins, clients, units, calls)', (select count(*) from pg_trigger where tgname = 'trg_stamp_real_time') = 5),
  ('34 Admin edit + managers'' own sheets + owner messages', exists (select 1 from col where c = 'finance_settings.wa_owner_ar') and exists (select 1 from col where c = 'finance_settings.wa_owner_en')
      and exists (select 1 from fn where proname = 'admin_sync_deal_rates') and exists (select 1 from pg_trigger where tgname = 'trg_charity_follow_edit')
      and exists (select 1 from pg_policies where tablename = 'attendance' and policyname = 'admin delete attendance')
      and not exists (select 1 from pg_proc where proname = 'can_manage_cold_for' and prosrc like '%is distinct from auth.uid()%')),
  ('17 Row security ON for every table', not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity))
)
select step, case when ok then 'OK' else '*** MISSING ***' end as result from checks order by step;
