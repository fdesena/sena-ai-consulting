import { useEffect } from "react";

const CHATWOOT_BASE_URL = "https://chatwoot.senaconsulting.app";
const CHATWOOT_WEBSITE_TOKEN = "6zssnqA83aNkMVah38byDDTi";

declare global {
  interface Window {
    chatwootSDK?: {
      run: (config: { websiteToken: string; baseUrl: string }) => void;
    };
  }
}

export default function ChatwootWidget() {
  useEffect(() => {
    if (document.getElementById("chatwoot-sdk")) return;

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
