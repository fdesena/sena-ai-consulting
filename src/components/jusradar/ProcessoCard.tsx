import type { Processo } from "@/lib/jusradar/types";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatData, formatNumeroCNJ, buildProcessLinks } from "@/lib/jusradar/format";

export function ProcessoCard({ processo }: { processo: Processo }) {
  const p = processo;
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-sm font-medium text-foreground">
          {formatNumeroCNJ(p.numeroProcesso)}
        </span>
        <div className="flex items-center gap-1.5">
          {p.tribunal && <Badge variant="outline">{p.tribunal}</Badge>}
          {p.grau && <Badge variant="outline">{p.grau}</Badge>}
          {p.fonte && (
            <Badge className="border-transparent bg-forest/15 text-forest hover:bg-forest/20">
              {p.fonte}
            </Badge>
          )}
        </div>
      </div>

      {p.parte && (
        <p className="mt-1 text-xs text-muted-foreground">
          Vinculado à parte: <span className="font-medium text-foreground/80">{p.parte}</span>
        </p>
      )}

      {p.classe && (
        <p className="mt-2 font-medium text-foreground/90">{p.classe}</p>
      )}
      {p.orgaoJulgador && (
        <p className="text-sm text-muted-foreground">{p.orgaoJulgador}</p>
      )}

      {p.assuntos?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Array.from(new Set(p.assuntos)).map((a, i) => (
            <Badge key={i} className="border-transparent bg-bronze/15 text-bronze hover:bg-bronze/20">
              {a}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span>Ajuizamento: {formatData(p.dataAjuizamento)}</span>
        <span>Atualização: {formatData(p.ultimaAtualizacao)}</span>
      </div>

      {p.movimentos?.length > 0 && (
        <Accordion type="single" collapsible className="mt-1">
          <AccordionItem value="mov" className="border-0">
            <AccordionTrigger className="py-2 text-xs text-bronze hover:no-underline">
              Últimas movimentações ({p.movimentos.length})
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {p.movimentos.map((m, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 font-mono">{formatData(m.data)}</span>
                    <span>{m.nome}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {p.url && (
          <a
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-bronze underline underline-offset-2 hover:text-bronze/80"
          >
            Abrir na fonte ({p.fonte ?? "externo"})
          </a>
        )}
        {buildProcessLinks(p.numeroProcesso, p.tribunal).map((l) => (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-bronze underline underline-offset-2 hover:text-bronze/80"
          >
            {`Abrir: ${l.label}`}
          </a>
        ))}
      </div>
    </div>
  );
}
