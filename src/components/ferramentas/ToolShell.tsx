import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

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
 * Casca compartilhada das páginas de /ferramentas — header escuro do site em
 * cima de um corpo claro, para as ferramentas em si não perderem contraste.
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
      <SiteHeader />

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
            {coBrand && (
              <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span>+</span>
                <img src={coBrand.logoSrc} alt={coBrand.name} className="h-7 w-auto" />
              </div>
            )}
            {back && (
              <Link
                to="/ferramentas"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar às ferramentas
              </Link>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>

        {children}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Sena Labs · Felipe Sena</span>
          <Link to="/" className="hover:text-primary hover:underline">
            senaconsulting.app
          </Link>
        </div>
      </footer>
    </div>
  );
}
