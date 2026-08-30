-- =========================================================
-- Quiz ao vivo — agrupamento de perguntas por "dimensão"
--
-- Pra templates de autoavaliação antes/depois (ex.: Termômetro), várias
-- perguntas de 1 a 5 se combinam numa dimensão só (ex.: "Prompting e uso
-- prático" = média de 2 perguntas). Esse campo livre marca a qual dimensão
-- cada pergunta pertence, pra exportação poder calcular a média da sala por
-- dimensão em vez de só por pergunta isolada.
-- =========================================================

ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS dimension TEXT;
