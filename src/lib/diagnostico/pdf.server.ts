// PDF gerado no servidor para o anexo do e-mail do diagnóstico. Não tenta
// clonar pixel-a-pixel o layout da página (isso ficaria a cargo do Imprimir
// / PDF do navegador) — é um documento próprio, limpo e com a identidade da
// marca, construído com jsPDF (não depende de navegador headless).
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { areaFor, transcriptFor } from "@/features/diagnostico/engine";
import { buildActionablePrompt } from "@/features/diagnostico/export";
import type { Answers, DiagnosticoReport } from "@/features/diagnostico/types";

const BRONZE: [number, number, number] = [252, 124, 52];
const INK: [number, number, number] = [23, 26, 29];
const MUTED: [number, number, number] = [94, 102, 108];

const PAGE_WIDTH = 595.28; // A4 pt
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

interface Lead {
  nome: string;
  negocio: string;
}

function withAutoTableY(doc: jsPDF): number {
  const last = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
  return last ? last.finalY : MARGIN;
}

export function buildDiagnosticoPdf(answers: Answers, r: DiagnosticoReport, lead: Lead): Buffer {
  const b = areaFor(answers);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = MARGIN;

  function ensureSpace(next: number) {
    if (y + next > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function heading(text: string) {
    ensureSpace(28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...INK);
    doc.text(text, MARGIN, y);
    y += 20;
  }

  function paragraph(label: string, value: string) {
    if (!value) return;
    ensureSpace(16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(`${label}:`, MARGIN, y);
    const labelWidth = doc.getTextWidth(`${label}: `);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    const lines = doc.splitTextToSize(value, CONTENT_WIDTH - labelWidth);
    doc.text(lines[0] ?? "", MARGIN + labelWidth, y);
    y += 14;
    for (const line of lines.slice(1)) {
      ensureSpace(14);
      doc.text(line, MARGIN, y);
      y += 14;
    }
    y += 4;
  }

  function wrappedText(text: string, size = 9.5) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...MUTED);
    for (const paragraph of text.split("\n")) {
      if (!paragraph) {
        y += size * 0.6;
        continue;
      }
      const lines = doc.splitTextToSize(paragraph, CONTENT_WIDTH);
      for (const line of lines) {
        ensureSpace(size * 1.4);
        doc.text(line, MARGIN, y);
        y += size * 1.4;
      }
    }
  }

  function bulletList(items: string[]) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...MUTED);
    for (const item of items) {
      const lines = doc.splitTextToSize(`•  ${item}`, CONTENT_WIDTH);
      for (const line of lines) {
        ensureSpace(14);
        doc.text(line, MARGIN, y);
        y += 14;
      }
    }
    y += 4;
  }

  // Capa
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...BRONZE);
  doc.text("SENA LABS", MARGIN, y);
  y += 26;
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text("Diagnóstico de Oportunidades", MARGIN, y);
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...MUTED);
  const contactLine = [lead.nome, lead.negocio].filter(Boolean).join(" — ");
  if (contactLine) {
    doc.text(contactLine, MARGIN, y);
    y += 14;
  }
  doc.text(
    new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
    MARGIN,
    y,
  );
  y += 28;

  // Oportunidade prioritária
  heading("01 — Oportunidade prioritária");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  const offerLines = doc.splitTextToSize(r.offer, CONTENT_WIDTH);
  for (const line of offerLines) {
    ensureSpace(16);
    doc.text(line, MARGIN, y);
    y += 16;
  }
  y += 4;
  doc.setFontSize(10.5);
  paragraph("Por quê", r.why);
  paragraph("O que você relatou", r.symptom + ".");
  paragraph("Como funciona hoje", r.context.workflow + ".");
  paragraph("O que está em jogo", r.impact.join("; ").toLowerCase() + ".");
  paragraph("Esforço atual", r.workload);
  paragraph("O que ainda precisamos validar", r.verify);

  // Plano de ação
  heading("02 — Plano de ação");
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Quando", "Ação", "Descrição"]],
    body: r.actions.map((a) => [a.when, a.title, a.text]),
    styles: { fontSize: 9.5, textColor: INK, cellPadding: 6 },
    headStyles: { fillColor: BRONZE, textColor: [255, 255, 255] },
    columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 130 } },
  });
  y = withAutoTableY(doc) + 20;

  // Indicador e condições
  heading("03 — Como observar o valor");
  paragraph("Indicador sugerido", r.metric);
  paragraph("Como medir", b.measure);
  ensureSpace(18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text("Condições antes de ampliar:", MARGIN, y);
  y += 16;
  bulletList(r.blockers.length ? r.blockers : [b.dependency]);

  // Outras oportunidades
  if (r.alternatives.length) {
    heading("04 — Outras oportunidades identificadas");
    bulletList(r.alternatives.map((a) => `${a.label}: ${a.question}`));
  }

  // Apêndice — respostas completas
  doc.addPage();
  y = MARGIN;
  heading("Apêndice — respostas completas do diagnóstico");
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Pergunta", "Resposta"]],
    body: transcriptFor(answers).map((row) => [row.title, row.value]),
    styles: { fontSize: 9, textColor: INK, cellPadding: 6, valign: "top" },
    headStyles: { fillColor: BRONZE, textColor: [255, 255, 255] },
    columnStyles: { 0: { cellWidth: 160 } },
  });

  // Apêndice — prompt para o usuário continuar sozinho com a IA de preferência
  doc.addPage();
  y = MARGIN;
  heading("Apêndice — prompt para continuar com uma IA");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  const introLines = doc.splitTextToSize(
    "Cole o texto abaixo em uma conversa nova no ChatGPT, Claude, Gemini ou na IA de sua preferência. Ela vai aprofundar a entrevista e te devolver um plano de implementação de até 30 dias.",
    CONTENT_WIDTH,
  );
  for (const line of introLines) {
    ensureSpace(15);
    doc.text(line, MARGIN, y);
    y += 15;
  }
  y += 10;
  wrappedText(
    buildActionablePrompt(answers, r, {
      nome: lead.nome,
      email: "",
      whatsapp: "",
      negocio: lead.negocio,
    }),
  );

  // Rodapé (numeração) em todas as páginas
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(
      `Sena Labs · Diagnóstico de Oportunidades · página ${i} de ${pageCount}`,
      MARGIN,
      PAGE_HEIGHT - 24,
    );
  }

  return Buffer.from(doc.output("arraybuffer"));
}
