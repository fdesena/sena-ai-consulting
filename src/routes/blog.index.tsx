import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BlogShell } from "@/components/blog/BlogShell";
import FinishFlag from "@/components/FinishFlag";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Sena Labs" },
      {
        name: "description",
        content:
          "Dados, análises e bastidores sobre estratégia, IA e tecnologia aplicada — direto da Sena Labs.",
      },
      { property: "og:title", content: "Blog — Sena Labs" },
      { property: "og:url", content: "https://senaconsulting.app/blog" },
    ],
    links: [{ rel: "canonical", href: "https://senaconsulting.app/blog" }],
  }),
  component: BlogIndex,
});

type Post = {
  slug: string;
  label: string;
  title: string;
  description: string;
};

const POSTS: Post[] = [
  {
    slug: "/blog/agentes",
    label: "02 / Inteligência artificial",
    title: "Um agente de IA começa pelo conhecimento da empresa.",
    description:
      "Fontes organizadas, limites claros e revisão humana ajudam a transformar respostas em apoio útil ao time.",
  },
  {
    slug: "/blog/software",
    label: "03 / Software sob medida",
    title: "Quando o processo não cabe na ferramenta.",
    description:
      "Como avaliar o que pode ser configurado, integrado ou construído antes de decidir por um novo sistema.",
  },
  {
    slug: "/blog/gap-adocao-ia",
    label: "04 / O gap de adoção",
    title: "A IA já consegue muito mais do que o mercado usa.",
    description:
      "Dados da pesquisa da Anthropic mostram o tamanho do gap entre o que a IA já consegue fazer e o que as empresas de fato usam.",
  },
  {
    slug: "/blog/marca-sena-labs",
    label: "05 / Marca e identidade",
    title: "A marca por trás da Sena Labs",
    description:
      "De onde vem o símbolo SL, o detalhe da bandeira de chegada e as cores da nova identidade visual.",
  },
];

function BlogIndex() {
  return (
    <BlogShell
      back={false}
      eyebrow="Sena Labs / Perspectivas"
      title="Boas perguntas. Melhores decisões."
      description="Estratégia, IA e software explicados a partir do que muda no trabalho de verdade."
    >
      <article className="grid gap-12 border-y border-border py-10 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.08em] text-primary">
            01 / Em destaque · Estratégia
          </span>
          <h2 className="mt-5 max-w-[18ch] text-3xl font-semibold leading-tight sm:text-5xl">
            Antes de automatizar, entenda o trabalho.
          </h2>
          <p className="mt-4 max-w-[43ch] text-muted-foreground">
            O melhor ponto de partida para a IA pode ser uma pergunta simples: onde o seu time está
            perdendo tempo?
          </p>
          <Link
            to="/blog/automatizar"
            className="mt-6 inline-flex items-center gap-8 border-b border-current pb-1.5 text-sm transition hover:text-primary"
          >
            Ler o artigo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Link
          to="/blog/automatizar"
          className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden bg-[var(--ink)] p-9 text-[var(--paper)] transition hover:opacity-95"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-primary/25"
          />
          <span className="font-mono text-xs text-white/50">CADERNO / 01</span>
          <strong className="text-4xl font-normal leading-[1.08] tracking-tight sm:text-5xl">
            Menos repetição.
            <br />
            <span className="text-[#ffb081]">Mais intenção.</span>
          </strong>
          <div className="flex items-end justify-between border-t border-white/20 pt-5 font-mono text-xs text-white/60">
            <span>
              Estratégia antes
              <br />
              da tecnologia.
            </span>
            <FinishFlag />
          </div>
        </Link>
      </article>

      <div className="mt-16">
        <h2 className="text-3xl font-semibold sm:text-4xl">Para pensar e aplicar.</h2>
      </div>
      <div className="mt-8 grid gap-10 sm:grid-cols-2">
        {POSTS.map((post) => (
          <Link key={post.slug} to={post.slug} className="group border-t border-border pt-6">
            <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
              {post.label}
            </span>
            <h3 className="mt-4 text-2xl font-semibold leading-tight">{post.title}</h3>
            <p className="mt-3 text-muted-foreground">{post.description}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
              Ler artigo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </BlogShell>
  );
}
