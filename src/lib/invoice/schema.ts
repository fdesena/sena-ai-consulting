import { z } from "zod";
import {
  addDays,
  formatAmount,
  parseAmount,
  suggestNumber,
  todayIso,
  type Language,
} from "./format";

export const CURRENCIES = ["USD", "EUR", "BRL", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

export type Provider = {
  name: string;
  taxId: string;
  email: string;
  address: string;
  cityState: string;
  zip: string;
};

export type Payer = {
  name: string;
  address: string;
};

export type Description = {
  text: string;
};

export type PaymentDetails = {
  text: string;
};

export interface InvoiceData {
  language: Language;
  number: string;
  issueDate: string;
  dueDate: string;
  provider: Provider;
  payer: Payer;
  description: string;
  paymentDetails: string;
  currency: Currency;
  amount: number;
}

export interface SavedInvoice extends InvoiceData {
  id: string;
  createdAt: string;
}

export interface InvoiceFormValues extends Omit<InvoiceData, "amount"> {
  amount: string;
}

const required = (message: string) => z.string().trim().min(1, message);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data");
const optionalEmail = z
  .string()
  .trim()
  .refine((v) => v === "" || z.string().email().safeParse(v).success, "E-mail inválido");

const invoiceFormSchema = z
  .object({
    language: z.enum(["pt", "en"]),
    number: required("Informe o número"),
    issueDate: isoDate,
    dueDate: isoDate,
    provider: z.object({
      name: required("Informe a razão social"),
      taxId: z.string().trim(),
      email: optionalEmail,
      address: z.string().trim(),
      cityState: z.string().trim(),
      zip: z.string().trim(),
    }),
    payer: z.object({
      name: required("Informe o nome da empresa"),
      address: z.string().trim(),
    }),
    description: required("Descreva o serviço"),
    paymentDetails: z.string().trim(),
    currency: z.enum(CURRENCIES),
    amount: z.string().transform((v, ctx) => {
      const n = parseAmount(v);
      if (n === null || n <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe um valor maior que zero" });
        return z.NEVER;
      }
      return n;
    }),
  })
  .refine((v) => v.dueDate >= v.issueDate, {
    message: "A validade não pode ser anterior à emissão",
    path: ["dueDate"],
  });

export function parseInvoiceForm(
  values: InvoiceFormValues,
): { ok: true; data: InvoiceData } | { ok: false; errors: Record<string, string> } {
  const r = invoiceFormSchema.safeParse(values);
  if (r.success) return { ok: true, data: r.data };
  const errors: Record<string, string> = {};
  for (const issue of r.error.issues) {
    const key = issue.path.join(".");
    if (!(key in errors)) errors[key] = issue.message;
  }
  return { ok: false, errors };
}

const DESCRIPTION_LABEL_MAX = 80;

export function descriptionLabel(text: string): string {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim() !== "") ?? "";
  const collapsed = firstLine.trim().replace(/\s+/g, " ");
  // Array.from corta por caractere, sem partir um par substituto (emoji).
  const cut = Array.from(collapsed).slice(0, DESCRIPTION_LABEL_MAX).join("");
  return cut.replace(/[\s:]+$/, "");
}

const EMPTY_PROVIDER: Provider = {
  name: "",
  taxId: "",
  email: "",
  address: "",
  cityState: "",
  zip: "",
};

export function emptyFormValues(today: string = todayIso()): InvoiceFormValues {
  return {
    language: "pt",
    number: suggestNumber(today),
    issueDate: today,
    dueDate: addDays(today, 7),
    provider: { ...EMPTY_PROVIDER },
    payer: { name: "", address: "" },
    description: "",
    paymentDetails: "",
    currency: "USD",
    amount: "",
  };
}

export function initialFormValues(
  latest?: SavedInvoice,
  today: string = todayIso(),
  defaultProvider?: Provider,
  defaultPaymentDetails?: string,
): InvoiceFormValues {
  const base = emptyFormValues(today);
  const provider = defaultProvider ?? latest?.provider;
  const withProvider = provider ? { ...base, provider: { ...provider } } : base;
  return defaultPaymentDetails === undefined
    ? withProvider
    : { ...withProvider, paymentDetails: defaultPaymentDetails };
}

export function formValuesFromInvoice(
  inv: InvoiceData,
  today: string = todayIso(),
): InvoiceFormValues {
  return {
    ...emptyFormValues(today),
    language: inv.language,
    provider: { ...inv.provider },
    payer: { ...inv.payer },
    description: inv.description,
    paymentDetails: inv.paymentDetails,
    currency: inv.currency,
    amount: formatAmount(inv.amount, "pt"),
  };
}
