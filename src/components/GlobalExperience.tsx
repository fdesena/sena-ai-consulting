import { useState, useEffect, useMemo, useRef } from "react";
import { ExternalLink, Linkedin, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import selectUsaImg from "@/assets/felipe-selectusa.png";
import miamiImg from "@/assets/felipe-miami-goglobal.png";
import myllenniumImg from "@/assets/felipe-myllennium.png";
import hultChallengeImg from "@/assets/felipe-hult-challenge.png";
import mitSolveImg from "@/assets/felipe-mit-solve.png";
import bostonBeyondImg from "@/assets/felipe-boston-beyond.png";
import epicMalasiaImg from "@/assets/felipe-epic-malasia.png";
import hultAlumniImg from "@/assets/felipe-hult-alumni.png";

type Experience = {
  title: string;
  context: string;
  description: string;
  location: string;
  flags: string;
  tag: string;
  image?: string;
  link: string;
  linkLabel: string;
};

const EXPERIENCES: Experience[] = [
  {
    title: "Gestor de Projetos · Programa Go Global",
    context: "University of Miami · Boston Innovation Gateway",
    description:
      "Liderei projetos de internacionalização para múltiplas empresas no Brasil e no Panamá, coordenando mais de 40 pessoas entre empresas, universidades, estudantes de MBA e consultores seniores.",
    location: "Estados Unidos · Brasil · Panamá",
    flags: "🇺🇸 🇧🇷 🇵🇦",
    tag: "Internacionalização",
    image: miamiImg,
    link: "https://www.linkedin.com/in/senafelipe/",
    linkLabel: "Ver no LinkedIn",
  },
  {
    title: "Visita ao escritório da Lovable AI",
    context: "Boston, Estados Unidos",
    description:
      "Imersão na Lovable AI, plataforma que utilizo para acelerar construção de produtos e automações.",
    location: "Estados Unidos",
    flags: "🇺🇸",
    tag: "Ecossistema de IA",
    image:
      "https://media.licdn.com/dms/image/v2/D4D22AQH2TuCoc2iSDg/feedshare-shrink_800/B4DZ5wQR85JcAc-/0/1779999776834?e=2147483647&v=beta&t=0Zo9XjI4HHXu1dRod75VHHDZYRqYyxK8jMehb-6HF6I",
    link: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7465860189200670721",
    linkLabel: "Ver post",
  },
  {
    title: "Professor assistente em disciplinas de IA",
    context: "Hult International Business School · Boston",
    description:
      "Professor assistente em disciplinas de IA na escola de negócios Hult International Business School em Boston.",
    location: "Estados Unidos",
    flags: "🇺🇸",
    tag: "Ensino & IA",
    image:
      "https://media.licdn.com/dms/image/v2/D4D22AQFC_jmUaFdOqQ/feedshare-image-high-res/feedshare-image-high-res/0/1714573503942?e=2147483647&v=beta&t=UgwEEBnkxBBANPnFFMIoWDTfW-Tv73Wj24vO0G4mBe4",
    link: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7191442511838535680",
    linkLabel: "Ver post",
  },
  {
    title: "Pitch no SelectUSA Investment Summit",
    context: "Rivool Finance · Washington, D.C.",
    description:
      "Representei a Rivool Finance no maior evento de investimento dos EUA, apresentando tokenização de crédito agrícola.",
    location: "Estados Unidos",
    flags: "🇺🇸",
    tag: "Captação internacional",
    image: selectUsaImg,
    link: "https://portal.agrosummit.com.br/agfintech-brasileira-e-selecionada-para-maior-evento-de-investimento-dos-eua",
    linkLabel: "Ver matéria",
  },
  {
    title: "Encontro Alumni Hult · Boston",
    context: "Hult International Business School · Alumni Association",
    description:
      "Organizei um encontro com alumni globais da Hult em Boston, reunindo profissionais de turmas entre 2015 e 2025. Uma oportunidade para reconectar com a comunidade, trocar experiências e fortalecer uma rede global presente em hubs como Boston, London, Dubai e Singapore.",
    location: "Estados Unidos",
    flags: "🇺🇸",
    tag: "Networking global",
    image: hultAlumniImg,
    link: "https://www.linkedin.com/posts/senafelipe_activity-7465827955500367872",
    linkLabel: "Ver post",
  },
  {
    title: "Business Challenge · Hult Business School",
    context: "Em parceria com Prof. Patrick Lynch, PhD (IA)",
    description:
      "Co-conduzi um Business Challenge sobre IA aplicada à estratégia com um dos especialistas em IA da Hult.",
    location: "Estados Unidos",
    flags: "🇺🇸",
    tag: "Estratégia & IA",
    image: hultChallengeImg,
    link: "https://www.linkedin.com/posts/senafelipe_it-was-a-distinct-pleasure-to-participate-activity-7143594499804459008-T8Co",
    linkLabel: "Ver post",
  },
  {
    title: "Curso de inovação · La Salle Barcelona",
    context: "Boston · Recepção de delegação espanhola",
    description:
      "Recebi alunos da Universidade La Salle de Barcelona em programa imersivo de inovação.",
    location: "Espanha · Estados Unidos",
    flags: "🇪🇸 🇺🇸",
    tag: "Educação executiva",
    image:
      "https://media.licdn.com/dms/image/v2/D4D22AQGfQ3v0TXIXbg/feedshare-image-high-res/feedshare-image-high-res/0/1719412540093?e=2147483647&v=beta&t=Z3HWh4F6arSeTkHNk-EYUw4FKn7eLQqxyaRmxrEktJQ",
    link: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7211738960128032768",
    linkLabel: "Ver post",
  },
  {
    title: "Aceleração · Myllennium Award",
    context: "Empreendedores italianos · Boston",
    description:
      "Conduzi programa de aceleração de negócios para empreendedores vencedores do prêmio italiano.",
    location: "Itália · Estados Unidos",
    flags: "🇮🇹 🇺🇸",
    tag: "Aceleração",
    image: myllenniumImg,
    link: "https://www.linkedin.com/posts/senafelipe_lesperienza-del-boston-innovation-gateway-activity-7176944036270784513-87zo",
    linkLabel: "Ver post",
  },
  {
    title: "MIT Solve & MIT Digital Strategy Conference",
    context: "Com Dr. Ibrahim Rawabdeh · Jordânia",
    description:
      "Acompanhei discussões no MIT sobre uso estratégico da IA, produtividade e agentes contextuais.",
    location: "Estados Unidos · Jordânia",
    flags: "🇺🇸 🇯🇴",
    tag: "MIT · IA estratégica",
    image: mitSolveImg,
    link: "https://www.linkedin.com/posts/senafelipe_digitaltransformation-artificialintelligence-activity-7123746921839493120-ePnZ",
    linkLabel: "Ver post",
  },
  {
    title: "Boston Beyond · Sistema FIEC + MIT ILP",
    context: "MIT Industrial Liaison Program · MIT-IBM Watson AI Lab",
    description:
      "Programa executivo conectando o Sistema FIEC ao MIT, com imersão em IA aplicada e deep learning.",
    location: "Brasil · Estados Unidos",
    flags: "🇧🇷 🇺🇸",
    tag: "Executivo · IA aplicada",
    image: bostonBeyondImg,
    link: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7121963915718074368",
    linkLabel: "Ver post",
  },
  {
    title: "EPIC Boston · Delegação C-level da Malásia",
    context: "Metodologia GIMI · 5 dias de imersão",
    description:
      "Acompanhei lideranças de Academy of Sciences Malaysia, MOSTI e PETRONAS em expedição de inovação e IA.",
    location: "Malásia · Estados Unidos",
    flags: "🇲🇾 🇺🇸",
    tag: "Inovação corporativa",
    image: epicMalasiaImg,
    link: "https://www.linkedin.com/posts/senafelipe_epicboston-innovationmanagement-collaboration-activity-7068354948282871808-K--8",
    linkLabel: "Ver post",
  },
];

export default function GlobalExperience() {
  const [isPaused, setIsPaused] = useState(false);
  const [dbPosts, setDbPosts] = useState<Experience[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const nudge = (dir: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: dir * 648, behavior: "smooth" });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("title,context,excerpt,cover_url,link_url,link_label,tag,location,flags")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (data) {
        setDbPosts(
          data.map((p: any) => ({
            title: p.title,
            context: p.context ?? "",
            description: p.excerpt ?? "",
            location: p.location ?? "",
            flags: p.flags ?? "",
            tag: p.tag ?? "",
            image: p.cover_url ?? undefined,
            link: p.link_url ?? "#",
            linkLabel: p.link_label ?? "Ver post",
          })),
        );
      }
    })();
  }, []);

  const experiences = useMemo(() => [...dbPosts, ...EXPERIENCES], [dbPosts]);
  // Duplicate for seamless infinite loop
  const marqueeItems = useMemo(() => [...experiences, ...experiences], [experiences]);

  // Velocidade constante (px/s) → duração proporcional à quantidade de cards.
  // Card = 300px (w-[300px]) + 24px (gap-6).
  const CARD_W = 324;
  const SPEED = 100; // px por segundo
  const duration = useMemo(
    () => Math.max(20, (experiences.length * CARD_W) / SPEED),
    [experiences.length],
  );

  return (
    <div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Experiências Profissionais Globais
        </p>
        <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
          Onde a estratégia foi aplicada — ao vivo, com instituições e líderes globais.
        </h3>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Uma seleção de programas, projetos e palestras conduzidos ao lado de universidades,
          governos e empresas em diferentes países.
        </p>
      </div>

      {/* Controles manuais de navegação */}
      <div className="mt-8 flex justify-end gap-2">
        <button
          onClick={() => nudge(-1)}
          aria-label="Voltar"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => nudge(1)}
          aria-label="Avançar"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary hover:text-primary"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Continuous marquee carousel */}
      <div
        ref={scrollerRef}
        className="mt-4 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 60px, black calc(100% - 60px), transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 60px, black calc(100% - 60px), transparent)",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex gap-6"
          style={{
            animation: `globalexp-marquee ${duration}s linear infinite`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {marqueeItems.map((exp, i) => (
            <a
              key={`${exp.title}-${i}`}
              href={exp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-[300px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/60 hover:shadow-lg"
            >
              {exp.image ? (
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium backdrop-blur">
                    {exp.tag}
                  </span>
                </div>
              ) : (
                <div className="relative aspect-[16/10] overflow-hidden bg-muted flex items-center justify-center">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary absolute left-4 top-4">
                    {exp.tag}
                  </span>
                  <Linkedin className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {exp.context}
                </p>
                <h4 className="text-base font-semibold leading-snug">{exp.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">{exp.description}</p>
                <div className="mt-auto flex items-center justify-between pt-3 text-sm">
                  <span className="text-muted-foreground text-xs">
                    {exp.flags} {exp.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-primary text-xs">
                    {exp.linkLabel}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes globalexp-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
