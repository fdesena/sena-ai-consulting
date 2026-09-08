import { createFileRoute } from "@tanstack/react-router";
import { BlogShell } from "@/components/blog/BlogShell";

export const Route = createFileRoute("/blog/agentes")({
  head: () => ({
    meta: [
      {
        title: "Um agente de IA começa pelo conhecimento da empresa. — Blog Sena Labs",
      },
      {
        name: "description",
        content:
          "Antes de discutir o que um agente pode responder, precisamos decidir de onde suas respostas devem vir.",
      },
      { property: "og:title", content: "Um agente de IA começa pelo conhecimento da empresa." },
      { property: "og:url", content: "https://senaconsulting.app/blog/agentes" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://senaconsulting.app/blog/agentes" }],
  }),
  component: AgentesPost,
});

function AgentesPost() {
  return (
    <BlogShell
      width="narrow"
      eyebrow="Blog · Inteligência artificial"
      title="Um agente de IA começa pelo conhecimento da empresa."
    >
      <div className="space-y-6 text-lg leading-relaxed text-foreground/90">
        <p className="text-xl text-foreground">
          Antes de discutir o que um agente pode responder, precisamos decidir de onde suas
          respostas devem vir.
        </p>

        <h2 className="pt-4 text-2xl font-semibold tracking-tight">Conhecimento com contexto.</h2>
        <p>
          Documentos precisam estar atualizados, ter responsáveis e respeitar permissões de acesso.
          Uma orientação antiga ou uma regra sem contexto pode confundir tanto uma pessoa quanto um
          sistema.
        </p>

        <h2 className="pt-4 text-2xl font-semibold tracking-tight">
          Limites também fazem parte do projeto.
        </h2>
        <p>
          Defina os assuntos que o agente atende, como ele apresenta suas fontes e quando deve
          encaminhar a conversa para alguém do time. Essas decisões tornam a experiência mais
          compreensível.
        </p>

        <blockquote className="border-l-2 border-primary py-1 pl-6 text-2xl leading-snug tracking-tight text-foreground">
          Um bom apoio sabe quando buscar, quando responder e quando pedir ajuda.
        </blockquote>

        <h2 className="pt-4 text-2xl font-semibold tracking-tight">Aprenda com perguntas reais.</h2>
        <p>
          Comece com um conjunto pequeno de dúvidas recorrentes. Revise as respostas com quem
          conhece o negócio e acompanhe os casos em que a informação não foi suficiente.
        </p>
      </div>
    </BlogShell>
  );
}
