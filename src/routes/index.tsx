import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "@/components/LandingPage";
import ogImage from "@/assets/og-sena.jpg.asset.json";

const OG_IMAGE_URL = `https://www.senalabs.tech${ogImage.url}`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sena Labs — Estratégia, IA e Software" },
      {
        name: "description",
        content:
          "Transformamos problemas de negócio em produtos digitais, automações, agentes de IA, dashboards e plataformas que funcionam.",
      },
      { property: "og:title", content: "Sena Labs — Do problema ao produto" },
      {
        property: "og:description",
        content:
          "Estratégia, IA e desenvolvimento de software. São Paulo · Boston — atuação global.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.senalabs.tech/" },
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Sena Labs — Do problema ao produto" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Sena Labs — Do problema ao produto" },
      {
        name: "twitter:description",
        content:
          "Estratégia, IA e desenvolvimento de software. São Paulo · Boston — atuação global.",
      },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
    links: [{ rel: "canonical", href: "https://www.senalabs.tech/" }],
  }),
  component: LandingPage,
});
