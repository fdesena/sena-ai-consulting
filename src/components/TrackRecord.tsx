import { useState } from "react";
import {
  Workflow,
  Bot,
  LineChart as LineChartIcon,
  GraduationCap,
  Globe,
  Presentation,
  Play,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

function MockWebsite() {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        <div className="h-1.5 w-20 rounded-full bg-foreground/70" />
      </div>
      <div className="h-1 w-28 rounded-full bg-foreground/15" />
      <div className="h-1 w-24 rounded-full bg-foreground/15" />
      <div className="mt-2 grid grid-cols-3 gap-1">
        <div className="aspect-video rounded-sm bg-primary/25" />
        <div className="aspect-video rounded-sm bg-foreground/10" />
        <div className="aspect-video rounded-sm bg-foreground/10" />
      </div>
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

type Item = {
  t: string;
  d: string;
  Icon: LucideIcon;
  Mock: () => React.ReactElement;
  desafio: string;
  solucao: string;
  resultado: string;
  tags: string[];
  /** Quando houver vídeo de demonstração, basta preencher a URL aqui. */
  video?: string;
  /** URLs de sites já entregues, mostrados como preview embedado no modal. */
  sites?: string[];
};

const items: Item[] = [
  {
    t: "Automação de propostas",
    d: "−80% no tempo de elaboração.",
    Icon: Workflow,
    Mock: MockProposal,
    desafio:
      "Elaboração de propostas comerciais feita à mão: lenta, inconsistente entre a equipe e dependente de poucas pessoas.",
    solucao:
      "Fluxo que monta a proposta a partir de poucos inputs, padronizando texto, escopo e precificação.",
    resultado: "−80% no tempo de elaboração, com mais padronização e menos retrabalho.",
    tags: ["Automação", "IA generativa", "Documentos"],
  },
  {
    t: "Agentes em conteúdo proprietário",
    d: "Suporte e decisão em escala.",
    Icon: Bot,
    Mock: MockAgent,
    desafio:
      "Conhecimento espalhado em documentos e pessoas, dificultando suporte e decisões rápidas.",
    solucao:
      "Agente de IA treinado no conteúdo da empresa, respondendo com base nas fontes internas.",
    resultado: "Suporte e tomada de decisão em escala, com respostas consistentes.",
    tags: ["Agentes de IA", "RAG", "Base de conhecimento"],
  },
  {
    t: "Visualização de dados com IA",
    d: "Dashboards executivos automáticos.",
    Icon: LineChartIcon,
    Mock: MockChart,
    desafio: "Relatórios manuais, demorados e quase sempre desatualizados para a gestão.",
    solucao:
      "Pipeline que consolida os dados e gera dashboards executivos atualizados automaticamente.",
    resultado: "Dashboards executivos prontos para decisão, sem trabalho manual.",
    tags: ["Dados", "Dashboards", "Automação"],
  },
  {
    t: "LMS gamificado",
    d: "Vídeos, quizzes e rankings próprios.",
    Icon: GraduationCap,
    Mock: MockLMS,
    desafio: "Treinamentos dispersos, sem trilha clara e com baixo engajamento do time.",
    solucao:
      "Plataforma de ensino própria com trilhas, vídeos, quizzes e rankings — com identidade da marca.",
    resultado: "Mais engajamento e aprendizado mensurável, em ambiente próprio.",
    tags: ["Plataforma", "LMS", "Gamificação"],
  },
  {
    t: "Website",
    d: "Sites sob medida, do zero ao ar.",
    Icon: Globe,
    Mock: MockWebsite,
    desafio:
      "Site genérico, lento ou dependente de templates prontos — sem controle sobre design, performance ou dados.",
    solucao:
      "Website sob medida, com design, performance e integrações pensadas para o negócio do cliente.",
    resultado: "Presença digital própria, rápida e alinhada à marca.",
    tags: ["Website", "Design", "Performance"],
    sites: [
      "https://think-big.app/",
      "https://www.tapetez.com.br/",
      "http://clinica-lassie.com.br/",
    ],
  },
  {
    t: "Ferramentas para eventos",
    d: "Apps ao vivo em palestras imersivas.",
    Icon: Presentation,
    Mock: MockEvent,
    desafio: "Palestras e eventos com pouca interação e participação da plateia.",
    solucao:
      "Apps ao vivo (votações, dinâmicas e visualizações em tempo real) para tornar o evento imersivo.",
    resultado: "Experiências ao vivo mais imersivas e participativas.",
    tags: ["App", "Tempo real", "Eventos"],
  },
];

function CaseRow({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{label}</span>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

export default function TrackRecord() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const active = openIdx !== null ? items[openIdx] : null;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c, i) => (
          <button
            key={c.t}
            onClick={() => setOpenIdx(i)}
            aria-label={`Ver exemplo: ${c.t}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"
          >
            {/* Preview canvas */}
            <div className="relative h-36 overflow-hidden border-b border-border bg-[var(--paper)] p-4">
              <div className="absolute left-3 top-3 flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
              </div>
              <div className="mt-4 h-[88px]">
                <c.Mock />
              </div>
              {/* Hover affordance */}
              <div className="absolute inset-0 flex items-center justify-center bg-background/55 opacity-0 backdrop-blur-[1px] transition duration-300 group-hover:opacity-100">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground shadow-sm">
                  <Play className="h-3.5 w-3.5" /> Ver exemplo
                </span>
              </div>
            </div>
            {/* Meta */}
            <div className="flex flex-1 flex-col p-5">
              <c.Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <h3 className="mt-4 text-base font-semibold">{c.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={openIdx !== null} onOpenChange={(o) => !o && setOpenIdx(null)}>
        <DialogContent className="max-w-2xl overflow-hidden p-0">
          {active && (
            <div className="max-h-[85vh] overflow-y-auto">
              {/* Slot de mídia — vídeo quando houver; placeholder até lá */}
              <div className="relative border-b border-border bg-[var(--paper)] p-6">
                <div className="mb-3 flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-foreground/20" />
                  <span className="h-2 w-2 rounded-full bg-foreground/20" />
                  <span className="h-2 w-2 rounded-full bg-foreground/20" />
                </div>
                {active.video ? (
                  <video
                    src={active.video}
                    controls
                    className="aspect-video w-full rounded-lg border border-border"
                  />
                ) : active.sites && active.sites.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {active.sites.map((url) => {
                      const hostname = new URL(url).hostname.replace(/^www\./, "");
                      return (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/site relative block overflow-hidden rounded-lg border border-border bg-white"
                        >
                          <div className="flex items-center gap-1 border-b border-border bg-foreground/5 px-2 py-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
                            <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
                            <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
                            <span className="ml-1 truncate font-mono text-[8px] text-muted-foreground">
                              {hostname}
                            </span>
                          </div>
                          <div className="relative h-36 w-full overflow-hidden">
                            <iframe
                              src={url}
                              title={hostname}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="pointer-events-none h-[900px] w-[1600px] origin-top-left border-0"
                              style={{ transform: "scale(0.225)" }}
                            />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-background/0 opacity-0 backdrop-blur-[1px] transition duration-200 group-hover/site:bg-background/40 group-hover/site:opacity-100">
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-medium text-primary-foreground">
                              <ExternalLink className="h-3 w-3" /> Abrir site
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    <div className="mx-auto h-44 max-w-[320px]">
                      <active.Mock />
                    </div>
                    <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-primary-foreground">
                      <Play className="h-3 w-3" /> Demo em vídeo em breve
                    </span>
                  </>
                )}
              </div>

              {/* Conteúdo do caso */}
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <active.Icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.5} />
                  <DialogTitle className="text-xl">{active.t}</DialogTitle>
                </div>
                <DialogDescription className="sr-only">
                  Detalhes do projeto {active.t}: desafio, solução e resultado.
                </DialogDescription>

                <div className="mt-5 space-y-4">
                  <CaseRow label="Desafio" text={active.desafio} />
                  <CaseRow label="Solução" text={active.solucao} />
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <CaseRow label="Resultado" text={active.resultado} />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {active.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
