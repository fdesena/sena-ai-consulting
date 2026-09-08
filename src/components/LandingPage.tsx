import senaLogoHorizontal from "@/assets/brand/sena-labs-horizontal-light.svg";
import senaLogoStacked from "@/assets/brand/sena-labs-stacked-light.svg";
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
  Users,
  Target,
  TrendingUp,
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
import OrbitHero from "./OrbitHero";
import TrackRecord from "./TrackRecord";
import GlobalExperience from "./GlobalExperience";
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
    <section id={id} className={`mx-auto w-full max-w-6xl px-6 py-20 sm:py-28 ${className}`}>
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
      <svg className="absolute inset-0" width="420" height="420" viewBox="0 0 420 420" fill="none">
        <circle
          cx="210"
          cy="210"
          r="75"
          stroke="#c8853a"
          strokeOpacity=".35"
          strokeWidth="1"
          strokeDasharray="3 6"
        />
        <circle
          cx="210"
          cy="210"
          r="130"
          stroke="#c8853a"
          strokeOpacity=".28"
          strokeWidth="1"
          strokeDasharray="3 6"
        />
        <circle
          cx="210"
          cy="210"
          r="185"
          stroke="#c8853a"
          strokeOpacity=".20"
          strokeWidth="1"
          strokeDasharray="3 6"
        />
      </svg>

      {/* Orbital rings — each ring rotates, icons counter-rotate to stay upright */}
      <OrbitalRing tools={RING_1_TOOLS} radius={75} duration={18} />
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
  useEffect(() => {
    trackPageview();
  }, []);

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
          <a href="#top" className="inline-flex items-center md:min-w-[280px]">
            <img src={senaLogoHorizontal} alt="Sena Labs" className="h-8 w-auto" />
          </a>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm md:flex">
            <a href="#pilares" className="hover:text-primary">
              O que fazemos
            </a>
            <a href="#processo" className="hover:text-primary">
              Como trabalhamos
            </a>
            <a href="#cases" className="hover:text-primary">
              Cases
            </a>
            <a href="#sobre" className="hover:text-primary">
              Sobre
            </a>
            <Link to="/blog" className="hover:text-primary">
              Blog
            </Link>
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
                  <SheetTitle className="flex items-center text-left">
                    <img src={senaLogoHorizontal} alt="Sena Labs" className="h-6 w-auto" />
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col gap-1 text-base">
                  <SheetClose asChild>
                    <a href="#pilares" className="rounded-xl px-3 py-3 transition hover:bg-muted">
                      O que fazemos
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <a href="#processo" className="rounded-xl px-3 py-3 transition hover:bg-muted">
                      Como trabalhamos
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
                  <SheetClose asChild>
                    <Link to="/blog" className="rounded-xl px-3 py-3 transition hover:bg-muted">
                      Blog
                    </Link>
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

      {/* HERO — Órbita Sena Labs (sticky scroll, canvas 3D) */}
      <OrbitHero />

      {/* HERO antigo — desativado, mantido para rollback (não remover) */}
      {/* eslint-disable-next-line no-constant-binary-expression */}
      {false && (
        <Section
          id="top-old"
          className="!pt-16 sm:!pt-24 min-h-[calc(100svh-64px)] flex flex-col justify-between"
        >
          <div className="grid items-center gap-12 md:grid-cols-[1fr_1fr]">
            {/* Left: copy + CTAs */}
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                <Eyebrow>Sena Labs · Estratégia, IA &amp; Software</Eyebrow>
              </div>
              <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-7xl">
                Do problema ao produto.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground sm:text-xl">
                Entendemos o problema, desenhamos a solução e construímos tecnologia que funciona —
                de automações e agentes de IA a apps, dashboards e plataformas.
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
                  Ver o que construímos
                </a>
              </div>
            </div>

            {/* Right: animated orbital motif */}
            <div className="relative hidden items-center justify-center md:flex">
              <HeroOrbital />
            </div>
          </div>

          {/* Scroll cue — bottom of first fold */}
          <a
            href="#cases"
            className="group mt-16 flex items-center gap-2 self-start text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground sm:mt-0 sm:self-end"
          >
            Ver resultados reais
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform group-hover:translate-y-0.5"
            >
              <path
                d="M8 3v10M4 9l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </Section>
      )}

      {/* CASES */}
      <Section id="cases" className="border-t border-border">
        <div>
          <Eyebrow>Cases / Results</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
            Resultados concretos. Sistemas em produção.
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Não paramos no diagnóstico. Desenhamos, construímos e colocamos soluções reais para
            funcionar.
          </p>
        </div>
        <div className="mt-12">
          <TrackRecord />
        </div>
      </Section>

      {/* DESAFIO */}
      <Section id="desafio" className="border-t border-border">
        <Eyebrow>O desafio</Eyebrow>
        <h2 className="mt-4 max-w-4xl text-3xl font-semibold sm:text-5xl">
          Entre o discurso da IA e o resultado real, existe um abismo.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          A dificuldade não está mais no acesso às ferramentas — está em transformá-las em processos
          melhores, produtividade e decisões mais rápidas.
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
              “Sei que a IA podia me poupar horas por dia — mas no fim continuo fazendo quase tudo
              na mão.”
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
              “Preciso de algo sob medida pra minha operação — só não sei por onde começar nem se o
              time vai adotar.”
            </p>
          </article>
        </div>
      </Section>

      {/* PILARES */}
      <Section id="pilares" className="border-t border-border !pb-0">
        <Eyebrow>O que fazemos</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
          Tecnologia aplicada a problemas reais.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Melhoramos operações, construímos produtos e transformamos dados em decisões.
        </p>
      </Section>

      {/* PILAR BLOCKS */}
      <PillarBlock
        id="capacitar"
        n="01"
        title="Aumentar produtividade"
        sub="Melhoramos processos, reduzimos trabalho manual e implementamos ferramentas mais eficientes para o negócio."
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

      {/* COMO TRABALHAMOS */}
      <Section id="processo" className="border-t border-border">
        <Eyebrow>04 · Como trabalhamos</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
          Entender → Desenhar → Construir → Implementar → Evoluir.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Da investigação do problema à evolução do produto, estratégia e execução caminham juntas.
          Cada entrega gera dados para o próximo ciclo.
        </p>
        <div className="mt-16">
          <ProcessCycle />
        </div>
      </Section>

      {/* FORMAS DE TRABALHAR */}
      <Section id="como-ajudar" className="border-t border-border">
        <Eyebrow>05 · Ways to work with us</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
          Entre pela etapa que faz sentido agora.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          De capacitação pontual à construção completa de um produto digital.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              name: "Learn",
              title: "Aprender e mobilizar",
              text: "Palestras e treinamentos para tornar IA prática, segura e útil no dia a dia do time.",
              action: "Capacitar meu time",
              Icon: Presentation,
            },
            {
              name: "Advisory",
              title: "Decidir o caminho",
              text: "Diagnóstico, desenho de solução e priorização para transformar uma oportunidade em plano executável.",
              action: "Mapear oportunidades",
              Icon: Compass,
            },
            {
              name: "Build",
              title: "Construir e implementar",
              text: "Agentes, automações, apps, dashboards e plataformas sob medida, integrados à operação.",
              action: "Construir uma solução",
              Icon: Bot,
            },
          ].map(({ name, title, text, action, Icon }, index) => (
            <article
              key={name}
              className={cn(
                "group flex min-h-[330px] flex-col rounded-2xl border p-7 transition sm:p-9",
                index === 2
                  ? "border-primary bg-[var(--ink)] text-[var(--paper)] shadow-lg"
                  : "border-border/60 bg-card hover:border-primary/50",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                  0{index + 1} · {name}
                </span>
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="mt-8 text-2xl font-semibold">{title}</h3>
              <p className={cn("mt-4", index === 2 ? "text-white/70" : "text-muted-foreground")}>
                {text}
              </p>
              <a
                href="https://calendar.app.google/oh4NeMRMtw8v5UP5A"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-medium text-primary"
              >
                {action} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </a>
            </article>
          ))}
        </div>
      </Section>

      {/* SOBRE A SENA LABS */}
      <section id="sobre" className="border-t border-border bg-[var(--ink)] text-[var(--paper)]">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 sm:py-28 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <Eyebrow>06 · About Sena Labs</Eyebrow>
          <div>
            <h2 className="max-w-3xl text-3xl font-semibold sm:text-5xl">
              Uma empresa de estratégia e tecnologia feita para construir.
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-white/70">
              A Sena Labs transforma problemas de negócio em soluções digitais úteis. Combinamos
              visão estratégica, IA, dados e desenvolvimento de software para entregar produtos que
              entram na operação — e evoluem com ela.
            </p>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
              {[
                ["Estratégia", "Clareza sobre o problema e o resultado esperado."],
                ["Tecnologia", "A solução certa, integrada ao que já existe."],
                ["Execução", "Produto implementado, adotado e mensurável."],
              ].map(([title, text]) => (
                <div key={title} className="bg-[var(--ink)] p-6">
                  <h3 className="text-lg font-semibold text-primary">{title}</h3>
                  <p className="mt-2 text-sm text-white/60">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FUNDADOR */}
      <Section id="fundador" className="border-t border-border">
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
                  alt="Felipe Sena, fundador da Sena Labs"
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
            <Eyebrow>07 · Founder</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">
              Felipe Sena. Estratégia, produto e execução em escala global.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              <span className="font-medium text-foreground">
                Consultor de Estratégia e Tecnologia
              </span>{" "}
              pela <span className="font-medium text-foreground">Boston Innovation Gateway</span>.
              Desde 2022, desenvolve e integra soluções de IA, dados e automação para aumentar
              produtividade, reduzir trabalho manual e apoiar decisões em empresas, governos e
              ecossistemas de inovação globais.
            </p>

            <ul className="mt-8 space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <Target className="mt-1 h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} />
                <span>
                  <span className="font-medium text-foreground">
                    Liderança de Produto e Projetos Digitais Globais
                  </span>{" "}
                  — Think-Big / Boston Innovation Gateway.
                </span>
              </li>
              <li className="flex gap-3">
                <TrendingUp className="mt-1 h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} />
                <span>
                  Passagem por grandes empresas como{" "}
                  <span className="font-medium text-foreground">Sicredi</span>,{" "}
                  <span className="font-medium text-foreground">XP Investimentos</span> e{" "}
                  <span className="font-medium text-foreground">HP Tech Ventures</span>. Empreendeu
                  na <span className="font-medium text-foreground">Rivool Finance</span> como Chefe
                  de Produto (CPO), onde desenvolveu e automatizou a plataforma de tokenização de
                  crédito agrícola.
                </span>
              </li>
              <li className="flex gap-3">
                <GraduationCap className="mt-1 h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} />
                <span>
                  <span className="font-medium text-foreground">Mestrado duplo</span> em Negócios
                  Internacionais &amp; Business Analytics — Hult International Business School.
                </span>
              </li>
              <li className="flex gap-3">
                <Compass className="mt-1 h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} />
                <span>
                  Atuação em <span className="font-medium text-foreground">São Paulo · Boston</span>{" "}
                  · projetos em 4 continentes &amp; 22 países.
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
              <Eyebrow>08 · Vamos conversar</Eyebrow>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold sm:text-5xl lg:text-6xl">
                Tem um problema que tecnologia poderia resolver?
              </h2>
              <p className="mt-5 max-w-xl text-lg text-white/70">
                Conte o contexto. Nós ajudamos a transformar a pergunta em uma solução que funciona.
              </p>
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
            <div className="flex flex-col items-start gap-2">
              <img src={senaLogoStacked} alt="Sena Labs" className="h-16 w-auto" />
              <span>© {new Date().getFullYear()} Sena Labs · Felipe Sena</span>
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
            <p className={`mt-4 text-lg ${dark ? "opacity-80" : "text-muted-foreground"}`}>{sub}</p>
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
