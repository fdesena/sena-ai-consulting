// Orquestra o fluxo completo do Embedded Signup: code -> token -> registro
// do número -> gravação da conexão. Qualquer falha no meio do caminho grava
// a conexão com status "error" e uma mensagem legível (nunca falha silenciosa).

import { randomInt } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { encryptToken } from "@/lib/crypto.server";
import {
  debugToken,
  exchangeCodeForToken,
  getPhoneNumbers,
  getWabaInfo,
  registerPhoneNumber,
  subscribeAppToWaba,
} from "./graph.server";

function generatePin(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function completeEmbeddedSignup(params: {
  userId: string;
  code: string;
  wabaId: string;
  phoneNumberId: string;
}): Promise<{ connectionId: string; status: "connected" | "error"; errorMessage?: string }> {
  const { userId, code, wabaId, phoneNumberId } = params;

  const { data: connection, error: upsertError } = await supabaseAdmin
    .from("whatsapp_connections")
    .upsert(
      { user_id: userId, waba_id: wabaId, phone_number_id: phoneNumberId, status: "registering" },
      { onConflict: "user_id,waba_id" },
    )
    .select("id")
    .single();

  if (upsertError || !connection) {
    throw new Error(upsertError?.message || "Falha ao criar registro da conexão.");
  }
  const connectionId = connection.id;

  const fail = async (errorMessage: string) => {
    await supabaseAdmin
      .from("whatsapp_connections")
      .update({ status: "error", error_message: errorMessage })
      .eq("id", connectionId);
    return { connectionId, status: "error" as const, errorMessage };
  };

  try {
    const { access_token, expires_in } = await exchangeCodeForToken(code);
    await debugToken(access_token).catch((err) => {
      console.warn("[whatsapp] debug_token falhou (não bloqueante):", err);
    });

    await subscribeAppToWaba(access_token, wabaId);
    const waba = await getWabaInfo(access_token, wabaId);
    const phones = await getPhoneNumbers(access_token, wabaId);
    const phone = phones.data.find((p) => p.id === phoneNumberId) ?? phones.data[0];

    const pin = generatePin();
    await registerPhoneNumber(access_token, phoneNumberId, pin);

    const { ciphertext, iv } = encryptToken(access_token);
    const tokenExpiresAt = expires_in
      ? new Date(Date.now() + expires_in * 1000).toISOString()
      : null;

    const { error: secretError } = await supabaseAdmin.from("whatsapp_connection_secrets").upsert(
      {
        connection_id: connectionId,
        encrypted_access_token: ciphertext,
        token_iv: iv,
        token_expires_at: tokenExpiresAt,
      },
      { onConflict: "connection_id" },
    );
    if (secretError) throw new Error(secretError.message);

    await supabaseAdmin
      .from("whatsapp_connections")
      .update({
        status: "connected",
        business_name: waba.name ?? null,
        verified_name: phone?.verified_name ?? null,
        display_phone_number: phone?.display_phone_number ?? null,
        error_message: null,
        connected_at: new Date().toISOString(),
      })
      .eq("id", connectionId);

    return { connectionId, status: "connected" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return fail(message);
  }
}
