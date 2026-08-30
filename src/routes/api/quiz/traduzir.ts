// Traduz um texto curto do quiz (PT) para EN/ES via OpenAI, pra manter o
// editor só em português — a tradução acontece em background quando o
// anfitrião sai do campo. Protegido: exige usuário autenticado com acesso
// ao app "quiz" (ou admin), já que consome a API paga da OpenAI.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import type { Database } from "@/integrations/supabase/types";

const MODEL = "gpt-4o-mini";

const SYSTEM = `Você traduz textos curtos de um quiz corporativo brasileiro sobre IA (perguntas,
opções de resposta, títulos) do português para inglês e espanhol. Mantenha o tom e o registro do
original (formal, coloquial, com emojis, etc.) e não explique nada — só traduza. Responda
estritamente em JSON no formato {"en": "...", "es": "..."}.`;

async function authorize(
  request: Request,
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
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

  const admin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!isAdmin) {
    const { data: access } = await admin
      .from("user_app_access")
      .select("app_slug")
      .eq("user_id", userId)
      .eq("app_slug", "quiz")
      .maybeSingle();
    if (!access) return { ok: false, status: 403, message: "Sem acesso ao Quiz ao Vivo." };
  }

  return { ok: true };
}

export const Route = createFileRoute("/api/quiz/traduzir")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authz = await authorize(request);
        if (!authz.ok) {
          return new Response(authz.message, { status: authz.status });
        }

        let text = "";
        try {
          const body = await request.json();
          text = String(body?.text ?? "").trim();
        } catch {
          return new Response("Corpo inválido (esperado JSON com { text }).", { status: 400 });
        }
        if (!text) {
          return Response.json({ en: "", es: "" });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          return new Response("Tradução automática indisponível no momento.", { status: 500 });
        }

        try {
          const client = new OpenAI({ apiKey });
          const completion = await client.chat.completions.create({
            model: MODEL,
            messages: [
              { role: "system", content: SYSTEM },
              { role: "user", content: text },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          });
          const raw = completion.choices[0]?.message?.content ?? "{}";
          let parsed: { en?: string; es?: string } = {};
          try {
            parsed = JSON.parse(raw);
          } catch {
            // resposta fora do formato esperado — devolve vazio, o editor
            // cai de volta pro texto em PT em runtime.
          }
          return Response.json({ en: parsed.en ?? "", es: parsed.es ?? "" });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Erro ao traduzir";
          return new Response(message, { status: 502 });
        }
      },
    },
  },
});
