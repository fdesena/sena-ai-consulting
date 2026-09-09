import { useEffect, useRef, useState } from "react";
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
  ArrowRight,
  ArrowUpRight,
  Disc3,
  Timer,
  FileText,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/components/ContactFAB";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

function quoteRequestUrl(caseTitle: string) {
  const text = `Olá, vim pelo site da Sena Labs e gostaria de solicitar um orçamento: ${caseTitle}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

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
    <div className="flex h-full gap-1.5">
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

type Filter = "software" | "automation" | "ai" | "data";

type Item = {
  t: string;
  d: string;
  /** Rótulo curto exibido no cabeçalho do mockup do card — distinto do título completo. */
  visualLabel: string;
  category: string;
  filter: Filter;
  featured?: boolean;
  dark?: boolean;
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
  /** Comparativo animado de tempo (sem IA x com IA) quando não há vídeo/site/ferramenta pra mostrar. Estimativa ilustrativa, não métrica medida do cliente. */
  timeSaved?: { cadence: string; traditionalMinutes: number; aiMinutes: number };
};

const items: Item[] = [
  {
    t: "Website",
    d: "Sites sob medida, do zero ao ar.",
    visualLabel: "Website",
    category: "Websites e presença digital",
    filter: "software",
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
    visualLabel: "Direção + IA",
    category: "Criação com IA",
    filter: "ai",
    dark: true,
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
    d: "Ferramentas sob medida, prontas para testar agora.",
    visualLabel: "Ferramentas",
    category: "Software sob medida",
    filter: "software",
    featured: true,
    Icon: Wrench,
    Mock: MockCustomTools,
    desafio:
      "Tarefas repetitivas do dia a dia — sorteio, cronometragem, geração de documentos — resolvidas na correria, sem uma ferramenta própria pra isso.",
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
    visualLabel: "Proposta comercial",
    category: "Automação comercial",
    filter: "automation",
    Icon: Workflow,
    Mock: MockProposal,
    desafio:
      "Elaboração de propostas comerciais feita à mão: lenta, inconsistente entre a equipe e dependente de poucas pessoas.",
    solucao:
      "Fluxo que monta a proposta a partir de poucos inputs, padronizando texto, escopo e precificação.",
    resultado: "−80% no tempo de elaboração, com mais padronização e menos retrabalho.",
    tags: ["Automação", "IA generativa", "Documentos"],
    timeSaved: { cadence: "por proposta", traditionalMinutes: 180, aiMinutes: 36 },
  },
  {
    t: "Agentes em conteúdo proprietário",
    d: "Suporte e decisão em escala.",
    visualLabel: "Base de conhecimento",
    category: "Inteligência aplicada",
    filter: "ai",
    dark: true,
    Icon: Bot,
    Mock: MockAgent,
    desafio:
      "Conhecimento espalhado em documentos e pessoas, dificultando suporte e decisões rápidas.",
    solucao:
      "Agente de IA treinado no conteúdo da empresa, respondendo com base nas fontes internas.",
    resultado: "Suporte e tomada de decisão em escala, com respostas consistentes.",
    tags: ["Agentes de IA", "RAG", "Base de conhecimento"],
    timeSaved: { cadence: "por pergunta respondida", traditionalMinutes: 10, aiMinutes: 0.5 },
  },
  {
    t: "Visualização de dados com IA",
    d: "Dashboards executivos automáticos.",
    visualLabel: "Visão de gestão",
    category: "Dados e gestão",
    filter: "data",
    Icon: LineChartIcon,
    Mock: MockChart,
    desafio: "Relatórios manuais, demorados e quase sempre desatualizados para a gestão.",
    solucao:
      "Pipeline que consolida os dados e gera dashboards executivos atualizados automaticamente.",
    resultado: "Dashboards executivos prontos para decisão, sem trabalho manual.",
    tags: ["Dados", "Dashboards", "Automação"],
    timeSaved: { cadence: "por relatório mensal", traditionalMinutes: 240, aiMinutes: 5 },
  },
  {
    t: "LMS gamificado",
    d: "Vídeos, quizzes e rankings próprios.",
    visualLabel: "Trilha de aprendizado",
    category: "Aprendizado em escala",
    filter: "data",
    Icon: GraduationCap,
    Mock: MockLMS,
    desafio: "Treinamentos dispersos, sem trilha clara e com baixo engajamento do time.",
    solucao:
      "Plataforma de ensino própria com trilhas, vídeos, quizzes e rankings — com identidade da marca.",
    resultado: "Mais engajamento e aprendizado mensurável, em ambiente próprio.",
    tags: ["Plataforma", "LMS", "Gamificação"],
    timeSaved: { cadence: "por novo colaborador treinado", traditionalMinutes: 360, aiMinutes: 30 },
  },
  {
    t: "Retenção de pacientes via WhatsApp",
    d: "Zero mensagem esquecida entre o agendamento e o disparo.",
    visualLabel: "Relacionamento",
    category: "Automação de relacionamento",
    filter: "automation",
    featured: true,
    Icon: MessageCircle,
    Mock: MockWhatsAppFlow,
    desafio:
      "Clínica de estética com ~200 agendamentos por mês, todo o acompanhamento da paciente feito na mão pela recepção — risco de esquecimento crescendo junto com o volume.",
    solucao:
      "Automação conectada ao sistema de gestão da clínica, disparando WhatsApp automaticamente a partir do agendamento — cinco fluxos cobrem pré e pós-procedimento, recompra, aniversário e orçamento em aberto, com painel de acompanhamento.",
    resultado:
      "Em produção, cobrindo mais de 200 agendamentos por mês e 760 pacientes por ano, sem nenhuma ação manual da recepção entre o agendamento e o envio.",
    tags: [
      "WhatsApp Business API",
      "Automação de CRM",
      "Integração de sistemas",
      "Painel de acompanhamento",
    ],
    timeSaved: { cadence: "por dia de trabalho da recepção", traditionalMinutes: 45, aiMinutes: 2 },
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

function formatMinutes(min: number) {
  if (min < 1) return `${Math.round(min * 60)}s`;
  if (min < 60) return `${Math.round(min)}min`;
  const h = Math.floor(min / 60);
  const rem = Math.round(min % 60);
  return rem > 0 ? `${h}h${rem}min` : `${h}h`;
}

function useCountUp(target: number, active: boolean, durationMs = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, durationMs]);
  return value;
}

function StopwatchDial({
  label,
  minutes,
  maxMinutes,
  accent,
  active,
}: {
  label: string;
  minutes: number;
  maxMinutes: number;
  accent: boolean;
  active: boolean;
}) {
  const animated = useCountUp(minutes, active);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const fraction = maxMinutes > 0 ? Math.min(1, animated / maxMinutes) : 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="8"
            className="stroke-border"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - fraction)}
            className={accent ? "stroke-primary" : "stroke-muted-foreground/40"}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-base font-semibold text-foreground">
            {formatMinutes(animated)}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

/** Comparativo animado de tempo (sem IA x com IA). Valores são estimativas ilustrativas. */
function TimeSavedComparison({
  cadence,
  traditionalMinutes,
  aiMinutes,
}: {
  cadence: string;
  traditionalMinutes: number;
  aiMinutes: number;
}) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setActive(true), 150);
    return () => clearTimeout(id);
  }, []);
  const savedPct = Math.round((1 - aiMinutes / traditionalMinutes) * 100);

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Tempo {cadence}
      </span>
      <div className="flex items-center gap-6 sm:gap-10">
        <StopwatchDial
          label="Sem IA"
          minutes={traditionalMinutes}
          maxMinutes={traditionalMinutes}
          accent={false}
          active={active}
        />
        <div className="flex flex-col items-center gap-1.5">
          <ArrowRight className="h-5 w-5 text-primary" />
          <span className="whitespace-nowrap rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            −{savedPct}%
          </span>
        </div>
        <StopwatchDial
          label="Com IA"
          minutes={aiMinutes}
          maxMinutes={traditionalMinutes}
          accent
          active={active}
        />
      </div>
      <span className="max-w-[280px] text-center text-[11px] leading-relaxed text-muted-foreground">
        *Estimativa ilustrativa comparando um processo manual típico com o mesmo processo com IA —
        não é uma métrica medida deste cliente.
      </span>
    </div>
  );
}

/** Slot de mídia à direita do card expandido — vídeos, ferramentas, sites ou mockup, na ordem de prioridade. */
function CaseMedia({ item }: { item: Item }) {
  if (item.videos && item.videos.length > 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {item.videos.map((v) => (
          <div key={v.src}>
            <video
              src={v.src}
              controls
              preload="metadata"
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
      <div className="grid gap-4 sm:grid-cols-2">
        {item.sites.map(({ url, screenshot }) => {
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
                <span className="ml-1 truncate font-mono text-[10px] text-muted-foreground">
                  {hostname}
                </span>
              </div>
              <div className="relative h-[160px] w-full overflow-hidden">
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
                    style={{ transform: "scale(0.178)" }}
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

  if (item.timeSaved) {
    return (
      <div className="flex flex-col-reverse items-center gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
        <TimeSavedComparison
          cadence={item.timeSaved.cadence}
          traditionalMinutes={item.timeSaved.traditionalMinutes}
          aiMinutes={item.timeSaved.aiMinutes}
        />
        <div className="h-28 w-full max-w-[200px] shrink-0 sm:w-[180px]">
          <item.Mock />
        </div>
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

/* ---------- Grid de cases com filtros + diálogo (layout preview.html) ---------- */

const FILTERS: { key: "all" | Filter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "software", label: "Software" },
  { key: "automation", label: "Automação" },
  { key: "ai", label: "Inteligência artificial" },
  { key: "data", label: "Dados e ensino" },
];

/** Compõe translateY (scroll) + rotateX/rotateY (ponteiro) sem que uma fonte apague a outra. */
function setPreviewTransform(
  el: HTMLElement,
  patch: Partial<{ depth: number; rx: number; ry: number }>,
) {
  const depth = patch.depth ?? parseFloat(el.dataset.depth || "0");
  const rx = patch.rx ?? parseFloat(el.dataset.rx || "0");
  const ry = patch.ry ?? parseFloat(el.dataset.ry || "0");
  el.dataset.depth = String(depth);
  el.dataset.rx = String(rx);
  el.dataset.ry = String(ry);
  el.style.transform = `translateY(${depth}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
}

function CaseCard({ item, index, onOpen }: { item: Item; index: number; onOpen: () => void }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const hoverCapableRef = useRef<boolean | null>(null);

  function hoverCapable() {
    if (hoverCapableRef.current === null) {
      hoverCapableRef.current =
        typeof window !== "undefined" &&
        window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    }
    return hoverCapableRef.current;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!hoverCapable() || !previewRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const rx = (0.5 - (e.clientY - r.top) / r.height) * 4;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
    setPreviewTransform(previewRef.current, { rx, ry });
  }

  function handlePointerLeave() {
    if (!previewRef.current) return;
    setPreviewTransform(previewRef.current, { rx: 0, ry: 0 });
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-haspopup="dialog"
      aria-label={`Ver aplicação: ${item.t}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition hover:border-primary",
        item.featured ? "sm:col-span-2 lg:col-span-6" : "lg:col-span-4",
      )}
    >
      <div
        className={cn(
          "flex flex-col overflow-hidden",
          item.featured ? "h-56" : "h-44",
          item.dark ? "bg-[#22262c]" : "bg-[var(--paper)]",
        )}
        style={{ perspective: "800px" }}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-between border-b px-4 py-2.5 font-mono text-xs",
            item.dark ? "border-white/10 text-white/60" : "border-border text-muted-foreground",
          )}
        >
          <span className="truncate">{item.visualLabel}</span>
          <i className="block h-[3px] w-5 shrink-0 rounded-full bg-primary" />
        </div>
        <div
          ref={previewRef}
          data-case-preview
          className="min-h-0 flex-1 overflow-hidden p-4 transition-transform duration-200 ease-out will-change-transform"
        >
          <item.Mock />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
          <span className="truncate">{item.category}</span>
          <span>{String(index + 1).padStart(2, "0")}</span>
        </div>
        <h3 className="mt-3 text-lg font-semibold sm:text-xl">{item.t}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{item.d}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-primary">
          Explorar aplicação
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
}

function CaseDialog({
  item,
  open,
  onOpenChange,
}: {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-[rgba(7,11,9,0.70)] backdrop-blur-[7px]"
        className="max-h-[88dvh] max-w-4xl gap-0 overflow-y-auto rounded-2xl border-border bg-[var(--paper)] p-0 text-[var(--paper-ink,inherit)]"
      >
        {item && (
          <div className="p-6 sm:p-8">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Exemplo de aplicação / {item.category}
            </span>
            <DialogTitle className="mt-2.5 text-2xl font-semibold tracking-tight sm:text-3xl">
              {item.t}
            </DialogTitle>
            <p className="mt-2.5 max-w-[64ch] text-base text-muted-foreground">{item.resultado}</p>

            <div className="mt-6 grid gap-6 border-y border-border py-6 sm:grid-cols-2">
              <CaseRow label="O desafio" text={item.desafio} />
              <CaseRow label="A solução" text={item.solucao} />
            </div>

            <div className="mt-6">
              <CaseMedia item={item} />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href={quoteRequestUrl(item.t)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Conversar sobre isso <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Compartilhado com OrbitHero.tsx: clicar num card do hero abre o case correspondente aqui.
const OPEN_CASE_EVENT = "sena:open-case";

export default function TrackRecord() {
  const [filter, setFilter] = useState<"all" | Filter>("all");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    function onOpenCase(e: Event) {
      const index = (e as CustomEvent<{ index: number }>).detail?.index;
      if (typeof index === "number") setOpenIdx(index);
    }
    window.addEventListener(OPEN_CASE_EVENT, onOpenCase);
    return () => window.removeEventListener(OPEN_CASE_EVENT, onOpenCase);
  }, []);

  // Leve parallax nos mockups dos cards conforme a página rola — um único listener
  // reposiciona todos os cards visíveis a cada frame, sem custo por card.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    function updateDepths() {
      raf = 0;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-case-preview]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const depth = Math.max(-24, Math.min(24, (r.top - vh * 0.4) * 0.06));
        setPreviewTransform(el, { depth });
      });
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(updateDepths);
    }
    updateDepths();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [filter]);

  const filtered = filter === "all" ? items : items.filter((it) => it.filter === filter);
  const active = openIdx !== null ? items[openIdx] : null;

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar aplicações">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition",
              filter === f.key
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground/60",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
        {filtered.map((item) => {
          const globalIndex = items.indexOf(item);
          return (
            <CaseCard
              key={item.t}
              item={item}
              index={globalIndex}
              onOpen={() => setOpenIdx(globalIndex)}
            />
          );
        })}
      </div>

      <CaseDialog
        item={active}
        open={openIdx !== null}
        onOpenChange={(next) => !next && setOpenIdx(null)}
      />
    </div>
  );
}
