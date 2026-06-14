import { ExternalLink, Linkedin } from "lucide-react";
import selectUsaAsset from "@/assets/felipe-selectusa.png.asset.json";
import miamiAsset from "@/assets/felipe-miami-goglobal.png.asset.json";

type Experience = {
  title: string;
  context: string;
  description: string;
  location: string;
  tag: string;
  image?: string;
  link: string;
  linkLabel: string;
};

const EXPERIENCES: Experience[] = [
  {
    title: "Pitch no SelectUSA Investment Summit",
    context: "Rivool Finance · Washington, D.C.",
    description:
      "Representei a Rivool Finance, agfintech selecionada para o maior evento de investimento dos EUA, apresentando a plataforma de tokenização de crédito agrícola para investidores globais.",
    location: "Estados Unidos",
    tag: "Captação internacional",
    image: selectUsaAsset.url,
    link: "https://portal.agrosummit.com.br/agfintech-brasileira-e-selecionada-para-maior-evento-de-investimento-dos-eua",
    linkLabel: "Ver matéria",
  },
  {
    title: "Gestor de Projetos · Programa Go Global",
    context: "University of Miami · Boston Innovation Gateway",
    description:
      "Liderei projetos com mais de 30 alunos do mestrado de Negócios Internacionais da University of Miami, treinando e mentorando o time para apoiar a internacionalização de empresas do Brasil e do Panamá.",
    location: "Estados Unidos · Brasil · Panamá",
    tag: "Internacionalização",
    image: miamiAsset.url,
    link: "https://www.linkedin.com/in/senafelipe/",
    linkLabel: "Ver no LinkedIn",
  },
  {
    title: "Teaching Assistant · Mestrado em Business Analytics",
    context: "Hult International Business School · Boston",
    description:
      "Apoiei as disciplinas de Business Analytics, Inteligência Artificial e o Futuro do Trabalho — tutoria de alunos, gestão do curso e elaboração de casos de negócios reais aplicando tecnologia.",
    location: "Estados Unidos",
    tag: "Ensino & IA",
    link: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7191442511838535680",
    linkLabel: "Ver post",
  },
  {
    title: "Visita ao escritório da Lovable AI",
    context: "Boston, Estados Unidos",
    description:
      "Imersão na Lovable AI, uma das plataformas de IA que utilizo profissionalmente para acelerar a construção de produtos e automações com clientes.",
    location: "Estados Unidos",
    tag: "Ecossistema de IA",
    link: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7465860189200670721",
    linkLabel: "Ver post",
  },
  {
    title: "Curso de inovação · La Salle Barcelona",
    context: "Boston · Recepção de delegação espanhola",
    description:
      "Recebi alunos da Universidade La Salle de Barcelona em um programa imersivo de inovação, conectando boas práticas europeias ao ecossistema de Boston.",
    location: "Espanha · Estados Unidos",
    tag: "Educação executiva",
    link: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7211738960128032768",
    linkLabel: "Ver post",
  },
  {
    title: "Aceleração · Myllennium Award",
    context: "Empreendedores italianos · Boston",
    description:
      "Conduzi programa de aceleração de negócios e inovação para empreendedores vencedores do prêmio italiano Myllennium Award.",
    location: "Itália · Estados Unidos",
    tag: "Aceleração",
    link: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7211738960128032768",
    linkLabel: "Ver post",
  },
  {
    title: "Business Challenge · Hult Business School",
    context: "Em parceria com Prof. Patrick Lynch, PhD (IA)",
    description:
      "Co-conduzi um Business Challenge sobre Inteligência Artificial aplicada à estratégia, junto a um dos especialistas em IA da Hult International Business School.",
    location: "Estados Unidos",
    tag: "Estratégia & IA",
    link: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7143594499804459008",
    linkLabel: "Ver post",
  },
  {
    title: "MIT Solve & MIT Digital Strategy Conference",
    context: "Com Dr. Ibrahim Rawabdeh · King Abdullah II Center, Jordânia",
    description:
      "Acompanhei discussões no MIT sobre o uso estratégico da IA nas organizações — produtividade, decisão baseada em dados e agentes de IA contextuais para o futuro do trabalho.",
    location: "Estados Unidos · Jordânia",
    tag: "MIT · IA estratégica",
    link: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7123746921839493120",
    linkLabel: "Ver post",
  },
  {
    title: "Boston Beyond · Sistema FIEC + MIT ILP",
    context: "MIT Industrial Liaison Program · MIT-IBM Watson AI Lab",
    description:
      "Programa executivo conectando o Sistema FIEC ao MIT, com visita ao MIT-IBM Watson AI Lab e imersão em IA aplicada, deep learning e impactos econômicos da tecnologia.",
    location: "Brasil · Estados Unidos",
    tag: "Executivo · IA aplicada",
    link: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7121963915718074368",
    linkLabel: "Ver post",
  },
  {
    title: "EPIC Boston · Delegação C-level da Malásia",
    context: "Metodologia GIMI · 5 dias de imersão",
    description:
      "Acompanhei lideranças de Academy of Sciences Malaysia, MOSTI, PETRONAS Innovation Garage e Sarawak Energy em uma expedição focada em gestão da inovação, IA, robótica e impacto.",
    location: "Malásia · Estados Unidos",
    tag: "Inovação corporativa",
    link: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7068354948282871808",
    linkLabel: "Ver post",
  },
];

export default function GlobalExperience() {
  const [first, second, ...rest] = EXPERIENCES;
  const featured = [first, second];

  return (
    <div>
      <div className="flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Prova social · Experiências internacionais
          </p>
          <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
            Onde a estratégia foi aplicada — ao vivo, com instituições e líderes globais.
          </h3>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Uma seleção de programas, projetos e palestras conduzidos ao lado de universidades, governos
            e empresas em diferentes países. Cada cartão leva para o registro original no LinkedIn ou na imprensa.
          </p>
        </div>
      </div>

      {/* Featured cards with photos */}
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {featured.map((exp) => (
          <a
            key={exp.title}
            href={exp.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/60 hover:shadow-lg"
          >
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
            <div className="flex flex-1 flex-col gap-3 p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{exp.context}</p>
              <h4 className="text-lg font-semibold leading-snug">{exp.title}</h4>
              <p className="text-sm text-muted-foreground">{exp.description}</p>
              <div className="mt-auto flex items-center justify-between pt-3 text-sm">
                <span className="text-muted-foreground">{exp.location}</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-primary">
                  {exp.linkLabel}
                  <ExternalLink className="h-4 w-4" />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Secondary grid */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((exp) => (
          <a
            key={exp.title}
            href={exp.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/60 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {exp.tag}
              </span>
              <Linkedin className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{exp.context}</p>
            <h4 className="text-base font-semibold leading-snug">{exp.title}</h4>
            <p className="text-sm text-muted-foreground">{exp.description}</p>
            <div className="mt-auto flex items-center justify-between pt-2 text-xs">
              <span className="text-muted-foreground">{exp.location}</span>
              <span className="inline-flex items-center gap-1 font-medium text-primary">
                {exp.linkLabel}
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
