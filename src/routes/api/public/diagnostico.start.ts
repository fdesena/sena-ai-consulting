import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const PayloadSchema = z.object({
  schemaVersion: z.string().trim().min(1).max(40),
  nome: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255),
  whatsapp: z.string().trim().min(8).max(50),
  negocio: z.string().trim().max(200).optional().nullable(),
  consentimento: z.literal(true),
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  } as const;
}

// Captures the lead at the start of the diagnostic — before any question is
// shown — once the visitor accepts the terms/privacy consent on the welcome
// screen. The row is later completed (answers/report) by diagnostico.submit.ts.
export const Route = createFileRoute("/api/public/diagnostico/start")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders() }),
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json(
            { ok: false, error: "invalid_json" },
            { status: 400, headers: corsHeaders() },
          );
        }
        const parsed = PayloadSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { ok: false, error: "validation_failed", issues: parsed.error.issues },
            { status: 400, headers: corsHeaders() },
          );
        }
        const data = parsed.data;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const ins = await supabaseAdmin
          .from("diagnostico_leads")
          .insert({
            schema_version: data.schemaVersion,
            nome: data.nome,
            email: data.email.toLowerCase(),
            whatsapp: data.whatsapp,
            negocio: data.negocio || null,
            consentimento: true,
          })
          .select("id")
          .single();

        if (ins.error || !ins.data) {
          console.error("insert diagnostico_leads (start) failed", ins.error);
          return Response.json(
            { ok: false, error: "db_insert_failed" },
            { status: 500, headers: corsHeaders() },
          );
        }

        return Response.json(
          { ok: true, id: ins.data.id },
          { status: 200, headers: corsHeaders() },
        );
      },
    },
  },
});
