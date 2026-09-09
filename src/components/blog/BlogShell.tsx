import { Link } from "@tanstack/react-router";
import SiteHeader from "@/components/SiteHeader";

type Props = {
  /** Eyebrow em mono acima do título (ex.: "Blog"). */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Nota lateral (borda laranja) — usada para avisos editoriais curtos. */
  note?: string;
  /** Quando false, esconde o breadcrumb "Voltar ao blog" (usado no índice). */
  back?: boolean;
  /** Largura do miolo de leitura — "wide" para o índice (grades), "narrow" para artigos. */
  width?: "wide" | "narrow";
  children: React.ReactNode;
};

/**
 * Casca compartilhada das páginas de /blog — header escuro do site,
 * hero editorial em papel claro e leitura confortável para os artigos.
 */
export function BlogShell({
  eyebrow,
  title,
  description,
  note,
  back = true,
  width = "wide",
  children,
}: Props) {
  const maxWidth = width === "narrow" ? "max-w-3xl" : "max-w-6xl";

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--paper-ink,var(--ink))]">
      <SiteHeader />

      <main className={`mx-auto ${maxWidth} px-6 py-14 sm:py-20`}>
        <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          {back ? (
            <Link to="/blog" className="hover:text-primary">
              Blog
            </Link>
          ) : (
            <span>Blog</span>
          )}
        </div>

        <div className="mb-10">
          {eyebrow && (
            <span className="font-mono text-sm uppercase tracking-[0.08em] text-primary">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-4 max-w-[17ch] text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-[48ch] text-lg text-muted-foreground">{description}</p>
          )}
          {note && (
            <p className="mt-6 max-w-[65ch] border-l-2 border-primary pl-4 text-sm text-muted-foreground">
              {note}
            </p>
          )}
        </div>

        {children}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Sena Labs · Felipe Sena</span>
          <Link to="/" className="hover:text-primary hover:underline">
            www.senalabs.tech
          </Link>
        </div>
      </footer>
    </div>
  );
}
