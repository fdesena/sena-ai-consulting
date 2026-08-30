import TypeWriter from "@/components/TypeWriter";
import logoIcon from "@/assets/Logo/logo-icon.png";
import logoFull from "@/assets/Logo/senaconsulting_logo_tight.png";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { trackEvent, trackPageview } from "@/lib/track";
import {
  ArrowRight,
  ArrowUpRight,
  GraduationCap,
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
  Zap,
  Building2,
  ChevronDown,
  LogIn,
  Wrench,
  Menu,
} from "lucide-react";
import { motion } from "framer-motion";
import { WHATSAPP_URL } from "./WhatsAppFAB";
import ProcessCycle from "./ProcessCycle";
import MarketGapChart from "./MarketGapChart";
import DiagnosticChart from "./DiagnosticChart";
import TrackRecord from "./TrackRecord";
import GlobalExperience from "./GlobalExperience";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { RING_1_TOOLS, RING_2_TOOLS, RING_3_TOOLS, type ToolIcon } from "@/data/tool-icons";
import felipeImg from "@/assets/felipe-sena-profile.png";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const COUNTRIES = [
  { code: "BR", name: "Brasil" },
  { code: "US", name: "Estados Unidos" },
  { code: "GB", name: "Reino Unido" },
  { code: "PT", name: "Portugal" },
  { code: "ES", name: "Espanha" },
  { code: "MY", name: "Malásia" },
  { code: "CN", name: "China (Xangai)" },
  { code: "IT", name: "Itália" },
  { code: "JO", name: "Jordânia" },
];

function Flag({ code, name }: { code: string; name: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w80/${code.toLowerCase()}.png 2x`}
      alt={name}
      title={name}
      loading="lazy"
      className="h-5 w-7 rounded-sm object-cover ring-1 ring-border"
    />
  );
}

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

const capacitarItems = [
  { t: "Mapeamento e melhoria de processos", Icon: Workflow },
  { t: "Seleção e implementação de ferramentas", Icon: Compass },
  { t: "Capacitação e adoção pelo time", Icon: Users },
];

const construirItems = [
  { t: "Assistentes de IA customizados", Icon: Bot },
  { t: "Apps e automações de fluxos", Icon: Workflow },
  { t: "Plataformas, dashboards e LMS", Icon: LayoutDashboard },
];

const orientarItems = [
  { t: "Indicadores para gestão do negócio", Icon: Target },
  { t: "Análise de oportunidades e gargalos", Icon: MessageSquare },
  { t: "Estratégia baseada em dados e ROI", Icon: TrendingUp },
];

const cases = [
  { t: "Automação de propostas", d: "−80% no tempo de elaboração.", Icon: Workflow },
  { t: "Agentes em conteúdo proprietário", d: "Suporte e decisão em escala.", Icon: Bot },
  { t: "Visualização de dados com IA", d: "Dashboards executivos automáticos.", Icon: LineChart },
  { t: "LMS gamificado", d: "Vídeos, quizzes e rankings próprios.", Icon: GradCap },
  { t: "CRM + Funil próprio", d: "Leads, pipeline e analytics integrados.", Icon: Database },
  { t: "Ferramentas para eventos", d: "Apps ao vivo em palestras imersivas.", Icon: Presentation },
];

function ToolIconBadge({ tool }: { tool: ToolIcon }) {
  return (
    <div
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-[var(--paper)] shadow-sm"
      style={{ opacity: 0.88 }}
      title={tool.name}
    >
      {tool.type === "img" ? (
        <img
          src={tool.src}
          alt={tool.name}
          className="h-6 w-6 rounded-lg object-contain"
          loading="lazy"
        />
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" fill={tool.color}>
          <path d={tool.path} />
        </svg>
      )}
    </div>
  );
}

function OrbitalRing({
  tools,
  radius,
  duration,
  reverse = false,
}: {
  tools: ToolIcon[];
  radius: number;
  duration: number;
  reverse?: boolean;
}) {
  const dir = reverse ? -360 : 360;
  return (
    <motion.div
      className="absolute inset-0"
      animate={{ rotate: dir }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {tools.map((tool, i) => {
        const angle = (360 / tools.length) * i;
        return (
          <div
            key={tool.name}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: -18,
              marginLeft: -18,
              transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`,
            }}
          >
            <motion.div
              animate={{ rotate: -dir }}
              transition={{ duration, repeat: Infinity, ease: "linear" }}
            >
              <ToolIconBadge tool={tool} />
            </motion.div>
          </div>
        );
      })}
    </motion.div>
  );
}

