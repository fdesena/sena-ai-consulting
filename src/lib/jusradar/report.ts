// Gera um relatório .docx completo a partir das três abas do site
// (Síntese, Processos, Jurisprudência), no estilo do exemplo
// "Levantamento Processual" em report-example/.
//
// Roda no navegador: Packer.toBlob() devolve um Blob para download direto.

import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { Decisao, Processo } from "@/lib/jusradar/types";
import { formatData, formatNumeroCNJ } from "@/lib/jusradar/format";

export interface ReportInput {
  contexto: string;
  synthesis: string;
  defesa?: string;
  requerente?: string;
  processos: Processo[];
  decisoes: Decisao[];
  quotaExceeded?: boolean;
}

const ACCENT = "1F4E79"; // azul-petróleo p/ títulos
const MUTED = "666666";
const HEADER_BG = "F1F3F5";

function dataBase(): string {
  return new Date().toLocaleDateString("pt-BR");
}

/* -------------------------------------------------------------------------- */
/* Markdown inline → TextRun[] (negrito, itálico, código, links em texto)     */
/* -------------------------------------------------------------------------- */

function inlineRuns(text: string, base: { size?: number; color?: string } = {}): TextRun[] {
  const runs: TextRun[] = [];
  // tokeniza **bold**, *italic* / _italic_, `code`, [label](url)
  const re = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(_([^_]+)_)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const push = (t: string, opts: Record<string, unknown> = {}) => {
    if (!t) return;
    runs.push(new TextRun({ text: t, size: base.size, color: base.color, ...opts }));
  };
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) push(text.slice(last, m.index));
    if (m[2] !== undefined) push(m[2], { bold: true });
    else if (m[4] !== undefined) push(m[4], { italics: true });
    else if (m[6] !== undefined) push(m[6], { italics: true });
    else if (m[8] !== undefined) push(m[8], { font: "Consolas" });
    else if (m[10] !== undefined) push(`${m[10]} (${m[11]})`, { color: ACCENT });
    last = re.lastIndex;
  }
  if (last < text.length) push(text.slice(last));
  if (runs.length === 0) push(text);
  return runs;
}

/* -------------------------------------------------------------------------- */
/* Markdown de bloco (síntese) → elementos docx                               */
/* -------------------------------------------------------------------------- */

function mdTable(rows: string[]): Table {
  const cells = rows
    .filter((r) => !/^\s*\|?[\s:|-]+\|?\s*$/.test(r)) // remove linha separadora ---|---
    .map((r) =>
      r
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((c) => c.trim()),
    );
  const cols = Math.max(...cells.map((c) => c.length));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: cells.map((cols0, ri) =>
      new TableRow({
        children: Array.from({ length: cols }).map((_, ci) =>
          new TableCell({
            shading: ri === 0 ? { type: ShadingType.CLEAR, fill: HEADER_BG, color: "auto" } : undefined,
            children: [
              new Paragraph({
                children: inlineRuns(cols0[ci] ?? "", { size: 18 }),
                spacing: { before: 40, after: 40 },
              }),
            ],
          }),
        ),
      }),
    ),
  });
}

function markdownToDocx(md: string): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];
  const lines = md.replace(/\r/g, "").split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // tabela markdown (bloco contíguo de linhas com "|")
    if (trimmed.includes("|") && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      const block: string[] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        block.push(lines[i]);
        i++;
      }
      out.push(mdTable(block));
      out.push(new Paragraph({ spacing: { after: 120 } }));
      continue;
    }

    // headings
    const h = /^(#{1,4})\s+(.*)$/.exec(trimmed);
    if (h) {
      const level = h[1].length;
      out.push(
        new Paragraph({
          children: inlineRuns(h[2], { color: ACCENT }),
          heading:
            level <= 1
              ? HeadingLevel.HEADING_2
              : level === 2
                ? HeadingLevel.HEADING_3
                : HeadingLevel.HEADING_4,
          spacing: { before: 200, after: 80 },
        }),
      );
      i++;
      continue;
    }

    // listas com marcador
    const li = /^[-*+]\s+(.*)$/.exec(trimmed);
    if (li) {
      out.push(
        new Paragraph({
          children: inlineRuns(li[1]),
          bullet: { level: 0 },
          spacing: { after: 60 },
        }),
      );
      i++;
      continue;
    }

    // listas numeradas → mantém o número no texto
    const ol = /^(\d+)[.)]\s+(.*)$/.exec(trimmed);
    if (ol) {
      out.push(
        new Paragraph({
          children: inlineRuns(`${ol[1]}. ${ol[2]}`),
          spacing: { after: 60 },
          indent: { left: 360 },
        }),
      );
      i++;
      continue;
    }

    // citação
    const bq = /^>\s?(.*)$/.exec(trimmed);
    if (bq) {
      out.push(
        new Paragraph({
          children: inlineRuns(bq[1], { color: MUTED }),
          indent: { left: 360 },
          border: { left: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 8 } },
          spacing: { after: 80 },
        }),
      );
      i++;
      continue;
    }

    // parágrafo comum
    out.push(
      new Paragraph({
        children: inlineRuns(trimmed),
        spacing: { after: 120 },
      }),
    );
    i++;
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Blocos do relatório                                                        */
/* -------------------------------------------------------------------------- */

