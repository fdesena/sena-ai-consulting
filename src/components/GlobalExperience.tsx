import { useState, useRef, useEffect } from "react";
import { ExternalLink, Linkedin, ChevronLeft, ChevronRight } from "lucide-react";
import selectUsaAsset from "@/assets/felipe-selectusa.png.asset.json";
import miamiAsset from "@/assets/felipe-miami-goglobal.png.asset.json";
import myllenniumAsset from "@/assets/felipe-myllennium.png.asset.json";
import hultChallengeAsset from "@/assets/felipe-hult-challenge.png.asset.json";
import mitSolveAsset from "@/assets/felipe-mit-solve.png.asset.json";
import bostonBeyondAsset from "@/assets/felipe-boston-beyond.png.asset.json";
import epicMalasiaAsset from "@/assets/felipe-epic-malasia.png.asset.json";
import hultAlumniAsset from "@/assets/felipe-hult-alumni.png.asset.json";

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
      "Liderei projetos com mais de 30 alunos do mestrado, mentorando a internacionalização de empresas do Brasil e Panamá.",
    location: "Estados Unidos · Brasil · Panamá",
    flags: "🇺🇸 🇧🇷 🇵🇦",
    tag: "Internacionalização",
    image: miamiAsset.url,
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
    image: selectUsaAsset.url,
    link: "https://portal.agrosummit.com.br/agfintech-brasileira-e-selecionada-para-maior-evento-de-investimento-dos-eua",
    linkLabel: "Ver matéria",
  },
  {
    title: "Business Challenge · Hult Business School",
    context: "Em parceria com Prof. Patrick Lynch, PhD (IA)",
    description:
      "Co-conduzi um Business Challenge sobre IA aplicada à estratégia com um dos especialistas em IA da Hult.",
    location: "Estados Unidos",
    flags: "🇺🇸",
    tag: "Estratégia & IA",
    image: hultChallengeAsset.url,
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
    image: myllenniumAsset.url,
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
    image: mitSolveAsset.url,
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
    image: bostonBeyondAsset.url,
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
    image: epicMalasiaAsset.url,
    link: "https://www.linkedin.com/posts/senafelipe_epicboston-innovationmanagement-collaboration-activity-7068354948282871808-K--8",
    linkLabel: "Ver post",
  },
];

export default function GlobalExperience() {
  const [current, setCurrent] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, EXPERIENCES.length - itemsPerView);
  const canPrev = current > 0;
  const canNext = current < maxIndex;

  const goPrev = () => setCurrent((p) => Math.max(0, p - 1));
  const goNext = () => setCurrent((p) => Math.min(maxIndex, p + 1));

  return (
    <div>
      <div className="flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Experiências internacionais
          </p>
          <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
            Onde a estratégia foi aplicada — ao vivo, com instituições e líderes globais.
          </h3>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Uma seleção de programas, projetos e palestras conduzidos ao lado de universidades, governos
            e empresas em diferentes países. Cada cartão leva para o registro original no LinkedIn ou na imprensa.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            disabled={!canPrev}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition hover:bg-accent disabled:opacity-40"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            disabled={!canNext}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition hover:bg-accent disabled:opacity-40"
            aria-label="Próximo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Carousel track */}
      <div className="mt-10 overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-6 transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `translateX(-${current * (100 / itemsPerView)}%)` }}
        >
          {EXPERIENCES.map((exp) => (
            <a
              key={exp.title}
              href={exp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/60 hover:shadow-lg"
              style={{ width: `calc(${100 / itemsPerView}% - ${(24 * (itemsPerView - 1)) / itemsPerView}px)` }}
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
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{exp.context}</p>
                <h4 className="text-base font-semibold leading-snug">{exp.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">{exp.description}</p>
                <div className="mt-auto flex items-center justify-between pt-3 text-sm">
                  <span className="text-muted-foreground text-xs">{exp.flags} {exp.location}</span>
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

      {/* Dots */}
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${
              i === current ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Ir para slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
