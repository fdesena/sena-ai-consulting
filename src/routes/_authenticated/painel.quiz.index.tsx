import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gamepad2, Lock, Plus, Play, Trash2, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  createSession,
  createTemplate,
  deleteTemplate,
  listMyTemplates,
} from "@/lib/quiz/db";
import { pickLocale, type QuizTemplate } from "@/lib/quiz/types";

export const Route = createFileRoute("/_authenticated/painel/quiz/")({
  component: QuizIndexPage,
});

function QuizIndexPage() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [templates, setTemplates] = useState<QuizTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [startingId, setStartingId] = useState<string | null>(null);

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
        .eq("app_slug", "quiz")
        .maybeSingle();
      setAllowed(!!access);
    })();
  }, []);

  useEffect(() => {
    if (allowed !== true) return;
    (async () => {
      setLoading(true);
      try {
        setTemplates(await listMyTemplates());
      } catch (e: any) {
        toast.error("Erro ao carregar templates", { description: e.message });
      } finally {
        setLoading(false);
      }
    })();
  }, [allowed]);

  async function novoTemplate() {
    setCreating(true);
    try {
      const t = await createTemplate();
      navigate({ to: "/painel/quiz/templates/$templateId", params: { templateId: t.id } });
    } catch (e: any) {
      toast.error("Erro ao criar template", { description: e.message });
    } finally {
      setCreating(false);
    }
  }

  async function iniciarSessao(templateId: string) {
    setStartingId(templateId);
    try {
      const session = await createSession(templateId, "pt");
      navigate({ to: "/painel/quiz/sessao/$sessionId", params: { sessionId: session.id } });
    } catch (e: any) {
      toast.error("Erro ao iniciar sessão", { description: e.message });
    } finally {
      setStartingId(null);
    }
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este template e todas as perguntas? Essa ação não pode ser desfeita.")) return;
    try {
      await deleteTemplate(id);
      setTemplates((t) => t.filter((x) => x.id !== id));
    } catch (e: any) {
      toast.error("Erro ao excluir", { description: e.message });
    }
  }

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
          Você ainda não tem acesso ao Quiz ao Vivo. Fale com a equipe Sena Consulting para
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

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster />
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-bronze/10 text-bronze grid place-items-center">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
              Sena Consulting Apps
            </span>
            <h1 className="text-2xl font-semibold">Quiz ao Vivo</h1>
          </div>
        </div>
        <button
          onClick={novoTemplate}
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Novo template
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando templates…</p>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
          <p className="text-muted-foreground">
            Nenhum template ainda. Crie o primeiro para montar as perguntas do seu quiz.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5"
            >
              <div className="min-w-0">
                <p className="font-medium">{pickLocale(t.title, "pt") || "Sem título"}</p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {pickLocale(t.description, "pt") || "Sem descrição"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to="/painel/quiz/templates/$templateId"
                  params={{ templateId: t.id }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-4 py-2 text-sm font-medium hover:border-foreground/40"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Link>
                <button
                  onClick={() => iniciarSessao(t.id)}
                  disabled={startingId === t.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-bronze px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {startingId === t.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Iniciar sessão
                </button>
                <button
                  onClick={() => excluir(t.id)}
                  className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
