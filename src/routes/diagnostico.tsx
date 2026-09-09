import { createFileRoute } from "@tanstack/react-router";
import DiagnosticoApp from "@/features/diagnostico/DiagnosticoApp";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      { title: "Diagnóstico de oportunidades — Sena Labs" },
      {
        name: "description",
        content:
          "Identifique uma oportunidade prioritária para seu negócio e receba um plano inicial de ação, sem precisar conhecer ferramentas de IA.",
      },
      { property: "og:title", content: "Diagnóstico de oportunidades — Sena Labs" },
      {
        property: "og:description",
        content:
          "Um plano inicial de ação a partir da sua situação real, sem nota de maturidade e sem cadastro.",
      },
      { property: "og:url", content: "https://senaconsulting.app/diagnostico" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Diagnóstico de oportunidades — Sena Labs" },
      {
        name: "twitter:description",
        content:
          "Um plano inicial de ação a partir da sua situação real, sem nota de maturidade e sem cadastro.",
      },
    ],
    links: [{ rel: "canonical", href: "https://senaconsulting.app/diagnostico" }],
  }),
  component: DiagnosticoApp,
});
