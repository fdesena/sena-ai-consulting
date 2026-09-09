import FinishFlag from "@/components/FinishFlag";
import { cn } from "@/lib/utils";
import { STAGE_NAMES } from "../engine";

interface StepRailProps {
  stage: number;
  areaLabel: string | null;
}

export default function StepRail({ stage, areaLabel }: StepRailProps) {
  return (
    <aside className="lg:sticky lg:top-8">
      <ol className="grid grid-cols-4 gap-2 lg:hidden">
        {STAGE_NAMES.map((name, i) => (
          <li
            key={name}
            className={cn(
              "flex flex-col gap-2 text-[11px]",
              i === stage ? "text-white" : i < stage ? "text-[#c6ccd1]" : "text-[#939ba3]",
            )}
          >
            <span
              className={cn(
                "grid h-6.5 w-6.5 place-items-center rounded-full border font-mono text-[13px]",
                i === stage
                  ? "border-bronze bg-bronze text-[#111]"
                  : i < stage
                    ? "border-[#fc7c3488] text-[#ffb081]"
                    : "border-white/20",
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <strong className="font-normal">{name}</strong>
          </li>
        ))}
      </ol>

      <div className="hidden lg:block">
        <div className="mb-7 font-mono text-xs uppercase tracking-[0.09em] text-[#ffb081]">
          Seu próximo passo
        </div>
        <ol className="space-y-0">
          {STAGE_NAMES.map((name, i) => (
            <li
              key={name}
              aria-current={i === stage ? "step" : undefined}
              className={cn(
                "relative flex gap-4 pb-7 text-[15px]",
                i !== STAGE_NAMES.length - 1 &&
                  "after:absolute after:left-[14px] after:top-8 after:bottom-1 after:w-px after:bg-white/15",
                i === stage ? "text-white" : i < stage ? "text-[#c6ccd1]" : "text-[#939ba3]",
              )}
            >
              <span
                className={cn(
                  "grid h-7.5 w-7.5 flex-none place-items-center rounded-full border font-mono text-[13px]",
                  i === stage
                    ? "border-bronze bg-bronze text-[#111]"
                    : i < stage
                      ? "border-[#fc7c3488] text-[#ffb081]"
                      : "border-white/20",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <strong className="pt-0.5 font-normal">{name}</strong>
            </li>
          ))}
        </ol>
        <div className="mt-3 border-t border-white/15 pt-6.5">
          <span className="font-mono text-xs text-[#9ba5ae]">O que você leva</span>
          <h2 className="mt-2.5 mb-3 text-xl font-medium">
            {areaLabel ?? "Clareza para começar."}
          </h2>
          <p className="text-[15px] text-[#aeb5bc]">
            {areaLabel
              ? "Esta é a prioridade que vamos aprofundar. Você pode voltar e ajustar sua escolha."
              : "Uma oportunidade prioritária, pontos a validar e um plano inicial que você pode usar por conta própria."}
          </p>
          <p className="mt-5 text-[13px] text-[#8e979f]">
            Sem nota de maturidade. Sem precisar conhecer ferramentas de IA.
          </p>
          <div className="mt-7 flex items-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-bronze" />
            <FinishFlag />
          </div>
        </div>
      </div>
    </aside>
  );
}
