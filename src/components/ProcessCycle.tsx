import { useEffect, useRef, useState } from "react";
import {
  Compass,
  Hammer,
  GraduationCap,
  LineChart,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

type Step = {
  n: string;
  title: string;
  tag: string;
  desc: string;
  Icon: LucideIcon;
};

const steps: Step[] = [
  {
    n: "01",
    title: "Diagnóstico",
    tag: "Ponto de partida",
    desc: "Mapeio processos, gaps e onde a IA gera mais impacto no seu negócio.",
    Icon: Compass,
  },
  {
    n: "02",
    title: "Construção",
    tag: "Construir ferramentas",
    desc: "Implemento ferramentas, agentes e automações sob medida, integrados ao stack que você já usa.",
    Icon: Hammer,
  },
  {
    n: "03",
    title: "Adoção",
    tag: "Aumentar produtividade",
    desc: "Capacito o time para uso real no dia a dia — produtividade que se sustenta, não só entrega.",
    Icon: GraduationCap,
  },
  {
    n: "04",
    title: "Evolução",
    tag: "Direcionar decisões",
    desc: "Acompanho resultados, meço ROI e aponto o próximo ciclo de melhoria.",
    Icon: LineChart,
  },
];

export default function ProcessCycle() {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll-driven step progression
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress: 0 when top hits middle of viewport, 1 when bottom leaves it
      const total = rect.height + vh * 0.6;
      const passed = vh * 0.8 - rect.top;
      const p = Math.max(0, Math.min(1, passed / total));
      const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
      setActive(idx);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const Active = steps[active];
  const radius = 150;

  // Wrap-around navigation — reforça que é um ciclo, sem início/fim travados
  const go = (delta: number) =>
    setActive((a) => (a + delta + steps.length) % steps.length);

  return (
    <div
      ref={containerRef}
      className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center"
    >
      {/* Orbit — cada fatia do círculo é uma fase do ciclo */}
      <div className="relative mx-auto aspect-square w-full max-w-[420px]">
        <svg viewBox="-200 -200 400 400" className="absolute inset-0 h-full w-full">
          <defs>
            <marker
              id="cycle-arrow"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="4.5"
              markerHeight="4.5"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="var(--bronze)" />
            </marker>
          </defs>

          {steps.map((_, i) => {
            const mid = -Math.PI / 2 + (i / steps.length) * Math.PI * 2;
            const half = Math.PI / steps.length; // metade de uma fatia (45°)
            const gap = 0.2; // folga entre fatias
            const a1 = mid - half + gap;
            const a2 = mid + half - gap;
            const x1 = Math.cos(a1) * radius;
            const y1 = Math.sin(a1) * radius;
            const x2 = Math.cos(a2) * radius;
            const y2 = Math.sin(a2) * radius;
            const isActive = i === active;
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={isActive ? 3 : 2}
                strokeLinecap="round"
                markerEnd={isActive ? "url(#cycle-arrow)" : undefined}
                className={`transition-all duration-500 ${
                  isActive ? "text-primary" : "text-border"
                }`}
              />
            );
          })}
        </svg>

        {/* Center hub — fase atual */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            key={active}
            className="flex h-36 w-36 animate-[scale-in_0.4s_ease-out] flex-col items-center justify-center rounded-full bg-primary px-4 text-center text-primary-foreground shadow-xl"
          >
            <Active.Icon className="h-6 w-6" strokeWidth={1.5} />
            <span className="mt-1.5 text-base font-semibold leading-tight">{Active.title}</span>
            <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] opacity-80">
              Fase {Active.n} · de 0{steps.length}
            </span>
          </div>
        </div>

        {/* Ícones — um por fatia/quadrante */}
        {steps.map((s, i) => {
          const angle = (i / steps.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isActive = i === active;
          return (
            <button
              key={s.n}
              onClick={() => setActive(i)}
              aria-label={`Fase ${s.n}: ${s.title}`}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border bg-card transition-all duration-500 ${
                isActive
                  ? "scale-110 border-primary text-primary shadow-md"
                  : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
              }`}
            >
              <s.Icon
                className={`m-3 transition-all ${isActive ? "h-6 w-6" : "h-5 w-5"}`}
                strokeWidth={1.6}
              />
            </button>
          );
        })}
      </div>

      {/* Detail */}
      <div className="min-h-[260px]">
        <div key={active} className="animate-[fade-in_0.4s_ease-out]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              Fase {Active.n}
            </span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
              {Active.tag}
            </span>
          </div>
          <h3 className="mt-3 text-3xl font-semibold sm:text-5xl">{Active.title}</h3>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">{Active.desc}</p>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <div className="flex gap-2">
            {steps.map((s, i) => (
              <button
                key={s.n}
                onClick={() => setActive(i)}
                aria-label={s.title}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === active ? "w-12 bg-primary" : "w-6 bg-border hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:flex">
            <RotateCw className="h-3 w-3" /> Ciclo contínuo
          </span>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => go(-1)}
              aria-label="Fase anterior"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Próxima fase"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary hover:text-primary"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
