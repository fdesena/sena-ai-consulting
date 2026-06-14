import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KeyRound, Shield, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/painel/admin/configuracoes")({
  component: AdminConfig,
});

function AdminConfig() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="max-w-2xl mx-auto space-y-6 text-zinc-100">
      <div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">Administrador</span>
        <h1 className="mt-2 text-3xl font-semibold">Configurações</h1>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-[#161616] p-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-bronze" />
          <h2 className="font-semibold">Conta do administrador</h2>
        </div>
        <div className="text-sm text-zinc-400">E-mail: <span className="text-zinc-100">{email}</span></div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-[#161616] p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="h-4 w-4 text-bronze" />
          <h2 className="font-semibold">Alterar senha</h2>
        </div>
        <form onSubmit={changePassword} className="space-y-3">
          <input type="password" minLength={6} required value={pwd} onChange={(e) => setPwd(e.target.value)}
            placeholder="Nova senha (mín. 6)" className="w-full rounded-xl border border-zinc-700 bg-[#1f1f1f] px-4 py-3 text-sm" />
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
