import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { buildDiagnosticoPdf } from "@/lib/diagnostico/pdf.server";
import { sendResendEmail, EmailSendError } from "@/lib/email/resend.server";

const OWNER_BCC = "felipesmsena@gmail.com";

const PayloadSchema = z.object({
  id: z.string().uuid(),
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  } as const;
}

// Envia o diagnóstico já concluído (buscado pelo id da linha em
// diagnostico_leads, não pelo corpo da requisição) por e-mail via Resend, com
// o PDF em anexo e cópia oculta para a Sena Labs. Buscar os dados no servidor
// evita que o cliente injete um e-mail de destino ou um relatório arbitrário.
export const Route = createFileRoute("/api/public/diagnostico/email")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders() }),
      POST: async ({ request }) => {
        const apiKey = process.env.RESEND_API_KEY;
        const resendFrom = process.env.RESEND_FROM;
        if (!apiKey || !resendFrom) {
          console.error("diagnostico/email: missing RESEND_API_KEY or RESEND_FROM");
          return Response.json(
            { ok: false, error: "server_configuration" },
            { status: 500, headers: corsHeaders() },
          );
        }

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

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: lead, error } = await supabaseAdmin
          .from("diagnostico_leads")
          .select("nome, negocio, email, answers, report, completed_at")
          .eq("id", parsed.data.id)
          .maybeSingle();

        if (error) {
          console.error("diagnostico/email: lead lookup failed", error);
          return Response.json(
            { ok: false, error: "lookup_failed" },
            { status: 500, headers: corsHeaders() },
          );
        }
        if (!lead || !lead.completed_at || !lead.email) {
          return Response.json(
            { ok: false, error: "lead_not_found_or_incomplete" },
            { status: 404, headers: corsHeaders() },
          );
        }

        const answers = (lead.answers ?? {}) as Record<string, unknown>;
        const report = lead.report as Record<string, unknown> | null;
        if (!report || !Array.isArray((report as { actions?: unknown }).actions)) {
          return Response.json(
            { ok: false, error: "report_unavailable" },
            { status: 422, headers: corsHeaders() },
          );
        }

        let pdf: Buffer;
        try {
          pdf = buildDiagnosticoPdf(answers as never, report as never, {
            nome: lead.nome ?? "",
            negocio: lead.negocio ?? "",
          });
        } catch (err) {
          console.error("diagnostico/email: pdf build failed", err);
          return Response.json(
            { ok: false, error: "pdf_build_failed" },
            { status: 500, headers: corsHeaders() },
          );
        }

        const displayName = lead.negocio || lead.nome || "seu diagnóstico";
        try {
          await sendResendEmail(
            {
              to: lead.email,
              from: resendFrom,
              bcc: [OWNER_BCC],
              subject: `Seu diagnóstico Sena Labs — ${displayName}`,
              text: `Olá${lead.nome ? ", " + lead.nome : ""}!\n\nSegue em anexo o PDF com o resultado completo do seu diagnóstico de oportunidades da Sena Labs.\n\nQualquer dúvida, é só responder este e-mail.\n\n— Sena Labs`,
              attachments: [
                {
                  filename: "diagnostico-sena-labs.pdf",
                  content: pdf.toString("base64"),
                },
              ],
            },
            { apiKey, from: resendFrom },
          );
        } catch (err) {
          const status = err instanceof EmailSendError ? err.status : 500;
          console.error("diagnostico/email: resend send failed", err);
          return Response.json(
            { ok: false, error: "send_failed" },
            { status: status >= 400 && status < 600 ? status : 500, headers: corsHeaders() },
          );
        }

        return Response.json({ ok: true }, { status: 200, headers: corsHeaders() });
      },
    },
  },
});
