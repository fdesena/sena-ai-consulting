ALTER TABLE public.diagnostico_respostas ADD COLUMN IF NOT EXISTS email text;
CREATE INDEX IF NOT EXISTS diag_resp_email_idx ON public.diagnostico_respostas (email);