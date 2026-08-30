-- =========================================================
-- Backfill: reclassifica como 'survey' as perguntas de autoavaliação que já
-- existiam nos templates "Termômetro" (sem nenhuma opção correta marcada).
-- Em arquivo separado da criação do enum porque o Postgres não deixa usar um
-- valor de enum recém-criado na mesma transação que o criou.
-- =========================================================

UPDATE public.quiz_questions q
SET kind = 'survey'
WHERE q.kind = 'single'
  AND NOT EXISTS (
    SELECT 1 FROM public.quiz_options o WHERE o.question_id = q.id AND o.is_correct
  )
  AND EXISTS (
    SELECT 1 FROM public.quiz_templates t
    WHERE t.id = q.template_id AND t.title ->> 'pt' ILIKE 'Termômetro%'
  );
