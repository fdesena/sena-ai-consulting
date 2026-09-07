import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { trackEvent } from "@/lib/track";
import { BlogShell } from "@/components/blog/BlogShell";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import MarketGapChart from "@/components/MarketGapChart";

export const Route = createFileRoute("/blog/gap-adocao-ia")({
  head: () => ({
    meta: [
      { title: "A IA já consegue muito mais do que o mercado usa — Blog Sena Labs" },
      {
        name: "description",
        content:
          "Dados da pesquisa da Anthropic mostram o tamanho do gap entre o que a IA já consegue fazer e o que as empresas de fato usam — e onde está a oportunidade.",
      },
      {
        property: "og:title",
        content: "A IA já consegue muito mais do que o mercado usa",
      },
      {
        property: "og:description",
        content:
          "O gap de adoção de IA, com dados da Anthropic: o que já é possível vs. o que se usa em média.",
      },
      { property: "og:url", content: "https://senaconsulting.app/blog/gap-adocao-ia" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://senaconsulting.app/blog/gap-adocao-ia" }],
  }),
  component: GapAdocaoIaPost,
});

function GapAdocaoIaPost() {
  return (
    <BlogShell
      eyebrow="Blog · O gap de adoção"
      title="A IA já consegue muito mais do que o mercado usa."
    >
      <ContainerScroll titleComponent={<></>}>
        <div className="grid h-full gap-0 md:grid-cols-[1fr_1.1fr]">
          {/* Explanation + CTAs */}
          <div className="order-2 flex flex-col gap-6 px-6 py-8 text-left sm:px-10 sm:py-10 md:order-1">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  O gap de adoção · dados Anthropic
                </span>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                O que os dados revelam para o seu negócio
              </h2>
            </div>
            <div>
              <p className="text-muted-foreground">
                Dados da pesquisa da Anthropic mostram o{" "}
                <b className="text-foreground">tamanho da oportunidade</b> no mercado. Cada ponta é
                uma categoria profissional: o <b style={{ color: "#4F86C6" }}>azul</b> é o que a IA
                já consegue fazer hoje; o <b style={{ color: "#D14B3D" }}>vermelho</b> é o que de
                fato se usa, em média. A distância entre eles representa o gap — e quem agir
                primeiro leva vantagem.
              </p>
              <div className="mt-5 rounded-2xl border border-border/70 bg-card p-5">
                <p className="text-sm text-muted-foreground">
                  Agora é a sua vez: descubra o quanto você entende, usa e aplica IA — e onde estão
                  os gaps para transformar essa oportunidade em resultado na sua empresa.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/diagnostico"
                onClick={() => trackEvent("click_diagnostico_cta", { source: "blog_oportunidade" })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Realizar diagnóstico
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="/#pilares"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/15 px-6 py-3.5 text-sm font-medium hover:border-foreground/40"
              >
                Ver serviços
              </a>
            </div>
          </div>

          {/* Chart */}
          <div className="order-1 border-t border-border px-6 py-8 text-left sm:px-8 md:order-2 md:border-l md:border-t-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Panorama do mercado · pesquisa
              </span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <MarketGapChart />
            <div className="mt-2 flex items-center justify-center gap-6 text-[11px] font-mono uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm" style={{ background: "#4F86C6" }} /> Poderia
                fazer
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm" style={{ background: "#D14B3D" }} /> Já se usa
              </span>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
              Fonte: Massenkoff &amp; McCrory (2026), "Labor market impacts of AI", Anthropic — Fig.
              2. Valores aproximados, lidos da figura. Adaptado pela Sena.
            </p>
          </div>
        </div>
      </ContainerScroll>
    </BlogShell>
  );
}
