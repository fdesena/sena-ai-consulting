
CREATE OR REPLACE FUNCTION public.claim_seed_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
  uemail text;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RETURN false;
  END IF;
  SELECT email INTO uemail FROM auth.users WHERE id = uid;
  IF lower(coalesce(uemail,'')) = 'senaconsulting@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_seed_admin() TO authenticated;
