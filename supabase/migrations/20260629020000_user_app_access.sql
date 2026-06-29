-- =========================================================
-- Acesso a Apps por usuário
-- Apps internos da plataforma (ex.: JusRadar) ficam ocultos por padrão.
-- O admin concede acesso explicitamente; só então o usuário vê a tab.
-- =========================================================
CREATE TABLE IF NOT EXISTS public.user_app_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_slug TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (user_id, app_slug)
);

CREATE INDEX IF NOT EXISTS user_app_access_user_idx
  ON public.user_app_access (user_id);

GRANT SELECT ON public.user_app_access TO authenticated;
GRANT ALL ON public.user_app_access TO service_role;

ALTER TABLE public.user_app_access ENABLE ROW LEVEL SECURITY;

-- Usuário enxerga o próprio acesso; admin enxerga tudo.
DROP POLICY IF EXISTS "Users see own app access" ON public.user_app_access;
CREATE POLICY "Users see own app access"
  ON public.user_app_access FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
