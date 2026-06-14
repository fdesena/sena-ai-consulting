import {
  Workflow,
  Bot,
  LineChart as LineChartIcon,
  GraduationCap,
  Database,
  Presentation,
} from "lucide-react";

/* ---------- Mini visual mockups (pure SVG/CSS) ---------- */

function MockProposal() {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        <div className="h-1.5 w-16 rounded-full bg-foreground/70" />
        <div className="ml-auto h-1 w-8 rounded-full bg-primary/40" />
      </div>
      {[80, 95, 70, 88, 60].map((w, i) => (
        <div key={i} className="h-1 rounded-full bg-foreground/15" style={{ width: `${w}%` }} />
      ))}
      <div className="mt-2 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-2 py-1">
        <div className="h-1 w-1 animate-pulse rounded-full bg-primary" />
        <span className="font-mono text-[8px] uppercase tracking-wider text-primary">
          gerando proposta…
        </span>
      </div>
    </div>
  );
}

function MockAgent() {
  return (
    <div className="space-y-1.5">
      <div className="ml-auto max-w-[70%] rounded-lg rounded-br-sm bg-foreground/10 px-2 py-1">
        <div className="h-1 w-20 rounded-full bg-foreground/40" />
      </div>
      <div className="max-w-[80%] rounded-lg rounded-bl-sm bg-primary/15 px-2 py-1.5">
        <div className="h-1 w-24 rounded-full bg-primary/70" />
        <div className="mt-1 h-1 w-16 rounded-full bg-primary/40" />
      </div>
      <div className="ml-auto flex max-w-[60%] items-center gap-1 rounded-lg rounded-br-sm bg-foreground/10 px-2 py-1.5">
        <span className="h-1 w-1 animate-bounce rounded-full bg-foreground/50 [animation-delay:0ms]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-foreground/50 [animation-delay:120ms]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-foreground/50 [animation-delay:240ms]" />
      </div>
    </div>
  );
}

function MockChart() {
  const bars = [40, 65, 50, 78, 60, 90, 72];
  return (
    <div className="flex h-full items-end gap-1.5">
      {bars.map((h, i) => (
        <div key={i} className="flex flex-1 flex-col justify-end gap-0.5">
          <div
            className="rounded-t-sm bg-primary"
            style={{ height: `${h * 0.5}%`, opacity: 0.85 }}
          />
          <div
            className="rounded-b-sm bg-foreground/15"
            style={{ height: `${(100 - h) * 0.35}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function MockLMS() {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className={`aspect-video rounded-md ${
            i === 2 ? "bg-primary" : "bg-foreground/10"
          } relative overflow-hidden`}
        >
          {i === 2 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-primary-foreground" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MockCRM() {
  const cols = [
    { label: "Leads", h: [60, 45, 30] },
    { label: "Quali.", h: [55, 40] },
    { label: "Prop.", h: [70] },
  ];
  return (
    <div className="grid h-full grid-cols-3 gap-1.5">
      {cols.map((c, i) => (
        <div key={i} className="rounded-md border border-foreground/10 bg-foreground/5 p-1.5">
          <div className="mb-1 font-mono text-[7px] uppercase tracking-wider text-muted-foreground">
            {c.label}
          </div>
          <div className="space-y-1">
            {c.h.map((h, j) => (
              <div
                key={j}
                className={`rounded-sm ${i === 2 ? "bg-primary/70" : "bg-foreground/20"}`}
                style={{ height: `${h * 0.18}px` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MockEvent() {
  return (
    <div className="relative h-full overflow-hidden rounded-md bg-foreground/90">
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-3 gap-px p-1">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[1px]"
            style={{
              background:
                Math.random() > 0.4
                  ? "color-mix(in oklab, var(--bronze) 80%, transparent)"
                  : "color-mix(in oklab, white 15%, transparent)",
            }}
          />
        ))}
      </div>
      <div className="absolute bottom-1 left-1 right-1 flex items-center gap-1 rounded-sm bg-background/95 px-1.5 py-0.5">
        <span className="h-1 w-1 animate-pulse rounded-full bg-red-500" />
        <span className="font-mono text-[7px] uppercase tracking-wider">ao vivo</span>
        <span className="ml-auto font-mono text-[7px] text-muted-foreground">142</span>
      </div>
    </div>
  );
}

/* ---------- Card grid ---------- */

const items = [
  {
    t: "Automação de propostas",
    d: "−80% no tempo de elaboração.",
    Icon: Workflow,
    Mock: MockProposal,
  },
  {
    t: "Agentes em conteúdo proprietário",
    d: "Suporte e decisão em escala.",
    Icon: Bot,
    Mock: MockAgent,
  },
  {
    t: "Visualização de dados com IA",
    d: "Dashboards executivos automáticos.",
    Icon: LineChartIcon,
    Mock: MockChart,
  },
  {
    t: "LMS gamificado",
    d: "Vídeos, quizzes e rankings próprios.",
    Icon: GraduationCap,
    Mock: MockLMS,
  },
  {
    t: "CRM + Funil próprio",
    d: "Leads, pipeline e analytics integrados.",
    Icon: Database,
    Mock: MockCRM,
  },
  {
    t: "Ferramentas para eventos",
    d: "Apps ao vivo em palestras imersivas.",
    Icon: Presentation,
    Mock: MockEvent,
  },
];

export default function TrackRecord() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => (
        <article
          key={c.t}
          className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"
        >
          {/* Preview canvas */}
          <div className="relative h-36 border-b border-border bg-[var(--paper)] p-4">
            <div className="absolute left-3 top-3 flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
            </div>
            <div className="mt-4 h-[88px]">
              <c.Mock />
            </div>
          </div>
          {/* Meta */}
          <div className="flex flex-1 flex-col p-5">
            <c.Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <h3 className="mt-4 text-base font-semibold">{c.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
