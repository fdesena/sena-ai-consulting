import { areaFor } from "../engine";
import { buildExportPayload, downloadFile, reportText } from "../export";
import type { Answers, DiagnosticoReport, StepId } from "../types";
import { transcriptFor } from "../engine";
import { OutlineButtonDark, PrimaryButton } from "./Controls";

interface ResultViewProps {
  answers: Answers;
  report: DiagnosticoReport;
  onEditStep: (stepId: StepId) => void;
  onBackToQuestions: () => void;
  onOpenContact: () => void;
  saveFailed?: boolean;
}

export default function ResultView({
  answers,
  report: r,
  onEditStep,
  onBackToQuestions,
  onOpenContact,
  saveFailed,
}: ResultViewProps) {
  const b = areaFor(answers);
  const conditions = r.blockers.length ? r.blockers : [b.dependency];
  const independence =
    answers.support === "self"
      ? "Você pode começar com este plano. Se encontrar um obstáculo, uma conversa pode ajudar a delimitar o próximo passo."
      : answers.support === "training"
        ? "Podemos usar esse recorte para desenhar uma orientação ou prática guiada."
        : `Podemos avaliar ${r.fit.toLowerCase()}, começando pelo recorte que você escolheu.`;
  const resourceNote = answers.barriers?.includes("time")
    ? "Reserve uma janela curta e uma tarefa: evite começar várias mudanças ao mesmo tempo."
    : answers.barriers?.includes("money")
      ? "Antes de contratar ou comprar outra ferramenta, teste o recorte com os recursos já disponíveis."
      : "";
  const aiNote =
    answers.ai === "none"
      ? "Você não precisa dominar IA para começar. Primeiro torne a tarefa e o resultado esperado claros."
      : answers.ai === "trial"
        ? "Nos usos de IA que já existem, registre critérios de revisão e exemplos de resultados úteis."
        : "";
  const transcript = transcriptFor(answers);

  return (
    <div className="py-10 sm:py-14">
      <div className="grid grid-cols-1 items-end gap-6 border-b border-white/15 pb-8 sm:grid-cols-[1.3fr_1fr] sm:gap-10">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.09em] text-[#ffb081]">
            Seu diagnóstico / Plano inicial
          </div>
          <h1
            tabIndex={-1}
            id="result-title"
            className="mt-3 max-w-[21ch] text-[2.1rem] font-medium leading-[1.1] tracking-tight sm:text-5xl"
          >
            Um próximo passo para {r.goal.toLowerCase()}.
          </h1>
          <p className="mt-4 max-w-[58ch] text-[#b4bdc5]">
            Você escolheu <strong className="text-white">{b.label.toLowerCase()}</strong> como
            prioridade. Abaixo está uma hipótese de trabalho, com ações para começar e evidências
            para acompanhar.
          </p>
        </div>
        <div className="diagnostico-no-print flex flex-wrap justify-start gap-2.5 sm:justify-end">
          <OutlineButtonDark
            type="button"
            onClick={() =>
              downloadFile(
                "meu-diagnostico-sena-labs.txt",
                reportText(answers, r),
                "text/plain;charset=utf-8",
              )
            }
          >
            Baixar diagnóstico ↓
          </OutlineButtonDark>
          <OutlineButtonDark type="button" onClick={() => window.print()}>
            Imprimir / PDF
          </OutlineButtonDark>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1.5fr)_minmax(290px,1fr)]">
        <article className="rounded-xl bg-[var(--paper)] p-7 text-[var(--ink)] sm:p-9">
          <div className="font-mono text-xs uppercase tracking-[0.09em] text-[#a34a18]">
            01 / Oportunidade prioritária
          </div>
          <h2 className="mt-3 mb-5 text-2xl font-medium tracking-tight sm:text-3xl">{r.offer}</h2>
          <p className="text-[#525e66]">{r.why}</p>
          <div className="mt-6 space-y-3 border-y border-[#cbd1d6] py-5">
            <p>
              <strong className="font-medium text-[#252e35]">O que você relatou:</strong>{" "}
              {r.symptom}.
            </p>
            <p>
              <strong className="font-medium text-[#252e35]">Como funciona hoje:</strong>{" "}
              {r.context.workflow}.
            </p>
            <p>
              <strong className="font-medium text-[#252e35]">O que está em jogo:</strong>{" "}
              {r.impact.join("; ").toLowerCase()}.
            </p>
          </div>
          <div className="mt-6">
            <h3 className="mb-3 text-lg font-medium">O que ainda precisamos validar</h3>
            <p className="text-[#525e66]">{r.verify}</p>
          </div>
        </article>

        <aside className="rounded-[10px] border border-white/15 bg-[#1b1f23] p-7">
          <div className="mb-4 inline-block rounded-[5px] border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-[#f1c8ad]">
            {r.path}
          </div>
          <h2 className="text-xl font-medium">Esforço atual, sem prometer economia.</h2>
          <p className="mt-3 font-medium text-white">{r.workload}</p>
          <p className="mt-2 text-sm text-[#929da6]">
            {answers.hours === "unknown" || answers.hours === "zero"
              ? "Nenhuma economia foi calculada."
              : "Faixa informada por você × 4 semanas. Não é uma previsão de horas recuperadas ou de retorno financeiro."}
          </p>
          <hr className="my-6 border-white/15" />
          <h3 className="mb-3 text-lg font-medium">Dimensão informada</h3>
          <p className="text-[#b5bfc7]">
            {b.volumeQuestion}
            <br />
            <strong className="text-white">{r.volume}</strong>
          </p>
          <p className="mt-2 text-sm text-[#929da6]">{r.confidence}</p>
        </aside>
      </div>

      <section className="mt-10">
        <h2 className="mb-6 text-2xl font-medium tracking-tight sm:text-3xl">
          O que você pode fazer a partir de agora.
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {r.actions.map((s) => (
            <article key={s.when} className="border-t-2 border-[#fc7c3488] bg-[#181c20] p-6">
              <div className="font-mono text-xs text-[#ffb081]">{s.when}</div>
              <h3 className="mt-3.5 mb-4 text-xl leading-snug">{s.title}</h3>
              <p className="text-[#b0bac3]">{s.text}</p>
            </article>
          ))}
        </div>
        <p className="mt-5 max-w-[92ch] text-sm text-[#929da7]">
          As janelas acima organizam suas ações. Não são um prazo de entrega contratado.
          {resourceNote ? " " + resourceNote : ""}
          {aiNote ? " " + aiNote : ""}
        </p>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 border-t border-white/15 pt-8 sm:grid-cols-2 sm:gap-11">
        <div>
          <h2 className="mb-4 text-xl font-medium sm:text-2xl">Como observar o valor.</h2>
          <p className="font-medium text-white">{r.metric}</p>
          {!r.metricDefined ? (
            <p className="mt-3 text-[#b5bdc5]">
              Você ainda não definiu um indicador. Este é um ponto de partida sugerido, a confirmar.
            </p>
          ) : null}
          {answers.target && answers.success !== "custom" ? (
            <p className="mt-3 text-[#b5bdc5]">Sua referência: {answers.target}</p>
          ) : null}
          <p className="mt-4 text-[#b5bdc5]">{b.measure}</p>
        </div>
        <div>
          <h2 className="mb-4 text-xl font-medium sm:text-2xl">Antes de ampliar.</h2>
          <ul className="list-disc space-y-2 pl-5 text-[#b5bdc5]">
            {conditions.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </section>

      {r.alternatives.length ? (
        <section className="mt-10 grid grid-cols-1 gap-6 border-t border-white/15 pt-8 sm:grid-cols-2 sm:gap-11">
          <div>
            <h2 className="mb-4 text-xl font-medium sm:text-2xl">
              Outras oportunidades que você marcou.
            </h2>
            <p className="text-[#b5bdc5]">
              Estas áreas não foram aprofundadas. São hipóteses para explorar depois, sem uma
              estimativa de impacto ou ordem de retorno.
            </p>
          </div>
          <div>
            {r.alternatives.map((x) => (
              <article
                key={x.key}
                className="border-t border-white/15 py-5 first:border-t-0 first:pt-0"
              >
                <h3 className="mb-2 text-lg tracking-tight">{x.label}</h3>
                <p className="text-[#b5bdc5]">{x.question}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="diagnostico-no-print mt-10 flex flex-col items-start gap-6 rounded-[10px] border border-white/15 bg-[#25292d] p-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-medium sm:text-2xl">
            {answers.when === "explore"
              ? "Guarde seu plano. Avance quando fizer sentido."
              : "Quer conversar a partir deste diagnóstico?"}
          </h2>
          <p className="mt-3 max-w-[58ch] text-[#b8c0c7]">{independence}</p>
          <p className="mt-3 text-sm">
            Formato indicado pela sua preferência: {r.format.toLowerCase()}.
          </p>
        </div>
        <PrimaryButton type="button" onClick={onOpenContact} className="shrink-0">
          {answers.support === "self" ? "Conversar se precisar ↗" : "Preparar uma conversa ↗"}
        </PrimaryButton>
      </section>

      <details className="mt-8 border-t border-white/15 pt-6">
        <summary className="min-h-11 cursor-pointer text-[#c6cdd3]">
          Revisar minhas respostas
        </summary>
        <div className="mt-2">
          {transcript.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-2 border-t border-white/10 py-3.5 text-[15px] sm:grid-cols-[1fr_1.3fr_auto] sm:items-start sm:gap-6"
            >
              <span className="text-[#a2aeb8]">{row.title}</span>
              <p className="whitespace-pre-wrap">{row.value}</p>
              <button
                type="button"
                onClick={() => onEditStep(row.id as StepId)}
                className="diagnostico-no-print justify-self-start text-[#ffb081] underline"
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      </details>

      <details className="mt-4 border-t border-white/15 pt-6">
        <summary className="min-h-11 cursor-pointer text-[#c6cdd3]">
          Como este resultado foi construído
        </summary>
        <p className="mt-3 max-w-[92ch] text-sm text-[#929da7]">
          A prioridade foi escolhida por você. A situação específica define a hipótese de solução;
          processo, fontes e responsável determinam o preparo necessário. Barreiras e preferência de
          apoio ajustam os próximos passos. Não há nota de maturidade, comparação com outras
          empresas ou recomendação gerada por IA. Prazo e orçamento não alteram o acesso nem a
          oportunidade recomendada.
        </p>
      </details>

      <div className="diagnostico-no-print mt-7 flex flex-wrap gap-3">
        <OutlineButtonDark
          type="button"
          onClick={() =>
            downloadFile(
              "meu-diagnostico-sena-labs.json",
              JSON.stringify(buildExportPayload(answers, r), null, 2),
              "application/json",
            )
          }
        >
          Exportar respostas e plano (.json)
        </OutlineButtonDark>
        <OutlineButtonDark type="button" onClick={onBackToQuestions}>
          Voltar às perguntas
        </OutlineButtonDark>
      </div>
      <p className="mt-4 max-w-[92ch] text-sm text-[#979fa7]">
        Seu diagnóstico completo foi registrado com os dados de contato informados no início. Baixe
        uma cópia se quiser guardar localmente.
      </p>
      {saveFailed ? (
        <p role="alert" className="mt-2 max-w-[92ch] text-sm text-[#f0b088]">
          Não foi possível confirmar o registro do seu diagnóstico completo agora — seus dados de
          contato já estão salvos. Você pode baixar uma cópia acima para não perder o resultado.
        </p>
      ) : null}
    </div>
  );
}
