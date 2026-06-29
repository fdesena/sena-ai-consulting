import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Skeleton } from "@/components/ui/skeleton";

export function SynthesisPanel({
  text,
  running,
  placeholder = "A síntese da IA aparecerá aqui após as buscas.",
  skeleton = true,
}: {
  text: string;
  running: boolean;
  /** Mensagem exibida quando ainda não há texto. */
  placeholder?: string;
  /** Mostra esqueleto de carregamento enquanto `running` e sem texto (default: true). */
  skeleton?: boolean;
}) {
  if (!text && running && skeleton) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!text) {
    return <p className="text-muted-foreground text-sm">{placeholder}</p>;
  }

  return (
    <div className="markdown text-[0.95rem] leading-relaxed text-foreground/90">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h1 className="font-display text-2xl font-semibold mt-2 mb-3" {...p} />,
          h2: (p) => (
            <h2 className="font-display text-xl font-semibold mt-6 mb-2 text-bronze" {...p} />
          ),
          h3: (p) => <h3 className="font-display text-lg font-semibold mt-4 mb-2" {...p} />,
          p: (p) => <p className="my-3" {...p} />,
          ul: (p) => <ul className="my-3 ml-5 list-disc space-y-1.5" {...p} />,
          ol: (p) => <ol className="my-3 ml-5 list-decimal space-y-1.5" {...p} />,
          li: (p) => <li className="pl-1" {...p} />,
          strong: (p) => <strong className="font-semibold text-foreground" {...p} />,
          a: (p) => (
            <a
              className="text-bronze underline underline-offset-2 hover:text-bronze/80"
              target="_blank"
              rel="noreferrer"
              {...p}
            />
          ),
          blockquote: (p) => (
            <blockquote
              className="border-l-2 border-bronze pl-4 my-3 text-muted-foreground italic"
              {...p}
            />
          ),
          code: (p) => (
            <code className="rounded bg-muted px-1.5 py-0.5 text-[0.85em] font-mono" {...p} />
          ),
          table: (p) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm" {...p} />
            </div>
          ),
          th: (p) => (
            <th className="border border-border bg-muted px-3 py-2 text-left font-semibold" {...p} />
          ),
          td: (p) => <td className="border border-border px-3 py-2 align-top" {...p} />,
        }}
      >
        {text}
      </ReactMarkdown>
      {running && <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-bronze/70 align-middle" />}
    </div>
  );
}
