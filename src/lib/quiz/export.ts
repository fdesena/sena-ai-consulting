import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { getTemplateWithQuestions } from "./db";
import { pickLocale, type Locale } from "./types";

const db = supabase as any;

type RawTeam = { id: string; name: string; emoji: string; score: number };
type RawAnswer = {
  question_id: string;
  team_id: string;
  option_ids: string[];
  assignments: Record<string, "a" | "b"> | null;
  text_answer: string | null;
  is_correct: boolean;
  points_awarded: number;
  answered_at: string;
};

/**
 * Monta e baixa um .xlsx com o placar final e o detalhe de cada resposta de
 * uma sessão já encerrada (ou em andamento) — pra o anfitrião revisar depois
 * quem respondeu o quê, sem precisar abrir o painel ao vivo de novo.
 */
export async function exportSessionResultsXLSX(
  sessionId: string,
  sessionLabel: string,
  templateId: string,
  locale: Locale = "pt",
) {
  const [{ template, questions }, teamsRes, answersRes] = await Promise.all([
    getTemplateWithQuestions(templateId),
    db
      .from("quiz_teams")
      .select("id,name,emoji,score")
      .eq("session_id", sessionId)
      .order("score", { ascending: false }),
    db
      .from("quiz_answers")
      .select(
        "question_id,team_id,option_ids,assignments,text_answer,is_correct,points_awarded,answered_at",
      )
      .eq("session_id", sessionId),
  ]);
  if (teamsRes.error) throw teamsRes.error;
  if (answersRes.error) throw answersRes.error;

  const teams: RawTeam[] = teamsRes.data ?? [];
  const answers: RawAnswer[] = answersRes.data ?? [];
  const teamById = new Map(teams.map((t) => [t.id, t]));

  const placar = teams.map((t, i) => ({
    Posição: i + 1,
    Equipe: `${t.emoji} ${t.name}`,
    Pontuação: t.score,
  }));

  const respostas = questions.flatMap((q) => {
    const optionLabel = (id: string) =>
      pickLocale(q.options?.find((o) => o.id === id)?.label, locale) || id;

    return answers
      .filter((a) => a.question_id === q.id)
      .map((a) => {
        const time = teamById.get(a.team_id);
        let respostaTexto = "";
        if (q.kind === "text") {
          respostaTexto = a.text_answer ?? "";
        } else if (q.kind === "two_categories") {
          respostaTexto = Object.entries(a.assignments ?? {})
            .map(([optId, cat]) => `${optionLabel(optId)} → ${cat.toUpperCase()}`)
            .join("; ");
        } else {
          respostaTexto = (a.option_ids ?? []).map(optionLabel).join("; ");
        }
        return {
          Pergunta: pickLocale(q.prompt, locale),
          Equipe: time ? `${time.emoji} ${time.name}` : "(equipe removida)",
          Resposta: respostaTexto,
          Correta:
            q.kind === "text" ||
            q.kind === "single" ||
            q.kind === "true_false" ||
            q.kind === "multiple" ||
            q.kind === "two_categories"
              ? a.is_correct
                ? "Sim"
                : "Não"
              : "",
          Pontos: a.points_awarded,
          "Respondido em": new Date(a.answered_at).toLocaleString("pt-BR"),
        };
      });
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(placar), "Placar");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(respostas), "Respostas");

  const nomeTemplate = pickLocale(template.title, locale) || "quiz";
  const arquivo = `${nomeTemplate} — ${sessionLabel}`.replace(/[\\/:*?"<>|]/g, "-");
  XLSX.writeFile(wb, `${arquivo}.xlsx`);
}
