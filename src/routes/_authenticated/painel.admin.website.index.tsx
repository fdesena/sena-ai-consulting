import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, MousePointerClick, FileCheck2, Users, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/painel/admin/website/")({
  component: TrafficPage,
});

type EventRow = {
  id: string;
  event: string;
  path: string | null;
  referrer: string | null;
  session_id: string | null;
  user_id: string | null;
  created_at: string;
  meta: any;
};

function TrafficPage() {
  const [days, setDays] = useState(7);
  const [rows, setRows] = useState<EventRow[]>([]);
  const [leadCount, setLeadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
      const [{ data: events }, { count }] = await Promise.all([
        supabase.from("page_events").select("*").gte("created_at", since).order("created_at", { ascending: false }).limit(5000),
        supabase.from("diagnostico_respostas").select("id", { count: "exact", head: true }).gte("created_at", since),
      ]);
      setRows((events as any) ?? []);
      setLeadCount(count ?? 0);
      setLoading(false);
    })();
  }, [days]);

  const stats = useMemo(() => {
    const pv = rows.filter((r) => r.event === "pageview");
    const clicks = rows.filter((r) => r.event === "click_diagnostico_cta");
    const sessions = new Set(rows.map((r) => r.session_id).filter(Boolean));
    return {
      pageviews: pv.length,
      uniqueVisitors: sessions.size,
      ctaClicks: clicks.length,
      conversionRate: sessions.size ? Math.round((clicks.length / sessions.size) * 100) : 0,
    };
  }, [rows]);

  const byPath = useMemo(() => {
    const m = new Map<string, number>();
    rows.filter((r) => r.event === "pageview").forEach((r) => {
      const p = r.path || "/";
      m.set(p, (m.get(p) ?? 0) + 1);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [rows]);

  const bySource = useMemo(() => {
    const m = new Map<string, number>();
    rows.filter((r) => r.event === "pageview").forEach((r) => {
      let src = "Direto";
      if (r.referrer) {
        try { src = new URL(r.referrer).hostname.replace(/^www\./, ""); } catch { src = r.referrer; }
      }
      m.set(src, (m.get(src) ?? 0) + 1);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [rows]);

  const ctaSources = useMemo(() => {
    const m = new Map<string, number>();
    rows.filter((r) => r.event === "click_diagnostico_cta").forEach((r) => {
      const s = (r.meta?.source as string) || "outro";
      m.set(s, (m.get(s) ?? 0) + 1);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const exportCsv = () => {
    const header = "data,evento,caminho,referrer,sessao,meta\n";
    const body = rows.map((r) =>
      [r.created_at, r.event, r.path ?? "", r.referrer ?? "", r.session_id ?? "", JSON.stringify(r.meta ?? {})]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `trafego-${days}d.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-full bg-card border border-border p-1">
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)} className={`px-3 py-1.5 text-xs rounded-full ${days === d ? "bg-bronze text-black font-semibold" : "text-muted-foreground"}`}>
              {d}d
            </button>
          ))}
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs hover:border-bronze">
          <Download className="h-3.5 w-3.5" /> Exportar CSV
        </button>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Kpi label="Pageviews" value={String(stats.pageviews)} Icon={Eye} />
        <Kpi label="Visitantes únicos" value={String(stats.uniqueVisitors)} Icon={Users} />
        <Kpi label="Cliques no diagnóstico" value={String(stats.ctaClicks)} Icon={MousePointerClick} />
        <Kpi label="Diagnósticos concluídos" value={String(leadCount)} Icon={FileCheck2} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Conversão</div>
        <p className="text-sm text-foreground">
          De cada 100 visitantes, <span className="text-bronze font-semibold">{stats.conversionRate}</span> clicaram em "Realizar diagnóstico".
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Breakdown title="Páginas mais vistas" rows={byPath} loading={loading} />
        <Breakdown title="Origem do tráfego" rows={bySource} loading={loading} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Cliques no CTA por origem</div>
        {ctaSources.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum clique registrado no período.</p>
        ) : (
          <ul className="divide-y divide-border">
            {ctaSources.map(([k, v]) => (
              <li key={k} className="py-2 flex justify-between text-sm"><span className="text-foreground">{k}</span><span className="text-bronze font-semibold">{v}</span></li>
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
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
        </div>
        <div className="h-9 w-9 rounded-lg bg-bronze/15 text-bronze grid place-items-center">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function Breakdown({ title, rows, loading }: { title: string; rows: [string, number][]; loading: boolean }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">{title}</div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map(([k, v]) => (
            <li key={k}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-foreground truncate max-w-[70%]">{k}</span>
                <span className="text-bronze font-semibold">{v}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-bronze rounded-full" style={{ width: `${(v / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
