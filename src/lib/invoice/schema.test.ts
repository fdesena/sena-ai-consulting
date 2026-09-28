import { describe, expect, it } from "vitest";
import {
  descriptionLabel,
  emptyFormValues,
  formValuesFromInvoice,
  initialFormValues,
  parseInvoiceForm,
  type InvoiceFormValues,
  type SavedInvoice,
} from "./schema";

const TODAY = "2026-09-28";

function valid(): InvoiceFormValues {
  return {
    ...emptyFormValues(TODAY),
    provider: {
      name: "Acme Serviços Ltda",
      taxId: "12.345.678/0001-90",
      email: "contato@example.com",
      address: "Rua Exemplo, 100",
      cityState: "Cidade, UF",
      zip: "12345000",
    },
    payer: { name: "Cliente Exemplo LLC", address: "100 Example St, MA, 02100" },
    description: "Professional Training",
    amount: "5.300,00",
  };
}

const saved: SavedInvoice = {
  id: "1",
  createdAt: "2026-09-01T00:00:00Z",
  language: "en",
  number: "09012026",
  issueDate: "2026-09-01",
  dueDate: "2026-09-08",
  provider: { name: "P", taxId: "", email: "", address: "A", cityState: "C", zip: "1" },
  payer: { name: "Payer", address: "Addr" },
  description: "Old work",
  paymentDetails: "Acme Bank\nRouting: 000000000",
  currency: "EUR",
  amount: 5300,
};

describe("emptyFormValues", () => {
  it("defaults dates, number and language", () => {
    const v = emptyFormValues(TODAY);
    expect(v).toMatchObject({
      language: "pt",
      issueDate: TODAY,
      dueDate: "2026-10-05",
      number: "09282026",
      currency: "USD",
      amount: "",
      paymentDetails: "",
    });
  });
});

describe("paymentDetails", () => {
  it("is trimmed on parse", () => {
    const v = valid();
    v.paymentDetails = "  Acme Bank\nRouting: 000000000 \n\n";
    const r = parseInvoiceForm(v);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.paymentDetails).toBe("Acme Bank\nRouting: 000000000");
  });

  it.each(["", "   \n "])("accepts empty value %j", (text) => {
    const v = valid();
    v.paymentDetails = text;
    const r = parseInvoiceForm(v);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.paymentDetails).toBe("");
  });
});

describe("provider taxId", () => {
  it("starts empty and is trimmed on parse", () => {
    expect(emptyFormValues(TODAY).provider.taxId).toBe("");
    const v = valid();
    v.provider.taxId = "  12.345.678/0001-90 ";
    const r = parseInvoiceForm(v);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.provider.taxId).toBe("12.345.678/0001-90");
  });

  it("is optional", () => {
    const v = valid();
    v.provider.taxId = "";
    expect(parseInvoiceForm(v).ok).toBe(true);
  });
});

describe("parseInvoiceForm", () => {
  it("accepts valid values and converts the amount to a number", () => {
    const r = parseInvoiceForm(valid());
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.amount).toBe(5300);
  });

  it("allows empty optional provider fields", () => {
    const v = valid();
    v.provider = { ...v.provider, email: "", address: "", cityState: "", zip: "" };
    v.payer.address = "";
    expect(parseInvoiceForm(v).ok).toBe(true);
  });

  it("reports required fields by path", () => {
    const v = valid();
    v.provider.name = " ";
    v.payer.name = "";
    v.number = "";
    v.description = "";
    const r = parseInvoiceForm(v);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errors).sort()).toEqual([
        "description",
        "number",
        "payer.name",
        "provider.name",
      ]);
    }
  });

  it.each(["", "0", "0,00", "-1", "abc", "1,234,567"])("rejects amount %j", (amount) => {
    const v = valid();
    v.amount = amount;
    const r = parseInvoiceForm(v);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.amount).toBeTruthy();
  });

  it("rejects a due date before the issue date", () => {
    const v = valid();
    v.dueDate = "2026-09-27";
    const r = parseInvoiceForm(v);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.dueDate).toMatch(/anterior/);
  });

  it("rejects an invalid e-mail but not an empty one", () => {
    const v = valid();
    v.provider.email = "not-an-email";
    const r = parseInvoiceForm(v);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors["provider.email"]).toBeTruthy();
  });

  it("rejects an empty date instead of crashing", () => {
    const v = valid();
    v.issueDate = "";
    const r = parseInvoiceForm(v);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.issueDate).toBeTruthy();
  });
});

