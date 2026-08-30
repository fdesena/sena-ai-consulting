import { useState } from "react";
import { Loader2 } from "lucide-react";
import { type I18nText, emptyI18n } from "@/lib/quiz/types";
import { translateToEnEs } from "@/lib/quiz/translate";

type Props = {
  value: I18nText | null | undefined;
  onChange: (v: I18nText) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
};

/**
 * Campo de texto do quiz — só edita em português. Ao sair do campo (blur),
 * traduz em background pra inglês/espanhol via IA e salva os três (a UI
 * nunca mostra EN/ES; em runtime `pickLocale` cai pro PT se faltar tradução).
 */
export function I18nField({ value, onChange, placeholder, multiline, className }: Props) {
  const v = value ?? emptyI18n();
  const [translating, setTranslating] = useState(false);
  const Field = multiline ? "textarea" : "input";

  async function handleBlur() {
    const text = v.pt.trim();
    if (!text) return;
    setTranslating(true);
    try {
      const { en, es } = await translateToEnEs(text);
      onChange({ pt: v.pt, en, es });
    } catch {
      // tradução falhou — segue só com o PT, sem travar o preenchimento.
    } finally {
      setTranslating(false);
    }
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <Field
        value={v.pt}
        onChange={(e) => onChange({ ...v, pt: e.target.value })}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={multiline ? 2 : undefined}
        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 pr-8 text-sm outline-none focus:border-primary"
      />
      {translating && (
        <Loader2
          className="absolute right-2.5 top-2.5 h-3.5 w-3.5 animate-spin text-muted-foreground"
          aria-label="Traduzindo…"
        />
      )}
    </div>
  );
}
