import { Link } from "@tanstack/react-router";
import WhatsAppFAB, { WHATSAPP_URL } from "./WhatsAppFAB";

const EMAIL = "felipesmsena@gmail.com";
const LINKEDIN = "https://linkedin.com/in/senafelipe";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`mx-auto w-full max-w-6xl px-6 py-20 sm:py-28 ${className}`}
    >
      {children}
    </section>
  );
}

const pillars = [
  {
    n: "01",
    title: "Capacitar",
    sub: "Sua equipe usando IA todo dia.",
    href: "#capacitar",
  },
  {
    n: "02",
    title: "Construir",
    sub: "Sistemas que trabalham por você.",
    href: "#construir",
  },
  {
    n: "03",
    title: "Orientar",
    sub: "Onde a IA gera ROI no seu negócio.",
    href: "#orientar",
  },
];

const capacitarItems = [
  {
    t: "Treinamento corporativo em IA",
    d: "Sob medida para operações, vendas, marketing e demais áreas do seu negócio.",
  },
  {
    t: "Palestras de IA",
    d: "Desperte o time para o que já é possível — eventos, clubes de negócio e empresas.",
  },
  {
    t: "Treinamento em ferramentas de IA",
    d: "Produtividade real no dia a dia (Claude Cowork, Lovable, entre outras).",
  },
  {
    t: "Cursos com avatares de IA",
    d: "Conteúdo de treinamento escalável e profissional com HeyGen e Synthesia.",
  },
];

const construirItems = [
  {
    t: "Assistentes de IA customizados",
    d: "Assistentes sob medida que trabalham 24h por dia (ex.: Hermes AI, OpenClaw, Custom GPT, Agent Builder).",
  },
  {
    t: "Apps e automações de fluxos",
    d: "Elimine o trabalho manual repetitivo com aplicações sob medida (Lovable, Antigravity, Cursor, AI Studio).",
  },
  {
    t: "Plataformas, dashboards e LMS",
    d: "Soluções digitais integradas aos sistemas que você já usa.",
  },
];

const orientarItems = [
  {
    t: "Diagnóstico Bússola Digital & IA",
    d: "Mapeie onde IA e automação geram retorno antes de investir.",
  },
  {
    t: "Consultoria 1:1",
    d: "Desenvolvimento de soluções específicas para o seu caso.",
  },
  {
    t: "Transformação digital",
    d: "Redesenho de processos e estrutura operacional para escalar.",
  },
];

const cases = [
  {
    t: "Automação de propostas & e-mails",
    d: "−80% no tempo de elaboração de propostas para o time comercial.",
  },
  {
    t: "Agentes de IA em conteúdo proprietário",
    d: "Suporte e decisão em escala, treinados no conhecimento da empresa.",
  },
  {
    t: "Visualização de dados com IA",
    d: "Gráficos executivos gerados automaticamente a partir dos dados.",
  },
  {
    t: "LMS com gamificação",
    d: "Vídeos, quizzes, rankings e gestão de usuários em plataforma própria.",
  },
  {
    t: "Plataforma CRM + Funil",
    d: "Captura de leads, pipeline comercial e analytics integrados.",
  },
  {
    t: "Ferramentas para eventos",
    d: "Aplicações ao vivo para workshops e palestras imersivas.",
  },
];

