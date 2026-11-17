-- Fix: sales / managers got "new row violates row-level security policy for
-- table deals" when submitting a deal. The read rule looked the new deal up
-- in the table before it existed, so the app couldn't read back the row it
-- had just created. The creator can now always read their own deal directly.
-- Run once in Supabase SQL Editor. Safe to re-run.
drop policy if exists "read" on public.deals;
create policy "read" on public.deals for select
  using (created_by = auth.uid() or public.can_see_deal(id));
