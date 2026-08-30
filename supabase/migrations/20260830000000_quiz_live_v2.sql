-- =========================================================
-- Quiz ao vivo — ajustes de comportamento (segue 20260817000000):
--
--   1) quiz_join: se o nome já existe na sessão, retoma a MESMA equipe
--      (devolve o token existente) em vez de recusar. Cobre o caso de quem
--      fechou o navegador sem querer e volta digitando o mesmo nome.
--   2) quiz_answer: não bloqueia mais o envio da resposta quando a pergunta
--      já foi revelada. O anfitrião pode revelar cedo (pra acompanhar a
--      distribuição em tempo real) e quem ainda não respondeu continua
--      podendo responder até ele avançar para a próxima pergunta.
-- =========================================================

CREATE OR REPLACE FUNCTION public.quiz_join(p_pin TEXT, p_name TEXT, p_emoji TEXT DEFAULT '🎯')
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_session public.quiz_sessions;
  v_team_id UUID;
  v_token   UUID;
BEGIN
  SELECT * INTO v_session FROM public.quiz_sessions WHERE pin = btrim(p_pin);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PIN não encontrado';
  END IF;
  IF v_session.status NOT IN ('lobby', 'in_progress') THEN
    RAISE EXCEPTION 'Esta sessão já foi encerrada';
  END IF;
  IF btrim(coalesce(p_name, '')) = '' THEN
    RAISE EXCEPTION 'Informe um nome para a equipe';
  END IF;

  BEGIN
    INSERT INTO public.quiz_teams (session_id, name, emoji)
    VALUES (v_session.id, btrim(p_name), coalesce(nullif(btrim(p_emoji), ''), '🎯'))
    RETURNING id INTO v_team_id;
  EXCEPTION WHEN unique_violation THEN
    -- Mesmo nome já usado nesta sessão: deixa a mesma pessoa retomar de onde
    -- parou (ex.: fechou o navegador sem querer) em vez de recusar a entrada.
    SELECT t.id INTO v_team_id
    FROM public.quiz_teams t
    WHERE t.session_id = v_session.id AND lower(btrim(t.name)) = lower(btrim(p_name));
  END;

  SELECT token INTO v_token FROM public.quiz_team_secrets WHERE team_id = v_team_id;
  IF NOT FOUND THEN
    INSERT INTO public.quiz_team_secrets (team_id) VALUES (v_team_id)
    RETURNING token INTO v_token;
  END IF;

  RETURN jsonb_build_object(
    'session_id', v_session.id,
    'team_id',    v_team_id,
    'token',      v_token,
    'pin',        v_session.pin
  );
END $$;

CREATE OR REPLACE FUNCTION public.quiz_answer(
  p_token       UUID,
  p_question_id UUID,
  p_option_ids  UUID[] DEFAULT '{}',
  p_assignments JSONB  DEFAULT NULL,
  p_text        TEXT   DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_team     public.quiz_teams;
  v_session  public.quiz_sessions;
  v_question public.quiz_questions;
  v_correct  UUID[];
  v_chosen   UUID[];
  v_total    INT;
  v_hits     INT;
  v_ok       BOOLEAN := false;
  v_points   INT := 0;
  v_deadline TIMESTAMPTZ;
BEGIN
  SELECT t.* INTO v_team
  FROM public.quiz_teams t
  JOIN public.quiz_team_secrets s ON s.team_id = t.id
  WHERE s.token = p_token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Equipe não reconhecida';
  END IF;

  SELECT * INTO v_session FROM public.quiz_sessions WHERE id = v_team.session_id;
  IF v_session.status <> 'in_progress' THEN
    RAISE EXCEPTION 'A sessão não está em andamento';
  END IF;
  IF v_session.current_question_id IS DISTINCT FROM p_question_id THEN
    RAISE EXCEPTION 'Esta não é a pergunta atual';
  END IF;
  -- (removido) bloqueio por "question_revealed": o anfitrião pode revelar
  -- cedo e deixar a turma continuar respondendo até avançar de pergunta.

  SELECT * INTO v_question FROM public.quiz_questions WHERE id = p_question_id;

  -- respeita o tempo da pergunta (limite + ajuste do anfitrião, com 2s de folga
  -- para latência de rede)
  IF v_question.time_limit_seconds IS NOT NULL AND v_session.question_started_at IS NOT NULL THEN
    v_deadline := v_session.question_started_at
                  + make_interval(secs => v_question.time_limit_seconds + v_session.time_adjustment_seconds + 2);
    IF now() > v_deadline THEN
      RAISE EXCEPTION 'Tempo esgotado para esta pergunta';
    END IF;
  END IF;

  SELECT array_agg(id ORDER BY id) INTO v_correct
  FROM public.quiz_options WHERE question_id = p_question_id AND is_correct;

  SELECT array_agg(DISTINCT x ORDER BY x) INTO v_chosen
  FROM unnest(coalesce(p_option_ids, '{}')) AS x;
  v_chosen := coalesce(v_chosen, '{}');

  IF v_question.kind IN ('single', 'true_false', 'multiple') THEN
    v_ok := v_chosen = coalesce(v_correct, '{}') AND array_length(v_chosen, 1) IS NOT NULL;
    IF v_ok THEN v_points := v_question.points; END IF;

  ELSIF v_question.kind = 'two_categories' THEN
    SELECT count(*) INTO v_total FROM public.quiz_options WHERE question_id = p_question_id;
    SELECT count(*) INTO v_hits
    FROM public.quiz_options o
    WHERE o.question_id = p_question_id
      AND o.category IS NOT NULL
      AND coalesce(p_assignments ->> o.id::TEXT, '') = o.category;
    IF v_total > 0 THEN
      v_points := round(v_question.points::NUMERIC * v_hits / v_total);
      v_ok := v_hits = v_total;
    END IF;

  ELSIF v_question.kind = 'text' THEN
    v_ok := EXISTS (
      SELECT 1 FROM public.quiz_options o, jsonb_each_text(o.label) AS l(k, v)
      WHERE o.question_id = p_question_id AND o.is_correct
        AND lower(btrim(v)) = lower(btrim(coalesce(p_text, '')))
        AND btrim(coalesce(p_text, '')) <> ''
    );
    IF v_ok THEN v_points := v_question.points; END IF;
  END IF;

  INSERT INTO public.quiz_answers
    (session_id, question_id, team_id, option_ids, assignments, text_answer, is_correct, points_awarded)
  VALUES
    (v_session.id, p_question_id, v_team.id, v_chosen, p_assignments, p_text, v_ok, v_points)
  ON CONFLICT (question_id, team_id) DO NOTHING;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', true, 'already_answered', true);
  END IF;

  UPDATE public.quiz_teams SET score = score + v_points WHERE id = v_team.id;

  RETURN jsonb_build_object('ok', true, 'already_answered', false);
END $$;
