import senaLogoHorizontalDark from "@/assets/brand/sena-labs-horizontal-dark.svg";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import ReadingProgress from "./ReadingProgress";

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
          <Link to="/auth" className="hover:text-primary">
            Área exclusiva
          </Link>
        </nav>
        <a
          href="https://calendar.app.google/oh4NeMRMtw8v5UP5A"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Fale comigo <ArrowRight className="h-4 w-4" />
        </a>
      </div>
      <ReadingProgress />
    </header>
  );
}
