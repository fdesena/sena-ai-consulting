import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import posthog from "posthog-js";

const POSTHOG_KEY = "phc_oKS8WCVMzt4FZpLpwcRVsaihWHRzezZtcNjPm7eBpMHt";
const POSTHOG_HOST = "https://us.i.posthog.com";

let initialized = false;

/**
 * Inicializa o PostHog uma única vez e captura pageview manualmente a cada
 * navegação da SPA — o autocapture padrão só cobre o carregamento inicial,
 * já que rotas internas trocam sem recarregar a página.
 */
export default function PostHogInit() {
  const router = useRouter();

  useEffect(() => {
    if (initialized) return;
    initialized = true;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      defaults: "2026-05-30",
      person_profiles: "identified_only",
      capture_pageview: false,
    });
  }, []);

  useEffect(() => {
    return router.subscribe("onResolved", (event) => {
      if (!event.pathChanged && !event.hrefChanged) return;
      posthog.capture("$pageview");
    });
  }, [router]);

  return null;
}
