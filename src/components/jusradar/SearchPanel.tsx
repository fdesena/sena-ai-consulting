import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const EXEMPLOS = [
  "Menor de idade trabalhando em posto de gasolina como frentista, sem reconhecimento de vínculo empregatício (SP).",
  "Negativação indevida em cadastro de inadimplentes e dano moral, consumidor em São Paulo.",
  "Acidente de trabalho com dano estético, responsabilidade civil do empregador.",
  "Há processos vinculados ao CNPJ 40.962.221/0001-65 ou aos seus administradores?",
];

export function SearchPanel({
  value,
  onChange,
  onSubmit,
  running,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  running: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <label htmlFor="contexto" className="font-display text-sm font-semibold">
        Descreva o caso em linguagem natural
      </label>
      <Textarea
        id="contexto"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !running) onSubmit();
        }}
        placeholder="Ex.: menores trabalhando em posto de gasolina sem reconhecimento de vínculo, com pedido de periculosidade e dano moral…"
        className="mt-2 min-h-32 resize-y text-base"
        disabled={running}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {EXEMPLOS.map((ex, i) => (
          <button
            key={i}
            type="button"
            disabled={running}
            onClick={() => onChange(ex)}
            className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground transition-colors hover:bg-bronze/10 hover:border-bronze/40 disabled:opacity-50"
          >
            {ex.length > 60 ? ex.slice(0, 60) + "…" : ex}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Etapa 1: processos no DataJud (por assunto). Etapa 2: jurisprudência por tema. Ou informe
          um CNPJ para empresa + administradores e links de busca processual.
        </p>
        <Button
          onClick={onSubmit}
          disabled={running || !value.trim()}
          size="lg"
          className="bg-bronze hover:bg-bronze/90 text-white shrink-0"
        >
          {running ? "Pesquisando…" : "Pesquisar"}
        </Button>
      </div>
    </div>
  );
}