const processo = [
  { n: "01", t: "Diagnóstico", d: "Mapeamento de processos, gaps e oportunidades." },
  { n: "02", t: "Construção", d: "Implementação integrada ao seu stack atual." },
  { n: "03", t: "Capacitação", d: "Treino das equipes e garantia de adoção real." },
  { n: "04", t: "Suporte contínuo", d: "Mantemos e evoluímos suas soluções — relação de longo prazo." },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="font-display text-lg font-semibold tracking-tight">
            Sena<span className="text-primary">.</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="#pilares" className="hover:text-primary">O que faço</a>
            <a href="#processo" className="hover:text-primary">Processo</a>
            <a href="#cases" className="hover:text-primary">Cases</a>
            <a href="#sobre" className="hover:text-primary">Sobre</a>
          </nav>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 sm:inline-flex"
          >
            Fale comigo
          </a>
        </div>
      </header>

      {/* HERO */}
      <Section id="top" className="!pt-16 sm:!pt-24">
        <Eyebrow>Sena Consulting · 2026</Eyebrow>
        <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-7xl">
          Onde Estratégia <br className="hidden sm:block" />
          <span className="text-primary">Encontra Execução.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Consultoria de IA e automação de processos que sai da apresentação e vira sistema rodando.
          Do diagnóstico à execução — com resultados mensuráveis.
        </p>

        {/* Primary CTA card */}
        <div className="mt-12 grid gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm sm:grid-cols-[1.2fr_1fr] sm:p-10">
          <div>
            <Eyebrow>CTA Principal</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">IA sem complicação.</h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Sua empresa quer usar IA, mas não sabe por onde começar? Eu ajudo a identificar
              oportunidades e implementar ferramentas práticas para economizar tempo, reduzir
              trabalho manual e gerar resultado real.
            </p>
          </div>
          <div className="flex flex-col items-stretch justify-center gap-3 sm:items-end">
            <Link
              to="/diagnostico"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-4 text-base font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              Realize um diagnóstico →
            </Link>
            <a
              href="#pilares"
              className="inline-flex items-center justify-center rounded-full border border-foreground/20 px-6 py-4 text-base font-medium text-foreground transition hover:border-foreground/40"
            >
              Ver o que faço
            </a>
          </div>
        </div>
      </Section>

      {/* DESAFIO */}
      <Section id="desafio" className="border-t border-border">
        <Eyebrow>O desafio</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
          Entre o discurso da IA e o resultado real, existe um abismo.
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-8">
            <Eyebrow>Da empresa</Eyebrow>
            <h3 className="mt-3 text-2xl font-semibold">
              Empresas querem usar IA, mas não sabem por onde começar.
            </h3>
            <p className="mt-4 text-muted-foreground">
              Muitas empresas querem usar IA, mas travam na prática: não sabem o que priorizar,
              como implementar ou como gerar resultado real com a tecnologia.
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-8">
            <Eyebrow>Da liderança</Eyebrow>
            <h3 className="mt-3 text-2xl font-semibold">
              Todo líder quer usar IA. Poucos sabem transformar isso em gestão e adoção real.
            </h3>
            <p className="mt-4 text-muted-foreground">
              Ferramentas já existem. O desafio é aplicar IA nos processos certos, melhorar a
              gestão da operação e fazer o time usar no dia a dia para ganhar produtividade.
            </p>
          </article>
        </div>
      </Section>

      {/* PILARES */}
      <Section id="pilares" className="border-t border-border">
        <Eyebrow>O que eu vendo</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
          Três formas de gerar valor com IA.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <a
              key={p.n}
              href={p.href}
              className="group rounded-2xl border border-border bg-card p-8 transition hover:border-primary"
            >
              <span className="font-mono text-xs text-primary">{p.n}</span>
              <h3 className="mt-4 text-2xl font-semibold">{p.title}</h3>
              <p className="mt-3 text-muted-foreground">{p.sub}</p>
              <span className="mt-6 inline-block text-sm text-primary opacity-0 transition group-hover:opacity-100">
                Ver detalhes →
              </span>
            </a>
          ))}
        </div>
      </Section>

      {/* PILAR 1 */}
      <PillarBlock
        id="capacitar"
        n="01"
        title="Capacitar"
        sub="Sua equipe usando IA todo dia."
        items={capacitarItems}
      />
      <PillarBlock
        id="construir"
        n="02"
        title="Construir"
        sub="Sistemas que trabalham por você."
        items={construirItems}
        dark
      />
      <PillarBlock
        id="orientar"
        n="03"
        title="Orientar"
        sub="Onde a IA gera ROI no seu negócio."
        items={orientarItems}
      />

      {/* COMECE AQUI */}
      <Section id="comece" className="border-t border-border">
        <Eyebrow>Comece aqui</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
          Não sabe por onde começar?
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h3 className="text-2xl font-semibold">Diagnóstico gratuito</h3>
            <p className="mt-3 text-muted-foreground">
              Mapeie suas maiores oportunidades com IA em uma conversa estruturada.
            </p>
            <Link
              to="/diagnostico"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Fazer diagnóstico →
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-[var(--ink)] p-8 text-[var(--paper)]">
            <h3 className="text-2xl font-semibold">Agende uma palestra</h3>
            <p className="mt-3 opacity-80">
              Leve IA prática para o seu time, evento ou clube de negócios.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Falar no WhatsApp →
            </a>
          </div>
        </div>
      </Section>

      {/* PROCESSO */}
      <Section id="processo" className="border-t border-border">
        <Eyebrow>Como trabalho</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
          Do mapa ao sistema em produção.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {processo.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
              <span className="font-mono text-xs text-primary">{s.n}</span>
              <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CASES */}
      <Section id="cases" className="border-t border-border">
        <Eyebrow>Track record</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
          Construído. Implantado. Em produção.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Projetos que liderei e implementei em consultoria internacional, na Rivool e em
          iniciativas próprias.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <article key={c.t} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold">{c.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* SOBRE */}
      <Section id="sobre" className="border-t border-border">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-center">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <img
              src="/founder.jpg"
              alt="Felipe Sena, fundador da Sena Consulting"
              className="aspect-[4/5] w-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <Eyebrow>Sobre o Felipe</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">
              Estratégia, dados e execução — no mesmo profissional.
            </h2>
            <ul className="mt-8 space-y-4 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Mestrado duplo</span> em Negócios
                Internacionais & Business Analytics.
              </li>
              <li>
                Analytics na <span className="font-medium text-foreground">Sicredi</span> (R$50B em
                AuM), CPO na <span className="font-medium text-foreground">Rivool</span>, programas
                Go-to-Global no <span className="font-medium text-foreground">Boston Innovation
                Gateway</span> — 4 continentes, 22 países. Hult Alumni.
              </li>
              <li>
                Atuação: <span className="font-medium text-foreground">São Paulo · Boston</span> ·
                globalmente.
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* CTA FINAL */}
      <Section id="contato" className="border-t border-border">
        <div className="rounded-3xl bg-[var(--ink)] p-10 text-[var(--paper)] sm:p-16">
          <Eyebrow>Vamos conversar</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold sm:text-6xl">
            Vamos construir algo <span className="text-primary">que funciona.</span>
          </h2>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="rounded-full border border-white/30 px-6 py-3 font-medium text-white hover:bg-white/10"
            >
              E-mail
            </a>
            <a
              href={LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/30 px-6 py-3 font-medium text-white hover:bg-white/10"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </Section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Sena Consulting. Felipe Sena.</span>
          <span>São Paulo · Boston · Global</span>
        </div>
      </footer>

      <WhatsAppFAB />
    </main>
  );
}

function PillarBlock({
  id,
  n,
  title,
  sub,
  items,
  dark = false,
}: {
  id: string;
  n: string;
  title: string;
  sub: string;
  items: { t: string; d: string }[];
  dark?: boolean;
}) {
  return (
    <section
      id={id}
      className={`border-t border-border ${dark ? "bg-[var(--ink)] text-[var(--paper)]" : ""}`}
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <div className="flex items-baseline gap-4">
          <span className={`font-mono text-sm ${dark ? "text-primary" : "text-primary"}`}>
            Pilar {n}
          </span>
        </div>
        <h2 className="mt-3 text-4xl font-semibold sm:text-6xl">{title}.</h2>
        <p className={`mt-4 max-w-2xl text-lg ${dark ? "opacity-80" : "text-muted-foreground"}`}>
          {sub}
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {items.map((it) => (
            <article
              key={it.t}
              className={`rounded-2xl border p-6 ${
                dark ? "border-white/15 bg-white/5" : "border-border bg-card"
              }`}
            >
              <h3 className="text-xl font-semibold">{it.t}</h3>
              <p className={`mt-2 text-sm ${dark ? "opacity-80" : "text-muted-foreground"}`}>
                {it.d}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
