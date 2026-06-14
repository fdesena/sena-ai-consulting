import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, KeyRound, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/painel/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
      setCreatedAt(data.user?.created_at ?? "");
    });
  }, []);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null); setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (error) setErr(error.message);
    else { setMsg("Senha atualizada com sucesso."); setPwd(""); }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">Perfil</span>
        <h1 className="mt-2 text-3xl font-semibold">Minha conta</h1>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-bronze/10 text-bronze grid place-items-center">
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">{email}</div>
            <div className="text-xs text-muted-foreground">
              Conta criada em {createdAt ? new Date(createdAt).toLocaleDateString("pt-BR") : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="h-4 w-4 text-bronze" />
          <h2 className="font-semibold">Alterar senha</h2>
        </div>
        <form onSubmit={changePassword} className="space-y-3">
          <input
            type="password"
            minLength={6}
            required
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Nova senha (mín. 6 caracteres)"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-bronze"
          />
          {err && <p className="text-sm text-[#A6492F]">{err}</p>}
          {msg && <p className="text-sm text-[#2D5A3D] inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> {msg}</p>}
          <button
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-bronze to-[#a36c2e] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Salvando…" : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
