import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/painel/diagnostico")({
  component: MeuDiagnostico,
});

type Resp = {
  id: string;
  created_at: string;
  nome: string;
  negocio: string | null;
  arquetipo: string;
  nivel: string;
  score_geral: number;
  score_usar_ia: number;
  score_oportunidades: number;
  score_automacao: number;
  score_gente: number;
  score_dados: number;
  desafios: string[] | null;
  reflexao: string | null;
  respostas_brutas: Record<string, any> | null;
};

function MeuDiagnostico() {
  const [loading, setLoading] = useState(true);
  const [resp, setResp] = useState<Resp | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("diagnostico_respostas")
        .select("*")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setResp((data as Resp) ?? null);
      setLoading(false);
    })();
  }, []);

  // Envia os dados do diagnóstico para o relatório embutido e ajusta a altura.
  useEffect(() => {
    if (!resp) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const payload = {
      type: "diag-report",
      scores: {
        lit: resp.score_usar_ia,
        vis: resp.score_oportunidades,
        exe: resp.score_automacao,
        pes: resp.score_gente,
        dad: resp.score_dados,
        overall: resp.score_geral,
        ak: resp.arquetipo,
      },
      answers: resp.respostas_brutas ?? {},
    };

    const onMessage = (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin) return;
      if (ev.data?.type === "diag-embed-ready") {
        iframe.contentWindow?.postMessage(payload, window.location.origin);
      }
    };
    window.addEventListener("message", onMessage);

    // Caso o iframe já esteja pronto (cache), envia direto.
    try {
      iframe.contentWindow?.postMessage(payload, window.location.origin);
    } catch {}

    const syncHeight = () => {
      try {
        const h = iframe.contentDocument?.documentElement?.scrollHeight;
        if (h) iframe.style.height = h + "px";
      } catch {}
    };
    const interval = setInterval(syncHeight, 400);
    const stop = setTimeout(() => clearInterval(interval), 6000);

    return () => {
      window.removeEventListener("message", onMessage);
      clearInterval(interval);
      clearTimeout(stop);
    };
  }, [resp]);

  if (loading) return <p className="text-muted-foreground">Carregando…</p>;

  if (!resp) {
    return (
      <div className="max-w-2xl mx-auto">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
          Meu diagnóstico
        </span>
        <h1 className="mt-2 text-3xl font-semibold">Você ainda não fez o diagnóstico</h1>
        <p className="mt-3 text-muted-foreground">
          Em poucos minutos, mapeie onde IA e automação podem gerar retorno real no seu negócio. Ao
          final, você verá seu arquétipo, nível e plano de 30 dias.
        </p>
        <Link
          to="/diagnostico"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-bronze to-[#a36c2e] px-5 py-3 text-sm font-semibold text-white"
        >
          Iniciar diagnóstico <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
            Meu diagnóstico
          </span>
          <h1 className="mt-2 text-3xl font-semibold">Seu resultado</h1>
          <p className="text-sm text-muted-foreground">
            Respondido em {new Date(resp.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <Link
          to="/diagnostico"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Refazer diagnóstico
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <iframe
          ref={iframeRef}
          src="/diagnostico.html?embed=report"
          title="Seu diagnóstico completo"
          className="w-full block"
          style={{ height: 1200, border: "none" }}
        />
      </div>
    </div>
  );
}
