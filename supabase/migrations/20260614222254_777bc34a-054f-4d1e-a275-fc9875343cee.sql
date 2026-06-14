
-- 1. Tighten avatars SELECT policy: users can only read files in their own folder
DROP POLICY IF EXISTS "Avatars are readable by authenticated" ON storage.objects;
CREATE POLICY "Users read own avatar"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (auth.uid())::text);

-- 2. Revoke EXECUTE from anon on SECURITY DEFINER functions (keep for authenticated where needed)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.claim_seed_admin() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_seed_admin() TO authenticated;

-- 3. Tighten page_events insert: scope user_id to caller
DROP POLICY IF EXISTS "Anyone can insert events" ON public.page_events;
CREATE POLICY "Insert events scoped to caller"
ON public.page_events FOR INSERT
TO anon, authenticated
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL)
  OR (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
);
