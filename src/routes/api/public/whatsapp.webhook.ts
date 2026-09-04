// Webhook público do WhatsApp Business (Meta). GET = handshake de verificação
// na hora de registrar a Callback URL no App Dashboard. POST = eventos
// (mensagens, status). Autenticação é a assinatura HMAC, não Supabase auth —
// a Meta chama este endpoint diretamente, sem sessão de usuário.

import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

function verifySignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string,
): boolean {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const provided = signatureHeader.slice("sha256=".length);
  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(provided, "hex");
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}

export const Route = createFileRoute("/api/public/whatsapp/webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const verifyToken = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");

        const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
        if (mode === "subscribe" && expectedToken && verifyToken === expectedToken && challenge) {
          return new Response(challenge, { status: 200 });
        }
        return new Response("Forbidden", { status: 403 });
      },

      POST: async ({ request }) => {
        const appSecret = process.env.META_APP_SECRET;
        if (!appSecret) {
          return new Response("Configuração do servidor incompleta.", { status: 500 });
        }

        const rawBody = await request.text();
        const signature = request.headers.get("x-hub-signature-256");
        if (!verifySignature(rawBody, signature, appSecret)) {
          return new Response("Assinatura inválida.", { status: 401 });
        }

        let body: any;
        try {
          body = JSON.parse(rawBody);
        } catch {
          return new Response("OK", { status: 200 });
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const entries: any[] = Array.isArray(body?.entry) ? body.entry : [];

          for (const entry of entries) {
            const wabaId = String(entry?.id ?? "");
            if (!wabaId) continue;

            const { data: connection } = await supabaseAdmin
              .from("whatsapp_connections")
              .select("id")
              .eq("waba_id", wabaId)
              .maybeSingle();

            const changes: any[] = Array.isArray(entry?.changes) ? entry.changes : [];
            for (const change of changes) {
              const field = String(change?.field ?? "unknown");
              const eventType =
                field === "messages"
                  ? "message"
                  : field === "message_template_status_update"
                    ? "template_status"
                    : field;

              await supabaseAdmin.from("whatsapp_events").insert({
                waba_id: wabaId,
                connection_id: connection?.id ?? null,
                event_type: eventType,
                payload: change?.value ?? change ?? {},
              });
            }
          }
        } catch (err) {
          // Loga mas sempre responde 200 rápido — a Meta reenvia agressivamente em falha/timeout.
          console.error("[whatsapp webhook] falha ao processar evento", err);
        }

        return new Response("OK", { status: 200 });
      },
    },
  },
});
