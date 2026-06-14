import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err: any) {
      setError(err?.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F8F7F4",
        color: "#1A1916",
        display: "grid",
        placeItems: "center",
        padding: 20,
        fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#fff",
          border: "1px solid #E2DDD6",
          borderRadius: 20,
          padding: 28,
        }}
      >
        <div style={{ fontFamily: "'Fragment Mono', monospace", fontSize: 11, letterSpacing: 1.5, color: "#C8853A", textTransform: "uppercase" }}>
          Sena Consulting · Admin
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "12px 0 20px" }}>
          {mode === "signin" ? "Entrar" : "Criar acesso"}
        </h1>

        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #E2DDD6", marginBottom: 14, fontSize: 15 }}
        />

        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Senha</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #E2DDD6", marginBottom: 18, fontSize: 15 }}
        />

        {error && (
          <div style={{ background: "#FBE9E5", color: "#A6492F", padding: "10px 12px", borderRadius: 10, fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: "#1A1916",
            color: "#F8F7F4",
            border: "none",
            borderRadius: 13,
            padding: "14px 20px",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Aguarde…" : mode === "signin" ? "Entrar" : "Criar conta"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          style={{ marginTop: 14, background: "none", border: "none", color: "#7A756D", fontSize: 13, cursor: "pointer", fontFamily: "'Fragment Mono', monospace" }}
        >
          {mode === "signin" ? "Não tem conta? Criar acesso" : "Já tem conta? Entrar"}
        </button>
      </form>
    </main>
  );
}
