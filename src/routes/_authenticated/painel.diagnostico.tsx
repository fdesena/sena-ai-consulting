import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DiagnosticoApp from "@/features/diagnostico/DiagnosticoApp";
import type { Answers, DiagnosticoReport } from "@/features/diagnostico/types";

export const Route = createFileRoute("/_authenticated/painel/diagnostico")({
  component: MeuDiagnostico,
});

type LeadRow = {
  id: string;
  nome: string | null;
  email: string | null;
  whatsapp: string | null;
  negocio: string | null;
  answers: Answers;
  report: DiagnosticoReport;
};

function MeuDiagnostico() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [existing, setExisting] = useState<LeadRow | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setLoading(false);
        return;
      }
      setUserId(u.user.id);
      setUserEmail(u.user.email ?? null);
      const { data } = await supabase
        .from("diagnostico_leads")
        .select("id, nome, email, whatsapp, negocio, answers, report")
        .eq("user_id", u.user.id)
        .not("completed_at", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setExisting((data as unknown as LeadRow) ?? null);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-muted-foreground">Carregando…</p>;
  if (!userId) return <p className="text-muted-foreground">Faça login para ver seu diagnóstico.</p>;

  return (
    <div className="-m-6 sm:-m-8">
      {existing ? (
        <DiagnosticoApp
          embedded
          authUserId={userId}
          initialLead={{
            nome: existing.nome ?? "",
            email: existing.email ?? userEmail ?? "",
            whatsapp: existing.whatsapp ?? "",
            negocio: existing.negocio ?? "",
          }}
          initialCompleted={{
            leadId: existing.id,
            answers: existing.answers,
            report: existing.report,
          }}
        />
      ) : (
        <DiagnosticoApp
          embedded
          authUserId={userId}
          initialLead={{ nome: "", email: userEmail ?? "", whatsapp: "", negocio: "" }}
        />
      )}
    </div>
  );
}
