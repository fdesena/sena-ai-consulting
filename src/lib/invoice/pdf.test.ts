// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildInvoicePdf, pdfFileName, toWinAnsi } from "./pdf";
import type { InvoiceData } from "./schema";

const base: InvoiceData = {
  language: "en",
  number: "09282026",
  issueDate: "2026-09-28",
  dueDate: "2026-10-05",
  provider: {
    name: "Acme Serviços Ltda",
    taxId: "",
    email: "contato@example.com",
    address: "Rua Exemplo, 100,",
    cityState: "Cidade, UF",
    zip: "12345000",
  },
  payer: { name: "Cliente Exemplo LLC", address: "100 Example St, MA, 02100" },
  description: "Professional Training & Program Support Services\n\n- Design and delivery",
  paymentDetails: "",
  currency: "USD",
  amount: 5300,
};

// jsPDF sem compressão deixa o texto legível no stream: "(texto) Tj".
const out = (inv: InvoiceData) => buildInvoicePdf(inv).output();

describe("buildInvoicePdf", () => {
  it("renders the English document", () => {
    const pdf = out(base);
    for (const s of [
      "Invoice number: ",
      "09282026",
      "Issue date: ",
      "09/28/2026",
      "Due date: ",
      "10/05/2026",
      "Service provider",
      "Service user",
      "Description",
      "Amount to pay",
      "Cliente Exemplo LLC",
      "Rua Exemplo, 100, Cidade, UF, 12.345-000",
      "5,300.00",
      "Sena Labs",
    ]) {
      expect(pdf).toContain(s);
    }
  });

  it("renders the Portuguese document", () => {
    const pdf = out({ ...base, language: "pt" });
    for (const s of [
      "Prestador",
      "Pagador",
      "Descrição",
      "Valor a pagar",
      "28/09/2026",
      "05/10/2026",
      "5.300,00",
    ]) {
      expect(pdf).toContain(s);
    }
    expect(pdf).not.toContain("Service provider");
  });

  it("omits empty optional provider fields without stray commas", () => {
    const pdf = out({
      ...base,
      provider: { ...base.provider, email: "", address: "", cityState: "", zip: "" },
      payer: { ...base.payer, address: "" },
    });
    expect(pdf).not.toContain("(, )");
    expect(pdf).not.toContain("()");
  });

  it.each(["en", "pt"] as const)("prints the provider CNPJ line in %s", (language) => {
    const pdf = out({
      ...base,
      language,
      provider: { ...base.provider, taxId: "12.345.678/0001-90" },
    });
    expect(pdf).toContain("CNPJ: ");
    expect(pdf).toContain("12.345.678/0001-90");
  });

  it("puts the CNPJ line right below the provider name", () => {
    const pdf = out({ ...base, provider: { ...base.provider, taxId: "12.345.678/0001-90" } });
    const name = pdf.indexOf("Acme Servi");
    const cnpj = pdf.indexOf("CNPJ: ");
    const email = pdf.indexOf("contato@example.com");
    expect(name).toBeGreaterThan(-1);
    expect(cnpj).toBeGreaterThan(name);
    expect(cnpj).toBeLessThan(email);
  });

  it("omits the CNPJ line when the tax id is empty", () => {
    expect(out(base)).not.toContain("CNPJ");
  });

  it("keeps the original invoice number inside the document", () => {
    expect(out({ ...base, number: "2026/09 Ç" })).toContain("2026/09 Ç");
  });

  it("stays on one page for a short description and adds pages for a long one", () => {
    expect(buildInvoicePdf(base).getNumberOfPages()).toBe(1);
    const long = Array.from({ length: 300 }, (_, i) => `- Linha de serviço número ${i + 1}`).join(
      "\n",
    );
    const doc = buildInvoicePdf({ ...base, description: long });
    expect(doc.getNumberOfPages()).toBeGreaterThan(2);
    const pdf = doc.output();
    expect(pdf).toContain("Linha de serviço número 1");
    expect(pdf).toContain("Linha de serviço número 300");
  });

  it("breaks a single very long token without losing or overflowing it", () => {
    const token = "Q".repeat(5000);
    const doc = buildInvoicePdf({ ...base, description: token });
    const pdf = doc.output();
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    expect(pdf).not.toContain(token);
    expect(pdf.split("Q").length - 1).toBe(5000);
  });

  it("numbers pages only when there is more than one", () => {
    expect(out(base)).not.toContain("1 / 1");
    const long = Array.from({ length: 300 }, (_, i) => `- Linha ${i}`).join("\n");
    expect(out({ ...base, description: long })).toContain("1 / ");
  });
});

const BANK = [
  "Bank Account Details for Payment",
  "",
  "- Bank: Acme Bank",
  "- Routing number: 000000000",
  "- Account number: 000000000000",
].join("\n");

