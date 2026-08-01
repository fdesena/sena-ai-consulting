import { createFileRoute, Link } from "@tanstack/react-router";

const EMAIL = "felipesmsena@gmail.com";

export const Route = createFileRoute("/politica-de-privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Sena Consulting" },
      {
        name: "description",
        content:
          "Política de Privacidade da Sena Consulting: como coletamos, usamos e protegemos dados de contato, incluindo comunicação via WhatsApp.",
      },
      { property: "og:title", content: "Política de Privacidade — Sena Consulting" },
      { property: "og:url", content: "https://senaconsulting.app/politica-de-privacidade" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "https://senaconsulting.app/politica-de-privacidade" }],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-foreground">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">
        ← Voltar
      </Link>

      <h1 className="mt-6 text-3xl font-semibold">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: 1º de agosto de 2026</p>

      <div className="prose prose-neutral mt-8 max-w-none space-y-6 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-lg font-semibold">1. Quem somos</h2>
          <p>
            A Sena Consulting ("nós") é uma consultoria de IA e automação operada por Felipe Sena. Esta
            política explica como coletamos, usamos e protegemos as informações de pessoas que entram em
            contato conosco pelo site, e-mail, LinkedIn ou WhatsApp, incluindo interações automatizadas
            realizadas através da API do WhatsApp Business (Meta).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Quais dados coletamos</h2>
          <p>Quando você interage com a gente, podemos coletar:</p>
          <ul className="list-disc pl-6">
            <li>Nome, número de telefone e conteúdo das mensagens trocadas via WhatsApp;</li>
            <li>Endereço de e-mail e conteúdo de mensagens enviadas por formulários ou e-mail;</li>
            <li>Respostas fornecidas em nosso diagnóstico de IA e automação (Bússola Digital & IA);</li>
            <li>Dados de uso do site (páginas visitadas, origem do tráfego) para fins estatísticos.</li>
            <li>
              Nome, telefone e conteúdo das mensagens de clientes dos nossos clientes, quando operamos
              integrações de WhatsApp Business em nome deles.
            </li>
          </ul>
          <p>
            Nesse último caso atuamos como operadores: os dados pertencem ao nosso cliente contratante,
            que define as finalidades do tratamento.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Como usamos seus dados</h2>
          <p>Usamos essas informações para:</p>
          <ul className="list-disc pl-6">
            <li>Responder dúvidas e conduzir conversas comerciais, inclusive por automações de WhatsApp;</li>
            <li>Agendar reuniões e dar continuidade a propostas de consultoria;</li>
            <li>Gerar o diagnóstico solicitado e enviar seu resultado por e-mail ou WhatsApp;</li>
            <li>Melhorar nossos serviços e comunicação.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Compartilhamento de dados</h2>
          <p>
            Não vendemos seus dados. Tratamos dois conjuntos de dados independentes, em infraestruturas
            separadas, e cada prestador tem acesso apenas ao conjunto indicado abaixo.
          </p>
          <p>
            Dados do site e da área de clientes — nome, e-mail, respostas de diagnóstico e dados de uso:
          </p>
          <ul className="list-disc pl-6">
            <li>Supabase, Inc. (Estados Unidos) — banco de dados;</li>
            <li>Vercel Inc. (Estados Unidos) — hospedagem do site;</li>
            <li>provedor de e-mail transacional.</li>
          </ul>
          <p>
            Dados das integrações de WhatsApp Business — nome, telefone e conteúdo das mensagens trocadas
            entre nossos clientes e os clientes deles:
          </p>
          <ul className="list-disc pl-6">
            <li>Meta Platforms, Inc. — infraestrutura da API do WhatsApp Business;</li>
            <li>servidores operados diretamente pela Sena Consulting, em datacenter no Brasil.</li>
          </ul>
          <p>
            Estes dados não são armazenados no Supabase, na Vercel nem em qualquer outro prestador
            terceiro.
          </p>
          <p>
            Também podemos divulgar dados quando exigido por autoridade competente, observada nossa
            política de análise de legitimidade e de minimização de dados.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Retenção e exclusão de dados</h2>
          <p>
            Mantemos seus dados pelo tempo necessário para os fins descritos acima ou conforme exigido por
            lei. Você pode solicitar a exclusão dos seus dados a qualquer momento entrando em contato pelo
            e-mail <a href={`mailto:${EMAIL}`} className="underline">{EMAIL}</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Seus direitos</h2>
          <p>
            De acordo com a LGPD (Lei nº 13.709/2018) e, quando aplicável, o GDPR, você tem direito a
            acessar, corrigir, portar ou solicitar a exclusão dos seus dados pessoais, além de revogar
            consentimento para comunicações a qualquer momento.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Contato</h2>
          <p>
            Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato pelo e-mail{" "}
            <a href={`mailto:${EMAIL}`} className="underline">{EMAIL}</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
