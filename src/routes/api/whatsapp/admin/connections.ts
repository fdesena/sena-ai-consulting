// Lista todas as conexões de WhatsApp de todos os clientes, com o e-mail do
// dono. Protegido: exige acesso explícito ao app "whatsapp_admin" — ser
// admin sozinho NÃO basta (ver authorize.server.ts requireExplicitAccess).

import { createFileRoute } from "@tanstack/react-router";
import { authorize } from "@/lib/authorize.server";

export const Route = createFileRoute("/api/whatsapp/admin/connections")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const authz = await authorize(request, {
          appSlug: "whatsapp_admin",
          requireExplicitAccess: true,
        });
        if (!authz.ok) return new Response(authz.message, { status: authz.status });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: connections, error } = await supabaseAdmin
          .from("whatsapp_connections")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return Response.json({ error: error.message }, { status: 500 });

        const userIds = Array.from(new Set((connections ?? []).map((c) => c.user_id)));
        const emailByUser: Record<string, string> = {};
        if (userIds.length) {
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
          for (const u of usersData?.users ?? []) {
            if (userIds.includes(u.id)) emailByUser[u.id] = u.email ?? "";
          }
        }

        return Response.json({
          connections: (connections ?? []).map((c) => ({
            ...c,
            user_email: emailByUser[c.user_id] ?? null,
          })),
        });
      },
    },
  },
});
