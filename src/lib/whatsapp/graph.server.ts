// Wrapper fino sobre a Graph API da Meta para o fluxo de Embedded Signup
// (WhatsApp Business Platform, modelo Tech Provider). Sem SDK — fetch puro,
// no mesmo estilo do resto do repo (ex.: chamadas do JusRadar a APIs externas).

import type {
  GraphDebugTokenResponse,
  GraphPhoneNumber,
  GraphTokenResponse,
  GraphWabaInfo,
} from "./types";

function graphConfig() {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const version = process.env.META_GRAPH_API_VERSION || "v21.0";
  if (!appId || !appSecret) {
    throw new Error("META_APP_ID / META_APP_SECRET não configurados.");
  }
  return { appId, appSecret, base: `https://graph.facebook.com/${version}` };
}

async function graphFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (json as any)?.error?.message || `Graph API respondeu ${res.status}.`;
    throw new Error(message);
  }
  return json as T;
}

/** Troca o `code` do Embedded Signup por um access token (System User). */
export async function exchangeCodeForToken(code: string): Promise<GraphTokenResponse> {
  const { appId, appSecret, base } = graphConfig();
  const url = new URL(`${base}/oauth/access_token`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("code", code);
  return graphFetch<GraphTokenResponse>(url.toString());
}

/** Valida o token e retorna seus escopos/validade — usado só para log/verificação. */
export async function debugToken(accessToken: string): Promise<GraphDebugTokenResponse> {
  const { appId, appSecret, base } = graphConfig();
  const url = new URL(`${base}/debug_token`);
  url.searchParams.set("input_token", accessToken);
  url.searchParams.set("access_token", `${appId}|${appSecret}`);
  return graphFetch<GraphDebugTokenResponse>(url.toString());
}

/** Vincula o WABA do cliente ao nosso app — sem isso o webhook não recebe eventos dele. */
export async function subscribeAppToWaba(accessToken: string, wabaId: string): Promise<void> {
  const { base } = graphConfig();
  await graphFetch(`${base}/${wabaId}/subscribed_apps`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getWabaInfo(accessToken: string, wabaId: string): Promise<GraphWabaInfo> {
  const { base } = graphConfig();
  const url = new URL(`${base}/${wabaId}`);
  url.searchParams.set("fields", "id,name,message_template_namespace");
  return graphFetch<GraphWabaInfo>(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getPhoneNumbers(
  accessToken: string,
  wabaId: string,
): Promise<{ data: GraphPhoneNumber[] }> {
  const { base } = graphConfig();
  return graphFetch<{ data: GraphPhoneNumber[] }>(`${base}/${wabaId}/phone_numbers`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

/** Registro obrigatório na Cloud API antes do número enviar/receber mensagens. */
export async function registerPhoneNumber(
  accessToken: string,
  phoneNumberId: string,
  pin: string,
): Promise<void> {
  const { base } = graphConfig();
  await graphFetch(`${base}/${phoneNumberId}/register`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", pin }),
  });
}

/** Envio de mensagem via template — stub para uso futuro, não usado no MVP de conexão. */
export async function sendTemplateMessage(
  accessToken: string,
  phoneNumberId: string,
  payload: Record<string, unknown>,
): Promise<unknown> {
  const { base } = graphConfig();
  return graphFetch(`${base}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });
}
