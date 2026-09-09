// Apoio para o contato comercial após o diagnóstico: qual produto/frente da
// Sena Labs conversa com o que a pessoa já respondeu, e o que ainda perguntar
// antes de propor algo. Não inventa nada novo — reaproveita o que o motor
// determinístico já calculou (áreas/oferta/validação em engine.ts), no mesmo
// espírito do arquivo: sem nota de maturidade, sem inferência de IA.
import { areaFor, labelFor } from "./engine";
import type { Answers, DiagnosticoReport } from "./types";

const SUPPORT_FRAME: Record<string, string> = {
  hire: "Prefere contratar quem implemente — o próximo passo é uma proposta de implementação.",
  training:
    "Prefere orientação/capacitação — o próximo passo é uma trilha guiada, não um projeto fechado.",
  self: "Prefere fazer sozinho — vale oferecer acompanhamento pontual só se travar em algo específico.",
};

export interface LeadInsights {
  productFit: string;
  productNote: string;
  questions: string[];
  // Mensagem de abertura para a Sena Labs contatar o lead (direção oposta à
  // de whatsappMessage() em export.ts, que é o lead contatando a Sena Labs).
  contactMessage: string;
}

export function buildLeadInsights(
  answers: Answers,
  r: DiagnosticoReport,
  nome: string,
): LeadInsights {
  const b = areaFor(answers);
  const conditions = r.blockers.length ? r.blockers : [b.dependency];

  const questions: string[] = [r.verify];
  if (!answers.tools) {
    questions.push("Quais ferramentas já usa hoje para isso (se alguma)?");
  } else {
    questions.push(`Confirmar as ferramentas já em uso: "${answers.tools}" — o que falta nelas?`);
  }
  if (answers.decision) {
    questions.push(
      `Quem mais participa da decisão, além do que já foi dito ("${labelFor("decision", answers.decision)}")?`,
    );
  }
  if (answers.budget) {
    questions.push(
      `Faixa de orçamento já sinalizada ("${labelFor("budget", answers.budget)}") — isso é por projeto ou recorrente?`,
    );
  }
  questions.push(...conditions.map((c) => `Já está resolvido: ${c.toLowerCase()}`));

  const first = (nome || "").split(" ")[0];
  const contactMessage = [
    `Oi${first ? " " + first : ""}, aqui é o Felipe da Sena Labs.`,
    `Vi o seu diagnóstico: prioridade em ${b.label.toLowerCase()}, com foco em ${r.offer.toLowerCase()}.`,
    `Pelo que você relatou (${r.symptom.toLowerCase()}), tenho uma ideia de como avançar nisso.`,
    `Topa 30 min essa semana pra eu te mostrar o caminho? Sem compromisso.`,
  ].join(" ");

  return {
    productFit: r.fit,
    productNote: SUPPORT_FRAME[answers.support ?? ""] ?? "",
    questions,
    contactMessage,
  };
}
