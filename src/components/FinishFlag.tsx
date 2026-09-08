import { cn } from "@/lib/utils";

/**
 * Ícone quadriculado (bandeira de chegada) — o mesmo detalhe do terminal do
 * "L" no símbolo da Sena Labs, reaproveitado como selo decorativo.
 */
export default function FinishFlag({ className }: { className?: string }) {
  return (
    <span className={cn("grid h-6 w-6 shrink-0 grid-cols-2 bg-primary", className)}>
      <i className="bg-[var(--paper)]" />
      <i className="bg-primary" />
      <i className="bg-primary" />
      <i className="bg-[var(--paper)]" />
    </span>
  );
}
