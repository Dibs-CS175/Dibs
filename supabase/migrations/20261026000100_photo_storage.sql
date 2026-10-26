-- Storage bucket for listing photos (student Sell flow and Dibs Goods intake).
-- Limits match lib/photos.ts: 5 MB per file, JPEG / PNG / WebP only.
-- Public read so listing cards can load photos by URL; writes are limited to the uploader's own folder.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Files are stored as <auth.uid()>/<random>.<ext>; the first folder must be the uploader's id.
create policy "Users upload listing photos to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete their own listing photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
