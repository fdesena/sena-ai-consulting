-- Recreate the 'avatars' storage bucket.
-- In the old Lovable Cloud project this bucket was created via the dashboard UI,
-- so it never existed in a migration. The RLS policies for it live in
-- 20260614220011_*.sql and 20260614222254_*.sql; this creates the bucket itself.
-- Private bucket: access is governed by the per-user folder policies.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;
