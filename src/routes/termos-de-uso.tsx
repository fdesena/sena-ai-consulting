import { createFileRoute, Link } from "@tanstack/react-router";

const EMAIL = "felipesmsena@gmail.com";

export const Route = createFileRoute("/termos-de-uso")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Sena Consulting" },
      {
        name: "description",
        content: "Termos de Uso da Sena Consulting, em conformidade com a LGPD.",
      },
      { property: "og:title", content: "Termos de Uso — Sena Consulting" },
      { property: "og:url", content: "https://senaconsulting.app/termos-de-uso" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "https://senaconsulting.app/termos-de-uso" }],
  }),
  component: TermsOfUse,
});

function TermsOfUse() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-foreground">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">
        ← Voltar
      </Link>

      <h1 className="mt-6 text-3xl font-semibold">Termos de Uso</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: 30 de julho de 2026</p>

      <div className="prose prose-neutral mt-8 max-w-none space-y-6 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-lg font-semibold">1. Aceitação dos termos</h2>
          <p>
            Ao acessar o site senaconsulting.app ou interagir com a Sena Consulting por e-mail,
            LinkedIn ou WhatsApp (incluindo automações via API do WhatsApp Business), você concorda
            com estes Termos de Uso e com nossa{" "}
            <Link to="/politica-de-privacidade" className="underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Descrição do serviço</h2>
          <p>
            A Sena Consulting oferece serviços de consultoria em inteligência artificial, automação
            e transformação digital, incluindo diagnósticos, implementação de sistemas e
            capacitação. O conteúdo do site é informativo e comercial, não constituindo relação
            contratual até a formalização de uma proposta.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Uso aceitável</h2>
          <p>Ao usar nosso site ou canais de contato, você concorda em não:</p>
          <ul className="list-disc pl-6">
            <li>Utilizar os canais de comunicação para fins ilícitos, abusivos ou fraudulentos;</li>
            <li>Tentar acessar indevidamente sistemas, dados ou contas de terceiros;</li>
            <li>
              Reproduzir, copiar ou explorar comercialmente o conteúdo do site sem autorização.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Propriedade intelectual</h2>
          <p>
            Textos, marca, layout e materiais disponibilizados no site são de propriedade da Sena
            Consulting ou licenciados a ela, protegidos pela legislação de direitos autorais e
            propriedade industrial aplicável.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Dados pessoais e LGPD</h2>
          <p>
            O tratamento de dados pessoais coletados através de nossos canais segue a Lei Geral de
            Proteção de Dados (Lei nº 13.709/2018), conforme detalhado em nossa{" "}
            <Link to="/politica-de-privacidade" className="underline">
              Política de Privacidade
            </Link>
            . Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento
            pelo e-mail{" "}
            <a href={`mailto:${EMAIL}`} className="underline">
              {EMAIL}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Limitação de responsabilidade</h2>
          <p>
            As informações disponibilizadas no site têm caráter geral e não substituem uma análise
            personalizada do seu negócio. A Sena Consulting não se responsabiliza por decisões
            tomadas exclusivamente com base no conteúdo público do site, sem um diagnóstico ou
            consultoria formal.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Alterações destes termos</h2>
          <p>
            Podemos atualizar estes Termos de Uso periodicamente. A versão vigente estará sempre
            disponível nesta página, com a data da última atualização indicada acima.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">8. Contato</h2>
          <p>
            Dúvidas sobre estes termos podem ser enviadas para{" "}
            <a href={`mailto:${EMAIL}`} className="underline">
              {EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
