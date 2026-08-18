import { supabase } from "@/integrations/supabase/client";
import type {
  QuizOption,
  QuizQuestion,
  QuizSessionRow,
  QuizStatePayload,
  QuizTemplate,
} from "./types";

/**
 * As tabelas/RPCs `quiz_*` (migration 20260817000000) não estão no
 * `Database` gerado — supabase-js exige o tipo pra inferir `.from()`/`.rpc()`,
 * então usamos `any` só neste arquivo e devolvemos os tipos fortes de
 * `./types` pro resto do app.
 */
const db = supabase as any;

export async function listMyTemplates(): Promise<QuizTemplate[]> {
  const { data, error } = await db
    .from("quiz_templates")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createTemplate(): Promise<QuizTemplate> {
  const { data: u } = await supabase.auth.getUser();
  const { data, error } = await db
    .from("quiz_templates")
    .insert({ owner_id: u.user?.id })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateTemplate(
  id: string,
  patch: Partial<Pick<QuizTemplate, "title" | "description">>,
): Promise<void> {
  const { error } = await db
    .from("quiz_templates")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await db.from("quiz_templates").delete().eq("id", id);
  if (error) throw error;
}

export async function getTemplateWithQuestions(
  id: string,
): Promise<{ template: QuizTemplate; questions: QuizQuestion[] }> {
  const [{ data: template, error: e1 }, { data: questions, error: e2 }] = await Promise.all([
    db.from("quiz_templates").select("*").eq("id", id).single(),
    db
      .from("quiz_questions")
      .select("*, quiz_options(*)")
      .eq("template_id", id)
      .order("position"),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  const withOptions: QuizQuestion[] = (questions ?? []).map((q: any) => ({
    ...q,
    options: (q.quiz_options ?? []).sort((a: QuizOption, b: QuizOption) => a.position - b.position),
  }));
  return { template, questions: withOptions };
}

export async function createQuestion(
  templateId: string,
  position: number,
): Promise<QuizQuestion> {
  const { data, error } = await db
    .from("quiz_questions")
    .insert({ template_id: templateId, position, kind: "single" })
    .select("*")
    .single();
  if (error) throw error;
  return { ...data, options: [] };
}

export async function updateQuestion(
  id: string,
  patch: Partial<
    Pick<
      QuizQuestion,
      "kind" | "prompt" | "explanation" | "image_url" | "points" | "time_limit_seconds" | "category_labels" | "position"
    >
  >,
): Promise<void> {
  const { error } = await db
    .from("quiz_questions")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await db.from("quiz_questions").delete().eq("id", id);
  if (error) throw error;
}

export async function createOption(
  questionId: string,
  position: number,
): Promise<QuizOption> {
  const { data, error } = await db
    .from("quiz_options")
    .insert({ question_id: questionId, position })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateOption(
  id: string,
  patch: Partial<Pick<QuizOption, "label" | "is_correct" | "category" | "position">>,
): Promise<void> {
  const { error } = await db.from("quiz_options").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteOption(id: string): Promise<void> {
  const { error } = await db.from("quiz_options").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------- sessão ao vivo ---------------- */

export async function createSession(templateId: string, locale: string): Promise<QuizSessionRow> {
  const { data, error } = await db.rpc("quiz_create_session", {
    p_template_id: templateId,
    p_locale: locale,
  });
  if (error) throw error;
  return data;
}

export async function joinSession(
  pin: string,
  name: string,
  emoji: string,
): Promise<{ session_id: string; team_id: string; token: string; pin: string }> {
  const { data, error } = await db.rpc("quiz_join", { p_pin: pin, p_name: name, p_emoji: emoji });
  if (error) throw error;
  return data;
}

export async function fetchQuizState(
  sessionId: string,
  token?: string | null,
): Promise<QuizStatePayload> {
  const { data, error } = await db.rpc("quiz_state", {
    p_session_id: sessionId,
    p_token: token ?? null,
  });
  if (error) throw error;
  return data;
}

export async function submitAnswer(params: {
  token: string;
  questionId: string;
  optionIds?: string[];
  assignments?: Record<string, "a" | "b">;
  text?: string;
}): Promise<{ ok: boolean; already_answered: boolean }> {
  const { data, error } = await db.rpc("quiz_answer", {
    p_token: params.token,
    p_question_id: params.questionId,
    p_option_ids: params.optionIds ?? [],
    p_assignments: params.assignments ?? null,
    p_text: params.text ?? null,
  });
  if (error) throw error;
  return data;
}

export async function hostGetSession(sessionId: string): Promise<QuizSessionRow> {
  const { data, error } = await db.from("quiz_sessions").select("*").eq("id", sessionId).single();
  if (error) throw error;
  return data;
}

export async function hostListSessions(templateId?: string): Promise<QuizSessionRow[]> {
  let q = db.from("quiz_sessions").select("*").order("created_at", { ascending: false });
  if (templateId) q = q.eq("template_id", templateId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function hostStartQuestion(sessionId: string, questionId: string): Promise<void> {
  const { error } = await db
    .from("quiz_sessions")
    .update({
      status: "in_progress",
      started_at: new Date().toISOString(),
      current_question_id: questionId,
      question_started_at: new Date().toISOString(),
      question_revealed: false,
      time_adjustment_seconds: 0,
    })
    .eq("id", sessionId);
  if (error) throw error;
}

export async function hostRevealQuestion(sessionId: string): Promise<void> {
  const { error } = await db
    .from("quiz_sessions")
    .update({ question_revealed: true })
    .eq("id", sessionId);
  if (error) throw error;
}

export async function hostAdjustTime(sessionId: string, deltaSeconds: number): Promise<void> {
  const current = await hostGetSession(sessionId);
  const { error } = await db
    .from("quiz_sessions")
    .update({ time_adjustment_seconds: current.time_adjustment_seconds + deltaSeconds })
    .eq("id", sessionId);
  if (error) throw error;
}

export async function hostCompleteSession(sessionId: string): Promise<void> {
  const { error } = await db
    .from("quiz_sessions")
    .update({ status: "completed", completed_at: new Date().toISOString(), question_revealed: true })
    .eq("id", sessionId);
  if (error) throw error;
}

/* subscreve mudanças de sessão + equipes + respostas para uma sessão */
export function subscribeToSession(
  sessionId: string,
  onChange: () => void,
): () => void {
  const channel = supabase
    .channel(`quiz_session_${sessionId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "quiz_sessions", filter: `id=eq.${sessionId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "quiz_teams", filter: `session_id=eq.${sessionId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "quiz_answers", filter: `session_id=eq.${sessionId}` },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
