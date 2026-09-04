import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MessageCircle, Lock, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { loadFacebookSdk } from "@/lib/whatsapp/fbsdk";
import type {
  EmbeddedSignupMessage,
  WhatsAppConnection,
  WhatsAppConnectionStatus,
} from "@/lib/whatsapp/types";

export const Route = createFileRoute("/_authenticated/painel/whatsapp")({
  component: WhatsAppPage,
});

function WhatsAppPage() {
  const navigate = useNavigate();
  // null = verificando, true/false = resultado
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) {
        setAllowed(false);
        return;
      }

      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      if ((roles ?? []).some((r: any) => r.role === "admin")) {
        setAllowed(true);
        return;
      }

      const { data: access } = await supabase
        .from("user_app_access")
        .select("app_slug")
        .eq("user_id", uid)
        .eq("app_slug", "whatsapp")
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
          Você ainda não tem acesso ao WhatsApp Business. Fale com a equipe Sena Consulting para
          liberar este app.
        </p>
        <button
          onClick={() => navigate({ to: "/painel" })}
          className="mt-6 rounded-xl bg-gradient-to-r from-bronze to-[#a36c2e] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  return <WhatsAppApp />;
}

const STATUS_LABEL: Record<WhatsAppConnectionStatus, string> = {
  pending: "Pendente",
  registering: "Registrando…",
  connected: "Conectado",
  error: "Erro",
  revoked: "Revogado",
};

const STATUS_VARIANT: Record<
  WhatsAppConnectionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  registering: "secondary",
  connected: "default",
  error: "destructive",
  revoked: "outline",
};

function WhatsAppApp() {
  const [connections, setConnections] = useState<WhatsAppConnection[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const pendingCode = useRef<string | null>(null);
  const pendingWaba = useRef<{ wabaId: string; phoneNumberId: string } | null>(null);

  const appId = import.meta.env.VITE_META_APP_ID as string | undefined;
  const configId = import.meta.env.VITE_META_WHATSAPP_CONFIG_ID as string | undefined;

  const loadConnections = useCallback(async () => {
    setLoadingList(true);
    const { data, error } = await supabase
      .from("whatsapp_connections")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Falha ao carregar conexões", { description: error.message });
    } else {
      setConnections((data ?? []) as WhatsAppConnection[]);
    }
    setLoadingList(false);
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  useEffect(() => {
    if (!appId) return;
    loadFacebookSdk(appId).then(() => setSdkReady(true));
  }, [appId]);

  const finishIfReady = useCallback(async () => {
    const code = pendingCode.current;
    const waba = pendingWaba.current;
    if (!code || !waba) return;
    pendingCode.current = null;
    pendingWaba.current = null;

    setConnecting(true);
    const toastId = toast.loading("Conectando WhatsApp Business…");
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const res = await fetch("/api/whatsapp/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code, wabaId: waba.wabaId, phoneNumberId: waba.phoneNumberId }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Falha ao conectar (HTTP ${res.status}).`);
      }
      toast.success("WhatsApp Business conectado", { id: toastId });
      await loadConnections();
    } catch (err) {
      toast.error("Erro ao conectar", {
        id: toastId,
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setConnecting(false);
    }
  }, [loadConnections]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!/^https:\/\/www\.facebook\.com$/.test(event.origin)) return;
      let data: EmbeddedSignupMessage;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      if (data.type !== "WA_EMBEDDED_SIGNUP") return;
      if (data.event === "FINISH" && data.data?.waba_id && data.data?.phone_number_id) {
        pendingWaba.current = {
          wabaId: data.data.waba_id,
          phoneNumberId: data.data.phone_number_id,
        };
        finishIfReady();
      } else if (data.event === "ERROR") {
        toast.error("Cadastro incorporado cancelado", { description: data.data?.error_message });
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [finishIfReady]);

  const onConnect = useCallback(() => {
    if (!sdkReady || !configId) {
      toast.error("Configuração indisponível", {
        description: "VITE_META_APP_ID / VITE_META_WHATSAPP_CONFIG_ID não configurados.",
      });
      return;
    }
    window.FB?.login(
      (response) => {
        if (response.authResponse?.code) {
          pendingCode.current = response.authResponse.code;
          finishIfReady();
        }
      },
      { config_id: configId, response_type: "code", override_default_response_type: true },
    );
  }, [sdkReady, configId, finishIfReady]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-foreground">
      <Toaster />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-bronze/15 text-bronze">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
              Sena Consulting Apps
            </span>
            <h1 className="text-3xl font-semibold leading-tight">WhatsApp Business</h1>
            <p className="text-sm text-muted-foreground">
              Conecte seu número via Meta para gestão centralizada.
            </p>
          </div>
        </div>
        <Button onClick={onConnect} disabled={connecting || !sdkReady}>
          {connecting ? "Conectando…" : "Conectar WhatsApp"}
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Suas conexões</h2>
          <Button variant="outline" size="sm" onClick={loadConnections} disabled={loadingList}>
            <RefreshCw className={loadingList ? "animate-spin" : ""} />
            Atualizar
          </Button>
        </div>

        {loadingList ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : connections.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum número conectado ainda. Clique em <strong>Conectar WhatsApp</strong> para
            iniciar.
          </p>
        ) : (
          <div className="grid gap-3">
            {connections.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-4"
              >
                <div>
                  <p className="font-medium">
                    {c.display_phone_number || c.verified_name || c.business_name || c.waba_id}
                  </p>
                  {c.business_name && (
                    <p className="text-xs text-muted-foreground">{c.business_name}</p>
                  )}
                  {c.status === "error" && c.error_message && (
                    <p className="text-xs text-destructive mt-1">{c.error_message}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_VARIANT[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                  {c.status === "error" && (
                    <Button variant="outline" size="sm" onClick={onConnect} disabled={connecting}>
                      Reconectar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
