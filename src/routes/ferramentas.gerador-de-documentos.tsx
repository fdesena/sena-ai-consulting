import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

/**
 * A ferramenta é uma página estática auto-contida em /public (mesmo padrão do
 * diagnóstico). Esta rota só existe para dar uma URL limpa, sem o ".html".
 */
export const Route = createFileRoute("/ferramentas/gerador-de-documentos")({
  head: () => ({
    meta: [
      { title: "Gerador de Documentos — Sena Consulting" },
      {
        name: "description",
        content:
          "Gere crachás, certificados e cartas em lote a partir de um modelo (.pptx/.docx) e de uma planilha de participantes.",
      },
    ],
  }),
  component: GeradorRedirect,
});

function GeradorRedirect() {
  useEffect(() => {
    window.location.replace("/ferramentas/gerador-de-documentos.html");
  }, []);
  return (
    <main className="grid min-h-screen place-items-center bg-background text-foreground">
      <p className="text-muted-foreground">Abrindo o gerador de documentos…</p>
    </main>
  );
}
