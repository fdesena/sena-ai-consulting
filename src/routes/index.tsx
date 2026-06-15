import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "@/components/LandingPage";
import ogImage from "@/assets/og-sena.jpg.asset.json";

const OG_IMAGE_URL = `https://senaconsulting.app${ogImage.url}`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sena Consulting — IA, Automação e Transformação Digital" },
      {
        name: "description",
        content:
          "Consultoria de IA e automação que sai da apresentação e vira sistema rodando. Diagnóstico, construção e capacitação — com resultados mensuráveis.",
      },
      { property: "og:title", content: "Sena Consulting — Onde Estratégia Encontra Execução" },
      {
        property: "og:description",
        content:
          "Consultoria de IA, automação e transformação digital. São Paulo · Boston — atuando globalmente.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://senaconsulting.app/" },
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Sena Consulting — Onde Estratégia Encontra Execução" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Sena Consulting — Onde Estratégia Encontra Execução" },
      {
        name: "twitter:description",
        content:
          "Consultoria de IA, automação e transformação digital. São Paulo · Boston — atuando globalmente.",
      },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: [{ rel: "canonical", href: "https://senaconsulting.app/" }],
  }),
  component: LandingPage,
});
