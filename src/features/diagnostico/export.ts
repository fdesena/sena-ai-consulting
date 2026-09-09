import { AREAS, areaFor, labelFor, primaryArea, transcriptFor } from "./engine";
import type { Answers, DiagnosticoReport } from "./types";

export function reportText(answers: Answers, r: DiagnosticoReport): string {
  const b = areaFor(answers);
  const transcript = transcriptFor(answers);
  return `SENA LABS — DIAGNÓSTICO DE OPORTUNIDADES

Objetivo: ${r.goal}
Prioridade: ${b.label}
Oportunidade: ${r.offer}
Situação relatada: ${r.symptom}
Caminho: ${r.path}

ESFORÇO ATUAL
${r.workload}
Faixas de esforço não representam economia prevista.

PLANO INICIAL
${r.actions.map((s) => s.when + " — " + s.title + "\n" + s.text).join("\n\n")}

COMO OBSERVAR O VALOR
${r.metric}
${b.measure}

O QUE VALIDAR
${r.verify}
${r.blockers.join("\n")}

OUTRAS ÁREAS A EXPLORAR
${r.alternatives.map((a) => a.label + ": " + a.question).join("\n") || "Nenhuma outra área selecionada."}

RESPOSTAS
${transcript.map((row) => row.title + ": " + row.value).join("\n")}

${r.confidence}
Nenhuma proposta comercial ou retorno financeiro foi calculado.`;
}

export function buildExportPayload(answers: Answers, r: DiagnosticoReport) {
  return {
    schemaVersion: r.version,
    answers,
    report: r,
    questionLabels: transcriptFor(answers).map((row) => ({
      question: row.title,
      answer: row.value,
    })),
    commercialBrief: {
      need: r.offer,
      evidence: r.symptom,
      tools: answers.tools || null,
      readiness: r.path,
      obstacles: (answers.barriers || []).map((x) => labelFor("barriers", x)),
      preferredSupport: labelFor("support", answers.support),
      timing: r.urgency,
      decision: r.decision,
      budget: r.budget,
      nextValidation: r.verify,
    },
    sent: false,
  };
}

export function whatsappMessage(
  answers: Answers,
  r: DiagnosticoReport,
  name: string,
  company: string,
): string {
  const b = areaFor(answers);
  const lines = [
    `Olá, Felipe! ${name ? "Sou " + name + ". " : ""}${company ? "Meu negócio é " + company + ". " : ""}Fiz o diagnóstico da Sena Labs.`,
    "",
    `Meu objetivo: ${r.goal}.`,
    `Prioridade: ${b.label}.`,
    `Situação: ${r.symptom}.`,
    `Como trabalho hoje: ${r.context.workflow}.`,
    `Quero acompanhar: ${r.metric}.`,
    `Condições: ${r.path}.`,
    `Prefiro: ${labelFor("support", answers.support)}.`,
    `Momento: ${r.urgency}.`,
    "",
    "Gostaria de conversar sobre um primeiro passo.",
  ];
  return lines.join("\n");
}

export function downloadFile(name: string, data: string, mime: string) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function areaLabelOf(answers: Answers): string {
  const key = primaryArea(answers);
  return key ? AREAS[key]?.label || "" : "";
}
