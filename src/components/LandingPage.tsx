import senaLogoHorizontalDark from "@/assets/brand/sena-labs-horizontal-dark.svg";
import miamiImg from "@/assets/felipe-miami-goglobal.png";
import selectUsaImg from "@/assets/felipe-selectusa.png";
import hultAlumniImg from "@/assets/felipe-hult-alumni.png";
import hultChallengeImg from "@/assets/felipe-hult-challenge.png";
import myllenniumImg from "@/assets/felipe-myllennium.png";
import mitSolveImg from "@/assets/felipe-mit-solve.png";
import bostonBeyondImg from "@/assets/felipe-boston-beyond.png";
import epicMalasiaImg from "@/assets/felipe-epic-malasia.png";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { trackEvent, trackPageview } from "@/lib/track";
import { ArrowRight, Building2, LogIn, Wrench, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { WHATSAPP_URL } from "./ContactFAB";
import ProcessRail from "./ProcessRail";
import ScheduleButton from "./ScheduleButton";
import ReadingProgress from "./ReadingProgress";
import OrbitHero from "./OrbitHero";
import TrackRecord from "./TrackRecord";
import { RING_1_TOOLS, RING_2_TOOLS, RING_3_TOOLS, type ToolIcon } from "@/data/tool-icons";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const EMAIL = "felipesmsena@gmail.com";
const LINKEDIN = "https://linkedin.com/in/senafelipe";

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("eyebrow", className)}>{children}</span>;
}

/**
 * Foto com filtro/duotone laranja da marca — usada nos cards de experiência.
 * O filtro some no hover (revela a cor original) e o card ganha um contorno laranja.
 * Requer que o elemento pai tenha a classe `group`.
 */
