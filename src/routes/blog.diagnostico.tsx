import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BlogShell } from "@/components/blog/BlogShell";

export const Route = createFileRoute("/blog/diagnostico")({
  head: () => ({
    meta: [
      { title: "O que você recebe no diagnóstico de oportunidades — Blog Sena Labs" },
      {
        name: "description",
        content:
          "Um percurso de cerca de 8 minutos que prioriza uma oportunidade real no seu negócio e devolve um plano inicial — sem nota de maturidade, sem comparação de mercado e sem ROI inventado.",
      },
      { property: "og:title", content: "O que você recebe no diagnóstico de oportunidades." },
      { property: "og:url", content: "https://www.senalabs.tech/blog/diagnostico" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://www.senalabs.tech/blog/diagnostico" }],
  }),
  component: DiagnosticoPost,
});

function DiagnosticoPost() {
  return (
    <BlogShell
      width="narrow"
      eyebrow="Blog · Diagnóstico"
      title="O que você recebe no diagnóstico de oportunidades."
    >
      <div className="space-y-6 text-lg leading-relaxed text-foreground/90">
        <p className="text-xl text-foreground">
          Site, conteúdo, vendas, operação, atendimento, dados, uma ferramenta própria, IA para o
          time — são muitas frentes possíveis, e quase nunca fica óbvio por onde começar. O
          diagnóstico existe para resolver essa primeira decisão, não para vender uma resposta
          pronta.
        </p>

        <h2 className="pt-4 text-2xl font-semibold tracking-tight">Como funciona.</h2>
        <p>
          São cerca de 8 minutos de perguntas diretas, sem jargão técnico. Você escolhe até três
          áreas onde enxerga uma oportunidade e, se marcar mais de uma, escolhe qual delas merece
          atenção primeiro. As perguntas seguintes se ajustam a essa escolha e ao seu contexto —
          profissional solo ou equipe, o que já existe hoje, o que ainda falta organizar.
        </p>

        <h2 className="pt-4 text-2xl font-semibold tracking-tight">O que você recebe ao final.</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Uma oportunidade prioritária, com justificativa ligada às suas próprias respostas.
          </li>
          <li>A situação relatada, os efeitos percebidos e o que ainda precisa ser validado.</li>
          <li>
            Ações para agora, para os próximos 7 dias e para os próximos 30 dias — um plano inicial
            que você pode seguir por conta própria, não uma promessa de entrega.
          </li>
          <li>Um indicador de sucesso coerente com a situação específica, e como acompanhá-lo.</li>
          <li>As outras áreas que você marcou, registradas como hipóteses para explorar depois.</li>
          <li>Revisão das suas respostas, download do diagnóstico e impressão em PDF.</li>
        </ul>

        <blockquote className="border-l-2 border-primary py-1 pl-6 text-2xl leading-snug tracking-tight text-foreground">
          O resultado é seu, com ou sem conversa depois. Uma conversa com a Sena Labs é uma escolha
          posterior, nunca uma condição para ver o diagnóstico.
        </blockquote>

        <h2 className="pt-4 text-2xl font-semibold tracking-tight">
          O que você não vai encontrar.
        </h2>
        <p>
          Não há nota de maturidade nem comparação com outras empresas do seu setor. Não inventamos
          economia garantida ou retorno financeiro — quando você não sabe estimar o esforço atual,
          dizemos isso explicitamente, em vez de preencher a lacuna com um número. E prazo ou
          orçamento informados por você não mudam a oportunidade recomendada: eles ajudam a
          organizar uma eventual conversa, não a distorcer o diagnóstico.
        </p>

        <div className="pt-4">
          <Link
            to="/diagnostico"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Fazer o diagnóstico gratuito
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </BlogShell>
  );
}
