import { createFileRoute } from "@tanstack/react-router";
import { ToolShell } from "@/components/ferramentas/ToolShell";
import { Timer } from "@/components/ferramentas/Timer";

export const Route = createFileRoute("/ferramentas/temporizador")({
  head: () => ({
    meta: [
      { title: "Temporizador — Sena Consulting" },
      {
        name: "description",
        content:
          "Temporizador regressivo em tela cheia para workshops, dinâmicas e apresentações. Com presets, música de fundo e alerta sonoro.",
      },
    ],
  }),
  component: TemporizadorPage,
});

function TemporizadorPage() {
  return (
    <ToolShell
      eyebrow="Ferramenta"
      title="Temporizador"
      description="Contagem regressiva para workshops, dinâmicas e apresentações. Espaço inicia/pausa, R reseta e a tela cheia deixa o relógio visível na projeção."
    >
      <Timer />
    </ToolShell>
  );
}
