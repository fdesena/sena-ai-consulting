import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
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

const C = {
  bg: "#F8F7F4",
  surface: "#fff",
  border: "#E2DDD6",
  ink: "#1A1916",
  dim: "#7A756D",
  muted: "#B0AA9F",
  accent: "#C8853A",
  accentSoft: "#F3E7D6",
  green: "#2D5A3D",
  red: "#A6492F",
};

const FONT = "'Bricolage Grotesque', system-ui, sans-serif";
const MONO = "'Fragment Mono', 'SF Mono', Consolas, monospace";

function AdminPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Row>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Row | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      setEmail(userData.user?.email ?? "");
      if (!uid) {
        navigate({ to: "/auth" });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      const admin = (roles ?? []).some((r: any) => r.role === "admin");
      setIsAdmin(admin);
      if (!admin) return;

      const { data, error } = await supabase
        .from("diagnostico_respostas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) setError(error.message);
      else setRows((data ?? []) as Row[]);
    })();
  }, [navigate]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    const f = q
      ? rows.filter((r) =>
          [r.nome, r.negocio, r.whatsapp, r.segmento, r.arquetipo, r.nivel]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q)),
        )
      : rows;
    const sorted = [...f].sort((a, b) => {
      const va = a[sortKey] as any;
      const vb = b[sortKey] as any;
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [rows, search, sortKey, sortDir]);

  const summary = useMemo(() => {
    if (!rows || rows.length === 0) return null;
    const total = rows.length;
    const avg = Math.round(rows.reduce((a, r) => a + r.score_geral, 0) / total);
    const byArq: Record<string, number> = {};
    const bySeg: Record<string, number> = {};
    const byChal: Record<string, number> = {};
    rows.forEach((r) => {
      byArq[r.arquetipo] = (byArq[r.arquetipo] ?? 0) + 1;
      const s = r.segmento ?? "—";
      bySeg[s] = (bySeg[s] ?? 0) + 1;
      (r.desafios ?? []).forEach((d) => {
        byChal[d] = (byChal[d] ?? 0) + 1;
      });
    });
    const top = (o: Record<string, number>) =>
      Object.entries(o)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    return { total, avg, byArq: top(byArq), bySeg: top(bySeg), byChal: top(byChal) };
  }, [rows]);

  function toggleSort(k: keyof Row) {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  }

  function exportCSV() {
    if (!filtered.length) return;
    const cols: (keyof Row)[] = [
      "created_at", "nome", "negocio", "whatsapp", "papel", "segmento",
      "aspiracao", "equipe", "barreira", "impacto", "score_geral", "nivel", "arquetipo",
      "score_usar_ia", "score_oportunidades", "score_automacao", "score_gente", "score_dados",
      "ferramentas", "desafios", "reflexao",
    ];
    const esc = (v: any) => {
      if (v == null) return "";
      const s = Array.isArray(v) ? v.join("; ") : String(v);
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = cols.join(",");
    const body = filtered.map((r) => cols.map((c) => esc((r as any)[c])).join(",")).join("\n");
    const csv = "\uFEFF" + header + "\n" + body;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagnosticos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (isAdmin === null) {
    return <Shell><p style={{ color: C.dim }}>Carregando…</p></Shell>;
  }

  if (!isAdmin) {
    return (
      <Shell>
        <div style={card()}>
          <span style={label()}>Acesso restrito</span>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "12px 0 8px" }}>
            Você está logado, mas ainda não tem papel de admin
          </h1>
          <p style={{ color: C.dim, fontSize: 15, marginBottom: 14 }}>
            Logado como <b>{email}</b>. Para liberar este painel, peça ao Felipe
            que execute no banco:
          </p>
          <pre style={{ background: "#FBFAF8", border: `1px solid ${C.border}`, padding: 14, borderRadius: 12, fontSize: 12, overflow: "auto", fontFamily: MONO }}>
{`INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = '${email || "voce@exemplo.com"}';`}
          </pre>
          <button onClick={signOut} style={btnAlt()}>Sair</button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <div>
          <span style={label()}>Painel · Bússola Digital & IA</span>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "6px 0 0" }}>Respostas</h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.dim }}>{email}</span>
          <button onClick={signOut} style={btnAlt()}>Sair</button>
        </div>
      </div>

      {error && <div style={{ background: "#FBE9E5", color: C.red, padding: 12, borderRadius: 10, marginBottom: 14 }}>{error}</div>}

      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 18 }}>
          <KPI k="Total de respostas" v={String(summary.total)} />
          <KPI k="Nota média geral" v={`${summary.avg}/100`} />
          <KPI k="Arquétipo mais comum" v={summary.byArq[0]?.[0] ?? "—"} />
          <KPI k="Segmento mais comum" v={summary.bySeg[0]?.[0] ?? "—"} />
        </div>
      )}

      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 18 }}>
          <BreakBox title="Por arquétipo" items={summary.byArq} total={summary.total} />
          <BreakBox title="Por segmento" items={summary.bySeg} total={summary.total} />
          <BreakBox title="Desafios mais marcados" items={summary.byChal} total={summary.total} />
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <input
          placeholder="Buscar por nome, negócio, WhatsApp, segmento…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 220, padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 14, background: C.surface, fontFamily: FONT }}
        />
        <button onClick={exportCSV} style={btn()}>Exportar CSV</button>
      </div>

      <div style={{ overflowX: "auto", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#FBFAF8" }}>
              {([
                ["created_at", "Data"],
                ["nome", "Nome"],
                ["negocio", "Negócio"],
                ["whatsapp", "WhatsApp"],
                ["segmento", "Segmento"],
                ["score_geral", "Nota"],
                ["nivel", "Nível"],
                ["arquetipo", "Arquétipo"],
              ] as [keyof Row, string][]).map(([k, lbl]) => (
                <th
                  key={k}
                  onClick={() => toggleSort(k)}
                  style={{ textAlign: "left", padding: "12px 14px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", fontFamily: MONO, fontSize: 11, textTransform: "uppercase", color: C.muted, letterSpacing: 0.5, whiteSpace: "nowrap" }}
                >
                  {lbl} {sortKey === k ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} onClick={() => setSelected(r)} style={{ cursor: "pointer", borderBottom: `1px solid ${C.border}` }}>
                <td style={cell()}>{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                <td style={cell()}><b>{r.nome}</b></td>
                <td style={cell()}>{r.negocio ?? "—"}</td>
                <td style={{ ...cell(), fontFamily: MONO }}>{r.whatsapp}</td>
                <td style={cell()}>{r.segmento ?? "—"}</td>
                <td style={{ ...cell(), fontFamily: MONO, color: C.accent, fontWeight: 700 }}>{r.score_geral}</td>
                <td style={cell()}>{r.nivel}</td>
                <td style={cell()}>{r.arquetipo}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={8} style={{ padding: 28, textAlign: "center", color: C.dim }}>Nenhuma resposta ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "grid", placeItems: "center", padding: 20, zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: 18, maxWidth: 640, width: "100%", maxHeight: "85vh", overflow: "auto", padding: 24 }}>
            <span style={label()}>Detalhes</span>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "8px 0 4px" }}>{selected.nome}</h2>
            <p style={{ color: C.dim, fontSize: 14, marginBottom: 16 }}>{selected.negocio ?? "—"} · {selected.segmento ?? "—"}</p>

            <Grid>
              <Field k="WhatsApp" v={selected.whatsapp} mono />
              <Field k="Data" v={new Date(selected.created_at).toLocaleString("pt-BR")} />
              <Field k="Nota geral" v={`${selected.score_geral}/100`} mono accent />
              <Field k="Nível" v={selected.nivel} />
              <Field k="Arquétipo" v={selected.arquetipo} />
              <Field k="Papel" v={selected.papel ?? "—"} />
              <Field k="Aspiração" v={selected.aspiracao ?? "—"} />
              <Field k="Equipe" v={selected.equipe ?? "—"} />
              <Field k="Barreira" v={selected.barreira ?? "—"} />
              <Field k="Impacto" v={selected.impacto ?? "—"} />
            </Grid>

            <h3 style={subH()}>Notas por dimensão</h3>
            <Grid>
              <Field k="Usar IA" v={String(selected.score_usar_ia)} mono />
              <Field k="Oportunidades" v={String(selected.score_oportunidades)} mono />
              <Field k="Automação" v={String(selected.score_automacao)} mono />
              <Field k="Gente" v={String(selected.score_gente)} mono />
              <Field k="Dados" v={String(selected.score_dados)} mono />
            </Grid>

            <h3 style={subH()}>Ferramentas</h3>
            <p style={{ fontSize: 14, color: C.dim }}>{(selected.ferramentas ?? []).join(", ") || "—"}</p>

            <h3 style={subH()}>Desafios</h3>
            <ul style={{ paddingLeft: 18, color: C.dim, fontSize: 14 }}>
              {(selected.desafios ?? []).map((d) => <li key={d}>{d}</li>)}
              {!(selected.desafios ?? []).length && <li>—</li>}
            </ul>

            <h3 style={subH()}>Reflexão</h3>
            <p style={{ fontSize: 14, color: C.dim, whiteSpace: "pre-wrap" }}>{selected.reflexao ?? "—"}</p>

            <button onClick={() => setSelected(null)} style={{ ...btn(), marginTop: 18 }}>Fechar</button>
          </div>
        </div>
      )}
    </Shell>
  );
}

