import { useEffect } from "react";

const CHATWOOT_BASE_URL = "https://chatwoot.senaconsulting.app";
const CHATWOOT_WEBSITE_TOKEN = "6zssnqA83aNkMVah38byDDTi";

declare global {
  interface Window {
    chatwootSettings?: {
      hideMessageBubble?: boolean;
      position?: "left" | "right";
      locale?: string;
      darkMode?: "light" | "dark" | "auto";
    };
    chatwootSDK?: {
      run: (config: { websiteToken: string; baseUrl: string }) => void;
    };
  }
}

/**
 * Carrega o SDK do Chatwoot com a bolha padrão escondida — o launcher visível
 * é o <ContactFAB />, que abre o widget via window.$chatwoot.toggle("open").
 */
export default function ChatwootWidget() {
  useEffect(() => {
    if (document.getElementById("chatwoot-sdk")) return;

    window.chatwootSettings = {
      hideMessageBubble: true,
      position: "right",
      locale: "pt_BR",
    };

    const script = document.createElement("script");
    script.id = "chatwoot-sdk";
    script.src = `${CHATWOOT_BASE_URL}/packs/js/sdk.js`;
    script.async = true;
    script.onload = () => {
      window.chatwootSDK?.run({
        websiteToken: CHATWOOT_WEBSITE_TOKEN,
        baseUrl: CHATWOOT_BASE_URL,
      });
    };
    document.body.appendChild(script);
  }, []);

  return null;
}
