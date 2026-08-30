import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import {
  createOption,
  createQuestion,
  deleteOption,
  deleteQuestion,
  getTemplateWithQuestions,
  updateOption,
  updateQuestion,
  updateTemplate,
} from "@/lib/quiz/db";
import { I18nField } from "@/components/quiz/I18nField";
import {
  emptyI18n,
  QUESTION_KIND_LABEL,
  type I18nText,
  type QuestionKind,
  type QuizOption,
  type QuizQuestion,
  type QuizTemplate,
} from "@/lib/quiz/types";

export const Route = createFileRoute("/_authenticated/painel/quiz/templates/$templateId")({
  component: TemplateEditorPage,
});

function TemplateEditorPage() {
  const { templateId } = useParams({ from: "/_authenticated/painel/quiz/templates/$templateId" });
  const [template, setTemplate] = useState<QuizTemplate | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { template, questions } = await getTemplateWithQuestions(templateId);
        setTemplate(template);
        setQuestions(questions);
      } catch (e: any) {
        toast.error("Erro ao carregar template", { description: e.message });
      } finally {
        setLoading(false);
      }
    })();
  }, [templateId]);

  async function salvarTemplate(field: "title" | "description", value: I18nText) {
    if (!template) return;
    setTemplate({ ...template, [field]: value });
    try {
      await updateTemplate(template.id, { [field]: value });
    } catch (e: any) {
      toast.error("Erro ao salvar", { description: e.message });
    }
  }

  async function addQuestion() {
    try {
      const q = await createQuestion(templateId, questions.length);
      setQuestions((qs) => [...qs, q]);
    } catch (e: any) {
      toast.error("Erro ao criar pergunta", { description: e.message });
    }
  }

  async function removeQuestion(id: string) {
    if (!confirm("Excluir esta pergunta?")) return;
    try {
      await deleteQuestion(id);
      setQuestions((qs) => qs.filter((q) => q.id !== id));
    } catch (e: any) {
      toast.error("Erro ao excluir", { description: e.message });
    }
  }

  async function moveQuestion(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= questions.length) return;
    const reordered = [...questions];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setQuestions(reordered);
    try {
      await Promise.all(reordered.map((q, i) => updateQuestion(q.id, { position: i })));
    } catch (e: any) {
      toast.error("Erro ao reordenar", { description: e.message });
    }
  }

  function patchQuestionLocal(id: string, patch: Partial<QuizQuestion>) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }
  if (!template) {
    return <p className="text-sm text-destructive">Template não encontrado.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Toaster />
      <Link
        to="/painel/quiz"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-bronze"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar aos templates
      </Link>

      <div className="mb-8 rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Título do quiz
        </h2>
        <I18nField
          value={template.title}
          onChange={(v) => salvarTemplate("title", v)}
          placeholder="Título"
        />
        <h2 className="mb-3 mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Descrição
        </h2>
        <I18nField
          value={template.description}
          onChange={(v) => salvarTemplate("description", v)}
          placeholder="Descrição"
          multiline
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Perguntas — {questions.length}
        </h2>
        <button
          onClick={addQuestion}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Adicionar pergunta
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            index={i}
            total={questions.length}
            question={q}
            onLocalPatch={(patch) => patchQuestionLocal(q.id, patch)}
            onRemove={() => removeQuestion(q.id)}
            onMove={(dir) => moveQuestion(i, dir)}
          />
        ))}
        {questions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center text-sm text-muted-foreground">
            Nenhuma pergunta ainda.
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  total,
  onLocalPatch,
  onRemove,
  onMove,
}: {
  question: QuizQuestion;
  index: number;
  total: number;
  onLocalPatch: (patch: Partial<QuizQuestion>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const options = question.options ?? [];

  async function salvar(patch: Partial<QuizQuestion>) {
    onLocalPatch(patch);
    try {
      await updateQuestion(question.id, patch as any);
    } catch (e: any) {
      toast.error("Erro ao salvar pergunta", { description: e.message });
    }
  }

  async function mudarTipo(kind: QuestionKind) {
    // Estatística nunca pontua — não tem certo/errado, só coleta a distribuição.
    const patch: Partial<QuizQuestion> = kind === "survey" ? { kind, points: 0 } : { kind };
    onLocalPatch(patch);
    try {
      await updateQuestion(question.id, patch as any);
    } catch (e: any) {
      toast.error("Erro ao mudar o tipo", { description: e.message });
      return;
    }
    // Verdadeiro/Falso sempre tem exatamente essas duas opções.
    if (kind === "true_false" && options.length === 0) {
      const v = await createOption(question.id, 0);
      const f = await createOption(question.id, 1);
      await Promise.all([
        updateOption(v.id, {
          label: { pt: "Verdadeiro", en: "True", es: "Verdadero" },
          is_correct: true,
        }),
        updateOption(f.id, { label: { pt: "Falso", en: "False", es: "Falso" }, is_correct: false }),
      ]);
      onLocalPatch({
        options: [
          { ...v, label: { pt: "Verdadeiro", en: "True", es: "Verdadero" }, is_correct: true },
          { ...f, label: { pt: "Falso", en: "False", es: "Falso" }, is_correct: false },
        ],
      });
    }
  }

  async function addOption() {
    try {
      const o = await createOption(question.id, options.length);
      const patched = question.kind === "text" ? { ...o, is_correct: true } : o;
      if (question.kind === "text") await updateOption(o.id, { is_correct: true });
      onLocalPatch({ options: [...options, patched] });
    } catch (e: any) {
      toast.error("Erro ao adicionar opção", { description: e.message });
    }
  }

  async function removeOption(id: string) {
    try {
      await deleteOption(id);
      onLocalPatch({ options: options.filter((o) => o.id !== id) });
    } catch (e: any) {
      toast.error("Erro ao remover opção", { description: e.message });
    }
  }

  async function patchOption(id: string, patch: Partial<QuizOption>) {
    let next = options.map((o) => (o.id === id ? { ...o, ...patch } : o));
    // single / true_false: só uma opção correta por vez.
    if (patch.is_correct && (question.kind === "single" || question.kind === "true_false")) {
      next = next.map((o) => (o.id === id ? o : { ...o, is_correct: false }));
    }
    onLocalPatch({ options: next });
    try {
      await updateOption(id, patch);
      if (patch.is_correct && (question.kind === "single" || question.kind === "true_false")) {
        await Promise.all(
          next.filter((o) => o.id !== id).map((o) => updateOption(o.id, { is_correct: false })),
        );
      }
    } catch (e: any) {
      toast.error("Erro ao salvar opção", { description: e.message });
    }
  }

  const isTrueFalse = question.kind === "true_false";
  const isTwoCategories = question.kind === "two_categories";
  const isText = question.kind === "text";
  const isSurvey = question.kind === "survey";

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-bronze/10 font-mono text-xs font-semibold text-bronze">
          {index + 1}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            onClick={onRemove}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={`mb-4 grid gap-3 ${isSurvey ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
        <label className="sm:col-span-1">
          <span className="mb-1 block text-xs text-muted-foreground">Tipo</span>
          <select
            value={question.kind}
            onChange={(e) => mudarTipo(e.target.value as QuestionKind)}
            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary"
          >
            {Object.entries(QUESTION_KIND_LABEL).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </label>
        {isSurvey && (
          <label>
            <span className="mb-1 block text-xs text-muted-foreground">
              Dimensão (agrupa perguntas pra tirar média)
            </span>
            <input
              value={question.dimension ?? ""}
              onChange={(e) => salvar({ dimension: e.target.value || null })}
              placeholder="Ex: Prompting e uso prático"
              className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary"
            />
          </label>
        )}
        <label>
          <span className="mb-1 block text-xs text-muted-foreground">Pontuação</span>
          <input
            type="number"
            min={0}
            value={question.points}
            onChange={(e) => salvar({ points: Number(e.target.value) || 0 })}
            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs text-muted-foreground">
            Tempo (segundos, opcional)
          </span>
          <input
            type="number"
            min={1}
            value={question.time_limit_seconds ?? ""}
            onChange={(e) =>
              salvar({ time_limit_seconds: e.target.value ? Number(e.target.value) : null })
            }
            placeholder="Sem limite"
            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>

      <div className="mb-4">
        <span className="mb-1.5 block text-xs text-muted-foreground">Enunciado</span>
        <I18nField
          value={question.prompt}
          onChange={(v) => salvar({ prompt: v })}
          placeholder="Pergunta"
          multiline
        />
      </div>

      <div className="mb-4">
        <span className="mb-1.5 block text-xs text-muted-foreground">URL da imagem (opcional)</span>
        <input
          value={question.image_url ?? ""}
          onChange={(e) => salvar({ image_url: e.target.value || null })}
          placeholder="https://…"
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary"
        />
      </div>

      {isTwoCategories && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <span className="mb-1.5 block text-xs text-muted-foreground">Categoria A</span>
            <I18nField
              value={question.category_labels?.a}
              onChange={(v) =>
                salvar({
                  category_labels: {
                    a: v,
                    b: question.category_labels?.b ?? emptyI18n(),
                  },
                })
              }
              placeholder="Categoria A"
            />
          </div>
          <div>
            <span className="mb-1.5 block text-xs text-muted-foreground">Categoria B</span>
            <I18nField
              value={question.category_labels?.b}
              onChange={(v) =>
                salvar({
                  category_labels: {
                    a: question.category_labels?.a ?? emptyI18n(),
                    b: v,
                  },
                })
              }
              placeholder="Categoria B"
            />
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {isText
            ? "Respostas aceitas (qualquer uma delas conta como correta)"
            : isTwoCategories
              ? "Itens a classificar"
              : isSurvey
                ? "Opções (sem certo ou errado — só coletamos a distribuição)"
                : "Opções"}
        </span>
        {!isTrueFalse && (
          <button
            onClick={addOption}
            className="inline-flex items-center gap-1 text-xs font-medium text-bronze hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar {isText ? "resposta" : "opção"}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {options.map((o) => (
          <div key={o.id} className="flex items-start gap-2 rounded-xl border border-border p-2.5">
            {!isTwoCategories && !isText && !isSurvey && (
              <input
                type={question.kind === "multiple" ? "checkbox" : "radio"}
                name={`correct-${question.id}`}
                checked={o.is_correct}
                onChange={(e) => patchOption(o.id, { is_correct: e.target.checked })}
                className="mt-2.5 h-4 w-4 shrink-0 accent-[var(--bronze)]"
                title="Correta"
              />
            )}
            <div className="min-w-0 flex-1">
              <I18nField
                value={o.label}
                onChange={(v) => patchOption(o.id, { label: v })}
                placeholder={isText ? "Resposta aceita" : "Opção"}
              />
            </div>
            {isTwoCategories && (
              <select
                value={o.category ?? ""}
                onChange={(e) =>
                  patchOption(o.id, { category: (e.target.value || null) as "a" | "b" | null })
                }
                className="mt-0.5 shrink-0 rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary"
              >
                <option value="">—</option>
                <option value="a">A</option>
                <option value="b">B</option>
              </select>
            )}
            {!isTrueFalse && (
              <button
                onClick={() => removeOption(o.id)}
                className="mt-1.5 shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        {options.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma opção ainda.</p>
        )}
      </div>

      <div className="mt-4">
        <span className="mb-1.5 block text-xs text-muted-foreground">Explicação (opcional)</span>
        <I18nField
          value={question.explanation}
          onChange={(v) => salvar({ explanation: v })}
          placeholder="Mostrada depois de revelar a resposta"
          multiline
        />
      </div>
    </div>
  );
}
