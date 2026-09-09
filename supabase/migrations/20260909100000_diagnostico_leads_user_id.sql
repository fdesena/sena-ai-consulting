-- Permite fazer o diagnóstico de dentro da área logada (/painel/diagnostico):
-- a linha em diagnostico_leads passa a poder ser vinculada à conta do usuário,
-- para que "Meu Diagnóstico" leia o próprio resultado sem depender do sistema
-- legado (diagnostico_respostas).
ALTER TABLE public.diagnostico_leads
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS diagnostico_leads_user_id_idx ON public.diagnostico_leads (user_id);

DROP POLICY IF EXISTS "Users can read their own diagnostico lead" ON public.diagnostico_leads;
CREATE POLICY "Users can read their own diagnostico lead"
  ON public.diagnostico_leads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