/* ---------------- helpers ---------------- */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: FONT, padding: "24px 18px 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>{children}</div>
    </main>
  );
}
function KPI({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.muted }}>{k}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{v}</div>
    </div>
  );
}
function BreakBox({ title, items, total }: { title: string; items: [string, number][]; total: number }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.accent, marginBottom: 10 }}>{title}</div>
      {items.length === 0 && <div style={{ color: C.dim, fontSize: 13 }}>—</div>}
      {items.map(([k, n]) => {
        const pct = Math.round((n / total) * 100);
        return (
          <div key={k} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
              <span style={{ color: C.ink, fontWeight: 500 }}>{k}</span>
              <span style={{ fontFamily: MONO, color: C.dim }}>{n} · {pct}%</span>
            </div>
            <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: C.accent }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>{children}</div>;
}
function Field({ k, v, mono, accent }: { k: string; v: string; mono?: boolean; accent?: boolean }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", background: "#FBFAF8" }}>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.muted }}>{k}</div>
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2, fontFamily: mono ? MONO : FONT, color: accent ? C.accent : C.ink }}>{v}</div>
    </div>
  );
}
const card = (): React.CSSProperties => ({ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 24 });
const label = (): React.CSSProperties => ({ fontFamily: MONO, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.accent });
const cell = (): React.CSSProperties => ({ padding: "11px 14px", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" });
const subH = (): React.CSSProperties => ({ fontSize: 13, fontFamily: MONO, color: C.dim, textTransform: "uppercase", letterSpacing: 1, margin: "18px 0 8px" });
const btn = (): React.CSSProperties => ({ background: C.ink, color: C.bg, border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT });
const btnAlt = (): React.CSSProperties => ({ background: "transparent", color: C.ink, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontFamily: FONT });
