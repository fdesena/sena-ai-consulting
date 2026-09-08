import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Workflow,
  Bot,
  LineChart as LineChartIcon,
  GraduationCap,
  Globe,
  Wrench,
  Video,
  MessageCircle,
  Play,
  ExternalLink,
  ChevronRight,
  Disc3,
  Timer,
  FileText,
  Gamepad2,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

function MockVideoReel() {
  return (
    <div className="relative h-full overflow-hidden rounded-md bg-foreground/90">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/90">
          <div className="ml-0.5 h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-primary-foreground" />
        </div>
      </div>
      <div className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-sm bg-background/90 px-1.5 py-0.5">
        <span className="font-mono text-[7px] uppercase tracking-wider text-primary">
          gerado com ia
        </span>
      </div>
      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center gap-0.5">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 flex-1 rounded-[1px]"
            style={{
              background:
                i % 4 === 0
                  ? "color-mix(in oklab, var(--bronze) 85%, transparent)"
                  : "color-mix(in oklab, white 20%, transparent)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MockCustomTools() {
  const rows = [Disc3, Timer, FileText, Gamepad2];
  return (
    <div className="space-y-1.5">
      {rows.map((RowIcon, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-md border border-border bg-[var(--paper)] px-2 py-1"
        >
          <RowIcon className="h-2.5 w-2.5 text-primary" strokeWidth={1.5} />
          <div className="h-1 flex-1 rounded-full bg-foreground/15" />
        </div>
      ))}
    </div>
  );
}

function MockWhatsAppFlow() {
  const rows = [
    { status: "bg-primary" },
    { status: "bg-primary" },
    { status: "bg-foreground/25" },
    { status: "bg-red-500/70" },
  ];
  return (
    <div className="space-y-1.5">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-md border border-border bg-[var(--paper)] px-2 py-1"
        >
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${row.status}`} />
          <div className="h-1 flex-1 rounded-full bg-foreground/15" />
        </div>
      ))}
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
  /** Múltiplos vídeos de exemplo, empilhados um abaixo do outro no painel. */
  videos?: { src: string; label: string }[];
  /** Sites já entregues, mostrados como preview embedado no painel. Use `screenshot` quando o site bloquear iframe (X-Frame-Options). */
  sites?: { url: string; screenshot?: string }[];
  /** Ferramentas já em produção, listadas com link direto pra testar. */
  tools?: { name: string; description: string; Icon: LucideIcon; to?: string; href?: string }[];
};

const items: Item[] = [
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
      { url: "https://think-big.app/" },
      { url: "https://www.tapetez.com.br/" },
      { url: "https://clinica-lassie.com.br/", screenshot: "/images/cases/clinica-lassie.png" },
    ],
  },
  {
    t: "Vídeos institucionais e fotos com IA",
    d: "Alta qualidade, em uma fração do tempo e custo.",
    Icon: Video,
    Mock: MockVideoReel,
    desafio:
      "Produção tradicional de vídeo institucional e fotos profissionais exige equipe, estúdio e semanas de trabalho — caro e lento pra manter conteúdo atualizado.",
    solucao:
      "Vídeos institucionais e fotos gerados com IA (ElevenLabs, Higgsfield, Nanobanana, entre outras), com direção criativa e curadoria humana — sem abrir mão de qualidade profissional.",
    resultado:
      "Conteúdo pronto em dias, não semanas, a uma fração do custo de produção tradicional.",
    tags: ["Vídeo com IA", "Geração de imagem", "ElevenLabs", "Higgsfield", "Nanobanana"],
    videos: [
      { src: "/videos/sena-labs-ads.mp4", label: "Sena Labs" },
      { src: "/videos/sena-labs-video.mp4", label: "Sena Labs — Vídeo" },
      { src: "/videos/hercon-institucional.mp4", label: "Hercon — Institucional" },
    ],
  },
  {
    t: "Ferramentas customizadas",
    d: "Ferramentas prontas pra usar, sob medida quando precisar.",
    Icon: Wrench,
    Mock: MockCustomTools,
    desafio:
      "Times perdem tempo com tarefas repetitivas — sorteio, cronometragem, geração de documentos, quiz — sem uma ferramenta própria pra isso.",
    solucao:
      "Ferramentas web sob medida, leves e sem instalação, rodando direto no navegador — o mesmo padrão das que já uso com clientes.",
    resultado: "Ferramentas em produção agora, com acesso livre e exemplos reais pra testar.",
    tags: ["Ferramentas web", "Sob medida", "Sem instalação"],
    tools: [
      {
        name: "Roleta de Sorteio",
        description: "Sorteio interativo com roda giratória — nomes, prêmios e brindes em eventos.",
        Icon: Disc3,
        to: "/ferramentas/roleta",
      },
      {
        name: "Temporizador",
        description: "Cronômetro regressivo em tela cheia, com música de fundo e presets de tempo.",
        Icon: Timer,
        to: "/ferramentas/temporizador",
      },
      {
        name: "Gerador de Documentos",
        description:
          "Gere crachás, certificados e cartas em lote a partir de um modelo e de uma planilha.",
        Icon: FileText,
        href: "/ferramentas/gerador-de-documentos.html",
      },
      {
        name: "Quiz ao Vivo",
        description:
          "Quiz multiplayer em tempo real, estilo Kahoot — entre com o PIN e jogue com sua equipe.",
        Icon: Gamepad2,
        to: "/quiz",
      },
    ],
  },
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
    t: "Retenção de pacientes via WhatsApp",
    d: "Zero mensagem esquecida entre o agendamento e o disparo.",
    Icon: MessageCircle,
    Mock: MockWhatsAppFlow,
    desafio:
      "Clínica de estética de médio porte, ~200 agendamentos por mês, com todo o acompanhamento da paciente feito na mão pela recepção: lembrete de pré-procedimento, checagem pós-atendimento, aviso de recompra, aniversário e retomada de orçamento em aberto. Sem sistema entre o agendamento e o disparo da mensagem, o risco de esquecimento é constante — e cresce junto com o volume de pacientes.",
    solucao:
      "Automação conectada direto ao software de gestão da clínica, disparando mensagens de WhatsApp automaticamente a partir do próprio agendamento — sem a recepção precisar alimentar nenhuma ferramenta extra. Cinco fluxos cobrem o ciclo completo da paciente (pré-procedimento, pós-procedimento, recompra, aniversário, orçamento em aberto), com um painel que mostra quem respondeu, quem não respondeu e onde uma mensagem falhou.",
    resultado:
      "Em produção, cobrindo mais de 200 agendamentos por mês e 760 pacientes por ano, sem nenhuma ação manual da recepção entre o agendamento e o envio.",
    tags: [
      "WhatsApp Business API",
      "Automação de CRM",
      "Integração de sistemas",
      "Painel de acompanhamento",
    ],
  },
];

function CaseRow({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
        {label}
      </span>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

/** Slot de mídia à direita do card expandido — vídeos, ferramentas, sites ou mockup, na ordem de prioridade. */
function CaseMedia({ item }: { item: Item }) {
  if (item.videos && item.videos.length > 0) {
    return (
      <div className="flex flex-col gap-4">
        {item.videos.map((v) => (
          <div key={v.src} className="max-w-[380px]">
            <video
              src={v.src}
              controls
              className="aspect-video w-full rounded-lg border border-border"
            />
            <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {v.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (item.video) {
    return (
      <video
        src={item.video}
        controls
        className="aspect-video w-full rounded-lg border border-border"
      />
    );
  }

  if (item.tools && item.tools.length > 0) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {item.tools.map((tool) => {
          const cardCls =
            "group/tool flex items-start gap-3 rounded-lg border border-border bg-white p-3 text-left transition hover:border-primary/50 hover:shadow-sm";
          const inner = (
            <>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <tool.Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold">{tool.name}</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">{tool.description}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                  Testar <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </>
          );
          return tool.to ? (
            <Link key={tool.name} to={tool.to} className={cardCls}>
              {inner}
            </Link>
          ) : (
            <a key={tool.name} href={tool.href} className={cardCls}>
              {inner}
            </a>
          );
        })}
      </div>
    );
  }

  if (item.sites && item.sites.length > 0) {
    return (
      <div className="flex flex-col gap-3">
        {item.sites.map(({ url, screenshot }) => {
          const hostname = new URL(url).hostname.replace(/^www\./, "");
          return (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/site relative block max-w-[380px] overflow-hidden rounded-lg border border-border bg-white"
            >
              <div className="flex items-center gap-1 border-b border-border bg-foreground/5 px-2 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
                <span className="ml-1 truncate font-mono text-[10px] text-muted-foreground">
                  {hostname}
                </span>
              </div>
              <div className="relative h-[198px] w-full overflow-hidden">
                {screenshot ? (
                  <img
                    src={screenshot}
                    alt={`Captura de tela de ${hostname}`}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <iframe
                    src={url}
                    title={hostname}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="pointer-events-none h-[900px] w-[1600px] origin-top-left border-0"
                    style={{ transform: "scale(0.22)" }}
                  />
                )}
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
    );
  }

  return (
    <div className="relative">
      <div className="mx-auto h-44 max-w-[320px]">
        <item.Mock />
      </div>
      <span className="absolute right-0 top-0 inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-primary-foreground">
        <Play className="h-3 w-3" /> Demo em vídeo em breve
      </span>
    </div>
  );
}

function FullCard({ item, onOpen }: { item: Item; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label={`Ver exemplo: ${item.t}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"
    >
      <div className="relative h-36 overflow-hidden border-b border-border bg-[var(--paper)] p-4">
        <div className="absolute left-3 top-3 flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
        </div>
        <div className="mt-4 h-[88px]">
          <item.Mock />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/55 opacity-0 backdrop-blur-[1px] transition duration-300 group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground shadow-sm">
            <Play className="h-3.5 w-3.5" /> Ver exemplo
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <item.Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
        <h3 className="mt-4 text-base font-semibold">{item.t}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{item.d}</p>
      </div>
    </button>
  );
}

function CompactCard({ item, onOpen }: { item: Item; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label={`Ver exemplo: ${item.t}`}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
    >
      <item.Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium">{item.t}</h3>
        <p className="truncate text-xs text-muted-foreground">{item.d}</p>
      </div>
    </button>
  );
}

export default function TrackRecord() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const active = openIdx !== null ? items[openIdx] : null;

  return (
    <div>
      {active && (
        <div className="animate-in fade-in slide-in-from-top-2 relative mb-5 grid items-start overflow-hidden rounded-2xl border border-primary/40 bg-card shadow-lg duration-300 md:grid-cols-[380px_1fr]">
          <button
            type="button"
            onClick={() => setOpenIdx(null)}
            aria-label="Fechar exemplo"
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 text-foreground transition hover:border-primary hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col gap-5 border-b border-border p-6 md:border-b-0 md:border-r">
            <div>
              <active.Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <h3 className="mt-4 text-xl font-semibold">{active.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{active.d}</p>
            </div>
            <div className="space-y-4">
              <CaseRow label="Desafio" text={active.desafio} />
              <CaseRow label="Solução" text={active.solucao} />
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <CaseRow label="Resultado" text={active.resultado} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
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

          <div className="bg-[var(--paper)] p-6">
            <CaseMedia item={active} />
          </div>
        </div>
      )}

      <div
        className={cn(
          "grid gap-4",
          active
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            : "gap-5 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {items.map((item, i) =>
          openIdx === i ? null : active ? (
            <CompactCard key={item.t} item={item} onOpen={() => setOpenIdx(i)} />
          ) : (
            <FullCard key={item.t} item={item} onOpen={() => setOpenIdx(i)} />
          ),
        )}
      </div>
    </div>
  );
}
