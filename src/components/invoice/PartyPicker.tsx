import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { SavedParty } from "@/lib/invoice/parties";
import { selectClass } from "./fieldStyles";

export interface PartyPickerProps<T> {
  id: string;
  label: string;
  parties: SavedParty<T>[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  canSave: boolean;
  // Sem o handler o botão correspondente some.
  onSave?: () => Promise<void>;
  // Deve rejeitar em caso de falha.
  onDelete?: (id: string) => Promise<void>;
}

export function PartyPicker<T>({
  id,
  label,
  parties,
  selectedId,
  onSelect,
  canSave,
  onSave,
  onDelete,
}: PartyPickerProps<T>) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(value: string) {
    setSaved(false);
    setError(null);
    setConfirming(false);
    onSelect(value === "" ? null : value);
  }

  async function handleSave() {
    if (!onSave) return;
    setSaved(false);
    setError(null);
    setConfirming(false);
    setSaving(true);
    try {
      await onSave();
      setSaved(true);
    } catch {
      setError("Não foi possível salvar o cadastro.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete || selectedId === null) return;
    setSaved(false);
    setError(null);
    setDeleting(true);
    try {
      await onDelete(selectedId);
      setConfirming(false);
    } catch {
      setError("Não foi possível excluir o cadastro.");
      setConfirming(false);
    } finally {
      setDeleting(false);
    }
  }

  const busy = saving || deleting;

  return (
    <div className="space-y-2">
      <div>
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-muted-foreground">
          {label}
        </label>
        <select
          id={id}
          className={selectClass}
          value={selectedId ?? ""}
          disabled={busy}
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="">Digitar à mão</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {onSave || (onDelete && selectedId !== null) ? (
        <div className="flex flex-wrap items-center gap-1">
          {onSave ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canSave || busy}
              onClick={handleSave}
            >
              Salvar como cadastro
            </Button>
          ) : null}
          {onDelete && selectedId !== null ? (
            confirming ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={busy}
                  onClick={handleDelete}
                >
                  Confirmar exclusão
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => setConfirming(false)}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => setConfirming(true)}
              >
                Excluir cadastro
              </Button>
            )
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : saved ? (
        <p role="status" className="text-xs text-muted-foreground">
          Cadastro salvo.
        </p>
      ) : null}
    </div>
  );
}
