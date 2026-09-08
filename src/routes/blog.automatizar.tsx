import { createFileRoute } from "@tanstack/react-router";
import { BlogShell } from "@/components/blog/BlogShell";

export const Route = createFileRoute("/blog/automatizar")({
  head: () => ({
    meta: [
      { title: "Antes de automatizar, entenda o trabalho. — Blog Sena Labs" },
      {
        name: "description",
        content:
          "O melhor ponto de partida para a IA pode ser uma pergunta simples: onde o seu time está perdendo tempo?",
      },
      { property: "og:title", content: "Antes de automatizar, entenda o trabalho." },
      { property: "og:url", content: "https://senaconsulting.app/blog/automatizar" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://senaconsulting.app/blog/automatizar" }],
  }),
  component: AutomatizarPost,
});

function AutomatizarPost() {
  return (
    <BlogShell
      width="narrow"
      eyebrow="Blog · Estratégia"
      title="Antes de automatizar, entenda o trabalho."
    >
      <div className="space-y-6 text-lg leading-relaxed text-foreground/90">
        <p className="text-xl text-foreground">
          Uma tarefa repetitiva é um convite para investigar. Antes de escolher uma tecnologia, vale
          entender o que acontece, com que frequência e por quê.
        </p>

        <h2 className="pt-4 text-2xl font-semibold tracking-tight">Comece pelo caminho real.</h2>
        <p>
          Acompanhe uma execução do início ao fim. Quais informações entram? Onde alguém precisa
          copiar, conferir ou pedir uma aprovação? O desenho do processo deve incluir as exceções,
          não apenas o caminho ideal.
        </p>

        <h2 className="pt-4 text-2xl font-semibold tracking-tight">Escolha um recorte pequeno.</h2>
        <p>
          Uma boa primeira experiência tem limites claros: uma etapa, uma fonte de dados e uma
          pessoa responsável por acompanhar o resultado. Isso permite comparar o trabalho antes e
          depois e corrigir o que não funcionou.
        </p>

        <blockquote className="border-l-2 border-primary py-1 pl-6 text-2xl leading-snug tracking-tight text-foreground">
          O objetivo é devolver atenção às pessoas. A tecnologia é parte do caminho.
        </blockquote>

        <h2 className="pt-4 text-2xl font-semibold tracking-tight">
          Defina o que significa melhorar.
        </h2>
        <p>
          Pode ser reduzir retrabalho, diminuir o tempo de espera ou tornar uma informação mais
          confiável. Registre o ponto de partida e combine como a equipe vai avaliar a mudança.
        </p>
      </div>
    </BlogShell>
  );
}
