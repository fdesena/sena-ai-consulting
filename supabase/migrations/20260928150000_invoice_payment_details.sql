-- =========================================================
-- Dados para pagamento no app "invoice".
-- (a) Texto livre gravado junto de cada invoice.
-- (b) Opções salvas reaproveitam invoice_parties: a constraint de kind
--     passa a aceitar também 'payment'.
-- =========================================================
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_details TEXT NOT NULL DEFAULT '';

ALTER TABLE public.invoice_parties DROP CONSTRAINT IF EXISTS invoice_parties_kind_check;
ALTER TABLE public.invoice_parties
  ADD CONSTRAINT invoice_parties_kind_check
  CHECK (kind IN ('provider', 'payer', 'description', 'payment'));
