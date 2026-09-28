import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import type { Description, PaymentDetails, Provider } from "./schema";

export type PartyRow = Database["public"]["Tables"]["invoice_parties"]["Row"];
export type PartyKind = "provider" | "payer" | "description" | "payment";

export interface SavedParty<T> {
  id: string;
  kind: PartyKind;
  label: string;
  data: T;
  createdAt: string;
}

export function rowToParty<T>(row: PartyRow): SavedParty<T> {
  const kind = row.kind as PartyKind;
  // Cadastros de prestador salvos antes do CNPJ não têm taxId no jsonb.
  let data = row.data;
  if (kind === "provider") data = { taxId: "", ...(row.data as unknown as Partial<Provider>) };
  else if (kind === "description")
    data = { text: "", ...(row.data as unknown as Partial<Description>) };
  else if (kind === "payment")
    data = { text: "", ...(row.data as unknown as Partial<PaymentDetails>) };
  return { id: row.id, kind, label: row.label, data: data as T, createdAt: row.created_at };
}

export async function listParties<T>(kind: PartyKind): Promise<SavedParty<T>[]> {
  const { data, error } = await supabase
    .from("invoice_parties")
    .select("*")
    .eq("kind", kind)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => rowToParty<T>(row));
}

export async function saveParty<T>(
  kind: PartyKind,
  label: string,
  data: T,
): Promise<SavedParty<T>> {
  const trimmed = label.trim();
  if (trimmed === "") throw new Error("Informe um nome");
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw authError ?? new Error("Sessão expirada");
  const { data: row, error } = await supabase
    .from("invoice_parties")
    .upsert(
      {
        user_id: auth.user.id,
        kind,
        label: trimmed,
        data: data as unknown as Json,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,kind,label" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return rowToParty<T>(row);
}

export async function deleteParty(id: string): Promise<void> {
  const { error } = await supabase.from("invoice_parties").delete().eq("id", id);
  if (error) throw error;
}
