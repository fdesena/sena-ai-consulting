import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "@/components/LandingPage";

const OG_IMAGE_URL = "https://www.senalabs.tech/og-image.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sena Labs — Treinamento, Estratégia, IA e Software" },
      {
        name: "description",
        content:
          "Treinamentos práticos e soluções digitais para reduzir retrabalho, simplificar operações e devolver tempo às equipes.",
      },
      { property: "og:title", content: "Sena Labs — Treinamento, Estratégia, IA e Software" },
      {
        property: "og:description",
        content:
          "Treinamentos práticos e soluções digitais para reduzir retrabalho e devolver tempo às equipes.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.senalabs.tech/" },
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Sena Labs — Treinamento, Estratégia, IA e Software" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Sena Labs — Treinamento, Estratégia, IA e Software" },
      {
        name: "twitter:description",
        content:
          "Treinamentos práticos e soluções digitais para reduzir retrabalho e devolver tempo às equipes.",
      },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: [{ rel: "canonical", href: "https://www.senalabs.tech/" }],
  }),
  component: LandingPage,
});
