import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/track";
import { BlogShell } from "@/components/blog/BlogShell";
import senaLogoHorizontal from "@/assets/brand/sena-labs-horizontal-light.svg";

export const Route = createFileRoute("/blog/marca-sena-labs")({
  head: () => ({
    meta: [
      { title: "A marca por trás da Sena Labs — Blog Sena Labs" },
      {
        name: "description",
        content:
          "De onde vem o símbolo SL, o detalhe da bandeira de chegada e as cores da nova identidade visual da Sena Labs.",
      },
      { property: "og:title", content: "A marca por trás da Sena Labs" },
      {
        property: "og:description",
        content:
          "O símbolo, as cores e o raciocínio por trás da nova identidade visual da Sena Labs.",
      },
      { property: "og:url", content: "https://senaconsulting.app/blog/marca-sena-labs" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://senaconsulting.app/blog/marca-sena-labs" }],
  }),
  component: BrandPost,
});

function BrandPost() {
  return (
    <BlogShell
      eyebrow="Blog · Marca e identidade"
      title="A marca por trás da Sena Labs"
      description="De onde vem o símbolo SL, o detalhe da bandeira de chegada e as cores da nova identidade visual."
    >
      <div className="mb-10 flex justify-center rounded-2xl border border-border bg-card p-10">
        <img src={senaLogoHorizontal} alt="Sena Labs" className="h-16 w-auto sm:h-20" />
      </div>

      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>A identidade da Sena Labs parte da união entre estratégia e execução.</p>
          <p>
            O símbolo combina as iniciais <b className="text-foreground">S</b> e{" "}
            <b className="text-foreground">L</b> em um único traço contínuo. Essa construção
            representa o caminho completo que a Sena Labs percorre com seus clientes: entender o
            negócio, definir a direção e transformar a estratégia em soluções que funcionam.
          </p>
          <p>
            O terminal do L recebe um detalhe inspirado na bandeira de chegada. Ele representa a
            conclusão de projetos e a passagem da ideia para uma entrega concreta, sem transformar o
            símbolo em uma referência esportiva literal.
          </p>
          <p>
            O laranja destaca ação, energia e construção. O grafite transmite profundidade técnica e
            confiança. O off-white acrescenta clareza e proximidade.
          </p>
          <p>
            O nome em letras minúsculas reforça uma relação mais direta e acessível. A marca combina
            visão estratégica, inteligência artificial e software sob medida para ajudar empresas a
            trabalhar melhor e recuperar tempo para o que realmente importa.
          </p>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
              Versão curta
            </span>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              O símbolo da Sena Labs une as iniciais S e L em um traço contínuo, representando o
              caminho entre estratégia e execução. O detalhe no final do L faz referência à bandeira
              de chegada e simboliza projetos concluídos e soluções colocadas em funcionamento.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
              Versão institucional
            </span>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A marca da Sena Labs representa a conexão entre compreender um negócio e construir a
              tecnologia adequada para ele. O monograma SL, formado por um único percurso, traduz
              essa atuação integrada: estratégia, inteligência artificial, software sob medida e
              entrega.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              O detalhe inspirado na bandeira de chegada reforça a ideia de avanço e conclusão. Ele
              representa o momento em que uma decisão deixa de ser apenas uma intenção e se
              transforma em uma solução útil para o negócio.
            </p>
          </div>
        </aside>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/diagnostico"
          onClick={() => trackEvent("click_diagnostico_cta", { source: "blog_marca" })}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Realizar diagnóstico
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </BlogShell>
  );
}
