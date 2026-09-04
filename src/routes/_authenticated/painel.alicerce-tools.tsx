import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wrench, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/painel/alicerce-tools")({
  component: AlicerceToolsPage,
});

function AlicerceToolsPage() {
  const navigate = useNavigate();
  // null = verificando, true/false = resultado
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) {
        setAllowed(false);
        return;
      }

      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      if ((roles ?? []).some((r: any) => r.role === "admin")) {
        setAllowed(true);
        return;
      }

      const { data: access } = await supabase
        .from("user_app_access")
        .select("app_slug")
        .eq("user_id", uid)
        .eq("app_slug", "alicerce_tools")
        .maybeSingle();
      setAllowed(!!access);
    })();
  }, []);

  if (allowed === null) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (!allowed) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 text-foreground">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-muted">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você ainda não tem acesso ao Alicerce Tools. Fale com a equipe Sena Consulting para
          liberar este app.
        </p>
        <button
          onClick={() => navigate({ to: "/painel" })}
          className="mt-6 rounded-xl bg-gradient-to-r from-bronze to-[#a36c2e] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  return <AlicerceToolsApp />;
}

function AlicerceToolsApp() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-start gap-4">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-bronze/10 text-bronze grid place-items-center">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
            Sena Consulting Apps
          </span>
          <h1 className="mt-1 text-3xl font-semibold">Alicerce Tools</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            Ferramentas do Alicerce em um só lugar.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-7">
        <div className="h-11 w-11 rounded-xl bg-muted text-muted-foreground grid place-items-center">
          <Sparkles className="h-5 w-5" />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-muted-foreground">Em construção</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          As ferramentas deste app ainda estão sendo definidas.
        </p>
      </div>
    </div>
  );
}
