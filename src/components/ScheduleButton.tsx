import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://calendar.google.com/calendar/scheduling-button-script.js";
const CSS_HREF = "https://calendar.google.com/calendar/scheduling-button-script.css";
const CALENDAR_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3lQu1KctmL-8Unulcxey7NwiGFaiclYwd__oUfWmzqOMuGx2ZqHjylaG9sJq4QunHcHg06MH7q?gv=true";

declare global {
  interface Window {
    calendar?: {
      schedulingButton: {
        load: (opts: { url: string; color: string; label: string; target: Element }) => void;
      };
    };
  }
}

/** Botão oficial de agendamento do Google Calendar (abre o overlay de horários). */
export default function ScheduleButton({
  className,
  label = "Agendar uma conversa",
}: {
  className?: string;
  label?: string;
}) {
  const targetRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!document.querySelector(`link[href="${CSS_HREF}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_HREF;
      document.head.appendChild(link);
    }

    function mountButton() {
      // `load()` só pode ser chamado uma vez por instância — evita botão duplicado
      // quando o efeito roda mais de uma vez (StrictMode em dev, HMR, etc.).
      if (loadedRef.current || !targetRef.current || !window.calendar) return;
      loadedRef.current = true;
      window.calendar.schedulingButton.load({
        url: CALENDAR_URL,
        color: "#fc7c34",
        label,
        target: targetRef.current,
      });
    }

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existingScript) {
      if (window.calendar) mountButton();
      else existingScript.addEventListener("load", mountButton, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.addEventListener("load", mountButton, { once: true });
      document.body.appendChild(script);
    }
  }, []);

  return <div ref={targetRef} className={className} />;
}
