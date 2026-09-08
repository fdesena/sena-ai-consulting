import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import senaLogoHorizontal from "@/assets/brand/sena-labs-horizontal-light.svg";

type Props = {
  /** Eyebrow em mono acima do título (ex.: "Blog"). */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Quando false, esconde o link "Voltar ao blog" (usado no índice). */
  back?: boolean;
  children: React.ReactNode;
};

/**
 * Casca compartilhada das páginas de /blog — mesma barra, tipografia e
 * paleta do site público, no mesmo padrão do ToolShell usado em /ferramentas.
 */
export function BlogShell({ eyebrow, title, description, back = true, children }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <a href="/" className="inline-flex items-center gap-2">
            <img src={senaLogoHorizontal} alt="Sena Labs" className="h-7 w-auto" />
            <span className="font-mono text-xs text-muted-foreground">Blog</span>
          </a>
          <div className="flex items-center gap-3 text-sm">
            {back && (
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar ao blog</span>
              </Link>
            )}
            <a
              href="/"
              className="rounded-full border border-foreground/15 px-4 py-2 transition hover:border-foreground/40"
            >
              Site
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <div className="mb-8">
          {eyebrow && (
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {description && <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>}
        </div>

        {children}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Sena Labs · Felipe Sena</span>
          <a href="/" className="hover:underline">
            senaconsulting.app
          </a>
        </div>
      </footer>
    </div>
  );
}
