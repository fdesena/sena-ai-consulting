import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KeyRound, Shield, Check, Sun, Moon, Palette } from "lucide-react";
import { useAdminTheme } from "@/lib/admin-theme";

export const Route = createFileRoute("/_authenticated/painel/admin/configuracoes")({
  component: AdminConfig,
});

function AdminConfig() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useAdminTheme();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null); setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (error) setErr(error.message);
    else { setMsg("Senha atualizada."); setPwd(""); }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-foreground">
      <div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">Administrador</span>
        <h1 className="mt-2 text-3xl font-semibold">Configurações</h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="h-4 w-4 text-bronze" />
          <h2 className="font-semibold">Aparência do painel</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Escolha o tema do painel administrativo. A preferência fica salva neste navegador.</p>
        <div className="inline-flex rounded-xl border border-border bg-muted p-1">
          <button
            onClick={() => setTheme("light")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${theme === "light" ? "bg-bronze text-white" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Sun className="h-4 w-4" /> Claro
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${theme === "dark" ? "bg-bronze text-white" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Moon className="h-4 w-4" /> Escuro
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-bronze" />
          <h2 className="font-semibold">Conta do administrador</h2>
        </div>
        <div className="text-sm text-muted-foreground">E-mail: <span className="text-foreground">{email}</span></div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="h-4 w-4 text-bronze" />
          <h2 className="font-semibold">Alterar senha</h2>
        </div>
        <form onSubmit={changePassword} className="space-y-3">
          <input type="password" minLength={6} required value={pwd} onChange={(e) => setPwd(e.target.value)}
            placeholder="Nova senha (mín. 6)" className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm" />
          {err && <p className="text-sm text-red-300">{err}</p>}
          {msg && <p className="text-sm text-emerald-300 inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> {msg}</p>}
          <button disabled={loading} className="rounded-xl bg-gradient-to-r from-bronze to-[#a36c2e] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? "Salvando…" : "Salvar"}
          </button>
        </form>
      </div>
    </div>
  );
}
