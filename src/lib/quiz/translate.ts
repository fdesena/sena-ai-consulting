import { supabase } from "@/integrations/supabase/client";

export async function translateToEnEs(text: string): Promise<{ en: string; es: string }> {
  if (!text.trim()) return { en: "", es: "" };

  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;

  const res = await fetch("/api/quiz/traduzir", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    throw new Error((await res.text().catch(() => "")) || "Falha ao traduzir");
  }
  return res.json();
}
