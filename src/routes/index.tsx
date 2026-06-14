import { createFileRoute } from "@tanstack/react-router";
import DeckPage from "@/components/DeckPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sena Consulting — Onde Estratégia Encontra Execução" },
      {
        name: "description",
        content:
          "Sena Consulting: consultoria em IA, automação e transformação digital. Do diagnóstico ao deployment — sistemas que geram resultados mensuráveis.",
      },
      { property: "og:title", content: "Sena Consulting — Onde Estratégia Encontra Execução" },
      {
        property: "og:description",
        content:
          "Consultoria em IA, automação e transformação digital. São Paulo · Boston — atuando globalmente.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Sena Consulting" },
      {
        name: "twitter:description",
        content: "IA · Automação · Transformação Digital — Felipe Sena",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: DeckPage,
});