describe("initialFormValues", () => {
  it("is empty when there is no previous invoice", () => {
    expect(initialFormValues(undefined, TODAY)).toEqual(emptyFormValues(TODAY));
  });
  it("copies only the provider from the latest invoice", () => {
    const v = initialFormValues(saved, TODAY);
    expect(v.provider).toEqual(saved.provider);
    expect(v.payer).toEqual({ name: "", address: "" });
    expect(v.description).toBe("");
    expect(v.amount).toBe("");
    expect(v.language).toBe("pt");
  });
  it("prefers the default provider over the latest invoice provider", () => {
    const defaultProvider = {
      ...saved.provider,
      name: "Acme Serviços Ltda",
      taxId: "12.345.678/0001-90",
    };
    const v = initialFormValues(saved, TODAY, defaultProvider);
    expect(v.provider).toEqual(defaultProvider);
    expect(v.provider).not.toBe(defaultProvider);
  });
  it("uses the default provider even without a previous invoice", () => {
    const defaultProvider = { ...saved.provider, name: "Acme Serviços Ltda" };
    expect(initialFormValues(undefined, TODAY, defaultProvider).provider).toEqual(defaultProvider);
  });
  it("falls back to the latest invoice provider when there is no default", () => {
    expect(initialFormValues(saved, TODAY, undefined).provider).toEqual(saved.provider);
  });
  it("applies the default payment details when present", () => {
    const v = initialFormValues(saved, TODAY, undefined, "Acme Bank\nAccount: 000000000000");
    expect(v.paymentDetails).toBe("Acme Bank\nAccount: 000000000000");
  });
  it("leaves payment details empty without a default, never copying the latest invoice", () => {
    expect(initialFormValues(saved, TODAY).paymentDetails).toBe("");
    expect(initialFormValues(saved, TODAY, undefined, undefined).paymentDetails).toBe("");
  });
});

describe("formValuesFromInvoice (duplicate)", () => {
  it("keeps content but resets number and dates", () => {
    const v = formValuesFromInvoice(saved, TODAY);
    expect(v).toMatchObject({
      language: "en",
      number: "09282026",
      issueDate: TODAY,
      dueDate: "2026-10-05",
      description: "Old work",
      currency: "EUR",
      amount: "5.300,00",
    });
    expect(v.payer).toEqual(saved.payer);
  });
  it("copies the payment details", () => {
    expect(formValuesFromInvoice(saved, TODAY).paymentDetails).toBe(saved.paymentDetails);
  });
});

describe("descriptionLabel", () => {
  it("uses the first line of a multiline text", () => {
    expect(descriptionLabel("Consultoria mensal\n\n- item A")).toBe("Consultoria mensal");
  });

  it("ignores leading blank lines", () => {
    expect(descriptionLabel("\n  \n\t\nConsultoria mensal\nSegunda linha")).toBe(
      "Consultoria mensal",
    );
  });

  it("trims and collapses inner whitespace", () => {
    expect(descriptionLabel("   Consultoria \t  mensal   Acme  ")).toBe("Consultoria mensal Acme");
  });

  it("cuts a long line at 80 characters", () => {
    const label = descriptionLabel("a".repeat(120));
    expect(label).toHaveLength(80);
    expect(label).toBe("a".repeat(80));
  });

  it("does not leave a trailing space after cutting", () => {
    expect(descriptionLabel(`${"a".repeat(79)} bbb`)).toBe("a".repeat(79));
  });

  it.each([
    ["Bank Account Details for Payment:", "Bank Account Details for Payment"],
    ["Título::  ", "Título"],
    ["Título : ", "Título"],
    ["Dados: bancários", "Dados: bancários"],
    [":", ""],
  ])("removes trailing colons from %j", (text, expected) => {
    expect(descriptionLabel(text)).toBe(expected);
  });

  it("does not split a surrogate pair when cutting at 80 characters", () => {
    const label = descriptionLabel(`${"a".repeat(79)}😀 resto`);
    expect(Array.from(label)).toHaveLength(80);
    expect(label).toBe(`${"a".repeat(79)}😀`);
    expect(label).not.toMatch(/[\ud800-\udbff]$/);
    const before = descriptionLabel(`${"a".repeat(78)}😀😀`);
    expect(before).toBe(`${"a".repeat(78)}😀😀`);
  });

  it.each(["", "   ", "\n\n  \n"])("returns an empty label for %j", (text) => {
    expect(descriptionLabel(text)).toBe("");
  });
});
