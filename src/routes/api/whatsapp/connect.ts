// Recebe o `code` + waba_id/phone_number_id do Embedded Signup (frontend)
// e conclui o fluxo: troca o code por token, registra o número, grava a conexão.
// Protegido: exige usuário autenticado COM acesso ao app "whatsapp" (ou admin).

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { authorize } from "@/lib/authorize.server";

const BodySchema = z.object({
  code: z.string().trim().min(1),
  wabaId: z.string().trim().min(1),
  phoneNumberId: z.string().trim().min(1),
});

export const Route = createFileRoute("/api/whatsapp/connect")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authz = await authorize(request, { appSlug: "whatsapp" });
        if (!authz.ok) {
          return new Response(authz.message, { status: authz.status });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Corpo inválido (esperado JSON)." }, { status: 400 });
        }
        const parsed = BodySchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Validação falhou", issues: parsed.error.issues },
            { status: 400 },
          );
        }

        const { completeEmbeddedSignup } = await import("@/lib/whatsapp/connect.server");
        const result = await completeEmbeddedSignup({
          userId: authz.userId,
          code: parsed.data.code,
          wabaId: parsed.data.wabaId,
          phoneNumberId: parsed.data.phoneNumberId,
        });

        if (result.status === "error") {
          return Response.json(
            { ok: false, connectionId: result.connectionId, error: result.errorMessage },
            { status: 502 },
          );
        }
        return Response.json({ ok: true, connectionId: result.connectionId });
      },
    },
  },
});
