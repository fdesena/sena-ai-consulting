// Últimos eventos recebidos no webhook para uma conexão específica.
// Protegido: exige acesso explícito ao app "whatsapp_admin" (ver connections.ts).

import { createFileRoute } from "@tanstack/react-router";
import { authorize } from "@/lib/authorize.server";

export const Route = createFileRoute("/api/whatsapp/admin/events")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const authz = await authorize(request, {
          appSlug: "whatsapp_admin",
          requireExplicitAccess: true,
        });
        if (!authz.ok) return new Response(authz.message, { status: authz.status });

        const url = new URL(request.url);
        const connectionId = url.searchParams.get("connectionId");
        if (!connectionId) {
          return Response.json({ error: "connectionId é obrigatório." }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("whatsapp_events")
          .select("*")
          .eq("connection_id", connectionId)
          .order("received_at", { ascending: false })
          .limit(50);
        if (error) return Response.json({ error: error.message }, { status: 500 });

        return Response.json({ events: data ?? [] });
      },
    },
  },
});
