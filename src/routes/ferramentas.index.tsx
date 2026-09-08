import { createFileRoute, Link } from "@tanstack/react-router";
import { Disc3, Timer, FileText, Gamepad2, ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

export const Route = createFileRoute("/ferramentas/")({
  head: () => ({
    meta: [
      { title: "Ferramentas — Sena Consulting" },
      {
        name: "description",
        content:
          "Ferramentas gratuitas da Sena Consulting: roleta de sorteio, temporizador para eventos e gerador de documentos em lote.",
      },
      { property: "og:title", content: "Ferramentas — Sena Consulting" },
      { property: "og:url", content: "https://senaconsulting.app/ferramentas" },
    ],
    links: [{ rel: "canonical", href: "https://senaconsulting.app/ferramentas" }],
  }),
  component: FerramentasIndex,
});

type Tool = {
  label: string;
  name: string;
  description: string;
  meta: string;
  Icon: typeof Disc3;
  to?: string;
  href?: string;
};

const TOOLS: Tool[] = [
  {
    label: "01 / Eventos",
    name: "Roleta de Sorteio",
    description: "Sorteio interativo com roda giratória — nomes, prêmios e brindes em eventos.",
    meta: "Roda no navegador · Sem cadastro",
    Icon: Disc3,
    to: "/ferramentas/roleta",
  },
  {
    label: "02 / Produtividade",
    name: "Temporizador",
    description: "Cronômetro regressivo em tela cheia, com música de fundo e presets de tempo.",
    meta: "Roda no navegador · Sem cadastro",
    Icon: Timer,
    to: "/ferramentas/temporizador",
  },
  {
    label: "03 / Automação",
    name: "Gerador de Documentos",
    description:
      "Gere crachás, certificados e cartas em lote a partir de um modelo e de uma planilha.",
    meta: "Processamento local · Sem cadastro",
    Icon: FileText,
    href: "/ferramentas/gerador-de-documentos.html",
  },
  {
    label: "04 / Treinamento",
    name: "Quiz ao Vivo",
    description:
      "Quiz multiplayer em tempo real, estilo Kahoot — entre com o PIN e jogue com sua equipe.",
    meta: "Tempo real · Entrada por PIN",
    Icon: Gamepad2,
    to: "/quiz",
  },
];

function ToolCard({ tool }: { tool: Tool }) {
  const inner = (
    <>
      <div className="flex h-13 w-13 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-[#ffb081]">
        <tool.Icon className="h-6 w-6" strokeWidth={1.4} />
      </div>
      <span className="mt-11 font-mono text-xs uppercase tracking-[0.08em] text-white/50">
        {tool.label}
      </span>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight">{tool.name}</h2>
      <p className="mt-4 text-white/60">{tool.description}</p>
      <span className="mt-auto flex w-full items-center justify-between gap-2 rounded-md border border-white/20 px-5 py-3.5 pt-6 text-sm font-medium text-white transition group-hover:border-primary/60">
        Experimentar <ArrowRight className="h-4 w-4" />
      </span>
      <div className="mt-6 w-full border-t border-white/10 pt-4 font-mono text-xs text-white/40">
        {tool.meta}
      </div>
    </>
  );

  const cls =
    "group flex flex-col items-start rounded-xl border border-white/15 bg-[#202226] p-7 text-left transition duration-300 hover:-translate-y-1 hover:border-primary/50";

  return tool.to ? (
    <Link to={tool.to} className={cls}>
      {inner}
    </Link>
  ) : (
    <a href={tool.href} className={cls}>
      {inner}
    </a>
  );
}

function FerramentasIndex() {
  return (
    <div className="min-h-screen bg-[#191b1e] text-[var(--paper)]">
      <SiteHeader />

      <section className="border-b border-white/10 bg-[var(--ink)] pb-14 pt-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-6 flex items-center gap-3 text-sm text-white/50">
            <Link to="/" className="hover:text-primary">
              Início
            </Link>
            <span aria-hidden="true">/</span>
            <span>Ferramentas</span>
          </div>
          <span className="font-mono text-sm uppercase tracking-[0.08em] text-primary">
            Sena Labs / Ferramentas
          </span>
          <h1 className="mt-4 max-w-[17ch] text-4xl font-semibold leading-[1.04] tracking-tight sm:text-6xl">
            Menos esforço.
            <br />
            Mais espaço para criar.
          </h1>
          <p className="mt-5 max-w-[48ch] text-lg text-white/60">
            Utilitários que uso no dia a dia com clientes, liberados para você usar direto do
            navegador. Nada é enviado para servidores — tudo roda na sua máquina.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool) => (
              <ToolCard key={tool.name} tool={tool} />
            ))}
          </div>

          <div className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-white/15 pt-10 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-2xl font-semibold">Seu desafio pede algo específico?</h3>
              <p className="mt-2 text-white/60">
                Vamos entender o processo e desenhar o próximo passo.
              </p>
            </div>
            <a
              href="https://calendar.app.google/oh4NeMRMtw8v5UP5A"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Conversar sobre meu negócio <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[var(--ink)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-white/50">
          <span>© {new Date().getFullYear()} Sena Labs · Felipe Sena</span>
          <Link to="/" className="hover:text-primary">
            senaconsulting.app
          </Link>
        </div>
      </footer>
    </div>
  );
}
