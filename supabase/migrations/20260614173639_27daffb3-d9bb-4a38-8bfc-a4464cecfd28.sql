
-- =========================================================
-- 1) Papel de administrador (necessário para o painel admin)
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

DROP POLICY IF EXISTS "Users see own roles" ON public.user_roles;
CREATE POLICY "Users see own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 2) Respostas do diagnóstico
-- =========================================================
CREATE TABLE IF NOT EXISTS public.diagnostico_respostas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Lead
  nome TEXT NOT NULL,
  negocio TEXT,
  whatsapp TEXT NOT NULL,
  consentimento BOOLEAN NOT NULL DEFAULT false,

  -- Perfil
  papel TEXT,
  segmento TEXT,
  aspiracao TEXT,
  equipe TEXT,
  barreira TEXT,
  impacto TEXT,

  -- Listas
  ferramentas JSONB NOT NULL DEFAULT '[]'::jsonb,
  desafios    JSONB NOT NULL DEFAULT '[]'::jsonb,
  reflexao    TEXT,

  -- Resultado
  score_geral INTEGER NOT NULL CHECK (score_geral BETWEEN 0 AND 100),
  nivel       TEXT NOT NULL,
  arquetipo   TEXT NOT NULL,

  score_usar_ia        INTEGER NOT NULL DEFAULT 0,
  score_oportunidades  INTEGER NOT NULL DEFAULT 0,
  score_automacao      INTEGER NOT NULL DEFAULT 0,
  score_gente          INTEGER NOT NULL DEFAULT 0,
  score_dados          INTEGER NOT NULL DEFAULT 0,

  respostas_brutas JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- proteção mínima
  CONSTRAINT nome_nao_vazio CHECK (char_length(trim(nome)) BETWEEN 1 AND 200),
  CONSTRAINT whatsapp_nao_vazio CHECK (char_length(trim(whatsapp)) BETWEEN 1 AND 50),
  CONSTRAINT reflexao_limite CHECK (reflexao IS NULL OR char_length(reflexao) <= 4000)
);

CREATE INDEX IF NOT EXISTS diag_resp_created_at_idx
  ON public.diagnostico_respostas (created_at DESC);
CREATE INDEX IF NOT EXISTS diag_resp_segmento_idx
  ON public.diagnostico_respostas (segmento);
CREATE INDEX IF NOT EXISTS diag_resp_arquetipo_idx
  ON public.diagnostico_respostas (arquetipo);

-- Grants — formulário público pode INSERIR; SELECT/UPDATE/DELETE são checados por policy
GRANT INSERT ON public.diagnostico_respostas TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.diagnostico_respostas TO authenticated;
GRANT ALL ON public.diagnostico_respostas TO service_role;

ALTER TABLE public.diagnostico_respostas ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa (mesmo anônima) pode gravar, desde que tenha dado consentimento
DROP POLICY IF EXISTS "Anyone can insert with consent"
  ON public.diagnostico_respostas;
CREATE POLICY "Anyone can insert with consent"
  ON public.diagnostico_respostas
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (consentimento = true);

-- Apenas admins podem ler / alterar / apagar
DROP POLICY IF EXISTS "Admins can read all"
  ON public.diagnostico_respostas;
CREATE POLICY "Admins can read all"
  ON public.diagnostico_respostas
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update"
  ON public.diagnostico_respostas;
CREATE POLICY "Admins can update"
  ON public.diagnostico_respostas
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete"
  ON public.diagnostico_respostas;
CREATE POLICY "Admins can delete"
  ON public.diagnostico_respostas
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
