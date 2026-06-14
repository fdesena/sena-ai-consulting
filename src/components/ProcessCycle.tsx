import { useEffect, useRef, useState } from "react";
import {
  Compass,
  Hammer,
  GraduationCap,
  LifeBuoy,
  ArrowLeft,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

type Step = {
  n: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
};

const steps: Step[] = [
  {
    n: "01",
    title: "Diagnóstico",
    desc: "Mapeio processos, gaps e oportunidades reais de IA no seu negócio.",
    Icon: Compass,
  },
  {
    n: "02",
    title: "Construção",
    desc: "Implemento as soluções integradas ao stack que você já usa.",
    Icon: Hammer,
  },
  {
    n: "03",
    title: "Capacitação",
    desc: "Treino o time para garantir adoção real, não só entrega.",
    Icon: GraduationCap,
  },
  {
    n: "04",
    title: "Suporte contínuo",
    desc: "Mantenho e evoluo as soluções — parceria de longo prazo.",
    Icon: LifeBuoy,
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

  const go = (delta: number) =>
    setActive((a) => Math.max(0, Math.min(steps.length - 1, a + delta)));

  return (
    <div
      ref={containerRef}
      className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center"
    >
      {/* Orbit */}
      <div className="relative mx-auto aspect-square w-full max-w-[420px]">
        <svg viewBox="-200 -200 400 400" className="absolute inset-0 h-full w-full">
          <circle
            cx="0"
            cy="0"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border"
            strokeDasharray="2 6"
          />
          {steps.map((_, i) => {
            const next = (i + 1) % steps.length;
            const a1 = (i / steps.length) * Math.PI * 2 - Math.PI / 2;
            const a2 = (next / steps.length) * Math.PI * 2 - Math.PI / 2;
            const x1 = Math.cos(a1) * radius;
            const y1 = Math.sin(a1) * radius;
            const x2 = Math.cos(a2) * radius;
            const y2 = Math.sin(a2) * radius;
            const isActiveArc = i === active;
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={isActiveArc ? 2.5 : 0}
                className="text-primary transition-all duration-500"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Center icon */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            key={active}
            className="flex h-32 w-32 animate-[scale-in_0.4s_ease-out] flex-col items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl"
          >
            <Active.Icon className="h-10 w-10" strokeWidth={1.5} />
            <span className="mt-1 font-mono text-[10px] tracking-widest opacity-80">
              {Active.n}
            </span>
          </div>
        </div>

        {/* Orbit dots */}
        {steps.map((s, i) => {
          const angle = (i / steps.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isActive = i === active;
          return (
            <button
              key={s.n}
              onClick={() => setActive(i)}
              aria-label={`Passo ${s.n}: ${s.title}`}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-500 ${
                isActive
                  ? "scale-125 border-primary bg-primary text-primary-foreground shadow-lg"
                  : "scale-100 border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
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
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            Etapa {Active.n} / 04
          </span>
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
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => go(-1)}
              disabled={active === 0}
              aria-label="Etapa anterior"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => go(1)}
              disabled={active === steps.length - 1}
              aria-label="Próxima etapa"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
