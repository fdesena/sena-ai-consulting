import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, LineChart, ArrowUpRight, Activity, TrendingUp, Globe } from "lucide-react";

export const Route = createFileRoute("/_authenticated/painel/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const [totalLeads, setTotalLeads] = useState(0);
  const [last7, setLast7] = useState(0);
  const [avg, setAvg] = useState(0);
  const [last, setLast] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("diagnostico_respostas")
        .select("created_at, score_geral, nome, negocio, arquetipo, nivel")
        .order("created_at", { ascending: false });
      const rows = data ?? [];
      setTotalLeads(rows.length);
      const since = Date.now() - 7 * 24 * 3600 * 1000;
      setLast7(rows.filter((r: any) => new Date(r.created_at).getTime() > since).length);
      setAvg(
        rows.length
          ? Math.round(
              rows.reduce((a: number, r: any) => a + (r.score_geral ?? 0), 0) / rows.length,
            )
          : 0,
      );
      setLast(rows.slice(0, 5));
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-foreground">
      <div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
          Administrador
        </span>
        <h1 className="mt-2 text-3xl font-semibold">Visão geral</h1>
        <p className="text-sm text-muted-foreground">Resumo da operação e atividade recente.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Kpi label="Total de leads" value={String(totalLeads)} Icon={Users} />
        <Kpi label="Últimos 7 dias" value={String(last7)} Icon={Activity} />
        <Kpi label="Nota média" value={`${avg}/100`} Icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Link
          to="/painel/admin/leads"
          className="group rounded-2xl border border-border bg-card p-6 hover:border-bronze/50 transition"
        >
          <div className="h-11 w-11 rounded-xl bg-bronze/15 text-bronze grid place-items-center">
            <LineChart className="h-5 w-5" />
          </div>
          <h3 className="mt-5 text-lg font-semibold">Leads & Diagnósticos</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Dashboards completos, gráficos, tabela e exportação em Excel.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-bronze font-medium">
            Abrir <ArrowUpRight className="h-4 w-4" />
          </span>
        </Link>
        <Link
          to="/painel/admin/usuarios"
          className="group rounded-2xl border border-border bg-card p-6 hover:border-bronze/50 transition"
        >
          <div className="h-11 w-11 rounded-xl bg-bronze/15 text-bronze grid place-items-center">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="mt-5 text-lg font-semibold">Usuários</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie contas, defina papéis (admin / user) e gerencie acessos.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-bronze font-medium">
            Gerenciar <ArrowUpRight className="h-4 w-4" />
          </span>
        </Link>
        <Link
          to="/painel/admin/website"
          className="group rounded-2xl border border-border bg-card p-6 hover:border-bronze/50 transition"
        >
          <div className="h-11 w-11 rounded-xl bg-bronze/15 text-bronze grid place-items-center">
            <Globe className="h-5 w-5" />
          </div>
          <h3 className="mt-5 text-lg font-semibold">Website</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Tráfego, cliques no diagnóstico e gestão dos posts da seção Experiências internacionais.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-bronze font-medium">
            Abrir <ArrowUpRight className="h-4 w-4" />
          </span>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          Últimos leads
        </div>
        {last.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum lead ainda.</p>
        ) : (
          <ul className="divide-y divide-border">
            {last.map((r: any, i) => (
              <li key={i} className="py-2.5 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">
                    {r.nome} <span className="text-muted-foreground">· {r.negocio ?? "—"}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {new Date(r.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{r.arquetipo}</span>
                  <span className="rounded-full bg-bronze/15 text-bronze px-2 py-0.5 text-xs font-semibold">
                    {r.score_geral}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, Icon }: { label: string; value: string; Icon: any }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
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
