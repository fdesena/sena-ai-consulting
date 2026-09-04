export interface Step {
  phase: string;
  message: string;
}

// Cores por fase, na paleta clara da Sena.
const PHASE_COLOR: Record<string, string> = {
  analise: "bg-forest",
  datajud: "bg-bronze",
  cnpj: "bg-forest/70",
  teor: "bg-bronze/60",
  jurisprudencia: "bg-bronze",
  erro: "bg-destructive",
};

export function ProgressTimeline({ steps, running }: { steps: Step[]; running: boolean }) {
  if (steps.length === 0 && !running) return null;

  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="font-display text-sm font-semibold">Progresso do agente</span>
        {running && <span className="h-2 w-2 animate-pulse rounded-full bg-bronze" aria-hidden />}
      </div>
      <ol className="space-y-2">
        {steps.map((s, i) => {
          const isLast = i === steps.length - 1;
          return (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  PHASE_COLOR[s.phase] ?? "bg-muted-foreground"
                } ${running && isLast ? "animate-pulse" : ""}`}
                aria-hidden
              />
              <span
                className={
                  s.phase === "erro"
                    ? "text-destructive"
                    : running && isLast
                      ? "text-foreground"
                      : "text-muted-foreground"
                }
              >
                {s.message}
              </span>
            </li>
          );
        })}
        {running && steps.length === 0 && (
          <li className="text-sm text-muted-foreground">Iniciando…</li>
        )}
      </ol>
    </div>
  );
}
