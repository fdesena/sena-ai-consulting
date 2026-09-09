import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart as RLineChart,
  Line,
  Legend,
} from "recharts";
import {
  Download,
  Search,
  RefreshCw,
  TrendingUp,
  Users,
  Award,
  Target,
  FileText,
  Copy,
  MessageSquare,
  Lightbulb,
  Flame,
  Check,
} from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { AREAS, areaFor } from "@/features/diagnostico/engine";
import { buildActionablePrompt, reportText } from "@/features/diagnostico/export";
import { buildLeadInsights } from "@/features/diagnostico/insights";
import type { Answers, DiagnosticoReport } from "@/features/diagnostico/types";

export const Route = createFileRoute("/_authenticated/painel/admin/leads")({
  component: AdminLeads,
});

type Row = {
  id: string;
  created_at: string;
  nome: string;
  email: string | null;
  negocio: string | null;
  whatsapp: string;
  papel: string | null;
  segmento: string | null;
  aspiracao: string | null;
  equipe: string | null;
  barreira: string | null;
  impacto: string | null;
  ferramentas: string[] | null;
  desafios: string[] | null;
  reflexao: string | null;
  score_geral: number;
  nivel: string;
  arquetipo: string;
  score_usar_ia: number;
  score_oportunidades: number;
  score_automacao: number;
  score_gente: number;
  score_dados: number;
  respostas_brutas: Record<string, any> | null;
};

function porteOf(r: Row): string {
  return (r.respostas_brutas?.porte_label as string) ?? "—";
}

/* ===================== Insights de venda (derivados do diagnóstico) ===================== */
const ATIV = [
  "Atendimento / responder mensagens",
  "Agendamento e confirmações",
  "Orçamentos e propostas",
  "Cobrança e financeiro",
  "Conteúdo e marketing",
  "Pós-venda e relacionamento",
  "Relatórios e planilhas",
  "Recrutamento e equipe",
];
const ATIV_SOL = [
  {
    sol: "um assistente de IA que responde, qualifica e encaminha no primeiro contato",
    tipo: "Automação / Chatbot",
  },
  {
    sol: "agendamento automático com confirmação e lembretes (menos faltas, zero ida e volta manual)",
    tipo: "Automação",
  },
  {
    sol: "um gerador de orçamentos e propostas com IA — da conversa ao PDF em minutos",
    tipo: "Automação / App",
  },
  { sol: "uma régua de cobrança e conciliação financeira automatizadas", tipo: "Automação" },
  {
    sol: "uma esteira de conteúdo com IA (calendário, roteiros e criativos para as redes)",
    tipo: "Conteúdo / IA",
  },
  {
    sol: "um pós-venda automatizado: follow-up, reativação e pesquisa de satisfação",
    tipo: "Automação / CRM",
  },
  {
    sol: "um dashboard que monta os relatórios sozinho a partir dos seus dados",
    tipo: "Dados / BI",
  },
  { sol: "triagem e organização de recrutamento com IA", tipo: "Automação / RH" },
];
const HORAS_MID = [3, 7, 15, 25];
const VOLUME_OPT = ["menos de 20", "20 a 100", "100 a 500", "mais de 500"];
const CANAL_OPT = [
  "WhatsApp",
  "Instagram / redes",
  "Indicação",
  "Site / Google",
  "Telefone",
  "Presencial / loja",
  "Outros",
];
const PRAZO_OPT = [
  "Urgente — o quanto antes",
  "Próximos 1 a 3 meses",
  "Sem pressa, explorando",
  "Só pesquisando",
];
const DECISOR_OPT = [
  "Decide sozinho(a)",
  "Decide com sócio(a)",
  "Decide com a equipe",
  "Precisa aprovar com outra pessoa",
];
const ARQ: Record<string, { nome: string; gap: string; venda: string; frente: string }> = {
  improviso: {
    nome: "Operador no Improviso",
    gap: "Tudo depende dele(a); sem automação o negócio não escala além do próprio tempo.",
    venda: "Consultoria para mapear o caminho + a 1ª automação de alto impacto.",
    frente: "Consultoria",
  },
  curioso: {
    nome: "Curioso sem Rumo",
    gap: "Testa muita ferramenta sem foco — esforço espalhado, pouco resultado.",
    venda: "Consultoria para focar em 1 frente e construir a rotina que gera resultado.",
    frente: "Consultoria",
  },
  travado: {
    nome: "Estrategista Travado",
    gap: "Tem a visão, mas trava na execução — a ideia não sai do papel.",
    venda: "Construção de solução: tirar o piloto do papel em poucas semanas.",
    frente: "Construção",
  },
  intuitivo: {
    nome: "Executor Intuitivo",
    gap: "Executa no instinto, sem dados — decide no escuro.",
    venda: "Construção + camada de dados/dashboard para decidir com número.",
    frente: "Construção",
  },
  pioneiro: {
    nome: "Pioneiro Local",
    gap: "Já está à frente; o salto agora é diferenciação fina, não o básico.",
    venda: "Construção avançada sob medida + parceria contínua para manter a dianteira.",
    frente: "Construção",
  },
};
const DIM_GAP: Record<string, { nome: string; venda: string }> = {
  usar_ia: {
    nome: "Usar IA no dia a dia",
    venda: "capacitação prática para a equipe destravar o uso básico",
  },
  oportunidades: {
    nome: "Enxergar oportunidades",
    venda: "consultoria de mapeamento de oportunidades de IA",
  },
  automacao: {
    nome: "Colocar pra rodar (automação)",
    venda: "construção de automações e processos",
  },
  gente: { nome: "Gente e hábito", venda: "treinamento + acompanhamento de adoção da equipe" },
  dados: { nome: "Organização e dados", venda: "organização de dados + dashboard de indicadores" },
};

