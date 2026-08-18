import { type I18nText, type Locale, emptyI18n } from "@/lib/quiz/types";

const LOCALES: { key: Locale; label: string }[] = [
  { key: "pt", label: "PT" },
  { key: "en", label: "EN" },
  { key: "es", label: "ES" },
];

type Props = {
  value: I18nText | null | undefined;
  onChange: (v: I18nText) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
};

/**
 * Campo de texto trilíngue (PT/EN/ES) — usado em todo conteúdo do quiz
 * (títulos, perguntas, opções, explicações). PT é a única aba obrigatória;
 * EN/ES ficam vazias até o usuário preencher (fallback pro PT em runtime,
 * ver `pickLocale`).
 */
export function I18nField({ value, onChange, placeholder, multiline, className }: Props) {
  const v = value ?? emptyI18n();
  const Field = multiline ? "textarea" : "input";
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      {LOCALES.map(({ key, label }) => (
        <div key={key} className="flex items-start gap-2">
          <span className="mt-2 w-7 shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <Field
            value={v[key]}
            onChange={(e) => onChange({ ...v, [key]: e.target.value })}
            placeholder={key === "pt" ? placeholder : `${placeholder ?? ""} (${label.toLowerCase()})`}
            rows={multiline ? 2 : undefined}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary"
          />
        </div>
      ))}
    </div>
  );
}
