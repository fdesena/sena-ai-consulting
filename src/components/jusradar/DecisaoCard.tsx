import type { Decisao } from "@/lib/jusradar/types";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatData } from "@/lib/jusradar/format";

export function DecisaoCard({ decisao }: { decisao: Decisao }) {
  const d = decisao;
  const isWebLink = !!d.source;
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-sm text-foreground">
          {isWebLink ? (d.source ?? "Pesquisa web") : d.process_number || "Decisão"}
        </span>
        <div className="flex items-center gap-1.5">
          {isWebLink ? (
            <Badge className="border-transparent bg-forest/15 text-forest hover:bg-forest/20">
              Pesquisa web
            </Badge>
          ) : (
            d.court && <Badge variant="outline">{d.court.toUpperCase()}</Badge>
          )}
          {d.publication_date && (
            <span className="text-xs text-muted-foreground">{formatData(d.publication_date)}</span>
          )}
        </div>
      </div>

      {d.excerpt && (
        <p className="mt-2 text-sm leading-relaxed text-foreground/90 line-clamp-5">{d.excerpt}</p>
      )}

      {d.full_text && (
        <Accordion type="single" collapsible className="mt-1">
          <AccordionItem value="full" className="border-0">
            <AccordionTrigger className="py-2 text-xs text-bronze hover:no-underline">
              Ver inteiro teor
            </AccordionTrigger>
            <AccordionContent>
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                {d.full_text}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {d.url && (
        <a
          href={d.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs font-medium text-bronze underline underline-offset-2 hover:text-bronze/80"
        >
          {isWebLink
            ? `Abrir busca em ${(d.source ?? "").replace(/\s*\(.*\)/, "")} ↗`
            : "Abrir no portal do tribunal ↗"}
        </a>
      )}
    </div>
  );
}
