import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Gamepad2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/ferramentas/ToolShell";
import { joinSession } from "@/lib/quiz/db";
import { TEAM_EMOJIS } from "@/lib/quiz/types";

export const Route = createFileRoute("/quiz/")({
  head: () => ({
    meta: [
      { title: "Entrar no Quiz — Sena Consulting" },
      {
        name: "description",
        content: "Digite o PIN do quiz para entrar e jogar ao vivo com a sua equipe.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { pin?: string } =>
    typeof search.pin === "string" ? { pin: search.pin } : {},
  component: QuizJoinPage,
});

function QuizJoinPage() {
  const navigate = useNavigate();
  const { pin: pinFromUrl } = Route.useSearch();
  const [pin, setPin] = useState(pinFromUrl ?? "");
  const [nome, setNome] = useState("");
  const [emoji, setEmoji] = useState(TEAM_EMOJIS[0]);
  const [entrando, setEntrando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    const pinLimpo = pin.replace(/\D/g, "");
    if (pinLimpo.length !== 6) {
      toast.error("O PIN tem 6 dígitos");
      return;
    }
    if (!nome.trim()) {
      toast.error("Escolha um nome para a sua equipe");
      return;
    }
    setEntrando(true);
    try {
      const res = await joinSession(pinLimpo, nome.trim(), emoji);
      localStorage.setItem(`quiz_token_${res.session_id}`, res.token);
      navigate({ to: "/quiz/jogar/$sessionId", params: { sessionId: res.session_id } });
    } catch (err: any) {
      toast.error("Não consegui entrar", { description: err.message });
    } finally {
      setEntrando(false);
    }
  }

  return (
    <ToolShell
      eyebrow="Ferramenta"
      title="Quiz ao Vivo"
      description="Digite o PIN que apareceu na tela do anfitrião, escolha um nome de equipe e comece a jogar."
    >
      <form onSubmit={entrar} className="mx-auto max-w-sm space-y-5">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Gamepad2 className="h-6 w-6" />
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              PIN da sessão
            </span>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoFocus
              placeholder="000000"
              className="w-full rounded-xl border border-border bg-background py-3 text-center font-mono text-3xl tracking-[0.3em] outline-none focus:border-primary"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Nome da equipe
            </span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Os Invencíveis"
              maxLength={40}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-center outline-none focus:border-primary"
            />
          </label>

          <div className="mt-4">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Emoji</span>
            <div className="flex flex-wrap justify-center gap-2">
              {TEAM_EMOJIS.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setEmoji(em)}
                  className={`grid h-10 w-10 place-items-center rounded-full border text-lg transition ${
                    emoji === em
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={entrando}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {entrando && <Loader2 className="h-4 w-4 animate-spin" />}
          Entrar no quiz
        </button>
      </form>
    </ToolShell>
  );
}
