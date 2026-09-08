import { createFileRoute } from "@tanstack/react-router";
import { BlogShell } from "@/components/blog/BlogShell";

export const Route = createFileRoute("/blog/software")({
  head: () => ({
    meta: [
      { title: "Quando o processo não cabe na ferramenta. — Blog Sena Labs" },
      {
        name: "description",
        content:
          "Criar um sistema próprio é uma decisão de negócio. O primeiro passo é entender onde a ferramenta atual ajuda e onde exige trabalho extra.",
      },
      { property: "og:title", content: "Quando o processo não cabe na ferramenta." },
      { property: "og:url", content: "https://senaconsulting.app/blog/software" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://senaconsulting.app/blog/software" }],
  }),
  component: SoftwarePost,
});

function SoftwarePost() {
  return (
    <BlogShell
      width="narrow"
      eyebrow="Blog · Software sob medida"
      title="Quando o processo não cabe na ferramenta."
    >
      <div className="space-y-6 text-lg leading-relaxed text-foreground/90">
        <p className="text-xl text-foreground">
          Criar um sistema próprio é uma decisão de negócio. O primeiro passo é entender onde a
          ferramenta atual ajuda e onde exige trabalho extra.
        </p>

        <h2 className="pt-4 text-2xl font-semibold tracking-tight">Observe as adaptações.</h2>
        <p>
          Planilhas paralelas, campos usados para outra finalidade e informações digitadas duas
          vezes são bons pontos de investigação. Cada adaptação revela algo sobre a distância entre
          o processo e o sistema.
        </p>

        <h2 className="pt-4 text-2xl font-semibold tracking-tight">Compare caminhos possíveis.</h2>
        <p>
          Configurar melhor o que já existe, conectar ferramentas ou construir uma aplicação são
          alternativas que podem se complementar. A escolha deve considerar uso, manutenção, acesso
          aos dados e capacidade de evolução.
        </p>

        <blockquote className="border-l-2 border-primary py-1 pl-6 text-2xl leading-snug tracking-tight text-foreground">
          O projeto começa no trabalho das pessoas, antes de chegar às telas.
        </blockquote>

        <h2 className="pt-4 text-2xl font-semibold tracking-tight">
          Desenhe o essencial primeiro.
        </h2>
        <p>
          Um recorte bem definido ajuda a validar o fluxo com a equipe. Depois, novas funções podem
          ser priorizadas a partir de dificuldades observadas no uso.
        </p>
      </div>
    </BlogShell>
  );
}
