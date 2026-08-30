/**
 * Tipos do Quiz ao Vivo — espelham o schema em
 * supabase/migrations/20260817000000_quiz_live.sql. As tabelas `quiz_*` não
 * estão no `Database` gerado (types.ts é gerado só a partir de projetos
 * linkados); por isso o acesso via supabase-js usa `any` em db.ts e a
 * tipagem forte vive aqui.
 */

export type Locale = "pt" | "en" | "es";
export type I18nText = Record<Locale, string>;

export function emptyI18n(): I18nText {
  return { pt: "", en: "", es: "" };
}

export function pickLocale(text: I18nText | null | undefined, locale: Locale): string {
  if (!text) return "";
  return text[locale] || text.pt || text.en || text.es || "";
}

export type QuestionKind =
  | "single"
  | "multiple"
  | "true_false"
  | "two_categories"
  | "text"
  | "survey";

export const QUESTION_KIND_LABEL: Record<QuestionKind, string> = {
  single: "Escolha única",
  multiple: "Múltipla escolha",
  true_false: "Verdadeiro ou falso",
  two_categories: "Classificação em 2 categorias",
  text: "Texto livre",
  survey: "Estatística (sem certo ou errado)",
};

export type QuizTemplate = {
  id: string;
  owner_id: string;
  title: I18nText;
  description: I18nText;
  created_at: string;
  updated_at: string;
};

export type QuizOption = {
  id: string;
  question_id: string;
  position: number;
  label: I18nText;
  is_correct: boolean;
  category: "a" | "b" | null;
};

export type QuizQuestion = {
  id: string;
  template_id: string;
  position: number;
  kind: QuestionKind;
  prompt: I18nText;
  explanation: I18nText;
  /** Agrupa perguntas de autoavaliação (1-5) numa dimensão pra tirar média — ex.: "Prompting e uso prático". */
  dimension: string | null;
  image_url: string | null;
  points: number;
  time_limit_seconds: number | null;
  category_labels: { a: I18nText; b: I18nText } | null;
  options?: QuizOption[];
};

export type SessionStatus = "lobby" | "in_progress" | "completed" | "revealed";

export type QuizSessionRow = {
  id: string;
  template_id: string;
  host_id: string;
  pin: string;
  status: SessionStatus;
  locale: Locale;
  current_question_id: string | null;
  question_started_at: string | null;
  question_revealed: boolean;
  time_adjustment_seconds: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export type QuizTeamRow = {
  id: string;
  session_id: string;
  name: string;
  emoji: string;
  score: number;
  created_at: string;
};

/** Payload devolvido por `quiz_state(session_id, token)`. */
export type QuizStatePayload = {
  session: {
    id: string;
    pin: string;
    status: SessionStatus;
    locale: Locale;
    question_revealed: boolean;
    question_started_at: string | null;
    time_adjustment_seconds: number;
    current_question_id: string | null;
    question_index: number | null;
    question_count: number;
  };
  question: {
    id: string;
    kind: QuestionKind;
    prompt: I18nText;
    image_url: string | null;
    points: number;
    time_limit_seconds: number | null;
    category_labels: { a: I18nText; b: I18nText } | null;
    options: {
      id: string;
      position: number;
      label: I18nText;
      is_correct: boolean | null;
      category: "a" | "b" | null;
    }[];
    explanation: I18nText | null;
  } | null;
  teams: { id: string; name: string; emoji: string; score: number }[];
  answered_count: number;
  distribution: Record<string, number> | null;
  me: {
    team_id: string;
    name: string;
    emoji: string;
    score: number;
    answered: boolean;
    answer: {
      option_ids: string[];
      assignments: Record<string, "a" | "b"> | null;
      text_answer: string | null;
      is_correct: boolean | null;
      points_awarded: number | null;
    } | null;
  } | null;
};

export const TEAM_EMOJIS = ["🎯", "🚀", "🔥", "⚡", "🐯", "🦊", "🐼", "🦄", "🌵", "🍕", "🎮", "🏆"];