function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    children: inlineRuns(text, { color: ACCENT }),
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 120 },
  });
}

function plain(text: string, opts: { italics?: boolean; color?: string; after?: number } = {}): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, italics: opts.italics, color: opts.color })],
    spacing: { after: opts.after ?? 120 },
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({ children: inlineRuns(text), bullet: { level: 0 }, spacing: { after: 60 } });
}

function headerCell(text: string): TableCell {
  return new TableCell({
    shading: { type: ShadingType.CLEAR, fill: HEADER_BG, color: "auto" },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 18 })],
        spacing: { before: 40, after: 40 },
      }),
    ],
  });
}

function bodyCell(text: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text: text || "—", size: 18 })],
        spacing: { before: 40, after: 40 },
      }),
    ],
  });
}

function processosTable(processos: Processo[]): Table {
  const header = new TableRow({
    tableHeader: true,
    children: [
      headerCell("Nº do processo"),
      headerCell("Tribunal / Órgão"),
      headerCell("Classe / Assuntos"),
      headerCell("Atualização"),
      headerCell("Fonte"),
    ],
  });
  const rows = processos.map((p) => {
    const orgao = [p.tribunal?.toUpperCase(), p.orgaoJulgador].filter(Boolean).join(" — ");
    const assuntos = [p.classe, ...(p.assuntos ?? [])].filter(Boolean).join("; ");
    return new TableRow({
      children: [
        bodyCell(formatNumeroCNJ(p.numeroProcesso)),
        bodyCell(orgao),
        bodyCell(assuntos),
        bodyCell(formatData(p.ultimaAtualizacao ?? p.dataAjuizamento)),
        bodyCell(p.fonte ?? "DataJud/CNJ"),
      ],
    });
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [header, ...rows],
  });
}

/* -------------------------------------------------------------------------- */
/* Documento                                                                  */
/* -------------------------------------------------------------------------- */

