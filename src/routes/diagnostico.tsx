import { createFileRoute, Link } from "@tanstack/react-router";
import WhatsAppFAB, { WHATSAPP_URL } from "@/components/WhatsAppFAB";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      { title: "Diagnóstico Bússola Digital & IA — Sena Consulting" },
      {
        name: "description",
        content:
          "Diagnóstico estruturado para mapear onde IA e automação geram retorno real no seu negócio antes de investir.",
      },
      { property: "og:title", content: "Diagnóstico Bússola Digital & IA — Sena Consulting" },
      {
        property: "og:description",
        content: "Mapeie suas maiores oportunidades com IA antes de investir.",
      },
      { property: "og:url", content: "https://sena-ai-consulting.lovable.app/diagnostico" },
    ],
    links: [
      { rel: "canonical", href: "https://sena-ai-consulting.lovable.app/diagnostico" },
    ],
  }),
  component: DiagnosticoPage,
});

function DiagnosticoPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-lg font-semibold tracking-tight">
            Sena<span className="text-primary">.</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Voltar
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl px-6 py-24 sm:py-32">
        <span className="eyebrow">Bússola Digital &amp; IA</span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
          Realize um <span className="text-primary">diagnóstico</span>.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Em uma conversa estruturada, mapeamos onde IA e automação geram retorno real no seu
          negócio — antes de qualquer investimento.
        </p>

        <div className="mt-12 rounded-2xl border border-dashed border-border bg-card p-8">
          <span className="eyebrow">Em breve</span>
          <p className="mt-3 text-base text-muted-foreground">
            O formulário e o conteúdo completo do diagnóstico serão publicados aqui em breve.
            Enquanto isso, fale comigo direto no WhatsApp para agendar.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Agendar pelo WhatsApp →
          </a>
        </div>
      </section>

      <WhatsAppFAB />
    </main>
  );
}
