-- Salaries are paid on the 1st of the month for the PREVIOUS month
-- (e.g. paid 1 November = October's salary). Moves salaries that were
-- recorded against the month they were paid in to the month they cover.
-- Safe to re-run: rows already moved are not touched again.
update public.finance_transactions
   set period = to_char(date_trunc('month', occurred_at at time zone 'Africa/Cairo') - interval '1 month', 'YYYY-MM')
 where kind = 'salary'
   and extract(day from occurred_at at time zone 'Africa/Cairo') <= 10
   and period = to_char(occurred_at at time zone 'Africa/Cairo', 'YYYY-MM');
