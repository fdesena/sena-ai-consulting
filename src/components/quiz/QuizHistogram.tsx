import { pickLocale, type Locale, type QuizOption } from "@/lib/quiz/types";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

/**
 * Histograma dos votos por opção — usado no modo apresentação (tela cheia)
 * pra mostrar a distribuição em tempo real. As opções só levam a letra
 * (A/B/C…) porque o texto completo já está na pergunta, acima.
 * Vertical até 4 opções (estilo show de perguntas); a partir daí horizontal,
 * porque colunas ficam apertadas demais com muitas barras.
 */
export function QuizHistogram({
  options,
  distribution,
  revealed,
  locale = "pt",
}: {
  options: QuizOption[];
  distribution: Record<string, number> | null | undefined;
  revealed: boolean;
  locale?: Locale;
}) {
  if (!options.length) return null;

  const counts = options.map((o) => distribution?.[o.id] ?? 0);
  const max = Math.max(1, ...counts);
  const horizontal = options.length > 4;

  if (horizontal) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3">
        {options.map((o, i) => {
          const n = counts[i];
          const pct = (n / max) * 100;
          const correct = revealed && o.is_correct;
          return (
            <div key={o.id} className="flex items-center gap-3">
              <span className="w-9 shrink-0 text-center font-mono text-lg font-bold text-white/70">
                {LETTERS[i] ?? i + 1}
              </span>
              <div className="h-10 flex-1 overflow-hidden rounded-lg bg-white/10">
                <div
                  className={`flex h-full items-center justify-end rounded-lg px-2 transition-all duration-500 ${
                    correct ? "bg-emerald-500" : "bg-[#c8853a]"
                  }`}
                  style={{ width: `${Math.max(pct, n > 0 ? 6 : 0)}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right font-mono text-lg text-white">{n}</span>
              {correct && <span className="shrink-0 text-emerald-400">✓</span>}
              <span className="sr-only">{pickLocale(o.label, locale)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-64 max-w-3xl items-end justify-center gap-8">
      {options.map((o, i) => {
        const n = counts[i];
        const pct = (n / max) * 100;
        const correct = revealed && o.is_correct;
        return (
          <div key={o.id} className="flex w-24 flex-col items-center gap-2">
            <span className="font-mono text-base text-white">{n}</span>
            <div className="flex h-44 w-full items-end overflow-hidden rounded-t-xl bg-white/10">
              <div
                className={`w-full rounded-t-xl transition-all duration-500 ${
                  correct ? "bg-emerald-500" : "bg-[#c8853a]"
                }`}
                style={{ height: `${Math.max(pct, n > 0 ? 4 : 0)}%` }}
              />
            </div>
            <span className="font-mono text-xl font-bold text-white/70">
              {LETTERS[i] ?? i + 1}
              {correct && <span className="ml-1 text-emerald-400">✓</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
