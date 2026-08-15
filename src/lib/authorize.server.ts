// Autorização compartilhada para rotas de API autenticadas.
// Extraído do padrão inline em src/routes/api/jusradar/pesquisar.ts.
// Uso: authorize(request, { appSlug: "whatsapp" }) — exige sessão válida
// e (admin OU acesso explícito via user_app_access ao app_slug informado).
// Sem appSlug: só exige sessão válida.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type AuthzResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; message: string };

export async function authorize(
  request: Request,
  opts?: { appSlug?: string },
): Promise<AuthzResult> {
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

  if (!opts?.appSlug) return { ok: true, userId };

  const admin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!isAdmin) {
    const { data: access } = await admin
      .from("user_app_access")
      .select("app_slug")
      .eq("user_id", userId)
      .eq("app_slug", opts.appSlug)
      .maybeSingle();
    if (!access) return { ok: false, status: 403, message: `Sem acesso ao app "${opts.appSlug}".` };
  }

  return { ok: true, userId };
}
