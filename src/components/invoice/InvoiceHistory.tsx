import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatAmount, formatDate } from "@/lib/invoice/format";
import type { SavedInvoice } from "@/lib/invoice/schema";

interface Props {
  invoices: SavedInvoice[];
  onDownload: (inv: SavedInvoice) => void;
  onDuplicate: (inv: SavedInvoice) => void;
  onDelete: (inv: SavedInvoice) => Promise<void>;
}

export function InvoiceHistory({ invoices, onDownload, onDuplicate, onDelete }: Props) {
  const [pending, setPending] = useState<SavedInvoice | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  function openConfirm(inv: SavedInvoice) {
    setDeleteError(false);
    setPending(inv);
  }

  function closeConfirm() {
    setDeleteError(false);
    setPending(null);
  }

  async function confirmDelete() {
    if (!pending) return;
    setDeleting(true);
    setDeleteError(false);
    try {
      await onDelete(pending);
      setPending(null);
    } catch {
      setDeleteError(true);
    } finally {
      setDeleting(false);
    }
  }

  if (invoices.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma invoice gerada ainda.</p>;
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {invoices.map((inv) => (
          <li
            key={inv.id}
            className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{inv.payer.name}</p>
              <p className="text-xs text-muted-foreground">
                <span>{inv.number}</span> · <span>{formatDate(inv.issueDate, "pt")}</span> ·{" "}
                <span>{`${inv.currency} ${formatAmount(inv.amount, "pt")}`}</span>
              </p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => onDownload(inv)}>
                Baixar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDuplicate(inv)}>
                Duplicar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openConfirm(inv)}>
                Excluir
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => !open && !deleting && closeConfirm()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              A invoice {pending?.number} sai do histórico. PDFs já baixados não são afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? (
            <p role="alert" className="text-sm text-destructive">
              Não foi possível excluir a invoice.
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
            >
              Excluir invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
