// Endpoint SSE do JusRadar: recebe { contexto } e transmite os ProgressEvents do agente.
// Protegido: exige usuário autenticado COM acesso ao app "jusradar" (ou admin),
// pois o agente consome a API paga da OpenAI.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { runPesquisa } from "@/lib/jusradar/agent";
import type { ProgressEvent } from "@/lib/jusradar/types";
import type { Database } from "@/integrations/supabase/types";

async function authorize(
  request: Request,
): Promise<{ ok: true; userId: string } | { ok: false; status: number; message: string }> {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, status: 500, message: "Configuração do servidor incompleta." };
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { ok: false, status: 401, message: "Não autenticado." };

  const auth = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await auth.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !userId) return { ok: false, status: 401, message: "Sessão inválida." };

  // Verifica acesso com a service role (admin OU acesso explícito ao app).
  const admin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!isAdmin) {
    const { data: access } = await admin
      .from("user_app_access")
      .select("app_slug")
      .eq("user_id", userId)
      .eq("app_slug", "jusradar")
      .maybeSingle();
    if (!access) return { ok: false, status: 403, message: "Sem acesso ao JusRadar." };
  }

  return { ok: true, userId };
}

export const Route = createFileRoute("/api/jusradar/pesquisar")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authz = await authorize(request);
        if (!authz.ok) {
          return new Response(authz.message, { status: authz.status });
        }

        let contexto = "";
        try {
          const body = await request.json();
          contexto = String(body?.contexto ?? "").trim();
        } catch {
          return new Response("Corpo inválido (esperado JSON com { contexto }).", { status: 400 });
        }
        if (!contexto) {
          return new Response("Informe o contexto do caso.", { status: 400 });
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const send = (e: ProgressEvent) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
            };
            try {
              await runPesquisa(contexto, send);
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              send({ type: "error", message });
              send({ type: "done" });
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
