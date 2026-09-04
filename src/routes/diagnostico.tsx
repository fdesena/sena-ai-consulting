import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      { title: "Diagnóstico Bússola Digital & IA — Sena Consulting" },
      {
        name: "description",
        content:
          "Diagnóstico estruturado para mapear onde IA e automação geram retorno real no seu negócio antes de investir tempo e dinheiro.",
      },
      { property: "og:title", content: "Diagnóstico Bússola Digital & IA — Sena Consulting" },
      {
        property: "og:description",
        content: "Mapeie suas maiores oportunidades com IA e automação antes de investir.",
      },
      { property: "og:url", content: "https://senaconsulting.app/diagnostico" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Diagnóstico Bússola Digital & IA — Sena Consulting" },
      {
        name: "twitter:description",
        content: "Mapeie suas maiores oportunidades com IA e automação antes de investir.",
      },
    ],
    links: [{ rel: "canonical", href: "https://senaconsulting.app/diagnostico" }],
  }),
  component: DiagnosticoRedirect,
});

function DiagnosticoRedirect() {
  useEffect(() => {
    window.location.replace("/diagnostico.html");
  }, []);
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#F8F7F4",
        color: "#1A1916",
        fontFamily: "system-ui",
      }}
    >
      <p>Abrindo o diagnóstico…</p>
    </main>
  );
}
