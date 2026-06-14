
ALTER TABLE public.diagnostico_respostas
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_diagnostico_respostas_user_id
  ON public.diagnostico_respostas(user_id);

DROP POLICY IF EXISTS "Users read own diagnostico" ON public.diagnostico_respostas;
CREATE POLICY "Users read own diagnostico"
  ON public.diagnostico_respostas
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can insert with consent" ON public.diagnostico_respostas;
CREATE POLICY "Anyone can insert with consent"
  ON public.diagnostico_respostas
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    consentimento = true
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- Allow admins to manage user_roles
DROP POLICY IF EXISTS "Admins insert roles" ON public.user_roles;
CREATE POLICY "Admins insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete roles" ON public.user_roles;
CREATE POLICY "Admins delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update roles" ON public.user_roles;
CREATE POLICY "Admins update roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
