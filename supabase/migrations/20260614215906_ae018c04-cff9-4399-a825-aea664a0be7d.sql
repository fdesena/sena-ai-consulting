CREATE OR REPLACE FUNCTION public.claim_seed_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid;
  uemail text;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RETURN false;
  END IF;
  SELECT email INTO uemail FROM auth.users WHERE id = uid;
  IF lower(coalesce(uemail,'')) IN ('senaconsulting@gmail.com','felipesmsena@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN true;
  END IF;
  RETURN false;
END;
$function$;

-- Backfill admin role for these emails if accounts already exist
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE lower(u.email) IN ('senaconsulting@gmail.com','felipesmsena@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;