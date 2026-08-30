import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ArrowLeft, Download, Loader2, Trash2, Users } from "lucide-react";
import { getTemplateWithQuestions, hostDeleteSession, hostListSessions } from "@/lib/quiz/db";
import { exportSessionResultsXLSX } from "@/lib/quiz/export";
import { pickLocale, type QuizSessionRow, type QuizTemplate } from "@/lib/quiz/types";

export const Route = createFileRoute("/_authenticated/painel/quiz/templates/$templateId/sessoes")({
  component: SessionsHistoryPage,
});

const STATUS_LABEL: Record<string, string> = {
  lobby: "Na sala de espera",
  in_progress: "Em andamento",
  revealed: "Encerrado",
  completed: "Encerrado",
};

function SessionsHistoryPage() {
  const { templateId } = useParams({
    from: "/_authenticated/painel/quiz/templates/$templateId/sessoes",
  });
  const [template, setTemplate] = useState<QuizTemplate | null>(null);
  const [sessions, setSessions] = useState<QuizSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [{ template }, list] = await Promise.all([
          getTemplateWithQuestions(templateId),
          hostListSessions(templateId),
        ]);
        setTemplate(template);
        setSessions(list);
      } catch (e: any) {
        toast.error("Erro ao carregar sessões", { description: e.message });
      } finally {
        setLoading(false);
      }
    })();
  }, [templateId]);

  async function derrubar(session: QuizSessionRow) {
    if (
      !confirm(
        `Tem certeza que quer derrubar a sessão PIN ${session.pin}? Essa ação não pode ser desfeita.`,
      )
    )
      return;
    setDeletingId(session.id);
    try {
      await hostDeleteSession(session.id);
      setSessions((s) => s.filter((x) => x.id !== session.id));
    } catch (e: any) {
      toast.error("Erro ao derrubar a sessão", { description: e.message });
    } finally {
      setDeletingId(null);
    }
  }

  async function exportar(session: QuizSessionRow) {
    setExportingId(session.id);
    try {
      const label = new Date(session.created_at).toLocaleString("pt-BR");
      await exportSessionResultsXLSX(session.id, label, templateId);
    } catch (e: any) {
      toast.error("Erro ao exportar", { description: e.message });
    } finally {
      setExportingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Toaster />
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/painel/quiz"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-bronze"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      <div className="mb-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
          Sessões
        </span>
        <h1 className="text-2xl font-semibold">
          {template ? pickLocale(template.title, "pt") || "Sem título" : "Carregando…"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Histórico de sessões deste template — baixe as respostas de cada uma em Excel.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
          <p className="text-muted-foreground">Nenhuma sessão iniciada ainda para este template.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5"
            >
              <div className="min-w-0">
                <p className="font-medium">{new Date(s.created_at).toLocaleString("pt-BR")}</p>
                <p className="mt-0.5 flex items-center gap-3 text-sm text-muted-foreground">
                  <span>PIN {s.pin}</span>
                  <span>{STATUS_LABEL[s.status] ?? s.status}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {(s.status === "in_progress" || s.status === "lobby") && (
                  <>
                    <Link
                      to="/painel/quiz/sessao/$sessionId"
                      params={{ sessionId: s.id }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-4 py-2 text-sm font-medium hover:border-foreground/40"
                    >
                      <Users className="h-3.5 w-3.5" />
                      Abrir sessão
                    </Link>
                    <button
                      onClick={() => derrubar(s)}
                      disabled={deletingId === s.id}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive disabled:opacity-50"
                      title="Derrubar sessão"
                    >
                      {deletingId === s.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </>
                )}
                <button
                  onClick={() => exportar(s)}
                  disabled={exportingId === s.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-bronze px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {exportingId === s.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Excel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
