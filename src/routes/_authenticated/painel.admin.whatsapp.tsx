import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MessageCircle, Lock, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import type { WhatsAppConnectionStatus } from "@/lib/whatsapp/types";

export const Route = createFileRoute("/_authenticated/painel/admin/whatsapp")({
  component: WhatsAppAdminPage,
});

function WhatsAppAdminPage() {
  // null = verificando, true/false = resultado
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) { setAllowed(false); return; }

      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      const isAdmin = (roles ?? []).some((r: any) => r.role === "admin");
      if (!isAdmin) { setAllowed(false); return; }

      // Diferente das telas de app do cliente: ser admin NÃO basta aqui.
      // Precisa de acesso explícito ao slug "whatsapp_admin".
      const { data: access } = await supabase
        .from("user_app_access")
        .select("app_slug")
        .eq("user_id", uid)
        .eq("app_slug", "whatsapp_admin")
        .maybeSingle();
      setAllowed(!!access);
    })();
  }, []);

  if (allowed === null) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (!allowed) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 text-foreground">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-muted">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você não tem acesso à gestão de WhatsApp. Peça a outro admin para liberar em
          Usuários → Acesso de Apps → Ferramentas administrativas.
        </p>
      </div>
    );
  }

  return <WhatsAppAdminApp />;
}

const STATUS_LABEL: Record<WhatsAppConnectionStatus, string> = {
  pending: "Pendente",
  registering: "Registrando…",
  connected: "Conectado",
  error: "Erro",
  revoked: "Revogado",
};

const STATUS_VARIANT: Record<WhatsAppConnectionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  registering: "secondary",
  connected: "default",
  error: "destructive",
  revoked: "outline",
};

type AdminConnection = {
  id: string;
  user_id: string;
  user_email: string | null;
  waba_id: string;
  phone_number_id: string | null;
  display_phone_number: string | null;
  verified_name: string | null;
  business_name: string | null;
  status: WhatsAppConnectionStatus;
  error_message: string | null;
  connected_at: string | null;
  created_at: string;
};

type WhatsAppEvent = { id: string; event_type: string; payload: unknown; received_at: string };

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function WhatsAppAdminApp() {
  const [connections, setConnections] = useState<AdminConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [events, setEvents] = useState<Record<string, WhatsAppEvent[]>>({});
  const [eventsLoading, setEventsLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/admin/connections", { headers: await authHeader() });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setConnections(json.connections ?? []);
    } catch (err) {
      toast.error("Falha ao carregar conexões", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleEvents = useCallback(
    async (connectionId: string) => {
      if (expanded === connectionId) {
        setExpanded(null);
        return;
      }
      setExpanded(connectionId);
      if (events[connectionId]) return;

      setEventsLoading(connectionId);
      try {
        const res = await fetch(`/api/whatsapp/admin/events?connectionId=${connectionId}`, {
          headers: await authHeader(),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
        setEvents((e) => ({ ...e, [connectionId]: json.events ?? [] }));
      } catch (err) {
        toast.error("Falha ao carregar eventos", {
          description: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setEventsLoading(null);
      }
    },
    [expanded, events],
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-foreground">
      <Toaster />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-bronze/15 text-bronze">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">Administrador</span>
            <h1 className="text-3xl font-semibold leading-tight">WhatsApp — Gestão</h1>
            <p className="text-sm text-muted-foreground">Conexões de todos os clientes e eventos recebidos.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Atualizar
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Carregando…</p>
        ) : connections.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Nenhum cliente conectou o WhatsApp ainda.</p>
        ) : (
          <div className="divide-y divide-border">
            {connections.map((c) => (
              <div key={c.id}>
                <button
                  onClick={() => toggleEvents(c.id)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{c.user_email ?? c.user_id}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.display_phone_number || c.business_name || c.waba_id}
                    </p>
                    {c.status === "error" && c.error_message && (
                      <p className="text-xs text-destructive mt-1">{c.error_message}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                    {expanded === c.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {expanded === c.id && (
                  <div className="bg-muted/30 px-4 pb-4">
                    {eventsLoading === c.id ? (
                      <p className="py-2 text-sm text-muted-foreground">Carregando eventos…</p>
                    ) : (events[c.id]?.length ?? 0) === 0 ? (
                      <p className="py-2 text-sm text-muted-foreground">Nenhum evento recebido ainda.</p>
                    ) : (
                      <div className="space-y-2 pt-2">
                        {events[c.id].map((ev) => (
                          <div key={ev.id} className="rounded-lg border border-border bg-card p-3 text-xs">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="font-mono uppercase text-bronze">{ev.event_type}</span>
                              <span className="text-muted-foreground">
                                {new Date(ev.received_at).toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <pre className="whitespace-pre-wrap break-all text-muted-foreground">
                              {JSON.stringify(ev.payload, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
