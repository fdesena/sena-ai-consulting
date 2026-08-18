import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, ArrowRight, Eye, Loader2, Minus, Plus, Trophy, Users } from "lucide-react";
import {
  getTemplateWithQuestions,
  hostAdjustTime,
  hostCompleteSession,
  hostGetSession,
  hostRevealQuestion,
  hostStartQuestion,
} from "@/lib/quiz/db";
import { useQuizState } from "@/lib/quiz/useQuizState";
import { pickLocale, type QuizQuestion, type QuizSessionRow } from "@/lib/quiz/types";

export const Route = createFileRoute("/_authenticated/painel/quiz/sessao/$sessionId")({
  component: HostSessionPage,
});

function HostSessionPage() {
  const { sessionId } = useParams({ from: "/_authenticated/painel/quiz/sessao/$sessionId" });
  const [session, setSession] = useState<QuizSessionRow | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const { state, reload } = useQuizState(sessionId);

  useEffect(() => {
    (async () => {
      try {
        const s = await hostGetSession(sessionId);
        setSession(s);
        const { questions } = await getTemplateWithQuestions(s.template_id);
        setQuestions(questions);
      } catch (e: any) {
        toast.error("Erro ao carregar a sessão", { description: e.message });
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/quiz?pin=${session?.pin ?? ""}` : "";

  const currentIndex = useMemo(
    () => questions.findIndex((q) => q.id === state?.session.current_question_id),
    [questions, state?.session.current_question_id],
  );
  const currentQuestion = currentIndex >= 0 ? questions[currentIndex] : null;
  const isLast = currentIndex === questions.length - 1;
  const revealed = !!state?.session.question_revealed;
  const status = state?.session.status ?? session?.status ?? "lobby";

  async function iniciarPrimeira() {
    if (!questions.length) return;
    setBusy(true);
    try {
      await hostStartQuestion(sessionId, questions[0].id);
      await reload();
    } catch (e: any) {
      toast.error("Erro ao iniciar", { description: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function revelar() {
    setBusy(true);
    try {
      await hostRevealQuestion(sessionId);
      await reload();
    } catch (e: any) {
      toast.error("Erro ao revelar", { description: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function proxima() {
    setBusy(true);
    try {
      const next = questions[currentIndex + 1];
      if (next) {
        await hostStartQuestion(sessionId, next.id);
      } else {
        await hostCompleteSession(sessionId);
      }
      await reload();
    } catch (e: any) {
      toast.error("Erro ao avançar", { description: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function ajustarTempo(delta: number) {
    try {
      await hostAdjustTime(sessionId, delta);
      await reload();
    } catch (e: any) {
      toast.error("Erro ao ajustar o tempo", { description: e.message });
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (!session) return <p className="text-sm text-destructive">Sessão não encontrada.</p>;

  return (
    <div className="mx-auto max-w-4xl">
      <Toaster />
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/painel/quiz"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-bronze"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <span className="font-mono text-xs text-muted-foreground">
          PIN <strong className="text-foreground">{session.pin}</strong>
        </span>
      </div>

      {status === "lobby" && (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Entrar em
          </p>
          <p className="mb-4 text-sm text-muted-foreground">senaconsulting.app/quiz</p>
          <p className="mb-6 font-mono text-6xl font-bold tracking-[0.15em] text-primary">
            {session.pin}
          </p>
          {joinUrl && (
            <div className="mx-auto mb-6 grid h-40 w-40 place-items-center rounded-2xl border border-border bg-white p-3">
              <QRCodeSVG value={joinUrl} size={136} />
            </div>
          )}

          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {state?.teams.length ?? 0} equipe(s) na sala
          </div>
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {(state?.teams ?? []).map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm"
              >
                {t.emoji} {t.name}
              </span>
            ))}
          </div>

          <button
            onClick={iniciarPrimeira}
            disabled={busy || !questions.length || !(state?.teams.length)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Iniciar quiz
          </button>
          {!questions.length && (
            <p className="mt-3 text-xs text-destructive">Este template não tem perguntas.</p>
          )}
        </div>
      )}

      {status === "in_progress" && currentQuestion && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Pergunta {currentIndex + 1} de {questions.length}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {state?.answered_count ?? 0}/{state?.teams.length ?? 0} responderam
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-8 text-center">
            <p className="text-xl font-semibold">{pickLocale(currentQuestion.prompt, "pt")}</p>

            <div className="mx-auto mt-6 grid max-w-xl gap-2.5 sm:grid-cols-2">
              {(currentQuestion.options ?? []).map((o, i) => {
                const votes = state?.distribution?.[o.id] ?? 0;
                const showCorrectness = revealed;
                return (
                  <div
                    key={o.id}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                      showCorrectness && o.is_correct
                        ? "border-secondary bg-secondary/10"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{pickLocale(o.label, "pt")}</span>
                      {showCorrectness && o.is_correct && <span className="text-secondary">✓</span>}
                    </div>
                    {revealed && (
                      <span className="font-mono text-xs text-muted-foreground">{votes} voto(s)</span>
                    )}
                  </div>
                );
              })}
            </div>

            {revealed && pickLocale(currentQuestion.explanation, "pt") && (
              <p className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground">
                {pickLocale(currentQuestion.explanation, "pt")}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {currentQuestion.time_limit_seconds && !revealed && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm">
                <button onClick={() => ajustarTempo(-10)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-muted">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                Tempo
                <button onClick={() => ajustarTempo(10)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-muted">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {!revealed ? (
              <button
                onClick={revelar}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-bronze px-6 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                <Eye className="h-4 w-4" />
                Revelar resposta
              </button>
            ) : (
              <button
                onClick={proxima}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {isLast ? "Encerrar quiz" : "Próxima pergunta"}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Placar
            </p>
            <div className="flex flex-wrap gap-2">
              {[...(state?.teams ?? [])]
                .sort((a, b) => b.score - a.score)
                .map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm"
                  >
                    {t.emoji} {t.name} · <span className="font-mono">{t.score}</span>
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      {(status === "completed" || status === "revealed") && (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <Trophy className="mx-auto h-10 w-10 text-bronze" />
          <h2 className="mt-3 text-xl font-semibold">Quiz encerrado</h2>
          <div className="mx-auto mt-6 max-w-sm space-y-2 text-left">
            {[...(state?.teams ?? [])]
              .sort((a, b) => b.score - a.score)
              .map((t, i) => (
                <div
                  key={t.id}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 ${
                    i === 0 ? "bg-bronze/15" : "bg-muted/50"
                  }`}
                >
                  <span className="w-5 text-center font-mono text-sm">{i + 1}</span>
                  <span>{t.emoji}</span>
                  <span className="flex-1 truncate">{t.name}</span>
                  <span className="font-mono text-sm">{t.score}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
