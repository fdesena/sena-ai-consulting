import { useEffect, useRef } from "react";

/**
 * Barra fina sob o header que preenche conforme o scroll da página avança.
 * Importante: o estado "vazio" é controlado só via inline style (`transform`),
 * nunca pela classe utilitária `scale-x-0` — em Tailwind v4 ela compila para a
 * propriedade CSS `scale` separada, que multiplica com `transform` e trava a
 * barra em largura zero mesmo quando o JS atualiza `style.transform`.
 */
export default function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = pageHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / pageHeight)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden
      className="absolute inset-x-0 bottom-[-1px] h-[2px] origin-left bg-primary"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
