import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import senaLogoHorizontalDark from "@/assets/brand/sena-labs-horizontal-dark.svg";
import FinishFlag from "@/components/FinishFlag";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Área exclusiva Sena Labs" },
      {
        name: "description",
        content: "Acesso à área exclusiva de clientes e parceiros da Sena Labs.",
      },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.senalabs.tech/auth" }],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "recover";

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");
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
      if (mode === "recover") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        setInfo("Enviamos um link de recuperação para o seu e-mail.");
      } else if (mode === "signin") {
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

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  return (
    <main className="grid min-h-screen w-full bg-[var(--paper)] text-[var(--paper-ink,var(--ink))] md:grid-cols-2">
      {/* LEFT — brand story panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[var(--ink)] p-12 text-[var(--paper)] md:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: "radial-gradient(ellipse at 15% 100%, #fc7c3419, transparent 65%)",
          }}
        />
        <div className="relative">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </Link>
        </div>

        <div className="relative max-w-md space-y-6">
          <img src={senaLogoHorizontalDark} alt="Sena Labs" className="h-9 w-auto" />
          <span className="block font-mono text-sm uppercase tracking-[0.08em] text-primary">
            Sena Labs / Área exclusiva
          </span>
          <h2 className="max-w-[13ch] text-4xl font-semibold leading-tight sm:text-5xl">
            Mais foco no que <span className="text-[#ffb081]">faz você avançar.</span>
          </h2>
          <p className="max-w-[36ch] text-base leading-relaxed text-white/60">
            Estratégia, inteligência artificial e software sob medida. Do primeiro passo à próxima
            conquista.
          </p>
        </div>

        <div className="relative flex items-center gap-6 font-mono text-sm text-white/60">
          <span>CLAREZA → AÇÃO</span>
          <span className="h-px flex-1 bg-gradient-to-r from-primary to-transparent" />
          <FinishFlag />
        </div>
      </aside>

      {/* RIGHT — form */}
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[405px]">
          <div className="mb-8 md:hidden">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> Voltar ao site
            </Link>
          </div>

          <span className="font-mono text-sm uppercase tracking-[0.08em] text-primary">
            {mode === "recover"
              ? "Recuperar acesso"
              : mode === "signin"
                ? "Bem-vindo de volta"
                : "Criar acesso"}
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {mode === "recover"
              ? "Recuperar senha."
              : mode === "signin"
                ? "Acesse sua conta."
                : "Crie sua conta."}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "recover"
              ? "Enviaremos um link para redefinir sua senha."
              : mode === "signin"
                ? "Entre para continuar na sua área exclusiva."
                : "Crie seu acesso para acompanhar seu diagnóstico e seus projetos."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@empresa.com.br"
                autoComplete="email"
                className="w-full rounded-md border border-border bg-card px-4 py-3 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {mode !== "recover" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">Senha</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    className="w-full rounded-md border border-border bg-card px-4 py-3 pr-20 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    aria-pressed={showPwd}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {showPwd ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>
            )}

            {mode === "signin" && (
              <button
                type="button"
                onClick={() => switchMode("recover")}
                className="block w-full py-1 text-right text-sm text-muted-foreground underline hover:text-foreground"
              >
                Esqueci minha senha
              </button>
            )}

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm text-[#9e3d07]">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-[15px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loading
                ? "Aguarde…"
                : mode === "recover"
                  ? "Enviar link de recuperação"
                  : mode === "signin"
                    ? "Entrar"
                    : "Criar conta"}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>

            <div className="pt-2 text-center">
              {mode === "recover" ? (
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Voltar para entrar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {mode === "signin" ? (
                    <>
                      Não tem uma conta?{" "}
                      <span className="font-medium text-primary">Criar conta</span>
                    </>
                  ) : (
                    <>
                      Já tem conta? <span className="font-medium text-primary">Entrar</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          <p className="mt-10 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
            Uma iniciativa <span className="font-semibold text-foreground">Sena Labs</span>.
          </p>
        </div>
      </section>
    </main>
  );
}