function buildInsights(row: Row) {
  const rb = row.respostas_brutas ?? {};
  const num = (k: string) => (typeof rb[k] === "number" ? (rb[k] as number) : null);
  const ativArr: number[] = Array.isArray(rb.atividade)
    ? rb.atividade
    : typeof rb.atividade === "number"
      ? [rb.atividade]
      : [];
  const gargalo = ativArr.length && ativArr[0] != null ? ATIV[ativArr[0]] : null;
  const gargaloSol = ativArr.length && ativArr[0] != null ? ATIV_SOL[ativArr[0]] : null;
  const h = num("horas");
  const horasMes = h != null ? Math.round(HORAS_MID[h] * 4.3) : null;
  const cI = num("canal"),
    vI = num("volume"),
    pI = num("prazo"),
    dI = num("decisor");
  const canal = cI != null ? CANAL_OPT[cI] : null;
  const volume = vI != null ? VOLUME_OPT[vI] : null;
  const prazo = pI != null ? PRAZO_OPT[pI] : null;
  const decisor = dI != null ? DECISOR_OPT[dI] : null;
  const arq = ARQ[row.arquetipo] ?? null;

  const dims = [
    { key: "usar_ia", v: row.score_usar_ia },
    { key: "oportunidades", v: row.score_oportunidades },
    { key: "automacao", v: row.score_automacao },
    { key: "gente", v: row.score_gente },
    { key: "dados", v: row.score_dados },
  ].sort((a, b) => a.v - b.v);
  const lows = dims.slice(0, 2);

  const heat = (pI != null ? [2, 1, 0, -1][pI] : 0) + (dI != null ? [2, 1, 0, -1][dI] : 0);
  const termo =
    heat >= 3
      ? { label: "Quente", color: "#A6492F" }
      : heat >= 1
        ? { label: "Morno", color: "#C8853A" }
        : { label: "Frio", color: "#7A756D" };
  const termoReason =
    [
      prazo ? `prazo: ${prazo.toLowerCase()}` : null,
      decisor ? `decisão: ${decisor.toLowerCase()}` : null,
    ]
      .filter(Boolean)
      .join(" · ") || "sem sinais claros de prazo/decisão";

  const ops: { titulo: string; tipo: string; desc: string }[] = [];
  if (arq)
    ops.push({ titulo: `Frente principal: ${arq.frente}`, tipo: arq.frente, desc: arq.venda });
  if (gargaloSol && gargalo)
    ops.push({
      titulo: `Resolver o gargalo nº1 — ${gargalo}`,
      tipo: gargaloSol.tipo,
      desc: `Vender ${gargaloSol.sol}.`,
    });
  const lowDim = DIM_GAP[lows[0].key];
  if (lowDim)
    ops.push({
      titulo: `Atacar a área mais baixa — ${lowDim.nome} (${lows[0].v}/100)`,
      tipo: "Sob medida",
      desc: `Oferecer ${lowDim.venda}.`,
    });

  const roteiro: string[] = [];
  if (gargalo)
    roteiro.push(
      `Abra pelo gargalo nº1 — ${gargalo}${horasMes ? ` — e ancore na conta: ~${horasMes}h/mês em jogo` : ""}.`,
    );
  if (canal)
    roteiro.push(
      `Canal de clientes: ${canal}${volume ? ` · ${volume} clientes/mês` : ""} — conecte a solução a esse fluxo.`,
    );
  if (row.barreira)
    roteiro.push(`Maior barreira declarada: "${row.barreira}" — trate como a objeção principal.`);
  if (lowDim)
    roteiro.push(
      `Posicione "${lowDim.nome}" como o próximo passo de maior retorno (área mais baixa hoje).`,
    );
  if (arq) roteiro.push(`Limite do perfil: ${arq.gap}`);
  if (prazo)
    roteiro.push(
      `Feche propondo um próximo passo no horizonte que ele(a) declarou (${prazo.toLowerCase()}).`,
    );

  const nome1 = (row.nome || "").split(" ")[0];
  const mensagem = [
    `Oi ${nome1 || "tudo bem"}, aqui é o Felipe da Sena.`,
    `Vi o seu diagnóstico (${arq ? arq.nome : row.arquetipo}, nota ${row.score_geral}/100).`,
    gargalo
      ? `Pelo que você marcou, seu maior gargalo hoje é ${gargalo.toLowerCase()}${horasMes ? ` — algo como ${horasMes}h/mês` : ""}.`
      : "",
    gargaloSol
      ? `Tenho uma ideia de como ${gargaloSol.sol} pra te devolver parte desse tempo.`
      : arq
        ? `Tenho uma ideia de ${arq.venda.toLowerCase()}`
        : "",
    `Topa 30 min essa semana pra eu te mostrar o caminho? Sem compromisso.`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    termo,
    termoReason,
    ops,
    gaps: lows.map((d) => ({ nome: DIM_GAP[d.key]?.nome, v: d.v, venda: DIM_GAP[d.key]?.venda })),
    roteiro,
    mensagem,
    arq,
    gargalo,
    horasMes,
    canal,
    volume,
    prazo,
    decisor,
  };
}

function InsTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-bronze/15 text-bronze px-2 py-0.5 text-[11px] font-mono uppercase tracking-wide">
      {children}
    </span>
  );
}

function LeadInsights({ row }: { row: Row }) {
  const ins = useMemo(() => buildInsights(row), [row]);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ins.mensagem);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  const wa = row.whatsapp
    ? `https://wa.me/${row.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(ins.mensagem)}`
    : null;
  const block = "rounded-xl border border-border bg-muted p-4";
  const label =
    "font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5";

  return (
    <div className="p-5 space-y-4">
      <div className={block}>
        <div className={label}>
          <Flame className="h-3.5 w-3.5" /> Termômetro do lead
        </div>
        <div className="flex items-center gap-3">
          <span
            className="rounded-lg px-3 py-1 text-sm font-bold text-white"
            style={{ background: ins.termo.color }}
          >
            {ins.termo.label}
          </span>
          <span className="text-sm text-muted-foreground">{ins.termoReason}</span>
        </div>
      </div>

      <div className={block}>
        <div className={label}>
          <Target className="h-3.5 w-3.5" /> O que vender
        </div>
        <div className="space-y-3">
          {ins.ops.map((o, i) => (
            <div key={i} className="border-l-2 border-bronze/60 pl-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">{o.titulo}</span>
                <InsTag>{o.tipo}</InsTag>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{o.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={block}>
        <div className={label}>
          <TrendingUp className="h-3.5 w-3.5" /> Gaps a explorar
        </div>
        <div className="space-y-2">
          {ins.gaps.map((g, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-bronze whitespace-nowrap">
                {g.v}/100
              </span>
              <p className="text-sm text-foreground">
                <b>{g.nome}:</b> oportunidade de {g.venda}.
              </p>
            </div>
          ))}
          {ins.arq && (
            <p className="text-sm text-muted-foreground pt-1 border-t border-border mt-2">
              Gap do perfil <b className="text-foreground">{ins.arq.nome}</b>: {ins.arq.gap}
            </p>
          )}
        </div>
      </div>

      <div className={block}>
        <div className={label}>
          <Lightbulb className="h-3.5 w-3.5" /> Roteiro para a conversa agendada
        </div>
        <ol className="space-y-1.5 list-decimal list-inside">
          {ins.roteiro.map((r, i) => (
            <li key={i} className="text-sm text-foreground">
              {r}
            </li>
          ))}
        </ol>
      </div>

      <div className={block}>
        <div className={label}>
          <MessageSquare className="h-3.5 w-3.5" /> Mensagem sugerida
        </div>
        <p className="text-sm text-foreground bg-card rounded-lg p-3 border border-border whitespace-pre-wrap leading-relaxed">
          {ins.mensagem}
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm hover:bg-muted"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-400" /> Copiado
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copiar
              </>
            )}
          </button>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-bronze to-[#a36c2e] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-95"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Abrir no WhatsApp
            </a>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Sugestão automática a partir das respostas. Revise antes de enviar.
        </p>
      </div>
    </div>
  );
}

function ReportModal({ row, onClose }: { row: Row; onClose: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [tab, setTab] = useState<"report" | "insights">("report");
  useEffect(() => {
    function onMsg(ev: MessageEvent) {
      if (ev.origin !== window.location.origin) return;
      if ((ev.data as any)?.type !== "diag-embed-ready") return;
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: "diag-report",
          scores: {
            lit: row.score_usar_ia,
            vis: row.score_oportunidades,
            exe: row.score_automacao,
            pes: row.score_gente,
            dad: row.score_dados,
            overall: row.score_geral,
            ak: row.arquetipo,
          },
          answers: row.respostas_brutas ?? {},
        },
        window.location.origin,
      );
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [row]);
  const tabCls = (t: string) =>
    t === tab
      ? "rounded-lg px-3 py-1.5 text-sm font-semibold bg-white text-zinc-900 border border-zinc-300 shadow-sm"
      : "rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-zinc-800";
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-3xl h-[88vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-2">
            <button onClick={() => setTab("report")} className={tabCls("report")}>
              Relatório
            </button>
            <button onClick={() => setTab("insights")} className={tabCls("insights")}>
              Insights
            </button>
            <span className="text-sm text-muted-foreground ml-1 hidden sm:inline">
              — {row.nome}
            </span>
          </div>
          <div className="flex gap-2">
            {tab === "report" && (
              <button
                onClick={() => iframeRef.current?.contentWindow?.print()}
                className="rounded-lg bg-gradient-to-r from-bronze to-[#a36c2e] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-95"
              >
                Imprimir
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              Fechar
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 relative">
          <iframe
            ref={iframeRef}
            src="/diagnostico.html?embed=report"
            title="Relatório do diagnóstico"
            className={`absolute inset-0 w-full h-full border-0 ${tab === "report" ? "" : "invisible pointer-events-none"}`}
          />
          {tab === "insights" && (
            <div className="absolute inset-0 overflow-y-auto bg-card text-foreground">
              <LeadInsights row={row} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===================== Diagnóstico atual (engine novo, diagnostico_leads) ===================== */

type NewLead = {
  id: string;
  created_at: string;
  completed_at: string | null;
  nome: string | null;
  negocio: string | null;
  email: string | null;
  whatsapp: string | null;
  goal: string | null;
  priority_area: string | null;
  answers: Answers;
  report: DiagnosticoReport | null;
};

function areaLabel(key: string | null): string {
  return key ? (AREAS[key]?.label ?? key) : "—";
}

function F({ k, v }: { k: string; v: string | null }) {
  return (
    <div className="rounded-lg border border-border p-2.5">
      <div className="font-mono text-[10px] uppercase text-muted-foreground">{k}</div>
      <div className="text-sm mt-0.5">{v || "—"}</div>
    </div>
  );
}

function NewLeadDetail({ row, onClose }: { row: NewLead; onClose: () => void }) {
  const [tab, setTab] = useState<"resumo" | "completo" | "prompt" | "sugestoes">("resumo");
  const [copied, setCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const r = row.report;
  const insights = useMemo(
    () => (r ? buildLeadInsights(row.answers, r, row.nome ?? "") : null),
    [row, r],
  );
  const actionablePrompt = useMemo(
    () =>
      r
        ? buildActionablePrompt(row.answers, r, {
            nome: row.nome ?? "",
            email: row.email ?? "",
            whatsapp: row.whatsapp ?? "",
            negocio: row.negocio ?? "",
          })
        : "",
    [row, r],
  );
  const tabCls = (t: string) =>
    t === tab
      ? "rounded-lg px-3 py-1.5 text-sm font-semibold bg-bronze/15 text-bronze"
      : "rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground";

  async function copyMessage() {
    if (!insights) return;
    try {
      await navigator.clipboard.writeText(insights.contactMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(actionablePrompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 1800);
    } catch {}
  }

  async function resendEmail() {
    setEmailStatus("sending");
    try {
      const resp = await fetch("/api/public/diagnostico/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
      });
      if (!resp.ok) throw new Error(String(resp.status));
      setEmailStatus("sent");
    } catch {
      setEmailStatus("error");
    }
  }

  const wa = row.whatsapp
    ? `https://wa.me/${row.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(insights?.contactMessage ?? "")}`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card text-foreground rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-7 border border-border"
      >
        <div className="flex justify-between items-start mb-5 gap-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-bronze">
              Lead
            </span>
            <h2 className="text-2xl font-semibold mt-1">{row.nome ?? "—"}</h2>
            <p className="text-sm text-muted-foreground">
              {row.negocio ?? "—"} · {row.whatsapp ?? "—"} · {row.email ?? "—"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {!r ? (
          <p className="text-sm text-muted-foreground">
            Diagnóstico iniciado, mas ainda não concluído — sem relatório para exibir.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setTab("resumo")} className={tabCls("resumo")}>
                Resumo
              </button>
              <button onClick={() => setTab("completo")} className={tabCls("completo")}>
                Completo
              </button>
              <button onClick={() => setTab("prompt")} className={tabCls("prompt")}>
                Prompt
              </button>
              <button onClick={() => setTab("sugestoes")} className={tabCls("sugestoes")}>
                Sugestões
              </button>
            </div>

            {tab === "resumo" && (
              <div className="space-y-3 text-sm">
                <F k="Objetivo" v={r.goal} />
                <F k="Prioridade" v={areaLabel(row.priority_area)} />
                <F k="Oportunidade" v={r.offer} />
                <F k="Indicador" v={r.metric} />
                <div>
                  <div className="font-mono text-[10px] uppercase text-muted-foreground mb-1.5">
                    Plano de ação
                  </div>
                  <ul className="space-y-1.5">
                    {r.actions.map((a) => (
                      <li key={a.when} className="text-sm">
                        <b>{a.when}:</b> {a.title} — {a.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {tab === "completo" && (
              <pre className="text-xs whitespace-pre-wrap bg-muted rounded-lg p-4 border border-border">
                {reportText(row.answers, r)}
              </pre>
            )}

            {tab === "prompt" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Mesmo prompt oferecido ao lead para continuar sozinho em outra IA (ChatGPT,
                  Claude, Gemini etc.).
                </p>
                <pre className="text-xs whitespace-pre-wrap bg-muted rounded-lg p-4 border border-border">
                  {actionablePrompt}
                </pre>
                <button
                  onClick={copyPrompt}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm hover:bg-muted"
                >
                  {promptCopied ? (
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {promptCopied ? "Copiado" : "Copiar prompt"}
                </button>
              </div>
            )}

            {tab === "sugestoes" && insights && (
              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-mono text-[10px] uppercase text-muted-foreground mb-1.5">
                    Produto que conversa com esse lead
                  </div>
                  <p>{insights.productFit}</p>
                  {insights.productNote ? (
                    <p className="text-muted-foreground mt-1">{insights.productNote}</p>
                  ) : null}
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase text-muted-foreground mb-1.5">
                    Perguntas para o contato
                  </div>
                  <ol className="list-decimal list-inside space-y-1">
                    {insights.questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border">
              <button
                onClick={copyMessage}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm hover:bg-muted"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copiado" : "Copiar mensagem"}
              </button>
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-bronze to-[#a36c2e] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-95"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Abrir no WhatsApp
                </a>
              )}
              {row.email && (
                <button
                  onClick={resendEmail}
                  disabled={emailStatus === "sending"}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
                >
                  {emailStatus === "sent"
                    ? "E-mail reenviado ✓"
                    : emailStatus === "sending"
                      ? "Enviando…"
                      : emailStatus === "error"
                        ? "Falhou — tentar de novo"
                        : "Reenviar diagnóstico por e-mail"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NewDiagnosticoSection() {
  const [rows, setRows] = useState<NewLead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<NewLead | null>(null);

  async function load() {
    setError(null);
    const { data, error } = await supabase
      .from("diagnostico_leads")
      .select(
        "id, created_at, completed_at, nome, negocio, email, whatsapp, goal, priority_area, answers, report",
      )
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows((data ?? []) as unknown as NewLead[]);
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.nome, r.email, r.negocio, r.whatsapp, r.goal, areaLabel(r.priority_area)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const stats = useMemo(() => {
    if (!rows || rows.length === 0) return null;
    const completos = rows.filter((r) => r.completed_at).length;
    const count = (list: (string | null)[]) => {
      const m: Record<string, number> = {};
      list.forEach((v) => {
        if (!v) return;
        m[v] = (m[v] ?? 0) + 1;
      });
      return Object.entries(m).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    };
    return {
      total: rows.length,
      completos,
      topGoal: count(rows.map((r) => r.goal)),
      topArea: areaLabel(count(rows.map((r) => r.priority_area))),
    };
  }, [rows]);

  function exportXLSX() {
    if (!filtered.length) return;
    const sheetRows = filtered.map((r) => ({
      Data: new Date(r.created_at).toLocaleString("pt-BR"),
      Nome: r.nome ?? "",
      Email: r.email ?? "",
      WhatsApp: r.whatsapp ?? "",
      Negócio: r.negocio ?? "",
      Objetivo: r.goal ?? "",
      Prioridade: areaLabel(r.priority_area),
      Status: r.completed_at ? "Completo" : "Iniciado",
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheetRows), "Diagnóstico atual");
    XLSX.writeFile(wb, `diagnostico-atual-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  const cardBase = "rounded-2xl border border-border bg-card p-5";

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
            Administrador
          </span>
          <h1 className="mt-2 text-3xl font-semibold">Leads & Diagnósticos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Diagnóstico atual (/diagnostico) — dados de contato, resultado completo e sugestões para
            o contato.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-2.5 text-sm hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" /> Atualizar
          </button>
          <button
            onClick={exportXLSX}
            disabled={!filtered.length}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-bronze to-[#a36c2e] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Baixar Excel (.xlsx)
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-950/40 border border-red-900 text-red-300 px-3 py-2.5 text-sm">
          {error}
        </div>
      )}

      {!stats ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Nenhum lead ainda.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi label="Total de leads" value={String(stats.total)} Icon={Users} />
            <Kpi label="Diagnósticos completos" value={String(stats.completos)} Icon={TrendingUp} />
            <Kpi label="Objetivo mais comum" value={stats.topGoal} Icon={Target} />
            <Kpi label="Prioridade mais comum" value={stats.topArea} Icon={Award} />
          </div>

          <div className={cardBase}>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              Leads ({filtered.length})
            </div>
            <div className="relative mb-3">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Buscar por nome, negócio, WhatsApp, objetivo…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted pl-10 pr-4 py-2.5 text-sm outline-none focus:border-bronze text-foreground"
              />
            </div>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground font-mono border-b border-border">
                    <th className="py-2.5 px-2">Data</th>
                    <th className="py-2.5 px-2">Nome</th>
                    <th className="py-2.5 px-2">Email</th>
                    <th className="py-2.5 px-2">WhatsApp</th>
                    <th className="py-2.5 px-2">Negócio</th>
                    <th className="py-2.5 px-2">Objetivo</th>
                    <th className="py-2.5 px-2">Prioridade</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 px-2 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className="border-b border-border hover:bg-card/60 cursor-pointer"
                    >
                      <td className="py-2.5 px-2 font-mono text-[12px] text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-2.5 px-2 font-medium">{r.nome ?? "—"}</td>
                      <td className="py-2.5 px-2">{r.email ?? "—"}</td>
                      <td className="py-2.5 px-2 whitespace-nowrap">{r.whatsapp ?? "—"}</td>
                      <td className="py-2.5 px-2">{r.negocio ?? "—"}</td>
                      <td className="py-2.5 px-2">{r.goal ?? "—"}</td>
                      <td className="py-2.5 px-2">{areaLabel(r.priority_area)}</td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            r.completed_at
                              ? "bg-bronze/15 text-bronze"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {r.completed_at ? "Completo" : "Iniciado"}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(r);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs hover:bg-muted whitespace-nowrap"
                        >
                          <FileText className="h-3.5 w-3.5" /> Ver diagnóstico
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selected && <NewLeadDetail row={selected} onClose={() => setSelected(null)} />}
    </div>
  );

  function Kpi({ label, value, Icon }: { label: string; value: string; Icon: any }) {
    return (
      <div className={cardBase}>
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {label}
            </div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-bronze/15 text-bronze grid place-items-center">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }
}

const PALETTE = ["#C8853A", "#2D5A3D", "#A6492F", "#7A756D", "#D4A574", "#4A7C5A", "#3E3A33"];

function AdminLeads() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [report, setReport] = useState<Row | null>(null);

  async function load() {
    setError(null);
    const { data, error } = await supabase
      .from("diagnostico_respostas")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows((data ?? []) as Row[]);
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.nome, r.email, r.negocio, r.whatsapp, r.segmento, r.arquetipo, r.nivel, porteOf(r)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const stats = useMemo(() => {
    if (!rows || rows.length === 0) return null;
    const total = rows.length;
    const avg = Math.round(rows.reduce((a, r) => a + r.score_geral, 0) / total);
    const avgDim = {
      "Usar IA": Math.round(rows.reduce((a, r) => a + r.score_usar_ia, 0) / total),
      Oportunidades: Math.round(rows.reduce((a, r) => a + r.score_oportunidades, 0) / total),
      Automação: Math.round(rows.reduce((a, r) => a + r.score_automacao, 0) / total),
      Gente: Math.round(rows.reduce((a, r) => a + r.score_gente, 0) / total),
      Dados: Math.round(rows.reduce((a, r) => a + r.score_dados, 0) / total),
    };
    const byArq: Record<string, number> = {};
    const bySeg: Record<string, number> = {};
    const byNivel: Record<string, number> = {};
    const byChal: Record<string, number> = {};
    rows.forEach((r) => {
      byArq[r.arquetipo] = (byArq[r.arquetipo] ?? 0) + 1;
      bySeg[r.segmento ?? "—"] = (bySeg[r.segmento ?? "—"] ?? 0) + 1;
      byNivel[r.nivel] = (byNivel[r.nivel] ?? 0) + 1;
      (r.desafios ?? []).forEach((d) => {
        byChal[d] = (byChal[d] ?? 0) + 1;
      });
    });
    const sorted = (o: Record<string, number>) =>
      Object.entries(o)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }));
    const byDay: Record<string, number> = {};
    rows.forEach((r) => {
      const d = new Date(r.created_at).toISOString().slice(0, 10);
      byDay[d] = (byDay[d] ?? 0) + 1;
    });
    const series = Object.entries(byDay)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .slice(-30)
      .map(([date, count]) => ({ date: date.slice(5), respostas: count }));
    return {
      total,
      avg,
      avgDim,
      arqList: sorted(byArq),
      segList: sorted(bySeg),
      chalList: sorted(byChal).slice(0, 8),
      nivelList: sorted(byNivel),
      series,
    };
  }, [rows]);

  function exportXLSX() {
    if (!filtered.length) return;
    const sheetRows = filtered.map((r) => ({
      Data: new Date(r.created_at).toLocaleString("pt-BR"),
      Nome: r.nome,
      Email: r.email ?? "",
      Telefone: r.whatsapp,
      Porte: porteOf(r),
      Negócio: r.negocio ?? "",
      Papel: r.papel ?? "",
      Segmento: r.segmento ?? "",
      Aspiração: r.aspiracao ?? "",
      Equipe: r.equipe ?? "",
      Barreira: r.barreira ?? "",
      Impacto: r.impacto ?? "",
      "Nota Geral": r.score_geral,
      Nível: r.nivel,
      Arquétipo: r.arquetipo,
      "Score Usar IA": r.score_usar_ia,
      "Score Oportunidades": r.score_oportunidades,
      "Score Automação": r.score_automacao,
      "Score Gente": r.score_gente,
      "Score Dados": r.score_dados,
      Ferramentas: (r.ferramentas ?? []).join("; "),
      Desafios: (r.desafios ?? []).join("; "),
      Reflexão: r.reflexao ?? "",
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheetRows), "Diagnósticos");
    if (stats) {
      const resumo = [
        { Métrica: "Total de respostas", Valor: stats.total },
        { Métrica: "Nota média geral", Valor: stats.avg },
        ...Object.entries(stats.avgDim).map(([k, v]) => ({ Métrica: `Média — ${k}`, Valor: v })),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumo), "Resumo");
    }
    XLSX.writeFile(wb, `diagnosticos-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  const tipStyle: React.CSSProperties = {
    background: "#161616",
    border: "1px solid #3f3f46",
    borderRadius: 10,
    fontSize: 12,
    color: "#fafafa",
  };
  const cardBase = "rounded-2xl border border-border bg-card p-5";

  return (
    <div className="max-w-7xl mx-auto space-y-10 text-foreground">
      <NewDiagnosticoSection />

      <div className="border-t border-border pt-8 space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Histórico
            </span>
            <h1 className="mt-2 text-2xl font-semibold">Diagnóstico anterior (score/arquétipo)</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Versão anterior do diagnóstico (respostas já registradas antes da migração). Todas as
              respostas, KPIs, gráficos e exportação.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-2.5 text-sm hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" /> Atualizar
            </button>
            <button
              onClick={exportXLSX}
              disabled={!filtered.length}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-bronze to-[#a36c2e] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Baixar Excel (.xlsx)
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-950/40 border border-red-900 text-red-300 px-3 py-2.5 text-sm">
            {error}
          </div>
        )}

        {!stats ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Nenhuma resposta ainda.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Kpi label="Total de respostas" value={String(stats.total)} Icon={Users} />
              <Kpi label="Nota média geral" value={`${stats.avg}/100`} Icon={TrendingUp} />
              <Kpi label="Arquétipo top" value={stats.arqList[0]?.name ?? "—"} Icon={Award} />
              <Kpi label="Segmento top" value={stats.segList[0]?.name ?? "—"} Icon={Target} />
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              <DCard title="Respostas ao longo do tempo" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={260}>
                  <RLineChart data={stats.series} margin={{ left: -10, right: 10, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={tipStyle} />
                    <Line
                      type="monotone"
                      dataKey="respostas"
                      stroke="#C8853A"
                      strokeWidth={2.5}
                      dot={{ fill: "#C8853A", r: 3 }}
                    />
                  </RLineChart>
                </ResponsiveContainer>
              </DCard>
              <DCard title="Por nível">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={stats.nivelList}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {stats.nivelList.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
                  </PieChart>
                </ResponsiveContainer>
              </DCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <DCard title="Score médio por dimensão">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={Object.entries(stats.avgDim).map(([name, value]) => ({ name, value }))}
                    margin={{ left: -10, right: 10, top: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={tipStyle} />
                    <Bar dataKey="value" fill="#2D5A3D" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </DCard>
              <DCard title="Distribuição por arquétipo">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={stats.arqList} layout="vertical" margin={{ left: 30, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis type="number" stroke="#71717a" fontSize={11} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#71717a"
                      fontSize={11}
                      width={120}
                    />
                    <Tooltip contentStyle={tipStyle} />
                    <Bar dataKey="value" fill="#C8853A" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </DCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <DCard title="Desafios mais marcados">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={stats.chalList}
                    layout="vertical"
                    margin={{ left: 30, right: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis type="number" stroke="#71717a" fontSize={11} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#71717a"
                      fontSize={11}
                      width={170}
                    />
                    <Tooltip contentStyle={tipStyle} />
                    <Bar dataKey="value" fill="#fafafa" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </DCard>
              <DCard title="Por segmento">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={stats.segList.slice(0, 8)}
                    layout="vertical"
                    margin={{ left: 30, right: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis type="number" stroke="#71717a" fontSize={11} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#71717a"
                      fontSize={11}
                      width={120}
                    />
                    <Tooltip contentStyle={tipStyle} />
                    <Bar dataKey="value" fill="#A6492F" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </DCard>
            </div>

            <DCard title={`Leads (${filtered.length})`}>
              <div className="relative mb-3">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Buscar por nome, negócio, WhatsApp, segmento…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted pl-10 pr-4 py-2.5 text-sm outline-none focus:border-bronze text-foreground"
                />
              </div>
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground font-mono border-b border-border">
                      <th className="py-2.5 px-2">Data</th>
                      <th className="py-2.5 px-2">Nome</th>
                      <th className="py-2.5 px-2">Email</th>
                      <th className="py-2.5 px-2">Telefone</th>
                      <th className="py-2.5 px-2">Porte</th>
                      <th className="py-2.5 px-2">Negócio</th>
                      <th className="py-2.5 px-2">Segmento</th>
                      <th className="py-2.5 px-2">Nota</th>
                      <th className="py-2.5 px-2">Nível</th>
                      <th className="py-2.5 px-2">Arquétipo</th>
                      <th className="py-2.5 px-2 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelected(r)}
                        className="border-b border-border hover:bg-card/60 cursor-pointer"
                      >
                        <td className="py-2.5 px-2 font-mono text-[12px] text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-2.5 px-2 font-medium">{r.nome}</td>
                        <td className="py-2.5 px-2 text-foreground">{r.email ?? "—"}</td>
                        <td className="py-2.5 px-2 text-foreground whitespace-nowrap">
                          {r.whatsapp || "—"}
                        </td>
                        <td className="py-2.5 px-2">{porteOf(r)}</td>
                        <td className="py-2.5 px-2">{r.negocio ?? "—"}</td>
                        <td className="py-2.5 px-2">{r.segmento ?? "—"}</td>
                        <td className="py-2.5 px-2">
                          <span className="inline-flex items-center rounded-full bg-bronze/15 text-bronze px-2 py-0.5 text-xs font-semibold">
                            {r.score_geral}
                          </span>
                        </td>
                        <td className="py-2.5 px-2">{r.nivel}</td>
                        <td className="py-2.5 px-2">{r.arquetipo}</td>
                        <td className="py-2.5 px-2 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReport(r);
                            }}
                            title="Ver relatório final"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs hover:bg-muted whitespace-nowrap"
                          >
                            <FileText className="h-3.5 w-3.5" /> Ver relatório
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DCard>
          </>
        )}

        {report && <ReportModal row={report} onClose={() => setReport(null)} />}

        {selected && (
          <div
            className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-card text-foreground rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-7 border border-border"
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-bronze">
                    Lead
                  </span>
                  <h2 className="text-2xl font-semibold mt-1">{selected.nome}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selected.negocio} · {selected.whatsapp}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-muted-foreground hover:text-foreground text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <F k="Segmento" v={selected.segmento} />
                <F k="Papel" v={selected.papel} />
                <F k="Equipe" v={selected.equipe} />
                <F k="Aspiração" v={selected.aspiracao} />
                <F k="Barreira" v={selected.barreira} />
                <F k="Impacto" v={selected.impacto} />
                <F k="Nota geral" v={`${selected.score_geral}/100`} />
                <F k="Nível" v={selected.nivel} />
                <F k="Arquétipo" v={selected.arquetipo} />
              </div>
              <div className="mt-5 grid grid-cols-5 gap-2">
                {[
                  ["Usar IA", selected.score_usar_ia],
                  ["Oport.", selected.score_oportunidades],
                  ["Autom.", selected.score_automacao],
                  ["Gente", selected.score_gente],
                  ["Dados", selected.score_dados],
                ].map(([k, v]) => (
                  <div
                    key={k as string}
                    className="rounded-lg border border-border p-2.5 text-center"
                  >
                    <div className="font-mono text-[10px] uppercase text-muted-foreground">{k}</div>
                    <div className="text-lg font-semibold text-bronze">{v as number}</div>
                  </div>
                ))}
              </div>
              {selected.desafios && selected.desafios.length > 0 && (
                <div className="mt-5">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                    Desafios
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.desafios.map((d) => (
                      <span key={d} className="text-xs bg-muted px-2 py-1 rounded">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selected.reflexao && (
                <div className="mt-4">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                    Reflexão
                  </div>
                  <p className="text-sm">{selected.reflexao}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function Kpi({ label, value, Icon }: { label: string; value: string; Icon: any }) {
    return (
      <div className={cardBase}>
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {label}
            </div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-bronze/15 text-bronze grid place-items-center">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }
  function DCard({
    title,
    children,
    className = "",
  }: {
    title: string;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <div className={`${cardBase} ${className}`}>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          {title}
        </div>
        {children}
      </div>
    );
  }
  function F({ k, v }: { k: string; v: string | null }) {
    return (
      <div className="rounded-lg border border-border p-2.5">
        <div className="font-mono text-[10px] uppercase text-muted-foreground">{k}</div>
        <div className="text-sm mt-0.5">{v || "—"}</div>
      </div>
    );
  }
}
