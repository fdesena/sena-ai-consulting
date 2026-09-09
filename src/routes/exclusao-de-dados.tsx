import { createFileRoute, Link } from "@tanstack/react-router";

const EMAIL = "felipesmsena@gmail.com";

export const Route = createFileRoute("/exclusao-de-dados")({
  head: () => ({
    meta: [
      { title: "Exclusão de Dados do Usuário — Sena Labs" },
      {
        name: "description",
        content: "Instruções para solicitar a exclusão dos seus dados pessoais junto à Sena Labs.",
      },
      { property: "og:title", content: "Exclusão de Dados do Usuário — Sena Labs" },
      { property: "og:url", content: "https://www.senalabs.tech/exclusao-de-dados" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.senalabs.tech/exclusao-de-dados" }],
  }),
  component: DataDeletion,
});

function DataDeletion() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-foreground">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">
        ← Voltar
      </Link>

      <h1 className="mt-6 text-3xl font-semibold">Exclusão de Dados do Usuário</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: 30 de julho de 2026</p>

      <div className="prose prose-neutral mt-8 max-w-none space-y-6 text-sm leading-relaxed text-foreground/90">
        <section>
          <p>
            Se você trocou mensagens com a Sena Labs pelo WhatsApp, e-mail, LinkedIn ou preencheu
            algum formulário em nosso site (como o diagnóstico de oportunidades), você pode
            solicitar a exclusão dos seus dados pessoais armazenados por nós a qualquer momento.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Como solicitar a exclusão</h2>
          <p>Envie um e-mail para:</p>
          <p>
            <a
              href={`mailto:${EMAIL}?subject=Solicitação de exclusão de dados`}
              className="font-medium underline"
            >
              {EMAIL}
            </a>
          </p>
          <p>Inclua no e-mail:</p>
          <ul className="list-disc pl-6">
            <li>Seu nome completo;</li>
            <li>O número de telefone ou e-mail usado para entrar em contato conosco;</li>
            <li>O pedido de exclusão dos seus dados.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">O que acontece depois</h2>
          <p>
            Confirmamos o recebimento da solicitação em até 3 dias úteis e concluímos a exclusão dos
            dados associados à sua identidade (mensagens, respostas de formulários e dados de
            contato) em até 15 dias úteis, salvo obrigação legal de retenção por período maior.
          </p>
        </section>

        <section>
          <p>
            Para mais detalhes sobre como tratamos seus dados, consulte nossa{" "}
            <Link to="/politica-de-privacidade" className="underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
