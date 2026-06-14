import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "@/components/LandingPage";

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
      { property: "og:url", content: "https://sena-ai-consulting.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://sena-ai-consulting.lovable.app/" }],
  }),
  component: LandingPage,
});
