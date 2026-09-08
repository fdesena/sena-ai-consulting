import { useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, X } from "lucide-react";

export const WHATSAPP_NUMBER = "5519997485721";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Olá Felipe, vim pelo site da Sena Labs e gostaria de conversar.",
)}`;

declare global {
  interface Window {
    $chatwoot?: {
      toggle: (state?: "open" | "close") => void;
    };
  }
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M19.11 17.27c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47l-.52-.01c-.18 0-.48.07-.73.34s-.96.94-.96 2.29.99 2.66 1.13 2.84c.14.18 1.95 2.98 4.72 4.18.66.29 1.17.46 1.57.59.66.21 1.26.18 1.74.11.53-.08 1.6-.65 1.83-1.28.23-.63.23-1.18.16-1.28-.07-.11-.25-.18-.52-.32zM16.02 5.33c-5.86 0-10.62 4.76-10.62 10.62 0 1.87.49 3.69 1.42 5.29L5.4 26.67l5.55-1.46a10.6 10.6 0 0 0 5.07 1.29h.01c5.85 0 10.61-4.76 10.62-10.61 0-2.84-1.1-5.5-3.11-7.51a10.55 10.55 0 0 0-7.52-3.05zm0 19.4h-.01a8.78 8.78 0 0 1-4.48-1.23l-.32-.19-3.29.86.88-3.21-.21-.33a8.77 8.77 0 0 1-1.34-4.68c0-4.85 3.94-8.79 8.78-8.79 2.35 0 4.55.92 6.21 2.58a8.74 8.74 0 0 1 2.57 6.22c0 4.84-3.94 8.77-8.79 8.77z" />
    </svg>
  );
}

/**
 * Launcher flutuante com duas opções de contato: WhatsApp direto ou o
 * assistente de IA (widget do Chatwoot, aberto via window.$chatwoot.toggle).
 */
export default function ContactFAB() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-black/10">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
              <WhatsAppIcon className="h-4.5 w-4.5" />
            </span>
            WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              window.$chatwoot?.toggle("open");
            }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="h-4.5 w-4.5" />
            </span>
            Assistente de IA
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={open ? "Fechar opções de contato" : "Falar com a Sena Labs"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-1 ring-black/10 transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
