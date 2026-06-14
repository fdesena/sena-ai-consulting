import { supabase } from "@/integrations/supabase/client";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let sid = localStorage.getItem("track_sid");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("track_sid", sid);
    }
    return sid;
  } catch {
    return "anon";
  }
}

export async function trackEvent(event: string, meta: Record<string, any> = {}) {
  if (typeof window === "undefined") return;
  try {
    const { data } = await supabase.auth.getUser();
    await supabase.from("page_events").insert({
      event,
      path: window.location.pathname,
      referrer: document.referrer || null,
      session_id: getSessionId(),
      user_id: data.user?.id ?? null,
      user_agent: navigator.userAgent,
      meta,
    });
  } catch {
    /* swallow */
  }
}

export function trackPageview() {
  return trackEvent("pageview");
}