function buildDoc(input: ReportInput): Document {
  const { contexto, synthesis, defesa, requerente, processos, decisoes, quotaExceeded } = input;
  const children: (Paragraph | Table)[] = [];

  // --- Cabeçalho / título ---
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: "Relatório de Pesquisa Jurídica", bold: true, size: 40, color: ACCENT })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: "Jurisprudência.ai — pesquisa em linguagem natural", size: 22, color: MUTED })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [new TextRun({ text: `Data-base da consulta: ${dataBase()}`, size: 20, color: MUTED })],
    }),
  );

  // --- 1. Objetivo e escopo ---
  children.push(sectionTitle("1. Objetivo e escopo"));
  children.push(
    plain(
      "Este relatório consolida, em um único documento, os resultados da pesquisa jurídica realizada " +
        "na plataforma: a síntese analítica do caso, as estratégias de argumentação para a defesa e para " +
        "o requerente, os processos rastreados e a jurisprudência aplicável. Destina-se a subsidiar a " +
        "construção do caso e a antecipação dos argumentos da parte contrária.",
    ),
  );
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "Caso consultado: ", bold: true }), ...inlineRuns(contexto || "—")],
      spacing: { after: 120 },
      border: { left: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 8 } },
      indent: { left: 200 },
    }),
  );

  // --- 2. Resumo executivo ---
  children.push(sectionTitle("2. Resumo executivo"));
  const totalProc = processos.length;
  const totalDec = decisoes.length;
  const tribunais = Array.from(
    new Set(processos.map((p) => p.tribunal?.toUpperCase()).filter(Boolean) as string[]),
  );
  children.push(
    bullet(
      `Processos identificados: ${totalProc}${
        tribunais.length ? ` (tribunais: ${tribunais.join(", ")})` : ""
      }.`,
    ),
  );
  children.push(bullet(`Decisões/ementas de jurisprudência analisadas: ${totalDec}.`));
  if (quotaExceeded) {
    children.push(
      bullet(
        "A cota gratuita de jurisprudência (Jurisprudências.ai) foi atingida na consulta; a análise " +
          "foi complementada com os processos do DataJud e o conhecimento jurídico geral do modelo.",
      ),
    );
  }
  children.push(
    bullet(
      "A análise detalhada consta na seção 3 (Síntese); as estratégias para cada polo, nas seções 4 " +
        "(Defesa) e 5 (Requerente); os dados de origem, nas seções 6 e 7.",
    ),
  );

  // --- 3. Síntese da análise (aba Síntese) ---
  children.push(sectionTitle("3. Síntese da análise"));
  if (synthesis.trim()) {
    children.push(...markdownToDocx(synthesis));
  } else {
    children.push(plain("Sem síntese gerada nesta consulta.", { italics: true, color: MUTED }));
  }

  // --- 4. Estratégia de defesa (aba Defesa) ---
  children.push(sectionTitle("4. Estratégia de defesa (réu / requerido)"));
  children.push(
    plain(
      "Melhor linha de defesa: teses, fundamentos legais, precedentes (com fontes), estratégia " +
        "processual e antecipação dos argumentos do requerente.",
      { color: MUTED },
    ),
  );
  if (defesa && defesa.trim()) {
    children.push(...markdownToDocx(defesa));
  } else {
    children.push(plain("Sem análise de defesa gerada nesta consulta.", { italics: true, color: MUTED }));
  }

  // --- 5. Estratégia do requerente (aba Requerente) ---
  children.push(sectionTitle("5. Estratégia do requerente (autor)"));
  children.push(
    plain(
      "Melhor linha de ataque: teses do pedido, fundamentos legais, precedentes favoráveis (com " +
        "fontes), provas a produzir e antecipação da defesa.",
      { color: MUTED },
    ),
  );
  if (requerente && requerente.trim()) {
    children.push(...markdownToDocx(requerente));
  } else {
    children.push(plain("Sem análise do requerente gerada nesta consulta.", { italics: true, color: MUTED }));
  }

  // --- 6. Processos identificados (aba Processos) ---
  children.push(sectionTitle("6. Processos identificados"));
  if (processos.length) {
    children.push(
      plain(
        "Do DataJud (CNJ): candidatos por assunto — não pelos fatos do caso. Da busca por CNPJ/parte: " +
          "processos reais localizados no DJEN/CNJ (ver coluna “Fonte”).",
        { color: MUTED },
      ),
    );
    children.push(processosTable(processos));
    // links públicos quando houver
    const comUrl = processos.filter((p) => p.url);
    if (comUrl.length) {
      children.push(new Paragraph({ spacing: { before: 120 } }));
      children.push(plain("Links públicos:", { color: MUTED, after: 40 }));
      comUrl.forEach((p) =>
        children.push(bullet(`${formatNumeroCNJ(p.numeroProcesso)} — ${p.url}`)),
      );
    }
  } else {
    children.push(
      plain(
        "Nenhum processo retornado nesta consulta. Lembre-se: o DataJud filtra por assunto, não pelos fatos.",
        { italics: true, color: MUTED },
      ),
    );
  }

  // --- 7. Jurisprudência analisada (aba Jurisprudência) ---
  children.push(sectionTitle("7. Jurisprudência analisada"));
  if (decisoes.length) {
    decisoes.forEach((d, idx) => {
      const titulo = [d.court, d.process_number ? formatNumeroCNJ(d.process_number) : null]
        .filter(Boolean)
        .join(" — ");
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${idx + 1}. `, bold: true }),
            new TextRun({ text: titulo || "Decisão", bold: true }),
            ...(d.publication_date
              ? [new TextRun({ text: `  ·  ${formatData(d.publication_date)}`, color: MUTED, size: 18 })]
              : []),
          ],
          spacing: { before: 120, after: 40 },
        }),
      );
      if (d.excerpt) children.push(plain(d.excerpt, { after: 40 }));
      if (d.url) children.push(plain(`Fonte: ${d.url}`, { color: ACCENT, after: 80 }));
    });
  } else {
    children.push(
      plain(
        "Sem decisões estruturadas retornadas pela API. A análise jurisprudencial está incorporada à síntese (seção 3).",
        { italics: true, color: MUTED },
      ),
    );
  }

  // --- 8. Metodologia, fontes e limitações ---
  children.push(sectionTitle("8. Metodologia, fontes e limitações"));
  children.push(
    plain(
      "Fontes: API Pública do DataJud (CNJ) para metadados processuais; Jurisprudências.ai para ementas/decisões; " +
        "complementadas pela análise do modelo de linguagem. Consulta realizada em " +
        `${dataBase()}.`,
    ),
  );
  children.push(
    plain(
      "Limitações: levantamento preliminar e de apoio — não substitui certidões oficiais nem constitui parecer ou " +
        "aconselhamento jurídico. As bases podem ter defasagem e não alcançam processos em segredo de justiça. O " +
        "DataJud traz metadados públicos por assunto, não os fatos do caso; confirme sempre nas fontes oficiais " +
        "(e-SAJ, PJe, CNDT e congêneres).",
    ),
  );
  children.push(
    plain("Documento de natureza informativa, gerado automaticamente pela plataforma Jurisprudência.ai.", {
      italics: true,
      color: MUTED,
    }),
  );

  return new Document({
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          run: { size: 26, bold: true, color: ACCENT },
          paragraph: { spacing: { before: 320, after: 120 } },
        },
      ],
    },
    sections: [
      {
        properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
        children,
      },
    ],
  });
}

/* -------------------------------------------------------------------------- */
/* API pública                                                                */
/* -------------------------------------------------------------------------- */

export function nomeArquivoRelatorio(): string {
  const d = new Date();
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  return `${iso}-Relatorio-Pesquisa-Juridica.docx`;
}

/** Monta o .docx e dispara o download no navegador. */
export async function exportarRelatorioDocx(input: ReportInput): Promise<void> {
  const doc = buildDoc(input);
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivoRelatorio();
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
