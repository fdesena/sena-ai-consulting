-- =========================================================
-- Descrições de serviço reutilizáveis no app "invoice".
-- Reaproveita invoice_parties: a constraint de kind passa a aceitar
-- também 'description'. O apelido (label) é a primeira linha do texto.
-- =========================================================
ALTER TABLE public.invoice_parties DROP CONSTRAINT IF EXISTS invoice_parties_kind_check;
ALTER TABLE public.invoice_parties
  ADD CONSTRAINT invoice_parties_kind_check CHECK (kind IN ('provider', 'payer', 'description'));
