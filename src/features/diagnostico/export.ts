import * as XLSX from "xlsx";
import { WHATSAPP_NUMBER } from "@/components/ContactFAB";
import { AREAS, areaFor, labelFor, primaryArea, transcriptFor } from "./engine";
import type { Answers, DiagnosticoReport } from "./types";
import type { LeadFields } from "./components/IntroCapture";

export const AGENDA_URL = "https://calendar.app.google/oh4NeMRMtw8v5UP5A";

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

export function whatsappUrlFor(answers: Answers, r: DiagnosticoReport, lead: LeadFields): string {
  const message = whatsappMessage(answers, r, lead.nome.trim(), lead.negocio.trim());
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function sheetFromRows(rows: Record<string, string>[], colWidths: number[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = colWidths.map((wch) => ({ wch }));
  return ws;
}

export function buildDiagnosticoWorkbook(answers: Answers, r: DiagnosticoReport, lead: LeadFields) {
  const b = areaFor(answers);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows(
      [
        { Campo: "Objetivo", Valor: r.goal },
        { Campo: "Prioridade", Valor: b.label },
        { Campo: "Oportunidade prioritária", Valor: r.offer },
        { Campo: "Situação relatada", Valor: r.symptom },
        { Campo: "Como funciona hoje", Valor: r.context.workflow },
        { Campo: "O que está em jogo", Valor: r.impact.join("; ") },
        { Campo: "Esforço atual", Valor: r.workload },
        { Campo: "Indicador sugerido", Valor: r.metric },
        { Campo: "Dimensão informada", Valor: r.volume },
        { Campo: "O que ainda falta validar", Valor: r.verify },
        {
          Campo: "Condições antes de ampliar",
          Valor: (r.blockers.length ? r.blockers : [b.dependency]).join("; "),
        },
      ],
      [28, 90],
    ),
    "Resumo",
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows(
      r.actions.map((a) => ({ Quando: a.when, Ação: a.title, Descrição: a.text })),
      [16, 32, 80],
    ),
    "Plano de ação",
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows(
      transcriptFor(answers).map((row) => ({ Pergunta: row.title, Resposta: row.value })),
      [30, 90],
    ),
    "Respostas completas",
  );

  if (r.alternatives.length) {
    XLSX.utils.book_append_sheet(
      wb,
      sheetFromRows(
        r.alternatives.map((a) => ({
          Área: a.label,
          Hipótese: a.hypothesis,
          "Pergunta a validar": a.question,
        })),
        [24, 50, 50],
      ),
      "Outras oportunidades",
    );
  }

  XLSX.utils.book_append_sheet(
    wb,
    sheetFromRows(
      [
        { Campo: "Nome", Valor: lead.nome },
        { Campo: "Negócio", Valor: lead.negocio || "—" },
        { Campo: "E-mail", Valor: lead.email },
        { Campo: "WhatsApp", Valor: lead.whatsapp },
        { Campo: "Link de agendamento", Valor: AGENDA_URL },
        { Campo: "Link do WhatsApp (mensagem pronta)", Valor: whatsappUrlFor(answers, r, lead) },
      ],
      [30, 90],
    ),
    "Contato",
  );

  return wb;
}

export function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}

export function buildActionablePrompt(
  answers: Answers,
  r: DiagnosticoReport,
  lead: LeadFields,
): string {
  const b = areaFor(answers);
  const plan = r.actions.map((a) => `- ${a.when}: ${a.title} — ${a.text}`).join("\n");
  const barriers =
    (answers.barriers || []).map((x) => labelFor("barriers", x)).join("; ") ||
    "Nenhuma barreira relatada";
  const alternatives =
    r.alternatives.map((a) => `- ${a.label}: ${a.question}`).join("\n") ||
    "Nenhuma outra área foi selecionada.";

  return `INSTRUÇÕES DE USO
-----------------
Este arquivo traz um prompt pronto para você continuar este diagnóstico com a
ferramenta de IA que preferir (ChatGPT, Claude, Gemini etc.).

Como usar:
1. Copie todo o texto a partir de "PROMPT PARA A IA" abaixo.
2. Cole em uma conversa nova na ferramenta de IA escolhida.
3. Responda as perguntas de aprofundamento que ela fizer — quanto mais
   detalhe (ferramentas usadas, acessos disponíveis, tempo e orçamento reais),
   melhor o plano.
4. Peça o plano de implementação de até 30 dias quando sentir que já deu
   contexto suficiente — o prompt já instrui a IA a entregar isso.
5. Volte a essa conversa sempre que quiser revisar ou ajustar o plano.

Este prompt não é um serviço prestado pela Sena Labs. O conteúdo gerado pela
IA e as decisões tomadas a partir dele são de sua responsabilidade — veja os
Termos de Uso em https://www.senalabs.tech/termos-de-uso.

===================================================
PROMPT PARA A IA (copie a partir daqui)
===================================================

Você é um consultor especialista em IA e automação para pequenas e médias
empresas. Vou te passar o resultado de um diagnóstico que fiz sobre o meu
negócio${lead.negocio ? ` (${lead.negocio})` : ""}. Use esses dados como ponto
de partida, mas antes de sugerir qualquer ação, me faça perguntas de
aprofundamento para entender melhor minha situação, as ferramentas que já uso
e minhas restrições reais de tempo, orçamento e equipe. Só depois de eu
responder, monte comigo um plano de implementação prático e acionável para os
próximos 30 dias, organizado semana a semana, com passos concretos e sem
jargão técnico. Se precisar saber quais ferramentas eu uso ou que acesso eu
tenho antes de sugerir algo, pergunte antes de assumir.

DADOS DO DIAGNÓSTICO
- Objetivo: ${r.goal}
- Prioridade / área: ${b.label}
- Situação relatada: ${r.symptom}
- Como funciona hoje: ${r.context.workflow}
- Ferramentas usadas hoje: ${answers.tools || "não informado"}
- O que está em jogo: ${r.impact.join("; ")}
- Dimensão informada: ${r.volume}
- Esforço atual: ${r.workload}
- Indicador sugerido para acompanhar: ${r.metric}
- Barreiras relatadas: ${barriers}
- Preferência de apoio: ${labelFor("support", answers.support)}
- Plano inicial já sugerido:
${plan}
- Condições a validar antes de ampliar: ${(r.blockers.length ? r.blockers : [b.dependency]).join("; ")}
- Outras oportunidades identificadas (não aprofundadas):
${alternatives}

Comece fazendo as perguntas de aprofundamento antes de propor qualquer plano.`;
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
