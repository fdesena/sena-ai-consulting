-- =========================================================
-- Quiz ao vivo — tipo de pergunta "Estatística" (survey)
--
-- Perguntas de autoavaliação (ex.: "Termômetro — Encontro 1") não têm
-- certo/errado — só existem pra coletar a distribuição de respostas da
-- turma. Até aqui isso era simulado com kind='single' sem nenhuma opção
-- marcada como correta, o que fazia o participante ver "Não foi dessa vez"
-- mesmo sem existir resposta errada. O tipo 'survey' resolve isso: mesma
-- UI de escolha única pro participante, mas nunca pontua e o app mostra
-- uma tela neutra de confirmação em vez de acerto/erro.
-- =========================================================

ALTER TYPE public.quiz_question_kind ADD VALUE IF NOT EXISTS 'survey';
