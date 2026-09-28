import { describe, expect, it } from "vitest";
import { invoiceToInsert, rowToInvoice, type InvoiceRow } from "./api";
import type { InvoiceData } from "./schema";

const data: InvoiceData = {
  language: "en",
  number: "09282026",
  issueDate: "2026-09-28",
  dueDate: "2026-10-05",
  provider: { name: "P", taxId: "", email: "p@x.com", address: "A", cityState: "C", zip: "1" },
  payer: { name: "Payer", address: "Addr" },
  description: "Work",
  paymentDetails: "Acme Bank\nRouting: 000000000",
  currency: "USD",
  amount: 5300,
};

describe("invoice mappers", () => {
  it("maps an invoice to an insert row", () => {
    expect(invoiceToInsert(data, "user-1")).toEqual({
      user_id: "user-1",
      language: "en",
      number: "09282026",
      issue_date: "2026-09-28",
      due_date: "2026-10-05",
      provider: data.provider,
      payer: data.payer,
      description: "Work",
      payment_details: "Acme Bank\nRouting: 000000000",
      currency: "USD",
      amount: 5300,
    });
  });

  it("maps a row back to a saved invoice", () => {
    const row: InvoiceRow = {
      id: "abc",
      created_at: "2026-09-28T12:00:00Z",
      user_id: "user-1",
      language: "en",
      number: "09282026",
      issue_date: "2026-09-28",
      due_date: "2026-10-05",
      provider: data.provider,
      payer: data.payer,
      description: "Work",
      payment_details: "Acme Bank\nRouting: 000000000",
      currency: "USD",
      amount: 5300,
    };
    expect(rowToInvoice(row)).toEqual({ ...data, id: "abc", createdAt: "2026-09-28T12:00:00Z" });
  });

  it("turns a missing taxId in an old row into an empty string", () => {
    const { taxId: _omit, ...legacyProvider } = data.provider;
    const row: InvoiceRow = {
      id: "old",
      created_at: "2026-09-01T12:00:00Z",
      user_id: "user-1",
      language: "pt",
      number: "09012026",
      issue_date: "2026-09-01",
      due_date: "2026-09-08",
      provider: legacyProvider,
      payer: data.payer,
      description: "Work",
      payment_details: "",
      currency: "USD",
      amount: 100,
    };
    expect(rowToInvoice(row).provider.taxId).toBe("");
  });

  it("turns a row without payment_details into an empty string", () => {
    const { payment_details: _omit, ...rest } = {
      id: "old",
      created_at: "2026-09-01T12:00:00Z",
      user_id: "user-1",
      language: "pt",
      number: "09012026",
      issue_date: "2026-09-01",
      due_date: "2026-09-08",
      provider: data.provider,
      payer: data.payer,
      description: "Work",
      payment_details: "",
      currency: "USD",
      amount: 100,
    };
    expect(rowToInvoice(rest as unknown as InvoiceRow).paymentDetails).toBe("");
    expect(
      rowToInvoice({ ...rest, payment_details: null } as unknown as InvoiceRow).paymentDetails,
    ).toBe("");
  });
});
