import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, TrendingUp } from "lucide-react";
import { BlogShell } from "@/components/blog/BlogShell";

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
  title: string;
  description: string;
  Icon: typeof TrendingUp;
};

const POSTS: Post[] = [
  {
    slug: "/blog/gap-adocao-ia",
    title: "A IA já consegue muito mais do que o mercado usa.",
    description:
      "Dados da pesquisa da Anthropic mostram o tamanho do gap entre o que a IA já consegue fazer e o que as empresas de fato usam.",
    Icon: TrendingUp,
  },
];

function BlogIndex() {
  return (
    <BlogShell
      back={false}
      eyebrow="Blog Sena Labs"
      title="Blog"
      description="Dados, análises e bastidores sobre estratégia, IA e tecnologia aplicada."
    >
      <div className="grid gap-4">
        {POSTS.map((post) => (
          <Link
            key={post.slug}
            to={post.slug}
            className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 transition hover:border-primary/50 hover:shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <post.Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">{post.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{post.description}</p>
            </div>
            <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </BlogShell>
  );
}
