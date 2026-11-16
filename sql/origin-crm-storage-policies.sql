-- Allow any logged-in user to upload photos to the unit-photos bucket
create policy "authenticated upload unit photos"
  on storage.objects for insert
  with check (bucket_id = 'unit-photos' and auth.role() = 'authenticated');

-- Allow anyone to view photos (bucket is already public, this keeps reads working via the API too)
create policy "public read unit photos"
  on storage.objects for select
  using (bucket_id = 'unit-photos');
