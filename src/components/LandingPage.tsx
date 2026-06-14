import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  GraduationCap,
  Wrench,
  Compass,
  Bot,
  Workflow,
  LayoutDashboard,
  Presentation,
  Sparkles,
  Users,
  Target,
  Mic2,
  TrendingUp,
  Database,
  GraduationCap as GradCap,
  LineChart,
  MessageSquare,
  Mail,
  Linkedin,
} from "lucide-react";
import WhatsAppFAB, { WHATSAPP_URL } from "./WhatsAppFAB";
import ProcessCycle from "./ProcessCycle";
import DiagnosticChart from "./DiagnosticChart";
import TrackRecord from "./TrackRecord";

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
    Icon: GraduationCap,
  },
  {
    n: "02",
    title: "Construir",
    sub: "Sistemas que trabalham por você.",
    href: "#construir",
    Icon: Wrench,
  },
  {
    n: "03",
    title: "Orientar",
    sub: "Onde a IA gera ROI no seu negócio.",
    href: "#orientar",
    Icon: Compass,
  },
];

const capacitarItems = [
  { t: "Treinamento corporativo em IA", Icon: Users },
  { t: "Palestras de IA", Icon: Mic2 },
  { t: "Workshops em ferramentas (Claude, Lovable)", Icon: Sparkles },
  { t: "Cursos com avatares (HeyGen, Synthesia)", Icon: Presentation },
];

const construirItems = [
  { t: "Assistentes de IA customizados", Icon: Bot },
  { t: "Apps e automações de fluxos", Icon: Workflow },
  { t: "Plataformas, dashboards e LMS", Icon: LayoutDashboard },
];

const orientarItems = [
  { t: "Diagnóstico Bússola Digital & IA", Icon: Target },
  { t: "Consultoria 1:1", Icon: MessageSquare },
  { t: "Transformação digital", Icon: TrendingUp },
];

