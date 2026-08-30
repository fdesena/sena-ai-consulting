import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Check, Loader2, Trophy, Clock } from "lucide-react";
import { useQuizState } from "@/lib/quiz/useQuizState";
import { submitAnswer } from "@/lib/quiz/db";
import { pickLocale, type Locale } from "@/lib/quiz/types";

export const Route = createFileRoute("/quiz/jogar/$sessionId")({
  head: () => ({ meta: [{ title: "Jogando — Quiz ao Vivo" }] }),
  component: QuizPlayPage,
});

const OPTION_COLORS = ["#c8853a", "#2d5a3d", "#a3652a", "#3f7a53"];

function useNow(intervalMs = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function QuizPlayPage() {
  const { sessionId } = useParams({ from: "/quiz/jogar/$sessionId" });
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setToken(localStorage.getItem(`quiz_token_${sessionId}`));
  }, [sessionId]);

  const { state, error } = useQuizState(sessionId, token);
  const now = useNow();

  const [selected, setSelected] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Record<string, "a" | "b">>({});
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  const questionId = state?.question?.id;
  useEffect(() => {
    setSelected([]);
    setAssignments({});
    setTexto("");
  }, [questionId]);

  if (token === undefined) return null;

  if (!token) {
    return (
      <Centered>
        <p className="text-lg font-medium">Você ainda não entrou nessa sessão.</p>
        <Link
          to="/quiz"
          className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Entrar com o PIN
        </Link>
      </Centered>
    );
  }

  if (error) {
    return (
      <Centered>
        <p className="text-destructive">{error}</p>
      </Centered>
    );
  }

  if (!state) {
    return (
      <Centered>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Centered>
    );
  }

  const locale = (state.session.locale || "pt") as Locale;
  const me = state.me;

  if (state.session.status === "completed" || state.session.status === "revealed") {
    return <Podium teams={state.teams} me={me} />;
  }

  if (state.session.status === "lobby" || !state.question) {
    return (
      <Centered dark>
        <div className="text-5xl">{me?.emoji ?? "🎯"}</div>
        <p className="mt-3 text-xl font-semibold">{me?.name}</p>
        <p className="mt-2 text-white/70">Aguardando o anfitrião iniciar a próxima pergunta…</p>
        <Loader2 className="mx-auto mt-6 h-6 w-6 animate-spin text-white/60" />
      </Centered>
    );
  }

  const q = state.question;
  const revealed = state.session.question_revealed;

  const deadline =
    q.time_limit_seconds && state.session.question_started_at
      ? new Date(state.session.question_started_at).getTime() +
        (q.time_limit_seconds + state.session.time_adjustment_seconds) * 1000
      : null;
  const secondsLeft = deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : null;
  const tempoEsgotado = secondsLeft === 0;

  async function enviar(payload: {
    optionIds?: string[];
    assignments?: Record<string, "a" | "b">;
    text?: string;
  }) {
    if (!token || !q || enviando) return;
    setEnviando(true);
    try {
      await submitAnswer({ token, questionId: q.id, ...payload });
    } catch (e: any) {
      toast.error("Não consegui enviar", { description: e.message });
    } finally {
      setEnviando(false);
    }
  }

  // O anfitrião pode revelar a pergunta cedo pra acompanhar a distribuição
  // ao vivo — quem ainda não respondeu continua podendo responder normalmente
  // até ele avançar. Só mostramos a tela de resultado pra quem já enviou.
  if (me?.answered) {
    if (revealed && q.kind === "survey") {
      // Estatística: não tem certo/errado, só confirma que a resposta contou.
      return (
        <Centered dark>
          <div className="text-5xl">📊</div>
          <p className="mt-3 text-2xl font-semibold">Resposta registrada!</p>
          {pickLocale(q.explanation ?? undefined, locale) && (
            <p className="mx-auto mt-4 max-w-sm text-sm text-white/70">
              {pickLocale(q.explanation, locale)}
            </p>
          )}
          <p className="mt-6 text-sm text-white/50">Aguardando a próxima pergunta…</p>
        </Centered>
      );
    }
    if (revealed) {
      const acertou = me?.answer?.is_correct;
      return (
        <Centered dark accent={acertou ? "#2d5a3d" : "#8f2f1c"}>
          <div className="text-5xl">{acertou ? "✅" : "❌"}</div>
          <p className="mt-3 text-2xl font-semibold">
            {acertou ? "Você acertou!" : "Não foi dessa vez"}
          </p>
          {typeof me?.answer?.points_awarded === "number" && (
            <p className="mt-1 text-white/80">+{me.answer.points_awarded} pontos</p>
          )}
          {pickLocale(q.explanation ?? undefined, locale) && (
            <p className="mx-auto mt-4 max-w-sm text-sm text-white/70">
              {pickLocale(q.explanation, locale)}
            </p>
          )}
          <p className="mt-6 text-sm text-white/50">Aguardando a próxima pergunta…</p>
        </Centered>
      );
    }
    return (
      <Centered dark>
        <Check className="mx-auto h-10 w-10 text-[#2d5a3d]" />
        <p className="mt-3 text-xl font-semibold">Resposta enviada!</p>
        <p className="mt-2 text-white/60">Aguardando os outros participantes…</p>
      </Centered>
    );
  }

  if (tempoEsgotado) {
    return (
      <Centered dark>
        <Check className="mx-auto h-10 w-10 text-[#2d5a3d]" />
        <p className="mt-3 text-xl font-semibold">Tempo esgotado</p>
        <p className="mt-2 text-white/60">Aguardando os outros participantes…</p>
      </Centered>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#1a1916] text-white">
      <Toaster />
      <div className="flex items-center justify-between px-4 py-3 text-sm text-white/70">
        <Link
          to="/quiz"
          className="shrink-0 rounded-full px-2 py-1 text-xs hover:bg-white/10 hover:text-white"
        >
          ← Sair
        </Link>
        <span className="min-w-0 flex-1 truncate text-center">
          {me?.emoji} {me?.name}
        </span>
        {secondsLeft !== null && (
          <span className="inline-flex items-center gap-1.5 font-mono">
            <Clock className="h-4 w-4" />
            {secondsLeft}s
          </span>
        )}
      </div>

      <div className="flex-1 px-4 pb-6">
        <p className="mb-6 text-center text-lg font-semibold leading-snug">
          {pickLocale(q.prompt, locale)}
        </p>

        {(q.kind === "single" || q.kind === "true_false" || q.kind === "survey") && (
          <div className="grid gap-3">
            {q.options.map((o, i) => (
              <button
                key={o.id}
                onClick={() => enviar({ optionIds: [o.id] })}
                disabled={enviando}
                style={{ background: OPTION_COLORS[i % OPTION_COLORS.length] }}
                className="rounded-2xl px-5 py-5 text-left text-base font-medium text-white shadow-lg transition active:scale-[0.98] disabled:opacity-60"
              >
                {pickLocale(o.label, locale)}
              </button>
            ))}
          </div>
        )}

        {q.kind === "multiple" && (
          <div className="space-y-3">
            <div className="grid gap-3">
              {q.options.map((o, i) => {
                const on = selected.includes(o.id);
                return (
                  <button
                    key={o.id}
                    onClick={() =>
                      setSelected((s) => (on ? s.filter((x) => x !== o.id) : [...s, o.id]))
                    }
                    style={{
                      background: on ? OPTION_COLORS[i % OPTION_COLORS.length] : "transparent",
                      borderColor: OPTION_COLORS[i % OPTION_COLORS.length],
                    }}
                    className="rounded-2xl border-2 px-5 py-5 text-left text-base font-medium text-white transition"
                  >
                    {on ? "☑ " : "☐ "}
                    {pickLocale(o.label, locale)}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => enviar({ optionIds: selected })}
              disabled={enviando || selected.length === 0}
              className="w-full rounded-full bg-white py-3.5 text-sm font-semibold text-[#1a1916] disabled:opacity-40"
            >
              Confirmar resposta
            </button>
          </div>
        )}

        {q.kind === "two_categories" && (
          <div className="space-y-3">
            {q.options.map((o) => (
              <div key={o.id} className="flex items-center gap-2 rounded-2xl bg-white/10 p-3">
                <span className="flex-1 text-sm font-medium">{pickLocale(o.label, locale)}</span>
                {(["a", "b"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAssignments((a) => ({ ...a, [o.id]: cat }))}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      assignments[o.id] === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    {pickLocale(q.category_labels?.[cat], locale) || (cat === "a" ? "A" : "B")}
                  </button>
                ))}
              </div>
            ))}
            <button
              onClick={() => enviar({ assignments })}
              disabled={enviando || Object.keys(assignments).length < q.options.length}
              className="w-full rounded-full bg-white py-3.5 text-sm font-semibold text-[#1a1916] disabled:opacity-40"
            >
              Confirmar classificação
            </button>
          </div>
        )}

        {q.kind === "text" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar({ text: texto });
            }}
            className="space-y-3"
          >
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              autoFocus
              placeholder="Digite sua resposta"
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 text-center text-lg outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={enviando || !texto.trim()}
              className="w-full rounded-full bg-white py-3.5 text-sm font-semibold text-[#1a1916] disabled:opacity-40"
            >
              Enviar resposta
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Centered({
  children,
  dark,
  accent,
  showExit = true,
}: {
  children: React.ReactNode;
  dark?: boolean;
  accent?: string;
  showExit?: boolean;
}) {
  return (
    <div
      className={`relative grid min-h-screen place-items-center px-6 text-center ${
        dark ? "bg-[#1a1916] text-white" : "bg-background text-foreground"
      }`}
      style={accent ? { background: accent } : undefined}
    >
      <Toaster />
      {showExit && <ExitLink dark={dark ?? true} />}
      <div>{children}</div>
    </div>
  );
}

function ExitLink({ dark = true }: { dark?: boolean }) {
  return (
    <Link
      to="/quiz"
      className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
        dark
          ? "text-white/60 hover:bg-white/10 hover:text-white"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      ← Sair
    </Link>
  );
}

function Podium({
  teams,
  me,
}: {
  teams: { id: string; name: string; emoji: string; score: number }[];
  me: { team_id: string } | null;
}) {
  const ranked = useMemo(() => [...teams].sort((a, b) => b.score - a.score), [teams]);
  const minhaPosicao = me ? ranked.findIndex((t) => t.id === me.team_id) + 1 : null;

  return (
    <div className="min-h-screen bg-[#1a1916] px-6 py-12 text-white">
      <Toaster />
      <div className="mx-auto max-w-sm text-center">
        <Trophy className="mx-auto h-12 w-12 text-[#c8853a]" />
        <h1 className="mt-3 text-2xl font-semibold">Quiz encerrado!</h1>
        {minhaPosicao && <p className="mt-1 text-white/70">Você ficou em {minhaPosicao}º lugar</p>}

        <div className="mt-8 space-y-2 text-left">
          {ranked.map((t, i) => (
            <div
              key={t.id}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                i === 0 ? "bg-[#c8853a] text-[#1a1916]" : "bg-white/10"
              }`}
            >
              <span className="w-6 shrink-0 text-center font-mono text-sm">{i + 1}</span>
              <span className="text-xl">{t.emoji}</span>
              <span className="min-w-0 flex-1 truncate font-medium">{t.name}</span>
              <span className="font-mono text-sm">{t.score}</span>
            </div>
          ))}
        </div>

        <Link
          to="/ferramentas"
          className="mt-8 inline-flex rounded-full border border-white/25 px-5 py-2.5 text-sm hover:border-white/50"
        >
          Voltar às ferramentas
        </Link>
      </div>
    </div>
  );
}
