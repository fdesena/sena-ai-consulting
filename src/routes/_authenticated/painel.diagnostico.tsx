import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { Download, Search, RefreshCw, TrendingUp, Users, Award, Target } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/painel/diagnostico")({
  component: DiagnosticoDashboard,
});

type Row = {
  id: string;
  created_at: string;
  nome: string;
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
};

const PALETTE = ["#C8853A", "#2D5A3D", "#1A1916", "#A6492F", "#7A756D", "#D4A574", "#4A7C5A", "#3E3A33"];

function DiagnosticoDashboard() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [email, setEmail] = useState("");

  async function load() {
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    setEmail(userData.user?.email ?? "");
    if (!uid) return;
    try { await supabase.rpc("claim_seed_admin"); } catch {}
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    const admin = (roles ?? []).some((r: any) => r.role === "admin");
    setIsAdmin(admin);
    if (!admin) return;
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
      [r.nome, r.negocio, r.whatsapp, r.segmento, r.arquetipo, r.nivel]
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
      "Oportunidades": Math.round(rows.reduce((a, r) => a + r.score_oportunidades, 0) / total),
      "Automação": Math.round(rows.reduce((a, r) => a + r.score_automacao, 0) / total),
      "Gente": Math.round(rows.reduce((a, r) => a + r.score_gente, 0) / total),
      "Dados": Math.round(rows.reduce((a, r) => a + r.score_dados, 0) / total),
    };
    const byArq: Record<string, number> = {};
    const bySeg: Record<string, number> = {};
    const byNivel: Record<string, number> = {};
    const byChal: Record<string, number> = {};
    rows.forEach((r) => {
      byArq[r.arquetipo] = (byArq[r.arquetipo] ?? 0) + 1;
      bySeg[r.segmento ?? "—"] = (bySeg[r.segmento ?? "—"] ?? 0) + 1;
      byNivel[r.nivel] = (byNivel[r.nivel] ?? 0) + 1;
      (r.desafios ?? []).forEach((d) => { byChal[d] = (byChal[d] ?? 0) + 1; });
    });
    const sorted = (o: Record<string, number>) =>
      Object.entries(o).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

    // Time series by day (last 30 days observed)
    const byDay: Record<string, number> = {};
    rows.forEach((r) => {
      const d = new Date(r.created_at).toISOString().slice(0, 10);
      byDay[d] = (byDay[d] ?? 0) + 1;
    });
    const series = Object.entries(byDay)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .slice(-30)
      .map(([date, count]) => ({
        date: date.slice(5),
        respostas: count,
      }));

    const arqList = sorted(byArq);
    const segList = sorted(bySeg);
    const chalList = sorted(byChal).slice(0, 8);
    const nivelList = sorted(byNivel);

    return { total, avg, avgDim, arqList, segList, chalList, nivelList, series };
  }, [rows]);

  function exportXLSX() {
    if (!filtered.length) return;
    const sheetRows = filtered.map((r) => ({
      "Data": new Date(r.created_at).toLocaleString("pt-BR"),
      "Nome": r.nome,
      "Negócio": r.negocio ?? "",
      "WhatsApp": r.whatsapp,
      "Papel": r.papel ?? "",
      "Segmento": r.segmento ?? "",
      "Aspiração": r.aspiracao ?? "",
      "Equipe": r.equipe ?? "",
      "Barreira": r.barreira ?? "",
      "Impacto": r.impacto ?? "",
      "Nota Geral": r.score_geral,
      "Nível": r.nivel,
      "Arquétipo": r.arquetipo,
      "Score Usar IA": r.score_usar_ia,
      "Score Oportunidades": r.score_oportunidades,
      "Score Automação": r.score_automacao,
      "Score Gente": r.score_gente,
      "Score Dados": r.score_dados,
      "Ferramentas": (r.ferramentas ?? []).join("; "),
      "Desafios": (r.desafios ?? []).join("; "),
      "Reflexão": r.reflexao ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(sheetRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Diagnósticos");
    // Resumo
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

  if (isAdmin === null) {
    return <p className="text-muted-foreground">Carregando…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl">
        <span className="font-mono text-[11px] uppercase tracking-widest text-bronze">Acesso restrito</span>
        <h1 className="mt-2 text-2xl font-semibold">Você não tem permissão de admin</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Logado como <b>{email}</b>. Apenas usuários admin acessam o diagnóstico.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
            Bússola Digital &amp; IA
          </span>
          <h1 className="mt-2 text-3xl font-semibold">Diagnóstico — Painel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe leads, scores e oportunidades em tempo real.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm hover:bg-muted"
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
        <div className="rounded-lg bg-[#FBE9E5] border border-[#F1C7BC] text-[#A6492F] px-3 py-2.5 text-sm">
          {error}
        </div>
      )}

      {!stats ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Nenhuma resposta de diagnóstico ainda.
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI label="Total de respostas" value={String(stats.total)} Icon={Users} />
            <KPI label="Nota média geral" value={`${stats.avg}/100`} Icon={TrendingUp} />
            <KPI label="Arquétipo top" value={stats.arqList[0]?.name ?? "—"} Icon={Award} />
            <KPI label="Segmento top" value={stats.segList[0]?.name ?? "—"} Icon={Target} />
          </div>

          {/* Charts row 1 */}
          <div className="grid lg:grid-cols-3 gap-5">
            <Card title="Respostas ao longo do tempo" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={260}>
                <RLineChart data={stats.series} margin={{ left: -10, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,22,0.08)" />
                  <XAxis dataKey="date" stroke="#7A756D" fontSize={11} />
                  <YAxis stroke="#7A756D" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={tipStyle} />
                  <Line type="monotone" dataKey="respostas" stroke="#C8853A" strokeWidth={2.5} dot={{ fill: "#C8853A", r: 3 }} />
                </RLineChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Por nível">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats.nivelList} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {stats.nivelList.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Charts row 2 */}
          <div className="grid lg:grid-cols-2 gap-5">
            <Card title="Score médio por dimensão">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={Object.entries(stats.avgDim).map(([name, value]) => ({ name, value }))}
                  margin={{ left: -10, right: 10, top: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,22,0.08)" />
                  <XAxis dataKey="name" stroke="#7A756D" fontSize={11} />
                  <YAxis stroke="#7A756D" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={tipStyle} />
                  <Bar dataKey="value" fill="#2D5A3D" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Distribuição por arquétipo">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.arqList} layout="vertical" margin={{ left: 30, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,22,0.08)" />
                  <XAxis type="number" stroke="#7A756D" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#7A756D" fontSize={11} width={120} />
                  <Tooltip contentStyle={tipStyle} />
                  <Bar dataKey="value" fill="#C8853A" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <Card title="Desafios mais marcados">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.chalList} layout="vertical" margin={{ left: 30, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,22,0.08)" />
                  <XAxis type="number" stroke="#7A756D" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#7A756D" fontSize={11} width={170} />
                  <Tooltip contentStyle={tipStyle} />
                  <Bar dataKey="value" fill="#1A1916" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Por segmento">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.segList.slice(0, 8)} layout="vertical" margin={{ left: 30, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,22,0.08)" />
                  <XAxis type="number" stroke="#7A756D" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#7A756D" fontSize={11} width={120} />
                  <Tooltip contentStyle={tipStyle} />
                  <Bar dataKey="value" fill="#A6492F" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Leads table */}
          <Card title={`Leads (${filtered.length})`}>
            <div className="relative mb-3">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Buscar por nome, negócio, WhatsApp, segmento…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm outline-none focus:border-bronze"
              />
            </div>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground font-mono border-b border-border">
                    <th className="py-2.5 px-2">Data</th>
                    <th className="py-2.5 px-2">Nome</th>
                    <th className="py-2.5 px-2">Negócio</th>
                    <th className="py-2.5 px-2">Segmento</th>
                    <th className="py-2.5 px-2">Nota</th>
                    <th className="py-2.5 px-2">Nível</th>
                    <th className="py-2.5 px-2">Arquétipo</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className="border-b border-border/60 hover:bg-muted/50 cursor-pointer"
                    >
                      <td className="py-2.5 px-2 font-mono text-[12px] text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-2.5 px-2 font-medium">{r.nome}</td>
                      <td className="py-2.5 px-2">{r.negocio ?? "—"}</td>
                      <td className="py-2.5 px-2">{r.segmento ?? "—"}</td>
                      <td className="py-2.5 px-2">
                        <span className="inline-flex items-center rounded-full bg-bronze/10 text-bronze px-2 py-0.5 text-xs font-semibold">
                          {r.score_geral}
                        </span>
                      </td>
                      <td className="py-2.5 px-2">{r.nivel}</td>
                      <td className="py-2.5 px-2">{r.arquetipo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Detail drawer */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-7 border border-border"
          >
            <div className="flex justify-between items-start mb-5">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-widest text-bronze">Lead</span>
                <h2 className="text-2xl font-semibold mt-1">{selected.nome}</h2>
                <p className="text-sm text-muted-foreground">{selected.negocio} · {selected.whatsapp}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field k="Segmento" v={selected.segmento} />
              <Field k="Papel" v={selected.papel} />
              <Field k="Equipe" v={selected.equipe} />
              <Field k="Aspiração" v={selected.aspiracao} />
              <Field k="Barreira" v={selected.barreira} />
              <Field k="Impacto" v={selected.impacto} />
              <Field k="Nota geral" v={`${selected.score_geral}/100`} />
              <Field k="Nível" v={selected.nivel} />
              <Field k="Arquétipo" v={selected.arquetipo} />
            </div>
            <div className="mt-5 grid grid-cols-5 gap-2">
              {[
                ["Usar IA", selected.score_usar_ia],
                ["Oport.", selected.score_oportunidades],
                ["Autom.", selected.score_automacao],
                ["Gente", selected.score_gente],
                ["Dados", selected.score_dados],
              ].map(([k, v]) => (
                <div key={k as string} className="rounded-lg border border-border p-2.5 text-center">
                  <div className="font-mono text-[10px] uppercase text-muted-foreground">{k}</div>
                  <div className="text-lg font-semibold text-bronze">{v as number}</div>
                </div>
              ))}
            </div>
            {selected.desafios && selected.desafios.length > 0 && (
              <div className="mt-5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Desafios</div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.desafios.map((d) => (
                    <span key={d} className="text-xs bg-muted px-2 py-1 rounded">{d}</span>
                  ))}
                </div>
              </div>
            )}
            {selected.reflexao && (
              <div className="mt-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Reflexão</div>
                <p className="text-sm">{selected.reflexao}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const tipStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E2DDD6",
  borderRadius: 10,
  fontSize: 12,
};

function KPI({ label, value, Icon }: { label: string; value: string; Icon: any }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
        </div>
        <div className="h-9 w-9 rounded-lg bg-bronze/10 text-bronze grid place-items-center">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-surface p-5 ${className}`}>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ k, v }: { k: string; v: string | null }) {
  return (
    <div className="rounded-lg border border-border p-2.5">
      <div className="font-mono text-[10px] uppercase text-muted-foreground">{k}</div>
      <div className="text-sm mt-0.5">{v || "—"}</div>
    </div>
  );
}