const cases = [
  { t: "Automação de propostas", d: "−80% no tempo de elaboração.", Icon: Workflow },
  { t: "Agentes em conteúdo proprietário", d: "Suporte e decisão em escala.", Icon: Bot },
  { t: "Visualização de dados com IA", d: "Dashboards executivos automáticos.", Icon: LineChart },
  { t: "LMS gamificado", d: "Vídeos, quizzes e rankings próprios.", Icon: GradCap },
  { t: "CRM + Funil próprio", d: "Leads, pipeline e analytics integrados.", Icon: Database },
  { t: "Ferramentas para eventos", d: "Apps ao vivo em palestras imersivas.", Icon: Presentation },
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
            className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 sm:inline-flex"
          >
            Fale comigo
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* HERO */}
      <Section id="top" className="!pt-16 sm:!pt-24">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <Eyebrow>Sena Consulting · IA &amp; Automação</Eyebrow>
        </div>
        <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-7xl">
          Onde estratégia <br className="hidden sm:block" />
          encontra <span className="text-primary">execução.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
          Da apresentação ao sistema rodando. Consultoria de IA com resultado mensurável.
        </p>

        {/* Hero CTA — diagnostic with chart */}
        <div className="mt-14 grid gap-0 overflow-hidden rounded-3xl border border-border bg-card shadow-sm md:grid-cols-[1.05fr_1fr]">
          <div className="flex flex-col justify-between gap-8 p-8 sm:p-10">
            <div>
              <Eyebrow>Comece pelo diagnóstico</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                IA sem complicação.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Mapeio em uma conversa onde sua operação pode ganhar tempo, reduzir trabalho
                manual e gerar resultado real com IA.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/diagnostico"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Realizar diagnóstico
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#pilares"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/15 px-6 py-3.5 text-sm font-medium hover:border-foreground/40"
              >
                Ver serviços
              </a>
            </div>
          </div>
          <div className="border-t border-border bg-[var(--paper)] p-6 sm:p-8 md:border-l md:border-t-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Bússola Digital &amp; IA · Exemplo
              </span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <DiagnosticChart />
            <div className="mt-3 flex items-center justify-center gap-6 text-[11px] font-mono uppercase tracking-wider">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-[var(--muted-foreground)]" /> Atual
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" /> Com IA
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* DESAFIO */}
      <Section id="desafio" className="border-t border-border">
        <Eyebrow>O desafio</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
          Entre o discurso da IA e o resultado real, existe um abismo.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-8">
            <Target className="h-6 w-6 text-primary" strokeWidth={1.6} />
            <h3 className="mt-5 text-2xl font-semibold">
              Querem usar IA. Não sabem por onde começar.
            </h3>
            <p className="mt-3 text-muted-foreground">
              Travam na prática: o que priorizar, como implementar, como medir resultado.
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-8">
            <Users className="h-6 w-6 text-primary" strokeWidth={1.6} />
            <h3 className="mt-5 text-2xl font-semibold">
              Ferramentas existem. Adoção real, não.
            </h3>
            <p className="mt-3 text-muted-foreground">
              O desafio é aplicar IA nos processos certos e fazer o time usar todo dia.
            </p>
          </article>
        </div>
      </Section>

      {/* PILARES */}
      <Section id="pilares" className="border-t border-border">
        <Eyebrow>O que eu faço</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
          Três formas de gerar valor com IA.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <a
              key={p.n}
              href={p.href}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition hover:border-primary hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p.Icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                <span className="font-mono text-xs text-muted-foreground">{p.n}</span>
              </div>
              <h3 className="mt-8 text-2xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-muted-foreground">{p.sub}</p>
              <ArrowUpRight className="absolute right-6 bottom-6 h-5 w-5 translate-y-1 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </Section>

      {/* PILAR BLOCKS */}
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
          <div className="group rounded-2xl border border-border bg-card p-8 transition hover:border-primary">
            <Target className="h-7 w-7 text-primary" strokeWidth={1.5} />
            <h3 className="mt-6 text-2xl font-semibold">Diagnóstico gratuito</h3>
            <p className="mt-2 text-muted-foreground">
              Mapeie suas maiores oportunidades com IA.
            </p>
            <Link
              to="/diagnostico"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Fazer diagnóstico <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-[var(--ink)] p-8 text-[var(--paper)]">
            <Mic2 className="h-7 w-7 text-primary" strokeWidth={1.5} />
            <h3 className="mt-6 text-2xl font-semibold">Palestra de IA</h3>
            <p className="mt-2 opacity-80">Leve IA prática para o seu time ou evento.</p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Falar no WhatsApp <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </Section>

      {/* PROCESSO — interactive cycle */}
      <Section id="processo" className="border-t border-border">
        <Eyebrow>Como trabalho</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
          Do mapa ao sistema em produção.
        </h2>
        <div className="mt-16">
          <ProcessCycle />
        </div>
      </Section>

      {/* CASES */}
      <Section id="cases" className="border-t border-border">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Track record</Eyebrow>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
              Construído. Implantado. Em produção.
            </h2>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Amostras de soluções entregues — protótipos das interfaces reais.
          </p>
        </div>
        <div className="mt-12">
          <TrackRecord />
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
              Estratégia, dados e execução no mesmo profissional.
            </h2>
            <ul className="mt-8 space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <GraduationCap className="mt-1 h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} />
                <span>
                  <span className="font-medium text-foreground">Mestrado duplo</span> em Negócios
                  Internacionais &amp; Business Analytics.
                </span>
              </li>
              <li className="flex gap-3">
                <TrendingUp className="mt-1 h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} />
                <span>
                  Analytics na <span className="font-medium text-foreground">Sicredi</span> (R$50B
                  AuM), CPO na <span className="font-medium text-foreground">Rivool</span>, Hult
                  Alumni · 4 continentes, 22 países.
                </span>
              </li>
              <li className="flex gap-3">
                <Compass className="mt-1 h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} />
                <span>
                  <span className="font-medium text-foreground">São Paulo · Boston</span> ·
                  globalmente.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* CTA FINAL */}
      <Section id="contato" className="border-t border-border">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--ink)] p-10 text-[var(--paper)] sm:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
          />
          <Eyebrow>Vamos conversar</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold sm:text-6xl">
            Vamos construir algo <span className="text-primary">que funciona.</span>
          </h2>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
            >
              <MessageSquare className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-medium text-white hover:bg-white/10"
            >
              <Mail className="h-4 w-4" /> E-mail
            </a>
            <a
              href={LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-medium text-white hover:bg-white/10"
            >
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
          </div>
        </div>
      </Section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Sena Consulting · Felipe Sena</span>
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
  items: { t: string; Icon: typeof Bot }[];
  dark?: boolean;
}) {
  return (
    <section
      id={id}
      className={`border-t border-border ${dark ? "bg-[var(--ink)] text-[var(--paper)]" : ""}`}
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_1.6fr] md:items-start">
          <div className="md:sticky md:top-28">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Pilar {n}
            </span>
            <h2 className="mt-3 text-4xl font-semibold sm:text-6xl">{title}.</h2>
            <p className={`mt-4 text-lg ${dark ? "opacity-80" : "text-muted-foreground"}`}>
              {sub}
            </p>
          </div>
          <div className="grid gap-3">
            {items.map((it) => (
              <article
                key={it.t}
                className={`flex items-center gap-4 rounded-xl border p-5 transition hover:translate-x-1 ${
                  dark
                    ? "border-white/15 bg-white/[0.03] hover:border-primary"
                    : "border-border bg-card hover:border-primary"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                    dark ? "bg-primary/15 text-primary" : "bg-primary/10 text-primary"
                  }`}
                >
                  <it.Icon className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <h3 className="text-base font-medium sm:text-lg">{it.t}</h3>
                <ArrowUpRight
                  className={`ml-auto h-4 w-4 ${dark ? "opacity-50" : "text-muted-foreground"}`}
                />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
