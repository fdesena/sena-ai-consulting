import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Eye,
  Loader2,
  Maximize,
  Minimize,
  Minus,
  Plus,
  Trophy,
  Users,
} from "lucide-react";
import {
  getTemplateWithQuestions,
  hostAdjustTime,
  hostCompleteSession,
  hostGetSession,
  hostRevealQuestion,
  hostStartQuestion,
} from "@/lib/quiz/db";
import { exportSessionResultsXLSX } from "@/lib/quiz/export";
import { useQuizState } from "@/lib/quiz/useQuizState";
import { pickLocale, type QuizQuestion, type QuizSessionRow } from "@/lib/quiz/types";
import { QuizHistogram } from "@/components/quiz/QuizHistogram";

export const Route = createFileRoute("/_authenticated/painel/quiz/sessao/$sessionId")({
  component: HostSessionPage,
});

function HostSessionPage() {
  const { sessionId } = useParams({ from: "/_authenticated/painel/quiz/sessao/$sessionId" });
  const [session, setSession] = useState<QuizSessionRow | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const { state, reload } = useQuizState(sessionId);

  useEffect(() => {
    function onFsChange() {
      if (!document.fullscreenElement) setPresenting(false);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

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

  const joinUrl =
    typeof window !== "undefined" ? `${window.location.origin}/quiz?pin=${session?.pin ?? ""}` : "";

  const currentIndex = useMemo(
    () => questions.findIndex((q) => q.id === state?.session.current_question_id),
    [questions, state?.session.current_question_id],
  );
  const currentQuestion = currentIndex >= 0 ? questions[currentIndex] : null;
  const isLast = currentIndex === questions.length - 1;
  const revealed = !!state?.session.question_revealed;
  const status = state?.session.status ?? session?.status ?? "lobby";

  useEffect(() => {
    if (status !== "in_progress" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [status]);

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

  async function anterior() {
    if (currentIndex <= 0) return;
    setBusy(true);
    try {
      await hostStartQuestion(sessionId, questions[currentIndex - 1].id);
      await reload();
    } catch (e: any) {
      toast.error("Erro ao voltar", { description: e.message });
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

  async function togglePresent() {
    if (presenting) {
      setPresenting(false);
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // ignora — só sai do modo apresentação mesmo sem fullscreen nativo
        }
      }
      return;
    }
    setPresenting(true);
    try {
      await stageRef.current?.requestFullscreen();
    } catch {
      // sem permissão/API de fullscreen: segue só com o layout de apresentação
    }
  }

  async function exportar(label: string) {
    if (!session) return;
    setExporting(true);
    try {
      await exportSessionResultsXLSX(sessionId, label, session.template_id);
    } catch (e: any) {
      toast.error("Erro ao exportar", { description: e.message });
    } finally {
      setExporting(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (!session) return <p className="text-sm text-destructive">Sessão não encontrada.</p>;

  return (
    <div
      ref={stageRef}
      className={
        presenting
          ? "fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#141310] text-white"
          : "mx-auto max-w-4xl"
      }
    >
      <Toaster />
      {!presenting && (
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
      )}

      {status === "lobby" && !presenting && (
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
            disabled={busy || !questions.length || !state?.teams.length}
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

      {status === "in_progress" && currentQuestion && presenting && (
        <PresentationView
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          question={currentQuestion}
          answeredCount={state?.answered_count ?? 0}
          teamCount={state?.teams.length ?? 0}
          distribution={state?.distribution}
          revealed={revealed}
          busy={busy}
          isLast={isLast}
          canGoBack={currentIndex > 0}
          onAnterior={anterior}
          onRevelar={revelar}
          onProxima={proxima}
          onExit={togglePresent}
        />
      )}

      {status === "in_progress" && currentQuestion && !presenting && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Pergunta {currentIndex + 1} de {questions.length}
            </span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {state?.answered_count ?? 0}/{state?.teams.length ?? 0} responderam
              </span>
              <button
                onClick={togglePresent}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 hover:border-bronze hover:text-bronze"
              >
                <Maximize className="h-3.5 w-3.5" />
                Modo apresentação
              </button>
            </div>
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
                      <span className="font-mono text-xs text-muted-foreground">
                        {votes} voto(s)
                      </span>
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
            <button
              onClick={anterior}
              disabled={busy || currentIndex <= 0}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium hover:border-foreground/40 disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </button>
            {currentQuestion.time_limit_seconds && !revealed && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm">
                <button
                  onClick={() => ajustarTempo(-10)}
                  className="grid h-6 w-6 place-items-center rounded-full hover:bg-muted"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                Tempo
                <button
                  onClick={() => ajustarTempo(10)}
                  className="grid h-6 w-6 place-items-center rounded-full hover:bg-muted"
                >
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

      {(status === "completed" || status === "revealed") && !presenting && (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <Trophy className="mx-auto h-10 w-10 text-bronze" />
          <h2 className="mt-3 text-xl font-semibold">Quiz encerrado</h2>
          <button
            onClick={() => exportar(new Date(session.created_at).toLocaleDateString("pt-BR"))}
            disabled={exporting}
            className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-bronze hover:text-bronze disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Baixar respostas (.xlsx)
          </button>
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

/**
 * Telão em tela cheia: pergunta + opções em cima, histograma de votos ao
 * vivo embaixo. Controles do anfitrião ficam numa barra fixa no rodapé.
 */
function PresentationView({
  currentIndex,
  totalQuestions,
  question,
  answeredCount,
  teamCount,
  distribution,
  revealed,
  busy,
  isLast,
  canGoBack,
  onAnterior,
  onRevelar,
  onProxima,
  onExit,
}: {
  currentIndex: number;
  totalQuestions: number;
  question: QuizQuestion;
  answeredCount: number;
  teamCount: number;
  distribution: Record<string, number> | null | undefined;
  revealed: boolean;
  busy: boolean;
  isLast: boolean;
  canGoBack: boolean;
  onAnterior: () => void;
  onRevelar: () => void;
  onProxima: () => void;
  onExit: () => void;
}) {
  const LETTERS = ["A", "B", "C", "D", "E", "F"];
  const options = question.options ?? [];
  const votingKinds: QuizQuestion["kind"][] = ["single", "true_false", "multiple", "survey"];
  const canChart = votingKinds.includes(question.kind) && options.length > 0;

  return (
    <div className="flex min-h-full flex-1 flex-col px-6 pb-24 pt-6 sm:px-10">
      <div className="flex items-center justify-between text-sm text-white/60">
        <span>
          Pergunta {currentIndex + 1} de {totalQuestions}
        </span>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {answeredCount}/{teamCount} responderam
          </span>
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 hover:border-white/50"
          >
            <Minimize className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-2xl font-semibold sm:text-4xl">{pickLocale(question.prompt, "pt")}</p>

        <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
          {options.map((o, i) => {
            const correct = revealed && o.is_correct;
            return (
              <div
                key={o.id}
                className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-left text-base sm:text-lg ${
                  correct ? "border-emerald-500 bg-emerald-500/10" : "border-white/15 bg-white/5"
                }`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 font-mono text-sm font-bold">
                  {LETTERS[i] ?? i + 1}
                </span>
                <span className="flex-1">{pickLocale(o.label, "pt")}</span>
                {correct && <span className="text-emerald-400">✓</span>}
              </div>
            );
          })}
        </div>

        {revealed && pickLocale(question.explanation, "pt") && (
          <p className="mx-auto mt-6 max-w-xl text-sm text-white/60">
            {pickLocale(question.explanation, "pt")}
          </p>
        )}
      </div>

      <div className="mt-10 flex flex-1 flex-col items-center justify-center">
        {canChart ? (
          <QuizHistogram options={options} distribution={distribution} revealed={revealed} />
        ) : (
          <p className="font-mono text-sm text-white/50">
            {answeredCount}/{teamCount} respostas recebidas
          </p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 flex items-center justify-center gap-3 bg-gradient-to-t from-[#141310] via-[#141310]/95 to-transparent px-6 py-6">
        <button
          onClick={onAnterior}
          disabled={busy || !canGoBack}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-medium hover:border-white/50 disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </button>
        {!revealed ? (
          <button
            onClick={onRevelar}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-bronze px-7 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            <Eye className="h-4 w-4" />
            Revelar resposta
          </button>
        ) : (
          <button
            onClick={onProxima}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isLast ? "Encerrar quiz" : "Próxima pergunta"}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