function PhotoTile({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-white/5 ring-1 ring-transparent transition-all duration-300 group-hover:ring-primary/70">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full scale-100 object-cover grayscale-[35%] transition-all duration-500 group-hover:scale-[1.04] group-hover:grayscale-0"
      />
      <div className="pointer-events-none absolute inset-0 bg-primary/35 mix-blend-color transition-opacity duration-500 group-hover:opacity-0" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
    </div>
  );
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

const capacitarTags = ["Processos", "Ferramentas", "Capacitação"];
const construirTags = ["Agentes de IA", "Apps e plataformas", "Automações"];
const orientarTags = ["Indicadores", "Análise", "Estratégia"];

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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[var(--ink)]/95 text-[var(--paper)] backdrop-blur">
        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="inline-flex items-center md:min-w-[280px]">
            <img src={senaLogoHorizontalDark} alt="Sena Labs" className="h-11 w-auto" />
          </a>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm text-white/70 md:flex">
            <a href="#cases" className="hover:text-primary">
              Casos de Uso
            </a>
            <Link to="/ferramentas" className="hover:text-primary">
              Ferramentas
            </Link>
            <Link to="/blog" className="hover:text-primary">
              Blog
            </Link>
            <a href="/auth" className="hover:text-primary">
              Área exclusiva
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="#contato"
              className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 sm:inline-flex"
            >
              Fale comigo
              <ArrowRight className="h-4 w-4" />
            </a>

            {/* Menu mobile */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Abrir menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-[var(--paper)] transition hover:border-primary hover:text-primary md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex w-[85%] flex-col border-white/10 bg-[var(--ink)] text-[var(--paper)] sm:max-w-sm"
              >
                <SheetHeader>
                  <SheetTitle className="flex items-center text-left">
                    <img src={senaLogoHorizontalDark} alt="Sena Labs" className="h-8 w-auto" />
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col gap-1 text-base">
                  <SheetClose asChild>
                    <a href="#cases" className="rounded-xl px-3 py-3 transition hover:bg-white/10">
                      Casos de Uso
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/ferramentas"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-3 transition hover:bg-white/10"
                    >
                      <Wrench className="h-4 w-4 text-primary" />
                      Ferramentas
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/blog" className="rounded-xl px-3 py-3 transition hover:bg-white/10">
                      Blog
                    </Link>
                  </SheetClose>

                  <div className="my-3 border-t border-white/10" />
                  <span className="px-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
                    Área exclusiva
                  </span>
                  <SheetClose asChild>
                    <a
                      href="/auth"
                      className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-3 transition hover:bg-white/10"
                    >
                      <LogIn className="h-4 w-4 text-primary" />
                      Entrar no painel
                    </a>
                  </SheetClose>
                </nav>

                <div className="mt-auto pt-6">
                  <SheetClose asChild>
                    <a
                      href="#contato"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                      Fale comigo
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <ReadingProgress />
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
          <Eyebrow>
            <span className="text-primary">01 /</span> Cases e aplicações
          </Eyebrow>
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
      <section
        id="desafio"
        className="border-y border-white/10 bg-[var(--ink)] text-[var(--paper)]"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-32">
          <Eyebrow className="justify-center text-white/50">
            <span className="text-primary">02 /</span> O desafio
          </Eyebrow>
          <h2 className="mx-auto mt-6 max-w-3xl text-center text-3xl font-semibold sm:text-5xl">
            Ter acesso à IA é só o começo.
            <br />
            <span className="text-white/45">
              Fazer sentido para o negócio
              <br />é o próximo passo.
            </span>
          </h2>

          <div className="mx-auto mt-16 grid max-w-4xl gap-12 sm:grid-cols-2">
            <div className="border-t border-white/25 pt-6">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                Para líderes e profissionais
              </span>
              <h3 className="mt-5 max-w-[24ch] text-xl font-semibold tracking-tight sm:text-2xl">
                Quer produzir mais.
                <br />
                Continua preso ao manual.
              </h3>
              <p className="mt-4 max-w-[42ch] text-white/60">
                A oportunidade existe, mas falta transformar ferramentas soltas em uma forma melhor
                de trabalhar.
              </p>
            </div>
            <div className="border-t border-white/25 pt-6">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                Para empresas e gestores
              </span>
              <h3 className="mt-5 max-w-[24ch] text-xl font-semibold tracking-tight sm:text-2xl">
                Precisa de algo próprio.
                <br />
                Não sabe por onde começar.
              </h3>
              <p className="mt-4 max-w-[42ch] text-white/60">
                A solução precisa acompanhar o seu processo, conversar com os seus sistemas e fazer
                parte da rotina do time.
              </p>
            </div>
          </div>
          <div
            aria-hidden
            className="mx-auto -mb-6 mt-11 h-[68px] w-px bg-gradient-to-b from-primary to-transparent"
          />
        </div>
      </section>

      {/* PILARES */}
      <Section id="pilares" className="border-t border-border">
        <div className="grid gap-6 sm:grid-cols-2 sm:items-end sm:gap-16">
          <Eyebrow className="sm:col-span-2">
            <span className="text-primary">03 /</span> O que fazemos
          </Eyebrow>
          <h2 className="text-3xl font-semibold sm:text-5xl">
            Tecnologia aplicada.
            <br />
            Em três frentes.
          </h2>
          <p className="text-lg text-muted-foreground">
            Melhoramos operações, construímos ferramentas próprias e usamos dados para orientar
            decisões.
          </p>
        </div>

        <div className="mt-10">
          <PillarRow
            id="capacitar"
            n="01"
            title={
              <>
                Aumentar
                <br />
                produtividade.
              </>
            }
            sub="Revisar processos, reduzir trabalho manual e preparar o time para usar a tecnologia com autonomia."
            tags={capacitarTags}
          />
          <PillarRow
            id="construir"
            n="02"
            title={
              <>
                Construir
                <br />
                ferramentas.
              </>
            }
            sub="Desenvolver soluções que acompanham o seu negócio, das primeiras regras à operação no dia a dia."
            tags={construirTags}
          />
          <PillarRow
            id="orientar"
            n="03"
            title={
              <>
                Direcionar
                <br />
                decisões.
              </>
            }
            sub="Organizar informações, identificar oportunidades e definir prioridades com base nos dados do negócio."
            tags={orientarTags}
            last
          />
        </div>
      </Section>

      {/* COMO TRABALHAMOS */}
      <section id="processo" className="border-y border-[#d1d3d5] bg-[#e8eaec] text-[#1a1c1e]">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
          <ProcessRail />
        </div>
      </section>

      {/* FORMAS DE TRABALHAR */}
      <Section id="como-ajudar" className="border-t border-border">
        <Eyebrow>
          <span className="text-primary">05 /</span> Como podemos ajudar
        </Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold sm:text-5xl">
          Comece pela etapa que faz sentido agora.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Da capacitação do time à construção de uma solução completa.
        </p>

        <div className="mt-12 grid border-y border-border sm:grid-cols-3">
          {[
            {
              name: "01 / Capacitação",
              title: "Aprender e mobilizar.",
              text: "Palestras e treinamentos para tornar a IA prática e útil no dia a dia do seu time.",
              action: "Capacitar meu time",
            },
            {
              name: "02 / Estratégia",
              title: "Decidir o caminho.",
              text: "Diagnóstico, desenho de solução e priorização para transformar uma oportunidade em plano.",
              action: "Mapear oportunidades",
            },
            {
              name: "03 / Desenvolvimento",
              title: "Construir e implementar.",
              text: "Agentes, automações, apps, dashboards e plataformas sob medida para a sua operação.",
              action: "Construir uma solução",
            },
          ].map(({ name, title, text, action }, index) => (
            <article
              key={name}
              className={cn(
                "flex flex-col items-start py-9 sm:px-8 sm:py-10",
                index > 0 && "border-t border-border sm:border-t-0 sm:border-l",
                index === 0 && "sm:pl-0",
                index === 2 && "sm:pr-0",
              )}
            >
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {name}
              </span>
              <h3 className="mt-7 text-2xl font-semibold sm:text-3xl">{title}</h3>
              <p className="mt-4 text-muted-foreground">{text}</p>
              <a
                href="https://calendar.app.google/oh4NeMRMtw8v5UP5A"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-medium text-primary"
              >
                {action} <ArrowRight className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>
      </Section>

      {/* SOBRE A SENA LABS */}
      <section id="sobre" className="border-t border-white/10 bg-[var(--ink)] text-[var(--paper)]">
        <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-20 sm:pb-28 sm:pt-28">
          <Eyebrow className="text-white/50">
            <span className="text-primary">06 /</span> Sobre a Sena Labs
          </Eyebrow>
          <div className="mt-6 grid gap-10 sm:grid-cols-[1.3fr_0.7fr] sm:gap-16">
            <h2 className="text-3xl font-semibold sm:text-5xl">
              Visão de negócio.
              <br />
              Capacidade de construir.
            </h2>
            <div>
              <p className="text-lg text-white/70">
                A Sena Labs combina estratégia, inteligência artificial, dados e desenvolvimento de
                software para criar soluções digitais úteis — que entram na operação e evoluem com
                ela.
              </p>
              <div className="mt-6 flex flex-col border-t border-white/15">
                {[
                  ["Estratégia", "01"],
                  ["Tecnologia", "02"],
                  ["Execução", "03"],
                ].map(([title, index]) => (
                  <div
                    key={title}
                    className="flex items-center justify-between border-b border-white/15 py-3 font-mono text-sm text-white/70"
                  >
                    <span>{title}</span>
                    <span className="text-primary">{index}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FUNDADOR */}
        <div id="fundador" className="border-t border-white/10">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 sm:grid-cols-[0.72fr_1.28fr] sm:gap-[72px] sm:py-20">
            <div>
              <Eyebrow className="text-white/50">
                <span className="text-primary">07 /</span> Fundador
              </Eyebrow>
              <h3 className="mt-5 text-4xl font-semibold sm:text-5xl">Felipe Sena.</h3>
              <p className="mt-3 text-sm text-white/50">Estratégia, produto e execução.</p>
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-block border-b border-current pb-1 text-sm text-[#ffb081] hover:text-primary"
              >
                Conheça minha trajetória ↗
              </a>
            </div>

            <div>
              <p className="max-w-[55ch] text-lg leading-relaxed text-white/80 sm:text-xl">
                Consultor de Estratégia e Tecnologia pela Boston Innovation Gateway, com experiência
                na construção de soluções de IA, dados e automação para empresas e programas
                internacionais.
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="border-t border-white/20 pt-4">
                  <b className="text-sm font-medium text-white">Negócio e análise de dados</b>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    Mestrados em International Business e Business Analytics pela Hult International
                    Business School.
                  </p>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <b className="text-sm font-medium text-white">Produto e execução</b>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    Experiências em Sicredi, XP Investimentos, HP Tech Ventures e liderança de
                    produto na Rivool Finance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-6xl border-t border-white/10 px-6 pb-20 pt-16 sm:pb-28">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <h3 className="text-xl font-semibold sm:text-2xl">
                Experiência aplicada, em diferentes contextos.
              </h3>
              <p className="font-mono text-xs text-white/50">
                São Paulo · Boston · Atuação internacional
              </p>
            </div>
            <div className="mt-6 grid gap-7 sm:grid-cols-3">
              {[
                {
                  small: "Internacionalização",
                  b: "Go Global · University of Miami ↗",
                  span: "Gestão de projetos de internacionalização com empresas, universidades e consultores.",
                  href: "https://www.linkedin.com/in/senafelipe/",
                  image: miamiImg,
                },
                {
                  small: "Ensino & IA",
                  b: "Hult International Business School ↗",
                  span: "Atuação como professor assistente em disciplinas de inteligência artificial.",
                  href: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7191442511838535680",
                  image:
                    "https://media.licdn.com/dms/image/v2/D4D22AQFC_jmUaFdOqQ/feedshare-image-high-res/feedshare-image-high-res/0/1714573503942?e=2147483647&v=beta&t=UgwEEBnkxBBANPnFFMIoWDTfW-Tv73Wj24vO0G4mBe4",
                },
                {
                  small: "Produto & negócios",
                  b: "Rivool Finance · SelectUSA ↗",
                  span: "Apresentação de uma plataforma de tokenização de crédito agrícola.",
                  href: "https://portal.agrosummit.com.br/agfintech-brasileira-e-selecionada-para-maior-evento-de-investimento-dos-eua",
                  image: selectUsaImg,
                },
              ].map((item) => (
                <a
                  key={item.small}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block border-t border-white/20 pt-4 transition hover:border-primary/60"
                >
                  <PhotoTile src={item.image} alt={item.b} />
                  <small className="mt-4 block font-mono text-xs text-[#ffb081]">
                    {item.small}
                  </small>
                  <b className="mt-2 block font-normal">{item.b}</b>
                  <span className="mt-2 block text-sm text-white/55">{item.span}</span>
                </a>
              ))}
            </div>

            <details className="group mt-7 border-t border-white/10">
              <summary className="cursor-pointer py-5 text-sm text-white/80">
                Ver outras experiências e programas
              </summary>
              <div className="grid gap-6 pt-2 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    b: "Visita ao escritório da Lovable AI ↗",
                    span: "Boston · Ecossistema de IA e desenvolvimento de produtos.",
                    href: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7465860189200670721",
                    image:
                      "https://media.licdn.com/dms/image/v2/D4D22AQH2TuCoc2iSDg/feedshare-shrink_800/B4DZ5wQR85JcAc-/0/1779999776834?e=2147483647&v=beta&t=0Zo9XjI4HHXu1dRod75VHHDZYRqYyxK8jMehb-6HF6I",
                  },
                  {
                    b: "Encontro Alumni Hult ↗",
                    span: "Organização de encontro com a comunidade global da Hult em Boston.",
                    href: "https://www.linkedin.com/posts/senafelipe_activity-7465827955500367872",
                    image: hultAlumniImg,
                  },
                  {
                    b: "Business Challenge · Hult ↗",
                    span: "IA aplicada à estratégia, em parceria com Prof. Patrick Lynch.",
                    href: "https://www.linkedin.com/posts/senafelipe_it-was-a-distinct-pleasure-to-participate-activity-7143594499804459008-T8Co",
                    image: hultChallengeImg,
                  },
                  {
                    b: "La Salle Barcelona ↗",
                    span: "Recepção de alunos em programa imersivo de inovação em Boston.",
                    href: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7211738960128032768",
                    image:
                      "https://media.licdn.com/dms/image/v2/D4D22AQGfQ3v0TXIXbg/feedshare-image-high-res/feedshare-image-high-res/0/1719412540093?e=2147483647&v=beta&t=Z3HWh4F6arSeTkHNk-EYUw4FKn7eLQqxyaRmxrEktJQ",
                  },
                  {
                    b: "Myllennium Award ↗",
                    span: "Programa de aceleração para empreendedores italianos.",
                    href: "https://www.linkedin.com/posts/senafelipe_lesperienza-del-boston-innovation-gateway-activity-7176944036270784513-87zo",
                    image: myllenniumImg,
                  },
                  {
                    b: "MIT Solve & Digital Strategy Conference ↗",
                    span: "Discussões sobre IA, produtividade e agentes contextuais.",
                    href: "https://www.linkedin.com/posts/senafelipe_digitaltransformation-artificialintelligence-activity-7123746921839493120-ePnZ",
                    image: mitSolveImg,
                  },
                  {
                    b: "Boston Beyond · Sistema FIEC + MIT ILP ↗",
                    span: "Programa executivo sobre IA aplicada e deep learning.",
                    href: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7121963915718074368",
                    image: bostonBeyondImg,
                  },
                  {
                    b: "EPIC Boston · Delegação da Malásia ↗",
                    span: "Expedição com lideranças de ciência, tecnologia e negócios.",
                    href: "https://www.linkedin.com/posts/senafelipe_epicboston-innovationmanagement-collaboration-activity-7068354948282871808-K--8",
                    image: epicMalasiaImg,
                  },
                ].map((item) => (
                  <a
                    key={item.b}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block text-sm transition"
                  >
                    <PhotoTile src={item.image} alt={item.b} />
                    <b className="mt-3 block font-normal">{item.b}</b>
                    <span className="mt-1.5 block text-white/55">{item.span}</span>
                  </a>
                ))}
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="contato" className="border-t border-white/10 bg-[#1e2022] text-[var(--paper)]">
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 overflow-hidden px-6 py-20 sm:py-28 md:grid-cols-[1fr_0.6fr] md:items-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
          />
          <div>
            <Eyebrow className="text-white/50">
              <span className="text-primary">08 /</span> Vamos conversar
            </Eyebrow>
            <h2 className="mt-4 max-w-2xl text-4xl font-semibold sm:text-5xl lg:text-6xl">
              Tem um problema que{" "}
              <span className="text-[#ffb081]">tecnologia poderia resolver?</span>
            </h2>
            <p className="mt-5 max-w-xl text-lg text-white/70">
              Conte o contexto. Nós ajudamos a transformar a pergunta em uma solução que funciona.
            </p>
          </div>

          <div className="flex flex-col gap-3 justify-self-start md:justify-self-end md:w-full md:max-w-[340px]">
            <ScheduleButton className="[&_button]:!w-full" />
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between gap-2 rounded-md border border-white/20 px-5 py-3.5 font-medium text-white hover:bg-white/10"
            >
              Conversar pelo WhatsApp <span>↗</span>
            </a>
            <div className="mt-1 flex items-center justify-between gap-4 text-sm text-white/60">
              <a href={`mailto:${EMAIL}`} className="hover:text-primary">
                E-mail ↗
              </a>
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                LinkedIn ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[var(--ink)] text-white/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col items-start gap-2">
              <img src={senaLogoHorizontalDark} alt="Sena Labs" className="h-8 w-auto" />
              <span>© {new Date().getFullYear()} Sena Labs · Felipe Sena</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a href="/politica-de-privacidade" className="hover:text-primary hover:underline">
                Política de Privacidade
              </a>
              <a href="/termos-de-uso" className="hover:text-primary hover:underline">
                Termos de Uso
              </a>
              <a href="/exclusao-de-dados" className="hover:text-primary hover:underline">
                Exclusão de Dados
              </a>
              <Link to="/ferramentas" className="hover:text-primary hover:underline">
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

function PillarRow({
  id,
  n,
  title,
  sub,
  tags,
  last = false,
}: {
  id: string;
  n: string;
  title: React.ReactNode;
  sub: string;
  tags: string[];
  last?: boolean;
}) {
  return (
    <article
      id={id}
      className={`group grid gap-5 border-t border-border py-10 sm:grid-cols-[64px_1fr_1fr] sm:gap-8 sm:py-12 ${
        last ? "border-b" : ""
      }`}
    >
      <span className="font-mono text-sm text-muted-foreground">{n}</span>
      <div>
        <span className="mb-4 block h-0.5 w-8 bg-primary transition-all duration-500 group-hover:w-16" />
        <h3 className="max-w-[13ch] text-3xl font-semibold leading-[1.12] sm:text-5xl">{title}</h3>
      </div>
      <div>
        <p className="max-w-[44ch] text-lg text-muted-foreground">{sub}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
