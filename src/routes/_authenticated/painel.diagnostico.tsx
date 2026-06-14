import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Award, Sparkles, Target, TrendingUp } from "lucide-react";

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
};

function MeuDiagnostico() {
  const [loading, setLoading] = useState(true);
  const [resp, setResp] = useState<Resp | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setLoading(false); return; }
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

  if (loading) return <p className="text-muted-foreground">Carregando…</p>;

  if (!resp) {
    return (
      <div className="max-w-2xl mx-auto">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">Meu diagnóstico</span>
        <h1 className="mt-2 text-3xl font-semibold">Você ainda não fez o diagnóstico</h1>
        <p className="mt-3 text-muted-foreground">
          Em poucos minutos, mapeie onde IA e automação podem gerar retorno real no seu
          negócio. Ao final, você verá seu arquétipo, nível e plano de 30 dias.
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

  const dims = [
    ["Usar IA", resp.score_usar_ia],
    ["Oportunidades", resp.score_oportunidades],
    ["Automação", resp.score_automacao],
    ["Gente", resp.score_gente],
    ["Dados", resp.score_dados],
  ] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">Meu diagnóstico</span>
        <h1 className="mt-2 text-3xl font-semibold">Seu resultado</h1>
        <p className="text-sm text-muted-foreground">
          Respondido em {new Date(resp.created_at).toLocaleDateString("pt-BR")}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <KPI label="Nota geral" value={`${resp.score_geral}/100`} Icon={TrendingUp} />
        <KPI label="Nível" value={resp.nivel} Icon={Award} />
        <KPI label="Arquétipo" value={resp.arquetipo} Icon={Target} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
          Notas por dimensão
        </div>
        <div className="space-y-3">
          {dims.map(([label, v]) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{label}</span>
                <span className="font-semibold text-bronze">{v}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-bronze to-[#a36c2e]" style={{ width: `${v}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {resp.desafios && resp.desafios.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
            Seus principais desafios
          </div>
          <div className="flex flex-wrap gap-2">
            {resp.desafios.map((d) => (
              <span key={d} className="text-xs bg-muted px-2.5 py-1 rounded">{d}</span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-bronze/30 bg-bronze/5 p-6 flex items-start gap-4">
        <Sparkles className="h-5 w-5 text-bronze flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold">Quer evoluir esses números?</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Refaça o diagnóstico após aplicar as ações sugeridas e acompanhe sua evolução.
          </p>
          <Link to="/diagnostico" className="mt-3 inline-flex items-center gap-1.5 text-sm text-bronze font-medium">
            Refazer diagnóstico <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, Icon }: { label: string; value: string; Icon: any }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="mt-2 text-xl font-semibold">{value}</div>
        </div>
        <div className="h-9 w-9 rounded-lg bg-bronze/10 text-bronze grid place-items-center">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
