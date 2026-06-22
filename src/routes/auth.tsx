import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Área exclusiva Sena Consulting" },
      { name: "description", content: "Acesso à área exclusiva de clientes e parceiros da Sena Consulting." },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://senaconsulting.app/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/painel" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await supabase.rpc("claim_seed_admin");
        navigate({ to: "/painel" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/painel` },
        });
        if (error) throw error;
        if (data.session) {
          await supabase.rpc("claim_seed_admin");
          navigate({ to: "/painel" });
        } else {
          setInfo("Conta criada. Confirme o e-mail e faça login.");
          setMode("signin");
        }
      }
    } catch (err: any) {
      setError(err?.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-background text-foreground font-display grid md:grid-cols-2">
      {/* LEFT — brand panel */}
      <aside className="relative hidden md:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#1a1916] via-[#2a2620] to-[#1a1916] text-paper">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #c8853a 0%, transparent 45%), radial-gradient(circle at 80% 70%, #2d5a3d 0%, transparent 50%)",
          }}
        />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-paper/70 hover:text-paper">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </Link>
        </div>

        <div className="relative space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-paper/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-bronze">
            <Sparkles className="h-3.5 w-3.5" /> Sena Consulting
          </div>
          <h2 className="text-4xl font-semibold leading-tight">
            Área exclusiva<span className="text-bronze">.</span>
          </h2>
          <p className="text-paper/70 text-base leading-relaxed">
            O espaço dos clientes Sena. Acompanhe seu diagnóstico, o andamento
            dos seus projetos e os materiais da consultoria — tudo em um só lugar.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-6">
            {[
              { k: "Diagnóstico", v: "Seu resultado" },
              { k: "Projetos", v: "Andamento e entregas" },
              { k: "Materiais", v: "Relatórios e acessos" },
            ].map((it) => (
              <div key={it.k} className="rounded-lg border border-paper/10 bg-paper/5 p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-bronze">{it.k}</div>
                <div className="mt-1 text-xs text-paper/80">{it.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-paper/50 font-mono">
          © {new Date().getFullYear()} Sena Consulting · IA &amp; Automação
        </div>
      </aside>

      {/* RIGHT — form */}
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> Voltar ao site
            </Link>
          </div>

          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
            {mode === "signin" ? "Bem-vindo de volta" : "Criar acesso"}
          </span>
          <h1 className="mt-2 text-3xl font-semibold">
            {mode === "signin" ? "Entre no painel" : "Crie sua conta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Acesse seu diagnóstico, seus projetos e os materiais da consultoria."
              : "Crie seu acesso para acompanhar seu diagnóstico e seus projetos."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">E-mail *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-[15px] outline-none transition focus:border-bronze focus:ring-2 focus:ring-bronze/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Senha *</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 pr-11 text-[15px] outline-none transition focus:border-bronze focus:ring-2 focus:ring-bronze/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Mostrar senha"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-[#FBE9E5] border border-[#F1C7BC] text-[#A6492F] px-3 py-2.5 text-sm">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-lg bg-[#E8F0EA] border border-[#C7DBCD] text-[#2D5A3D] px-3 py-2.5 text-sm">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-bronze to-[#a36c2e] px-5 py-3.5 text-[15px] font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Aguarde…" : mode === "signin" ? "Entrar" : "Criar conta"}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setError(null);
                  setInfo(null);
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {mode === "signin" ? (
                  <>Não tem uma conta? <span className="text-bronze font-medium">Criar Conta</span></>
                ) : (
                  <>Já tem conta? <span className="text-bronze font-medium">Entrar</span></>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center text-xs text-muted-foreground font-mono">
            Uma iniciativa <span className="text-foreground font-semibold">Sena Consulting</span>
          </div>
        </div>
      </section>
    </main>
  );
}