function HeroOrbital() {
  return (
    <div
      className="relative flex h-[420px] w-[420px] items-center justify-center select-none"
      aria-hidden
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(200,133,58,0.10)_0%,transparent_70%)]" />

      {/* Static decorative rings */}
      <svg
        className="absolute inset-0"
        width="420"
        height="420"
        viewBox="0 0 420 420"
        fill="none"
      >
        <circle cx="210" cy="210" r="75"  stroke="#c8853a" strokeOpacity=".35" strokeWidth="1" strokeDasharray="3 6"/>
        <circle cx="210" cy="210" r="130" stroke="#c8853a" strokeOpacity=".28" strokeWidth="1" strokeDasharray="3 6"/>
        <circle cx="210" cy="210" r="185" stroke="#c8853a" strokeOpacity=".20" strokeWidth="1" strokeDasharray="3 6"/>
      </svg>

      {/* Orbital rings — each ring rotates, icons counter-rotate to stay upright */}
      <OrbitalRing tools={RING_1_TOOLS} radius={75}  duration={18} />
      <OrbitalRing tools={RING_2_TOOLS} radius={130} duration={26} reverse />
      <OrbitalRing tools={RING_3_TOOLS} radius={185} duration={36} />

      {/* Center: company icon */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary/30 bg-card shadow-md">
          <Building2 className="h-8 w-8 text-primary" strokeWidth={1.5} />
        </div>
        <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Sua Empresa
        </span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  useEffect(() => { trackPageview(); }, []);

  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const submenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!submenuOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (submenuRef.current && !submenuRef.current.contains(e.target as Node)) {
        setSubmenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSubmenuOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [submenuOpen]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="inline-flex items-center gap-2 md:min-w-[280px]">
            <img src={logoIcon} alt="Sena Consulting" className="h-8 w-8" />
            <span className="font-display text-lg font-semibold tracking-tight">
              <TypeWriter />
            </span>
          </a>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm md:flex">
            <a href="#pilares" className="hover:text-primary">O que faço</a>
            <a href="#como-ajudar" className="hover:text-primary">Soluções</a>
            <a href="#cases" className="hover:text-primary">Cases</a>
            <a href="#sobre" className="hover:text-primary">Sobre</a>
            <div className="relative" ref={submenuRef}>
              <button
                type="button"
                onClick={() => setSubmenuOpen((o) => !o)}
                aria-expanded={submenuOpen}
                aria-haspopup="true"
                className="inline-flex items-center gap-1 py-2 hover:text-primary"
              >
                Área exclusiva
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    submenuOpen && "rotate-180",
                  )}
                />
              </button>
              {/* Submenu — abre e fecha ao clicar/tocar no gatilho */}
              <div
                className={cn(
                  "absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-3 transition duration-150",
                  submenuOpen ? "visible opacity-100" : "invisible opacity-0",
                )}
              >
                <div className="rounded-2xl border border-border bg-card p-1.5 shadow-lg shadow-black/5">
                  <a
                    href="/auth"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition hover:bg-muted"
                  >
                    <LogIn className="h-4 w-4 text-primary" />
                    Entrar no painel
                  </a>
                  <Link
                    to="/ferramentas"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition hover:bg-muted"
                  >
                    <Wrench className="h-4 w-4 text-primary" />
                    Ferramentas
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="https://calendar.app.google/oh4NeMRMtw8v5UP5A"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 sm:inline-flex"
            >
              Fale comigo
              <ArrowUpRight className="h-4 w-4" />
            </a>

            {/* Menu mobile */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Abrir menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-foreground transition hover:border-primary hover:text-primary md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[85%] flex-col sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-left">
                    <img src={logoIcon} alt="Sena Consulting" className="h-6 w-6" />
                    Sena Consulting
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col gap-1 text-base">
                  <SheetClose asChild>
                    <a href="#pilares" className="rounded-xl px-3 py-3 transition hover:bg-muted">
                      O que faço
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <a href="#como-ajudar" className="rounded-xl px-3 py-3 transition hover:bg-muted">
                      Soluções
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <a href="#cases" className="rounded-xl px-3 py-3 transition hover:bg-muted">
                      Cases
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <a href="#sobre" className="rounded-xl px-3 py-3 transition hover:bg-muted">
                      Sobre
                    </a>
                  </SheetClose>

                  <div className="my-3 border-t border-border" />
                  <span className="px-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Área exclusiva
                  </span>
                  <SheetClose asChild>
                    <a
                      href="/auth"
                      className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-3 transition hover:bg-muted"
                    >
                      <LogIn className="h-4 w-4 text-primary" />
                      Entrar no painel
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/ferramentas"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-3 transition hover:bg-muted"
                    >
                      <Wrench className="h-4 w-4 text-primary" />
                      Ferramentas
                    </Link>
                  </SheetClose>
                </nav>

                <div className="mt-auto pt-6">
                  <SheetClose asChild>
                    <a
                      href="https://calendar.app.google/oh4NeMRMtw8v5UP5A"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                      Fale comigo
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* HERO */}
      <Section id="top" className="!pt-16 sm:!pt-24 min-h-[calc(100svh-64px)] flex flex-col justify-between">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_1fr]">
          {/* Left: copy + CTAs */}
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <Eyebrow>Sena Consulting · IA &amp; Automação</Eyebrow>
            </div>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-7xl">
              IA sem complicação.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground sm:text-xl">
              Ajudo empresas a aplicar IA de forma prática para melhorar processos, criar ferramentas sob medida e tomar decisões mais estratégicas com times mais enxutos.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/diagnostico"
                onClick={() => trackEvent("click_diagnostico_cta", { source: "hero" })}
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

          {/* Right: animated orbital motif */}
          <div className="relative hidden items-center justify-center md:flex">
            <HeroOrbital />
          </div>
        </div>

        {/* Scroll cue — bottom of first fold */}
        <a href="#oportunidade" className="group mt-16 flex items-center gap-2 self-start text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground sm:mt-0 sm:self-end">
          Descobrir a oportunidade
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-y-0.5">
            <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </Section>

      {/* A OPORTUNIDADE — revealed on scroll with 3D tilt */}
      <section id="oportunidade" className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
          <ContainerScroll
            titleComponent={
              <>
                <Eyebrow>A OPORTUNIDADE</Eyebrow>
                <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
                  A IA já consegue muito mais do que o mercado usa.
                </h2>
              </>
            }
          >
            <div className="grid h-full gap-0 md:grid-cols-[1fr_1.1fr]">
              {/* Explanation + CTAs */}
              <div className="order-2 flex flex-col gap-6 px-6 py-8 text-left sm:px-10 sm:py-10 md:order-1">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      O gap de adoção · dados Anthropic
                    </span>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                    O que os dados revelam para o seu negócio
                  </h3>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    Dados da pesquisa da Anthropic mostram o <b className="text-foreground">tamanho da oportunidade</b> no mercado. Cada ponta é uma categoria profissional: o{" "}
                    <b style={{ color: "#4F86C6" }}>azul</b> é o que a IA já consegue fazer hoje; o{" "}
                    <b style={{ color: "#D14B3D" }}>vermelho</b> é o que de fato se usa, em média.
                    A distância entre eles representa o gap — e quem agir primeiro leva vantagem.
                  </p>
                  <div className="mt-5 rounded-2xl border border-border/70 bg-card p-5">
                    <p className="text-sm text-muted-foreground">
                      Agora é a sua vez: descubra o quanto você entende, usa e aplica IA — e onde estão os gaps para transformar essa oportunidade em resultado na sua empresa.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/diagnostico"
                    onClick={() => trackEvent("click_diagnostico_cta", { source: "oportunidade" })}
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

              {/* Chart */}
              <div className="order-1 border-t border-border px-6 py-8 text-left sm:px-8 md:order-2 md:border-l md:border-t-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Panorama do mercado · pesquisa
                  </span>
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <MarketGapChart />
                <div className="mt-2 flex items-center justify-center gap-6 text-[11px] font-mono uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-sm" style={{ background: "#4F86C6" }} /> Poderia fazer
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-sm" style={{ background: "#D14B3D" }} /> Já se usa
                  </span>
                </div>
                <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                  Fonte: Massenkoff &amp; McCrory (2026), "Labor market impacts of AI", Anthropic — Fig.
                  2. Valores aproximados, lidos da figura. Adaptado pela Sena.
                </p>
              </div>
            </div>
          </ContainerScroll>
        </div>
      </section>

      {/* DESAFIO */}
      <Section id="desafio" className="border-t border-border">
        <Eyebrow>O desafio</Eyebrow>
        <h2 className="mt-4 max-w-4xl text-3xl font-semibold sm:text-5xl">
          Entre o discurso da IA e o resultado real, existe um abismo.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          A dificuldade não está mais no acesso às ferramentas — está em
          transformá-las em processos melhores, produtividade e decisões mais rápidas.
        </p>

        <p className="mt-14 eyebrow text-primary">Soa familiar?</p>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <article className="rounded-2xl border border-border/40 bg-card p-8 transition hover:border-primary hover:shadow-md sm:p-10">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <span className="eyebrow">Para líderes e profissionais</span>
            </div>
            <h3 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">
              Quer produzir mais. Continua preso ao manual.
            </h3>
            <p className="mt-4 border-l-2 border-primary/50 pl-4 text-lg italic leading-relaxed text-foreground/90">
              “Sei que a IA podia me poupar horas por dia — mas no fim continuo fazendo quase tudo na mão.”
            </p>
          </article>
          <article className="rounded-2xl border border-border/40 bg-card p-8 transition hover:border-primary hover:shadow-md sm:p-10">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <span className="eyebrow">Para empresas e gestores</span>
            </div>
            <h3 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">
              Quer soluções próprias. Não sabe o que dá pra construir.
            </h3>
            <p className="mt-4 border-l-2 border-primary/50 pl-4 text-lg italic leading-relaxed text-foreground/90">
              “Preciso de algo sob medida pra minha operação — só não sei por onde começar nem se o time vai adotar.”
            </p>
          </article>
        </div>
      </Section>

      {/* PILARES */}
      <Section id="pilares" className="border-t border-border !pb-0">
        <Eyebrow>O que eu faço</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
          Três formas de gerar valor com IA.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Cada uma resolve uma dor diferente. Veja como funciona na prática.
        </p>
      </Section>

      {/* PILAR BLOCKS */}
      <PillarBlock
        id="capacitar"
        n="01"
        title="Aumentar produtividade"
        sub="Ajudo empresas a ganhar produtividade melhorando processos, reduzindo trabalho manual e implementando ferramentas de IA mais eficientes para o negócio."
        items={capacitarItems}
        divider={false}
      />
      <PillarBlock
        id="construir"
        n="02"
        title="Construir ferramentas"
        sub="Soluções customizadas para seu caso, com agilidade e eficiência de custo."
        items={construirItems}
        dark
      />
      <PillarBlock
        id="orientar"
        n="03"
        title="Direcionar decisões"
        sub="Decisões baseadas em dados e estratégias que geram ROI no negócio."
        items={orientarItems}
      />

      {/* COMO POSSO AJUDAR */}
      <Section id="como-ajudar" className="border-t border-border">
        <Eyebrow>Como posso ajudar</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
          Por onde você quer começar?
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Você pode começar com uma palestra, aprofundar com uma consultoria ou avançar direto para a implementação de agentes, automações e apps sob medida.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-3 md:items-stretch">
          {/* 01 */}
          <div className="relative flex flex-col rounded-2xl border border-border/60 bg-card p-8 transition hover:border-primary/50 hover:shadow-md md:p-10">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-primary">Etapa 01 · Entender</span>
              <Presentation className="h-5 w-5 text-primary/70" strokeWidth={1.5} />
            </div>
            <h3 className="mt-6 text-xl font-semibold">Treinamentos e palestras corporativas</h3>
            <p className="mt-3 text-muted-foreground">
              Para empresas, eventos e times que precisam entender como usar IA de forma prática, segura e aplicada ao dia a dia.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Ideal para:</span> sensibilizar o time, nivelar conhecimento e mostrar casos reais de uso.
            </p>
            <a
              href="https://calendar.app.google/oh4NeMRMtw8v5UP5A"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium hover:border-primary hover:text-primary md:mt-auto"
            >
              Levar IA para meu time <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* 02 — destaque */}
          <div className="relative flex flex-col rounded-2xl border-2 border-primary bg-card p-8 shadow-lg ring-1 ring-primary/10 md:scale-[1.03] md:p-10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary-foreground shadow-sm">
              Mais procurado
            </span>
            <div className="flex items-center justify-between">
              <span className="eyebrow text-primary">Etapa 02 · Planejar</span>
              <Compass className="h-5 w-5 text-primary/70" strokeWidth={1.5} />
            </div>
            <h3 className="mt-6 text-xl font-semibold">Consultoria customizada</h3>
            <p className="mt-3 text-muted-foreground">
              Para empresas, gestores e profissionais que precisam mapear oportunidades, melhorar processos e definir prioridades claras de aplicação de IA.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Ideal para:</span> sair da dúvida, escolher onde começar e estruturar um plano de ação com foco em resultado.
            </p>
            <a
              href="https://calendar.app.google/oh4NeMRMtw8v5UP5A"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 md:mt-auto"
            >
              Mapear oportunidades <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* 03 */}
          <div className="relative flex flex-col rounded-2xl border border-border/60 bg-card p-8 transition hover:border-primary/50 hover:shadow-md md:p-10">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-primary">Etapa 03 · Construir</span>
              <Bot className="h-5 w-5 text-primary/70" strokeWidth={1.5} />
            </div>
            <h3 className="mt-6 text-xl font-semibold">Agentes de IA, automações e apps</h3>
            <p className="mt-3 text-muted-foreground">
              Para quem já sabe o problema que quer resolver e precisa construir soluções sob medida com agilidade e menor custo.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Ideal para:</span> automatizar fluxos, criar assistentes de IA, dashboards, plataformas internas e ferramentas específicas para a operação.
            </p>
            <a
              href="https://calendar.app.google/oh4NeMRMtw8v5UP5A"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium hover:border-primary hover:text-primary md:mt-auto"
            >
              Construir uma solução <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </Section>

      {/* COMECE AQUI */}
      <Section id="comece" className="border-t border-border">
        <Eyebrow>Comece aqui</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
          Não sabe por onde começar?
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* Diagnóstico — protagonista, com preview do radar */}
          <div className="group rounded-2xl border border-border bg-card p-8 transition hover:border-primary md:col-span-2 md:p-10">
            <div className="grid gap-8 md:grid-cols-2 md:items-start">
              <div>
                <div className="flex items-center gap-3">
                  <Target className="h-7 w-7 text-primary" strokeWidth={1.5} />
                  <span className="eyebrow text-primary">Análise personalizada</span>
                </div>
                <h3 className="mt-5 text-2xl font-semibold sm:text-3xl">Diagnóstico de maturidade em IA</h3>
                <p className="mt-3 text-muted-foreground">
                  Uma análise estruturada do seu negócio: descubra, área por área,
                  onde a IA gera mais impacto e receba um retrato claro da distância
                  entre onde você está hoje e o seu potencial.
                </p>
                <Link
                  to="/diagnostico"
                  onClick={() => trackEvent("click_diagnostico_cta", { source: "comece" })}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Fazer diagnóstico <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div>
                <span className="flex h-7 items-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Exemplo de resultado
                </span>
                <DiagnosticChart />
                <div className="-mt-2 flex items-center justify-center gap-5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-sm bg-muted-foreground/50" /> Hoje
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-sm bg-primary" /> Potencial com IA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fale comigo — secundário */}
          <div className="flex flex-col justify-center rounded-2xl border border-border bg-[var(--ink)] p-8 text-[var(--paper)]">
            <Mic2 className="h-7 w-7 text-primary" strokeWidth={1.5} />
            <h3 className="mt-6 text-2xl font-semibold">Fale comigo</h3>
            <p className="mt-3 opacity-80">
              Tem uma demanda específica ou quer entender como posso ajudar? Entre em contato e vamos avaliar o melhor caminho.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Entrar em contato <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </Section>

      {/* PROCESSO — interactive cycle */}
      <Section id="processo" className="border-t border-border">
        <Eyebrow>Como trabalho</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
          Do diagnóstico ao resultado — e além.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          A cada volta, mapeamos novas oportunidades, construímos a solução,
          garantimos a adoção e medimos o resultado — elevando a maturidade em IA
          do seu negócio de forma contínua.
        </p>
        <div className="mt-16">
          <ProcessCycle />
        </div>
      </Section>

      {/* CASES */}
      <Section id="cases" className="border-t border-border">
        <div>
          <Eyebrow>Projetos entregues</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
            Soluções reais, prontas para uso.
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
            Soluções desenvolvidas para problemas reais.
          </p>
        </div>
        <div className="mt-12">
          <TrackRecord />
        </div>
      </Section>

      {/* SOBRE */}
      <Section id="sobre" className="border-t border-border">
        <div className="grid gap-12 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex flex-col items-center gap-6 md:items-start">
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-3 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-xl"
              />
              <div className="relative h-56 w-56 overflow-hidden rounded-full ring-4 ring-primary/20 ring-offset-4 ring-offset-background sm:h-64 sm:w-64">
                <img
                  src={felipeImg}
                  alt="Felipe Sena, fundador da Sena Consulting"
                  className="h-full w-full object-cover object-[center_15%]"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card hover:border-primary hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card hover:border-[#25D366] hover:text-[#25D366]"
              >
                <svg viewBox="0 0 32 32" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M19.11 17.27c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47l-.52-.01c-.18 0-.48.07-.73.34s-.96.94-.96 2.29.99 2.66 1.13 2.84c.14.18 1.95 2.98 4.72 4.18.66.29 1.17.46 1.57.59.66.21 1.26.18 1.74.11.53-.08 1.6-.65 1.83-1.28.23-.63.23-1.18.16-1.28-.07-.11-.25-.18-.52-.32zM16.02 5.33c-5.86 0-10.62 4.76-10.62 10.62 0 1.87.49 3.69 1.42 5.29L5.4 26.67l5.55-1.46a10.6 10.6 0 0 0 5.07 1.29h.01c5.85 0 10.61-4.76 10.62-10.61 0-2.84-1.1-5.5-3.11-7.51a10.55 10.55 0 0 0-7.52-3.05zm0 19.4h-.01a8.78 8.78 0 0 1-4.48-1.23l-.32-.19-3.29.86.88-3.21-.21-.33a8.77 8.77 0 0 1-1.34-4.68c0-4.85 3.94-8.79 8.78-8.79 2.35 0 4.55.92 6.21 2.58a8.74 8.74 0 0 1 2.57 6.22c0 4.84-3.94 8.77-8.79 8.77z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <Eyebrow>Sobre o Felipe</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">
              Estratégia, dados e execução — em escala global.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              <span className="font-medium text-foreground">Consultor de Estratégia e Tecnologia</span> pela{" "}
              <span className="font-medium text-foreground">Boston Innovation Gateway</span>. Desde 2022, desenvolve e integra soluções de IA, dados e automação para aumentar produtividade, reduzir trabalho manual e apoiar decisões em empresas, governos e ecossistemas de inovação globais.
            </p>

            <ul className="mt-8 space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <Target className="mt-1 h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} />
                <span>
                  <span className="font-medium text-foreground">Liderança de Produto e Projetos Digitais Globais</span> — Think-Big / Boston Innovation Gateway.
                </span>
              </li>
              <li className="flex gap-3">
                <TrendingUp className="mt-1 h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} />
                <span>
                  Passagem por grandes empresas como <span className="font-medium text-foreground">Sicredi</span>, <span className="font-medium text-foreground">XP Investimentos</span> e <span className="font-medium text-foreground">HP Tech Ventures</span>. Empreendeu na <span className="font-medium text-foreground">Rivool Finance</span> como Chefe de Produto (CPO), onde desenvolveu e automatizou a plataforma de tokenização de crédito agrícola.
                </span>
              </li>
              <li className="flex gap-3">
                <GraduationCap className="mt-1 h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} />
                <span>
                  <span className="font-medium text-foreground">Mestrado duplo</span> em Negócios Internacionais &amp; Business Analytics — Hult International Business School.
                </span>
              </li>
              <li className="flex gap-3">
                <Compass className="mt-1 h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} />
                <span>
                  Atuação em <span className="font-medium text-foreground">São Paulo · Boston</span> · projetos em 4 continentes &amp; 22 países.
                </span>
              </li>
            </ul>

            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Experiência internacional trabalhando com clientes globais
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {COUNTRIES.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center"
                    title={c.name}
                    aria-label={c.name}
                  >
                    <Flag code={c.code} name={c.name} />
                  </div>
                ))}
                <span className="text-xs text-muted-foreground">+ outros</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-border pt-16">
          <GlobalExperience />
        </div>
      </Section>



      {/* CTA FINAL */}
      <Section id="contato" className="border-t border-border">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--ink)] p-10 text-[var(--paper)] sm:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
          />
          <div className="flex flex-col gap-10">
            <div className="flex flex-col items-start">
              <Eyebrow>Vamos conversar</Eyebrow>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold sm:text-5xl lg:text-6xl">
                Vamos construir algo <span className="text-primary">que funciona.</span>
              </h2>
              <div className="mt-6 flex flex-wrap gap-3">
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
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white">
              <iframe
                src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3lQu1KctmL-8Unulcxey7NwiGFaiclYwd__oUfWmzqOMuGx2ZqHjylaG9sJq4QunHcHg06MH7q?gv=true"
                style={{ border: 0 }}
                width="100%"
                className="h-[600px] sm:h-[700px]"
                frameBorder={0}
                title="Agendar conversa com Felipe Sena"
              />
            </div>
          </div>
        </div>
      </Section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-muted-foreground">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col items-start gap-1">
              <img src={logoFull} alt="Sena Consulting" className="h-auto w-[248px] opacity-90" />
              <span>© {new Date().getFullYear()} Sena Consulting · Felipe Sena</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a href="/politica-de-privacidade" className="hover:underline">
                Política de Privacidade
              </a>
              <a href="/termos-de-uso" className="hover:underline">
                Termos de Uso
              </a>
              <a href="/exclusao-de-dados" className="hover:underline">
                Exclusão de Dados
              </a>
              <Link to="/ferramentas" className="hover:underline">
                Ferramentas
              </Link>
              <span>São Paulo · Boston · Global</span>
            </div>
          </div>
        </div>
      </footer>
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
  divider = true,
}: {
  id: string;
  n: string;
  title: string;
  sub: string;
  items: { t: string; Icon: typeof Bot }[];
  dark?: boolean;
  divider?: boolean;
}) {
  return (
    <section
      id={id}
      className={`${divider ? "border-t border-border" : ""} ${dark ? "bg-[var(--ink)] text-[var(--paper)]" : ""}`}
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
