import { jsPDF } from "jspdf";
import { formatAmount, formatDate, joinAddress, type Language } from "./format";
import type { InvoiceData } from "./schema";

export const LABELS: Record<
  Language,
  {
    title: string;
    number: string;
    issueDate: string;
    dueDate: string;
    provider: string;
    taxId: string;
    payer: string;
    description: string;
    amount: string;
    paymentDetails: string;
  }
> = {
  pt: {
    title: "Invoice",
    number: "Número da invoice",
    issueDate: "Emissão",
    dueDate: "Validade",
    provider: "Prestador",
    taxId: "CNPJ",
    payer: "Pagador",
    description: "Descrição",
    amount: "Valor a pagar",
    paymentDetails: "Dados para pagamento",
  },
  en: {
    title: "Invoice",
    number: "Invoice number",
    issueDate: "Issue date",
    dueDate: "Due date",
    provider: "Service provider",
    taxId: "CNPJ",
    payer: "Service user",
    description: "Description",
    amount: "Amount to pay",
    paymentDetails: "Payment details",
  },
};

type Rgb = [number, number, number];
const INK: Rgb = [16, 17, 18];
const ORANGE: Rgb = [252, 124, 52];
const MUTED: Rgb = [94, 102, 108];
const RULE: Rgb = [221, 221, 214];

const PAGE_W = 595.28; // A4 em pt
const PAGE_H = 841.89;
const MARGIN = 56;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = PAGE_H - 32;
const LINE = 15;

// O PNG do símbolo é quadrado com respiro; estas frações são a caixa visível
// do desenho, usadas para alinhar o "SL" à margem esquerda.
const LOGO_SIZE = 72;
const LOGO_INSET_X = 0.109;
const LOGO_INSET_Y = 0.281;

// A Helvetica embutida do jsPDF é WinAnsi (1 byte). Um único caractere fora
// dela faz o jsPDF gravar a linha inteira em 2 bytes, e ela sai ilegível.
const WIN_ANSI_EXTRAS = new Set("€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ");
const WIN_ANSI_FALLBACK: Record<string, string> = {
  "→": "->",
  "←": "<-",
  "✓": "v",
  "✔": "v",
  ł: "l",
  Ł: "L",
};

function isWinAnsi(ch: string): boolean {
  return ch.length === 1 && (ch.charCodeAt(0) <= 0xff || WIN_ANSI_EXTRAS.has(ch));
}

export function toWinAnsi(s: string): string {
  return Array.from(s)
    .map((ch) => {
      if (isWinAnsi(ch)) return ch;
      const stripped = ch.normalize("NFD").replace(/\p{M}/gu, "");
      if (stripped !== "" && Array.from(stripped).every(isWinAnsi)) return stripped;
      return WIN_ANSI_FALLBACK[ch] ?? "?";
    })
    .join("");
}

export function pdfFileName(number: string): string {
  const safe = number
    .trim()
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `invoice-${safe || "sem-numero"}.pdf`;
}

export function buildInvoicePdf(inv: InvoiceData, logoDataUrl?: string): jsPDF {
  const L = LABELS[inv.language];
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setProperties({ title: toWinAnsi(`${L.title} ${inv.number}`) });
  let y = MARGIN;

  function ensureSpace(height: number) {
    if (y + height > FOOTER_Y - 16) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function labelValue(label: string, value: string, x: number): number {
    const labelText = `${label}: `;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(labelText, x, y);
    const valueX = x + doc.getTextWidth(labelText);
    doc.setFont("helvetica", "normal");
    const text = toWinAnsi(value);
    doc.text(text, valueX, y);
    return valueX + doc.getTextWidth(text);
  }

  function heading(text: string) {
    ensureSpace(48);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text(text, MARGIN, y);
    y += 8;
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 20;
  }

  function body(lines: string[]) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...MUTED);
    for (const raw of lines) {
      const line = toWinAnsi(raw.trimEnd());
      if (line === "") {
        y += LINE;
        continue;
      }
      for (const part of doc.splitTextToSize(line, CONTENT_W) as string[]) {
        ensureSpace(LINE);
        doc.text(part, MARGIN, y);
        y += LINE;
      }
    }
  }

  if (logoDataUrl) {
    doc.addImage(
      logoDataUrl,
      "PNG",
      MARGIN - LOGO_INSET_X * LOGO_SIZE,
      40 - LOGO_INSET_Y * LOGO_SIZE,
      LOGO_SIZE,
      LOGO_SIZE,
      undefined,
      "FAST",
    );
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...INK);
  y = 120;
  doc.text(L.title, MARGIN, y);
  y += 12;
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(1.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);

  y += 24;
  labelValue(L.number, inv.number, MARGIN);
  y += 16;
  const issueEnd = labelValue(L.issueDate, formatDate(inv.issueDate, inv.language), MARGIN);
  doc.setTextColor(...MUTED);
  doc.text("-", issueEnd + 8, y);
  labelValue(
    L.dueDate,
    formatDate(inv.dueDate, inv.language),
    issueEnd + 8 + doc.getTextWidth("-") + 8,
  );
  y += 44;

  heading(L.provider);
  body(
    [
      inv.provider.name,
      inv.provider.taxId.trim() === "" ? "" : `${L.taxId}: ${inv.provider.taxId}`,
      inv.provider.email,
      joinAddress(inv.provider.address, inv.provider.cityState, inv.provider.zip),
    ].filter((s) => s.trim() !== ""),
  );
  y += 20;

  heading(L.payer);
  body([inv.payer.name, inv.payer.address].filter((s) => s.trim() !== ""));
  y += 20;

  heading(L.description);
  body(inv.description.split(/\r?\n/));
  y += 20;

  ensureSpace(52);
  heading(L.amount);
  ensureSpace(24);
  const currency = `${inv.currency} `;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text(currency, MARGIN, y);
  const currencyW = doc.getTextWidth(currency);
  doc.setFont("helvetica", "bold");
  doc.text(formatAmount(inv.amount, inv.language), MARGIN + currencyW, y);

  const paymentDetails = inv.paymentDetails.trim();
  if (paymentDetails !== "") {
    y += 36;
    heading(L.paymentDetails);
    body(paymentDetails.split(/\r?\n/));
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Sena Labs", MARGIN, FOOTER_Y);
    if (pages > 1) doc.text(`${i} / ${pages}`, PAGE_W - MARGIN, FOOTER_Y, { align: "right" });
  }

  return doc;
}
