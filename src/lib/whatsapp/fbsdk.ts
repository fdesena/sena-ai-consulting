// Carrega o Facebook JS SDK sob demanda (só no browser), necessário para
// abrir o modal do Embedded Signup via window.FB.login. Guard contra dupla
// injeção (remount de rota / StrictMode).

declare global {
  interface Window {
    FB?: {
      init: (opts: { appId: string; autoLogAppEvents?: boolean; xfbml?: boolean; version: string }) => void;
      login: (
        callback: (response: { authResponse?: { code?: string } }) => void,
        opts: {
          config_id: string;
          response_type: "code";
          override_default_response_type: boolean;
          extras?: Record<string, unknown>;
        },
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

let sdkPromise: Promise<void> | null = null;

export function loadFacebookSdk(appId: string): Promise<void> {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve) => {
    window.fbAsyncInit = () => {
      window.FB?.init({ appId, autoLogAppEvents: true, xfbml: false, version: "v21.0" });
      resolve();
    };

    if (document.getElementById("facebook-jssdk")) {
      // Script já injetado (ex.: remount); se FB já inicializou, resolve direto.
      if (window.FB) resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  });

  return sdkPromise;
}
