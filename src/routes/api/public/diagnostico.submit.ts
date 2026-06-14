import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const SiteOrigin = "https://senaconsulting.app";
const AgendaUrl = "https://calendar.app.google/UhKn3fDKNtN9kzb76";
const WhatsappUrl = "https://wa.me/14043079848";

const PayloadSchema = z.object({
  nome: z.string().trim().min(1).max(200),
  negocio: z.string().trim().max(200).optional().nullable(),
  email: z.string().trim().email().max(255),
  whatsapp: z.string().trim().min(8).max(50),
  consentimento: z.literal(true),
  papel: z.string().max(200).optional().nullable(),
  segmento: z.string().max(200).optional().nullable(),
  segmento_outro: z.string().max(200).optional().nullable(),
  aspiracao: z.string().max(200).optional().nullable(),
  equipe: z.string().max(200).optional().nullable(),
  barreira: z.string().max(200).optional().nullable(),
  impacto: z.string().max(200).optional().nullable(),
  ferramentas: z.array(z.string().max(100)).max(50).default([]),
  desafios: z.array(z.string().max(200)).max(20).default([]),
  reflexao: z.string().max(4000).optional().nullable(),
  score_geral: z.number().int().min(0).max(100),
  nivel: z.string().max(80),
  arquetipo: z.string().max(80),
  score_usar_ia: z.number().int().min(0).max(100),
  score_oportunidades: z.number().int().min(0).max(100),
  score_automacao: z.number().int().min(0).max(100),
  score_gente: z.number().int().min(0).max(100),
  score_dados: z.number().int().min(0).max(100),
  respostas_brutas: z.record(z.string(), z.any()).default({}),
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  } as const;
}

export const Route = createFileRoute("/api/public/diagnostico/submit")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders() }),
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400, headers: corsHeaders() });
        }
        const parsed = PayloadSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Validation failed", issues: parsed.error.issues },
            { status: 400, headers: corsHeaders() },
          );
        }
        const data = parsed.data;
        const email = data.email.toLowerCase();
        const senha = email; // por solicitação: senha inicial = email

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Cria (ou recupera) usuário
        let userId: string | null = null;
        const created = await supabaseAdmin.auth.admin.createUser({
          email,
          password: senha,
          email_confirm: true,
          user_metadata: { nome: data.nome, source: "diagnostico" },
        });
        if (created.error) {
          // se já existe, busca o id
          const msg = (created.error.message || "").toLowerCase();
          if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
            // page through users (small project)
            const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
            const found = list.data?.users.find((u) => (u.email || "").toLowerCase() === email);
            userId = found?.id ?? null;
          } else {
            console.error("createUser failed", created.error);
          }
        } else {
          userId = created.data.user?.id ?? null;
        }

        // Insere o diagnóstico (com ou sem user_id)
        const insertPayload = {
          nome: data.nome,
          negocio: data.negocio || null,
          email,
          whatsapp: data.whatsapp,
          consentimento: true,
          papel: data.papel || null,
          segmento:
            data.segmento === "Outro" && data.segmento_outro
              ? `Outro: ${data.segmento_outro}`
              : data.segmento || null,
          aspiracao: data.aspiracao || null,
          equipe: data.equipe || null,
          barreira: data.barreira || null,
          impacto: data.impacto || null,
          ferramentas: data.ferramentas,
          desafios: data.desafios,
          reflexao: data.reflexao || null,
          score_geral: data.score_geral,
          nivel: data.nivel,
          arquetipo: data.arquetipo,
          score_usar_ia: data.score_usar_ia,
          score_oportunidades: data.score_oportunidades,
          score_automacao: data.score_automacao,
          score_gente: data.score_gente,
          score_dados: data.score_dados,
          respostas_brutas: data.respostas_brutas,
          user_id: userId,
        };
        const ins = await supabaseAdmin.from("diagnostico_respostas").insert(insertPayload);
        if (ins.error) {
          console.error("insert diagnostico failed", ins.error);
        }

        // Enfileira o email de credenciais
        try {
          const enq = await supabaseAdmin.rpc("enqueue_email", {
            p_queue: "transactional_emails",
            p_template_name: "diagnostico-credenciais",
            p_recipient_email: email,
            p_template_data: {
              nome: data.nome.split(" ")[0] || data.nome,
              email,
              senha,
              loginUrl: `${SiteOrigin}/auth`,
              perfilUrl: `${SiteOrigin}/painel/perfil`,
              agendaUrl: AgendaUrl,
              whatsappUrl: WhatsappUrl,
            },
            p_idempotency_key: `diag-cred-${email}-${data.score_geral}`,
          });
          if (enq.error) console.error("enqueue_email error", enq.error);
        } catch (e) {
          console.error("enqueue_email throw", e);
        }

        return Response.json(
          { ok: true, accountCreated: !!created.data?.user, email, loginUrl: `${SiteOrigin}/auth` },
          { status: 200, headers: corsHeaders() },
        );
      },
    },
  },
});
