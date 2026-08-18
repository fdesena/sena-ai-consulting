import { createFileRoute, Link } from "@tanstack/react-router";
import { Disc3, Timer, FileText, Gamepad2, ArrowRight } from "lucide-react";
import { ToolShell } from "@/components/ferramentas/ToolShell";

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
  name: string;
  description: string;
  Icon: typeof Disc3;
  to?: string;
  href?: string;
};

const GERAIS: Tool[] = [
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
];

function ToolCard({ tool }: { tool: Tool }) {
  const inner = (
    <>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <tool.Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold">{tool.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
      </div>
      <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </>
  );

  const cls =
    "group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 transition hover:border-primary/50 hover:shadow-sm";

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
    <ToolShell
      back={false}
      eyebrow="Ferramentas Sena Consulting"
      title="Ferramentas"
      description="Utilitários que uso no dia a dia com clientes, liberados para você usar direto do navegador. Nada é enviado para servidores — tudo roda na sua máquina."
    >
      <section>
        <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Uso geral
        </h2>
        <div className="grid gap-4">
          {GERAIS.map((t) => (
            <ToolCard key={t.name} tool={t} />
          ))}
        </div>
      </section>

      <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
        Precisa de uma ferramenta sob medida para a sua operação?{" "}
        <a
          href="https://calendar.app.google/oh4NeMRMtw8v5UP5A"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
        >
          Fale comigo
        </a>
        .
      </div>
    </ToolShell>
  );
}
