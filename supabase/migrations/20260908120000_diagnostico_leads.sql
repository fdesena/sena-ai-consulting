-- Novo diagnóstico (deterministic, sem nota de maturidade, sem cadastro).
-- Tabela separada da legada public.diagnostico_respostas, que continua servindo
-- o painel /_authenticated/painel/diagnostico para o histórico já existente.

CREATE TABLE IF NOT EXISTS public.diagnostico_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  schema_version TEXT NOT NULL,
  nome TEXT,
  negocio TEXT,
  goal TEXT,
  priority_area TEXT,
  areas JSONB NOT NULL DEFAULT '[]'::jsonb,

  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  report JSONB NOT NULL DEFAULT '{}'::jsonb,

  CONSTRAINT diagnostico_leads_schema_version_nao_vazio CHECK (char_length(trim(schema_version)) BETWEEN 1 AND 40),
  CONSTRAINT diagnostico_leads_nome_limite CHECK (nome IS NULL OR char_length(nome) <= 200),
  CONSTRAINT diagnostico_leads_negocio_limite CHECK (negocio IS NULL OR char_length(negocio) <= 200)
);

CREATE INDEX IF NOT EXISTS diagnostico_leads_created_at_idx ON public.diagnostico_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS diagnostico_leads_priority_area_idx ON public.diagnostico_leads (priority_area);

-- Formulário público pode inserir (sem cadastro); SELECT/UPDATE/DELETE só para admins.
GRANT INSERT ON public.diagnostico_leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.diagnostico_leads TO authenticated;
GRANT ALL ON public.diagnostico_leads TO service_role;

ALTER TABLE public.diagnostico_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert diagnostico leads" ON public.diagnostico_leads;
CREATE POLICY "Anyone can insert diagnostico leads"
  ON public.diagnostico_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read diagnostico leads" ON public.diagnostico_leads;
CREATE POLICY "Admins can read diagnostico leads"
  ON public.diagnostico_leads
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update diagnostico leads" ON public.diagnostico_leads;
CREATE POLICY "Admins can update diagnostico leads"
  ON public.diagnostico_leads
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete diagnostico leads" ON public.diagnostico_leads;
CREATE POLICY "Admins can delete diagnostico leads"
  ON public.diagnostico_leads
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