describe("buildInvoicePdf payment details", () => {
  it.each([
    ["en", "Payment details", "Amount to pay"],
    ["pt", "Dados para pagamento", "Valor a pagar"],
  ] as const)("prints the section after the amount in %s", (language, title, amountLabel) => {
    const pdf = out({ ...base, language, paymentDetails: BANK });
    const amount = pdf.indexOf(amountLabel);
    const section = pdf.indexOf(title);
    expect(amount).toBeGreaterThan(-1);
    expect(section).toBeGreaterThan(amount);
    expect(pdf.indexOf("Acme Bank")).toBeGreaterThan(section);
    for (const s of [
      "Bank Account Details for Payment",
      "- Routing number: 000000000",
      "- Account number: 000000000000",
    ]) {
      expect(pdf.indexOf(s)).toBeGreaterThan(section);
    }
  });

  it("does not use the other language's title", () => {
    expect(out({ ...base, language: "pt", paymentDetails: BANK })).not.toContain("Payment details");
    expect(out({ ...base, language: "en", paymentDetails: BANK })).not.toContain(
      "Dados para pagamento",
    );
  });

  it.each(["", "   \n  \n"])("omits the section when the text is %j", (paymentDetails) => {
    for (const language of ["en", "pt"] as const) {
      const pdf = out({ ...base, language, paymentDetails });
      expect(pdf).not.toContain("Payment details");
      expect(pdf).not.toContain("Dados para pagamento");
    }
  });

  it("keeps the blank line between groups", () => {
    const yOf = (pdf: string, text: string) => {
      const m = new RegExp(`([\\d.]+) Td\\n\\(${text}\\) Tj`).exec(pdf);
      return Number(m?.[1]);
    };
    const withBlank = out({ ...base, paymentDetails: "Linha A\n\nLinha B" });
    const without = out({ ...base, paymentDetails: "Linha A\nLinha B" });
    const gapWith = yOf(withBlank, "Linha A") - yOf(withBlank, "Linha B");
    const gapWithout = yOf(without, "Linha A") - yOf(without, "Linha B");
    expect(gapWithout).toBeGreaterThan(0);
    expect(gapWith).toBeCloseTo(gapWithout * 2, 1);
  });

  it("paginates a long text without losing lines and keeps the footer on every page", () => {
    const long = Array.from({ length: 200 }, (_, i) => `- Instrução de pagamento ${i + 1}`).join(
      "\n",
    );
    const doc = buildInvoicePdf({ ...base, paymentDetails: long });
    expect(doc.getNumberOfPages()).toBeGreaterThan(2);
    const pdf = doc.output();
    expect(pdf).toContain("Instrução de pagamento 1)");
    expect(pdf).toContain("Instrução de pagamento 200)");
    expect(pdf.split("Sena Labs").length - 1).toBe(doc.getNumberOfPages());
  });

  it("wraps a long paragraph into several lines", () => {
    const paragraph = Array.from({ length: 80 }, (_, i) => `palavra${i}`).join(" ");
    const pdf = out({ ...base, paymentDetails: paragraph });
    expect(pdf).not.toContain(paragraph);
    expect(pdf).toContain("palavra0");
    expect(pdf).toContain("palavra79");
  });

  it("never leaves the section title alone at the bottom of a page", () => {
    // Enche a primeira página até sobrar pouco espaço e confere que o título
    // e a primeira linha ficam na mesma página.
    for (let n = 0; n < 100; n++) {
      const description = Array.from({ length: n + 5 }, (_, i) => `Linha ${i}`).join("\n");
      const doc = buildInvoicePdf({
        ...base,
        description,
        paymentDetails: "Primeira linha de pagamento",
      });
      const pages = doc.getNumberOfPages();
      let titlePage = 0;
      let bodyPage = 0;
      for (let p = 1; p <= pages; p++) {
        const text = (doc as unknown as { internal: { pages: string[][] } }).internal.pages[p].join(
          "\n",
        );
        if (text.includes("(Payment details)")) titlePage = p;
        if (text.includes("(Primeira linha de pagamento)")) bodyPage = p;
      }
      expect(titlePage).toBeGreaterThan(0);
      expect(bodyPage).toBe(titlePage);
    }
  });

  it("passes characters through toWinAnsi", () => {
    const pdf = out({
      ...base,
      paymentDetails: "Pagamento — Acme · Banco\nConfirmado ✓ ok",
    });
    expect(pdf).toContain("Confirmado v ok");
    expect(pdf).not.toContain("✓");
    expect(pdf).not.toContain("\u0000P\u0000a\u0000g");
  });
});

describe("toWinAnsi", () => {
  it.each([
    ["Consultoria ✓ entregue", "Consultoria v entregue"],
    ["Etapa 1 → Etapa 2", "Etapa 1 -> Etapa 2"],
    ["Michał Kowalski", "Michal Kowalski"],
    ["Şahin Řehoř", "Sahin Rehor"],
    ["ação €10 – ok", "ação €10 – ok"],
    ["ok 😀", "ok ?"],
    ["Acme — Banco · Agência", "Acme — Banco · Agência"],
  ])("converts %j", (input, expected) => {
    expect(toWinAnsi(input)).toBe(expected);
  });
});

describe("buildInvoicePdf with characters outside WinAnsi", () => {
  it("writes them as single-byte text instead of garbling the line", () => {
    const pdf = out({
      ...base,
      description: "Consultoria ✓ entregue\nEtapa 1 → Etapa 2",
      payer: { ...base.payer, name: "Michał Kowalski" },
    });
    expect(pdf).toContain("Consultoria v entregue");
    expect(pdf).toContain("Etapa 1 -> Etapa 2");
    expect(pdf).toContain("Michal Kowalski");
    expect(pdf).not.toContain("✓");
    // jsPDF escreve linhas fora do WinAnsi como texto de 2 bytes (\0C\0o\0n...).
    expect(pdf).not.toContain("\u0000C\u0000o\u0000n");
  });
});

describe("pdfFileName", () => {
  it("builds a safe file name", () => {
    expect(pdfFileName("09282026")).toBe("invoice-09282026.pdf");
    expect(pdfFileName("2026/09 Ç")).toBe("invoice-2026_09.pdf");
    expect(pdfFileName("   ")).toBe("invoice-sem-numero.pdf");
  });
});
