import { createFileRoute, Link } from "@tanstack/react-router";
import { LineChart, Sparkles, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/painel/")({
  component: PainelHome,
});

function PainelHome() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
          Painel Sena Consulting
        </span>
        <h1 className="mt-2 text-4xl font-semibold">
          Bem-vindo de volta<span className="text-bronze">.</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          Escolha um módulo para começar. Aqui você acompanha leads, diagnósticos
          e oportunidades geradas pelo seu site.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Link
          to="/painel/diagnostico"
          className="group rounded-2xl border border-border bg-surface p-7 hover:border-bronze/50 transition"
        >
          <div className="h-11 w-11 rounded-xl bg-bronze/10 text-bronze grid place-items-center">
            <LineChart className="h-5 w-5" />
          </div>
          <h3 className="mt-5 text-xl font-semibold">Diagnóstico</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            KPIs, gráficos e exportação em Excel das respostas do diagnóstico
            Bússola Digital &amp; IA.
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-bronze font-medium">
            Acessar dashboard
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </Link>

        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-7">
          <div className="h-11 w-11 rounded-xl bg-muted text-muted-foreground grid place-items-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-muted-foreground">Em breve</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Novos módulos serão liberados conforme expandimos a operação interna.
          </p>
        </div>
      </div>
    </div>
  );
}
