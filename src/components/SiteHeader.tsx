import senaLogoHorizontalDark from "@/assets/brand/sena-labs-horizontal-dark.svg";
import { Link } from "@tanstack/react-router";
import ReadingProgress from "./ReadingProgress";
import ScheduleButton from "./ScheduleButton";

/** Header escuro compartilhado pelas páginas fora da home (blog, ferramentas, área exclusiva). */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[var(--ink)]/95 text-[var(--paper)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="inline-flex items-center">
          <img src={senaLogoHorizontalDark} alt="Sena Labs" className="h-9 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          <a href="/#cases" className="hover:text-primary">
            Casos de Uso
          </a>
          <Link to="/ferramentas" className="hover:text-primary">
            Ferramentas
          </Link>
          <Link to="/blog" className="hover:text-primary">
            Blog
          </Link>
          <Link to="/diagnostico" className="hover:text-primary">
            Diagnóstico gratuito
          </Link>
          <Link to="/auth" className="hover:text-primary">
            Área exclusiva
          </Link>
        </nav>
        <ScheduleButton label="Fale comigo" className="[&_button]:!rounded-full" />
      </div>
      <ReadingProgress />
    </header>
  );
}
