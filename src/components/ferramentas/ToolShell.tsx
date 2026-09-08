import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import senaLogoHorizontal from "@/assets/brand/sena-labs-horizontal-light.svg";

type CoBrand = {
  /** Logo do parceiro (PNG/SVG importado). */
  logoSrc: string;
  /** Nome do parceiro, usado no alt da imagem. */
  name: string;
};

type Props = {
  /** Eyebrow em mono acima do título (ex.: "Ferramenta"). */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Slot à direita do cabeçalho da página (ações da ferramenta). */
  actions?: React.ReactNode;
  /** Quando false, esconde o link "Voltar às ferramentas" (usado no índice). */
  back?: boolean;
  /** Quando definido, mostra "Sena. + <logo do parceiro>" na barra (ex.: Modo Alicerce). */
  coBrand?: CoBrand;
  children: React.ReactNode;
};

/**
 * Casca compartilhada das páginas de /ferramentas — mesma barra, tipografia e
 * paleta do site público, para as ferramentas não parecerem um app à parte.
 */
export function ToolShell({
  eyebrow,
  title,
  description,
  actions,
  back = true,
  coBrand,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <a href="/" className="inline-flex items-center gap-2">
            <img src={senaLogoHorizontal} alt="Sena Labs" className="h-7 w-auto" />
            {coBrand ? (
              <span className="flex flex-col leading-tight">
                <span className="inline-flex items-center gap-2">
                  <span className="text-base font-normal text-muted-foreground">+</span>
                  <img src={coBrand.logoSrc} alt={coBrand.name} className="h-9 w-auto" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">Ferramentas</span>
              </span>
            ) : (
              <span className="font-mono text-xs text-muted-foreground">Ferramentas</span>
            )}
          </a>
          <div className="flex items-center gap-3 text-sm">
            {back && (
              <Link
                to="/ferramentas"
                className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar às ferramentas</span>
              </Link>
            )}
            <a
              href="/auth"
              className="rounded-full border border-foreground/15 px-4 py-2 transition hover:border-foreground/40"
            >
              Área exclusiva
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            {eyebrow && (
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                {eyebrow}
              </span>
            )}
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
            {description && <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>

        {children}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Sena Consulting · Felipe Sena</span>
          <a href="/" className="hover:underline">
            senaconsulting.app
          </a>
        </div>
      </footer>
    </div>
  );
}
