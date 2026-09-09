-- Captura do lead passa a acontecer no início do diagnóstico (tela de boas-vindas
-- com consentimento), não apenas quando a pessoa abre o WhatsApp no resultado.
-- O registro criado no início é completado (answers/report) ao final do percurso.

ALTER TABLE public.diagnostico_leads
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS consentimento BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS diagnostico_leads_email_idx ON public.diagnostico_leads (email);

-- Inserção (tela de boas-vindas): exige nome, e-mail, whatsapp e consentimento.
DROP POLICY IF EXISTS "Anyone can insert diagnostico leads" ON public.diagnostico_leads;
CREATE POLICY "Anyone can insert diagnostico leads"
  ON public.diagnostico_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    consentimento = true
    AND char_length(trim(coalesce(nome, ''))) BETWEEN 1 AND 200
    AND char_length(trim(coalesce(email, ''))) BETWEEN 3 AND 255
    AND char_length(trim(coalesce(whatsapp, ''))) BETWEEN 8 AND 50
  );

-- Conclusão do diagnóstico (fim do percurso): atualiza o mesmo registro com
-- answers/report. Escrita real acontece via service role nas rotas de servidor;
-- esta policy é só defesa em profundidade caso algo grave direto pelo client.
DROP POLICY IF EXISTS "Anyone can complete own diagnostico lead" ON public.diagnostico_leads;
CREATE POLICY "Anyone can complete own diagnostico lead"
  ON public.diagnostico_leads
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (consentimento = true);
