-- =========================================================
-- Quiz multiplayer em tempo real (estilo Kahoot)
--
-- Modelo de acesso:
--   * Anfitrião  = usuário autenticado (dono do template/sessão) — acessa as
--     tabelas direto, com RLS por owner/host.
--   * Participante = anônimo, SEM login. Nunca fala com as tabelas de conteúdo:
--     entra e joga só através das RPCs SECURITY DEFINER daqui, que devolvem
--     payload sanitizado. `is_correct` só sai depois que a pergunta/sessão é
--     revelada.
--   * O que o anônimo pode ler direto (para o Realtime funcionar) é limitado por
--     GRANT em nível de coluna: sessão e equipes, nunca respostas.
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE public.quiz_question_kind AS ENUM
    ('single', 'multiple', 'true_false', 'two_categories', 'text');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.quiz_session_status AS ENUM
    ('lobby', 'in_progress', 'completed', 'revealed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Texto trilíngue: sempre jsonb {"pt": "...", "en": "...", "es": "..."}
CREATE OR REPLACE FUNCTION public.quiz_empty_i18n()
RETURNS JSONB LANGUAGE SQL IMMUTABLE AS $$
  SELECT '{"pt":"","en":"","es":""}'::jsonb;
$$;

-- ---------------------------------------------------------
-- Conteúdo
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        JSONB NOT NULL DEFAULT public.quiz_empty_i18n(),
  description  JSONB NOT NULL DEFAULT public.quiz_empty_i18n(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id        UUID NOT NULL REFERENCES public.quiz_templates(id) ON DELETE CASCADE,
  position           INT NOT NULL DEFAULT 0,
  kind               public.quiz_question_kind NOT NULL DEFAULT 'single',
  prompt             JSONB NOT NULL DEFAULT public.quiz_empty_i18n(),
  explanation        JSONB NOT NULL DEFAULT public.quiz_empty_i18n(),
  image_url          TEXT,
  points             INT NOT NULL DEFAULT 1000 CHECK (points >= 0),
  time_limit_seconds INT CHECK (time_limit_seconds IS NULL OR time_limit_seconds > 0),
  -- rótulos das duas colunas em 'two_categories': {"a": {i18n}, "b": {i18n}}
  category_labels    JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quiz_questions_template_idx
  ON public.quiz_questions (template_id, position);

CREATE TABLE IF NOT EXISTS public.quiz_options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  position    INT NOT NULL DEFAULT 0,
  label       JSONB NOT NULL DEFAULT public.quiz_empty_i18n(),
  is_correct  BOOLEAN NOT NULL DEFAULT false,
  -- categoria correta quando a pergunta é de classificação
  category    TEXT CHECK (category IS NULL OR category IN ('a', 'b')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quiz_options_question_idx
  ON public.quiz_options (question_id, position);

-- ---------------------------------------------------------
-- Sessão ao vivo
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id             UUID NOT NULL REFERENCES public.quiz_templates(id) ON DELETE CASCADE,
  host_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pin                     TEXT NOT NULL UNIQUE CHECK (pin ~ '^[0-9]{6}$'),
  status                  public.quiz_session_status NOT NULL DEFAULT 'lobby',
  locale                  TEXT NOT NULL DEFAULT 'pt' CHECK (locale IN ('pt', 'en', 'es')),
  current_question_id     UUID REFERENCES public.quiz_questions(id) ON DELETE SET NULL,
  question_started_at     TIMESTAMPTZ,
  question_revealed       BOOLEAN NOT NULL DEFAULT false,
  -- segundos que o anfitrião adicionou (ou tirou) da pergunta atual
  time_adjustment_seconds INT NOT NULL DEFAULT 0,
  started_at              TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quiz_sessions_host_idx ON public.quiz_sessions (host_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.quiz_teams (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  name       TEXT NOT NULL CHECK (btrim(name) <> ''),
  emoji      TEXT NOT NULL DEFAULT '🎯',
  score      INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS quiz_teams_session_name_idx
  ON public.quiz_teams (session_id, lower(btrim(name)));

-- Token da equipe fica FORA de quiz_teams: assim nem RLS nem payload do
-- Realtime têm chance de vazar a credencial de quem está jogando.
CREATE TABLE IF NOT EXISTS public.quiz_team_secrets (
  team_id UUID PRIMARY KEY REFERENCES public.quiz_teams(id) ON DELETE CASCADE,
  token   UUID NOT NULL UNIQUE DEFAULT gen_random_uuid()
);

CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_id    UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  team_id        UUID NOT NULL REFERENCES public.quiz_teams(id) ON DELETE CASCADE,
  option_ids     UUID[] NOT NULL DEFAULT '{}',
  -- {"<option_id>": "a"|"b"} nas perguntas de classificação
  assignments    JSONB,
  text_answer    TEXT,
  is_correct     BOOLEAN NOT NULL DEFAULT false,
  points_awarded INT NOT NULL DEFAULT 0,
  answered_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (question_id, team_id)
);
CREATE INDEX IF NOT EXISTS quiz_answers_session_idx ON public.quiz_answers (session_id, question_id);

-- ---------------------------------------------------------
-- Privilégios explícitos (nada de permissão herdada por acidente)
-- ---------------------------------------------------------
REVOKE ALL ON public.quiz_templates, public.quiz_questions, public.quiz_options,
              public.quiz_sessions, public.quiz_teams, public.quiz_team_secrets,
              public.quiz_answers
  FROM PUBLIC, anon, authenticated;

GRANT ALL ON public.quiz_templates, public.quiz_questions, public.quiz_options,
             public.quiz_sessions, public.quiz_teams, public.quiz_team_secrets,
             public.quiz_answers
  TO service_role;

-- Anfitrião autenticado: acesso completo, recortado por RLS logo abaixo.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_options   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_sessions  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_teams     TO authenticated;
GRANT SELECT, DELETE                 ON public.quiz_answers   TO authenticated;

-- Participante anônimo: só o que o Realtime precisa enxergar, coluna a coluna.
-- (sem quiz_questions/quiz_options/quiz_answers — is_correct nunca chega ao cliente)
GRANT SELECT (id, template_id, pin, status, locale, current_question_id,
              question_started_at, question_revealed, time_adjustment_seconds,
              started_at, completed_at, created_at)
  ON public.quiz_sessions TO anon;
GRANT SELECT (id, session_id, name, emoji, score, created_at)
  ON public.quiz_teams TO anon;

-- ---------------------------------------------------------
-- RLS
-- ---------------------------------------------------------
ALTER TABLE public.quiz_templates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_teams        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_team_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers      ENABLE ROW LEVEL SECURITY;

-- dono do template (ou admin)
CREATE OR REPLACE FUNCTION public.quiz_owns_template(p_template_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.quiz_templates t
    WHERE t.id = p_template_id
      AND (t.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  );
$$;

CREATE OR REPLACE FUNCTION public.quiz_hosts_session(p_session_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.quiz_sessions s
    WHERE s.id = p_session_id
      AND (s.host_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  );
$$;

DROP POLICY IF EXISTS "quiz_templates owner" ON public.quiz_templates;
CREATE POLICY "quiz_templates owner" ON public.quiz_templates
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "quiz_questions owner" ON public.quiz_questions;
CREATE POLICY "quiz_questions owner" ON public.quiz_questions
  FOR ALL TO authenticated
  USING (public.quiz_owns_template(template_id))
  WITH CHECK (public.quiz_owns_template(template_id));

DROP POLICY IF EXISTS "quiz_options owner" ON public.quiz_options;
CREATE POLICY "quiz_options owner" ON public.quiz_options
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.quiz_questions q
                 WHERE q.id = question_id AND public.quiz_owns_template(q.template_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.quiz_questions q
                      WHERE q.id = question_id AND public.quiz_owns_template(q.template_id)));

DROP POLICY IF EXISTS "quiz_sessions host" ON public.quiz_sessions;
CREATE POLICY "quiz_sessions host" ON public.quiz_sessions
  FOR ALL TO authenticated
  USING (host_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (host_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Qualquer um pode acompanhar a sessão (as colunas visíveis já foram limitadas
-- pelo GRANT acima).
DROP POLICY IF EXISTS "quiz_sessions public read" ON public.quiz_sessions;
CREATE POLICY "quiz_sessions public read" ON public.quiz_sessions
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "quiz_teams host" ON public.quiz_teams;
CREATE POLICY "quiz_teams host" ON public.quiz_teams
  FOR ALL TO authenticated
  USING (public.quiz_hosts_session(session_id))
  WITH CHECK (public.quiz_hosts_session(session_id));

DROP POLICY IF EXISTS "quiz_teams public read" ON public.quiz_teams;
CREATE POLICY "quiz_teams public read" ON public.quiz_teams
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "quiz_answers host" ON public.quiz_answers;
CREATE POLICY "quiz_answers host" ON public.quiz_answers
  FOR ALL TO authenticated
  USING (public.quiz_hosts_session(session_id))
  WITH CHECK (public.quiz_hosts_session(session_id));

-- quiz_team_secrets: ninguém além das funções SECURITY DEFINER (sem policy).

-- ---------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_sessions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_teams;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_answers;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.quiz_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.quiz_teams    REPLICA IDENTITY FULL;
ALTER TABLE public.quiz_answers  REPLICA IDENTITY FULL;

-- =========================================================
-- RPCs
-- Tudo que o participante anônimo faz passa por aqui.
-- =========================================================

-- Anfitrião cria a sessão (PIN de 6 dígitos, único).
CREATE OR REPLACE FUNCTION public.quiz_create_session(p_template_id UUID, p_locale TEXT DEFAULT 'pt')
RETURNS public.quiz_sessions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_pin     TEXT;
  v_session public.quiz_sessions;
  v_try     INT := 0;
BEGIN
  IF NOT public.quiz_owns_template(p_template_id) THEN
    RAISE EXCEPTION 'Sem permissão para usar este template';
  END IF;

  LOOP
    v_try := v_try + 1;
    v_pin := lpad((floor(random() * 900000) + 100000)::INT::TEXT, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.quiz_sessions WHERE pin = v_pin);
    IF v_try > 50 THEN RAISE EXCEPTION 'Não consegui gerar um PIN livre'; END IF;
  END LOOP;

  INSERT INTO public.quiz_sessions (template_id, host_id, pin, locale)
  VALUES (p_template_id, auth.uid(), v_pin, coalesce(p_locale, 'pt'))
  RETURNING * INTO v_session;

  RETURN v_session;
END $$;

-- Participante entra pelo PIN e cria a equipe.
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
    RAISE EXCEPTION 'Já existe uma equipe com esse nome nesta sessão';
  END;

  INSERT INTO public.quiz_team_secrets (team_id) VALUES (v_team_id)
  RETURNING token INTO v_token;

  RETURN jsonb_build_object(
    'session_id', v_session.id,
    'team_id',    v_team_id,
    'token',      v_token,
    'pin',        v_session.pin
  );
END $$;

-- Estado completo da sessão para uma tela (participante ou telão público).
-- `is_correct` e explicação só entram no payload depois da revelação.
CREATE OR REPLACE FUNCTION public.quiz_state(p_session_id UUID, p_token UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_session  public.quiz_sessions;
  v_question public.quiz_questions;
  v_reveal   BOOLEAN;
  v_team     public.quiz_teams;
  v_answer   public.quiz_answers;
  v_options  JSONB;
  v_count    INT;
  v_index    INT;
BEGIN
  SELECT * INTO v_session FROM public.quiz_sessions WHERE id = p_session_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sessão não encontrada';
  END IF;

  v_reveal := v_session.question_revealed OR v_session.status = 'revealed';

  SELECT count(*) INTO v_count FROM public.quiz_questions WHERE template_id = v_session.template_id;

  IF v_session.current_question_id IS NOT NULL THEN
    SELECT * INTO v_question FROM public.quiz_questions WHERE id = v_session.current_question_id;

    SELECT count(*) + 1 INTO v_index
    FROM public.quiz_questions
    WHERE template_id = v_session.template_id
      AND (position, id::TEXT) < (v_question.position, v_question.id::TEXT);

    SELECT jsonb_agg(o ORDER BY o_pos) INTO v_options
    FROM (
      SELECT
        opt.position AS o_pos,
        jsonb_strip_nulls(jsonb_build_object(
          'id',         opt.id,
          'position',   opt.position,
          'label',      opt.label,
          'is_correct', CASE WHEN v_reveal THEN opt.is_correct ELSE NULL END,
          'category',   CASE WHEN v_reveal THEN opt.category   ELSE NULL END
        )) AS o
      FROM public.quiz_options opt
      WHERE opt.question_id = v_question.id
    ) s;
  END IF;

  IF p_token IS NOT NULL THEN
    SELECT t.* INTO v_team
    FROM public.quiz_teams t
    JOIN public.quiz_team_secrets s ON s.team_id = t.id
    WHERE s.token = p_token AND t.session_id = p_session_id;

    IF FOUND AND v_session.current_question_id IS NOT NULL THEN
      SELECT * INTO v_answer FROM public.quiz_answers
      WHERE team_id = v_team.id AND question_id = v_session.current_question_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'session', jsonb_build_object(
      'id',                      v_session.id,
      'pin',                     v_session.pin,
      'status',                  v_session.status,
      'locale',                  v_session.locale,
      'question_revealed',       v_session.question_revealed,
      'question_started_at',     v_session.question_started_at,
      'time_adjustment_seconds', v_session.time_adjustment_seconds,
      'current_question_id',     v_session.current_question_id,
      'question_index',          v_index,
      'question_count',          v_count
    ),
    'question', CASE WHEN v_session.current_question_id IS NULL THEN NULL ELSE
      jsonb_build_object(
        'id',                 v_question.id,
        'kind',              v_question.kind,
        'prompt',            v_question.prompt,
        'image_url',         v_question.image_url,
        'points',            v_question.points,
        'time_limit_seconds', v_question.time_limit_seconds,
        'category_labels',   v_question.category_labels,
        'options',           coalesce(v_options, '[]'::jsonb),
        'explanation',       CASE WHEN v_reveal THEN v_question.explanation ELSE NULL END
      ) END,
    'teams', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
               'id', t.id, 'name', t.name, 'emoji', t.emoji, 'score', t.score)
             ORDER BY t.score DESC, t.created_at)
      FROM public.quiz_teams t WHERE t.session_id = p_session_id), '[]'::jsonb),
    'answered_count', coalesce((
      SELECT count(*) FROM public.quiz_answers a
      WHERE a.session_id = p_session_id AND a.question_id = v_session.current_question_id), 0),
    'distribution', CASE WHEN v_reveal AND v_session.current_question_id IS NOT NULL THEN (
      SELECT coalesce(jsonb_object_agg(x.opt, x.n), '{}'::jsonb) FROM (
        SELECT unnest(a.option_ids)::TEXT AS opt, count(*) AS n
        FROM public.quiz_answers a
        WHERE a.session_id = p_session_id AND a.question_id = v_session.current_question_id
        GROUP BY 1) x) ELSE NULL END,
    'me', CASE WHEN v_team.id IS NULL THEN NULL ELSE jsonb_build_object(
      'team_id', v_team.id,
      'name',    v_team.name,
      'emoji',   v_team.emoji,
      'score',   v_team.score,
      'answered', v_answer.id IS NOT NULL,
      'answer', CASE WHEN v_answer.id IS NULL THEN NULL ELSE jsonb_build_object(
        'option_ids',     v_answer.option_ids,
        'assignments',    v_answer.assignments,
        'text_answer',    v_answer.text_answer,
        'is_correct',     CASE WHEN v_reveal THEN v_answer.is_correct ELSE NULL END,
        'points_awarded', CASE WHEN v_reveal THEN v_answer.points_awarded ELSE NULL END
      ) END) END
  );
END $$;

-- Participante envia a resposta; a correção e a pontuação acontecem aqui,
-- no servidor, nunca no cliente.
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
  IF v_session.question_revealed THEN
    RAISE EXCEPTION 'A resposta desta pergunta já foi revelada';
  END IF;

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

REVOKE ALL ON FUNCTION public.quiz_create_session(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.quiz_create_session(UUID, TEXT) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.quiz_join(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.quiz_join(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.quiz_state(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.quiz_state(UUID, UUID) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.quiz_answer(UUID, UUID, UUID[], JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.quiz_answer(UUID, UUID, UUID[], JSONB, TEXT) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.quiz_owns_template(UUID)  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.quiz_owns_template(UUID)  TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.quiz_hosts_session(UUID)  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.quiz_hosts_session(UUID) TO authenticated, service_role;
