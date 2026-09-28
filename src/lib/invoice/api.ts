import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Currency, InvoiceData, Payer, Provider, SavedInvoice } from "./schema";
import type { Language } from "./format";

export type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
export type InvoiceInsert = Database["public"]["Tables"]["invoices"]["Insert"];

export function rowToInvoice(row: InvoiceRow): SavedInvoice {
  return {
    id: row.id,
    createdAt: row.created_at,
    language: row.language as Language,
    number: row.number,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    // Invoices antigas foram gravadas antes de existir o CNPJ no jsonb.
    provider: { taxId: "", ...(row.provider as unknown as Partial<Provider>) } as Provider,
    payer: row.payer as unknown as Payer,
    description: row.description,
    // Invoices anteriores à coluna podem vir sem o campo.
    paymentDetails: row.payment_details ?? "",
    currency: row.currency as Currency,
    amount: Number(row.amount),
  };
}

export function invoiceToInsert(data: InvoiceData, userId: string): InvoiceInsert {
  return {
    user_id: userId,
    language: data.language,
    number: data.number,
    issue_date: data.issueDate,
    due_date: data.dueDate,
    provider: data.provider,
    payer: data.payer,
    description: data.description,
    payment_details: data.paymentDetails,
    currency: data.currency,
    amount: data.amount,
  };
}

export async function listInvoices(): Promise<SavedInvoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToInvoice);
}

export async function insertInvoice(data: InvoiceData): Promise<SavedInvoice> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw authError ?? new Error("Sessão expirada");
  const { data: row, error } = await supabase
    .from("invoices")
    .insert(invoiceToInsert(data, auth.user.id))
    .select("*")
    .single();
  if (error) throw error;
  return rowToInvoice(row);
}

export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw error;
}
