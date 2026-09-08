import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Step = {
  tag: string;
  sub: string;
  title: string;
  text: string;
  outcomeLabel: string;
  outcome: string;
};

const STEPS: Step[] = [
  {
    tag: "01 / Contexto",
    sub: "Problema primeiro",
    title: "Entender.",
    text: "Investigar a operação, as pessoas e os dados para definir o problema que realmente vale resolver.",
    outcomeLabel: "O que fica claro",
    outcome: "Objetivo, prioridades e critérios de sucesso.",
  },
  {
    tag: "02 / Direção",
    sub: "Escopo compartilhado",
    title: "Desenhar.",
    text: "Traduzir o diagnóstico em uma solução possível, com fluxos, prioridades e uma experiência que o time entende.",
    outcomeLabel: "O que ganha forma",
    outcome: "Escopo, desenho da solução e plano de trabalho.",
  },
  {
    tag: "03 / Construção",
    sub: "Entregas por etapa",
    title: "Construir.",
    text: "Desenvolver, conectar os sistemas e testar a solução em ciclos de entrega e revisão.",
    outcomeLabel: "O que pode ser testado",
    outcome: "Uma versão funcional, com ajustes baseados no uso.",
  },
  {
    tag: "04 / Adoção",
    sub: "Pessoas e operação",
    title: "Implementar.",
    text: "Colocar a solução no ambiente de trabalho, orientar as pessoas e acompanhar os primeiros usos.",
    outcomeLabel: "O que entra na rotina",
    outcome: "Solução publicada e time preparado para operar.",
  },
  {
    tag: "05 / Continuidade",
    sub: "Aprender com o uso",
    title: "Evoluir.",
    text: "Avaliar o que funcionou, identificar ajustes e priorizar a próxima evolução com base no resultado observado.",
    outcomeLabel: "O que orienta o próximo ciclo",
    outcome: "Aprendizados, indicadores e novas prioridades.",
  },
];

export default function ProcessRail() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [fill, setFill] = useState(0);

  useEffect(() => {
    function onScroll() {
      const anchor = window.scrollY + window.innerHeight * 0.45;
      let step = 0;
      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= anchor) step = i;
      });
      setCurrent(step);

      const track = trackRef.current;
      if (track) {
        const r = track.getBoundingClientRect();
        const progress = (window.innerHeight * 0.45 - r.top) / r.height;
        setFill(Math.max(0, Math.min(1, progress)));
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function goTo(i: number) {
    stepRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-20">
      <div className="lg:sticky lg:top-32">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#67696b]">
          <span className="text-primary">04 /</span> Como trabalhamos
        </span>
        <h2 className="mt-4 max-w-[10ch] text-3xl font-semibold sm:text-5xl">
          Da estratégia à entrega. E além.
        </h2>
        <p className="mt-6 max-w-[34ch] text-[#5e6062]">
          Cinco etapas conectam o problema, a solução e as pessoas que vão usá-la. Cada entrega
          ajuda a definir o próximo passo.
        </p>
        <nav className="mt-8 flex gap-2" aria-label="Etapas do processo">
          {STEPS.map((step, i) => (
            <button
              key={step.title}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Etapa ${i + 1}: ${step.title}`}
              aria-current={current === i ? "step" : undefined}
              className={cn(
                "grid h-11 w-11 place-items-center rounded-full border font-mono text-sm transition",
                current === i
                  ? "border-[#2a2c2e] bg-[#2a2c2e] text-white"
                  : "border-[#bdbfc1] text-[#6a6c6e] hover:border-[#2a2c2e]",
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </nav>
      </div>

      <div ref={trackRef} className="relative pl-10">
        <div className="absolute bottom-0 left-[5px] top-0 w-px bg-[#bfc1c3]" />
        <div
          className="absolute left-[5px] top-0 w-px bg-primary"
          style={{ height: `${fill * 100}%` }}
        />
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className="relative py-8 sm:py-12"
          >
            <span
              className={cn(
                "absolute -left-10 top-3.5 h-[11px] w-[11px] rounded-full border transition-colors",
                current === i ? "border-[#a74c16] bg-primary" : "border-[#a0a2a4] bg-[#e8eaec]",
              )}
            />
            <div className="flex items-center justify-between font-mono text-xs text-[#76787a]">
              <span>{step.tag}</span>
              <span>{step.sub}</span>
            </div>
            <h3 className="mt-3 text-3xl font-semibold sm:text-4xl">{step.title}</h3>
            <p className="mt-3 max-w-[42ch] text-[#5d5f61]">{step.text}</p>
            <div
              className={cn(
                "mt-5 max-w-[42ch] border-l-2 py-2 pl-4 text-sm text-[#404244] transition-colors",
                current === i ? "border-primary" : "border-[#aaacae]",
              )}
            >
              <b className="mb-1 block font-mono text-xs uppercase tracking-wide text-[#77797b]">
                {step.outcomeLabel}
              </b>
              {step.outcome}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
