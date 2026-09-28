import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PartyPicker, type PartyPickerProps } from "./PartyPicker";
import type { SavedParty } from "@/lib/invoice/parties";

type Data = { name: string };

const parties: SavedParty<Data>[] = [
  {
    id: "p1",
    kind: "provider",
    label: "Acme Serviços Ltda",
    data: { name: "Acme Serviços Ltda" },
    createdAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "p2",
    kind: "provider",
    label: "Beta Consultoria Ltda",
    data: { name: "Beta Consultoria Ltda" },
    createdAt: "2026-09-02T00:00:00Z",
  },
];

function setup(overrides: Partial<PartyPickerProps<Data>> = {}) {
  const props: PartyPickerProps<Data> = {
    id: "provider-party",
    label: "Prestador salvo",
    parties,
    selectedId: null,
    onSelect: vi.fn(),
    canSave: true,
    onSave: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  render(<PartyPicker {...props} />);
  return props;
}

// Vitest runs without globals here, so Testing Library's auto-cleanup never registers.
afterEach(cleanup);

describe("PartyPicker", () => {
  it("lists the manual option followed by one option per party", () => {
    setup();
    const select = screen.getByLabelText("Prestador salvo");
    expect(select).toHaveAttribute("id", "provider-party");
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.textContent);
    expect(options).toEqual(["Digitar à mão", "Acme Serviços Ltda", "Beta Consultoria Ltda"]);
  });

  it("reflects the selected id", () => {
    setup({ selectedId: "p2" });
    expect(screen.getByLabelText("Prestador salvo")).toHaveValue("p2");
  });

  it("calls onSelect with the id, and with null for the manual option", () => {
    const { onSelect } = setup({ selectedId: "p1" });
    fireEvent.change(screen.getByLabelText("Prestador salvo"), { target: { value: "p2" } });
    expect(onSelect).toHaveBeenLastCalledWith("p2");
    fireEvent.change(screen.getByLabelText("Prestador salvo"), { target: { value: "" } });
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it("disables saving when canSave is false", () => {
    setup({ canSave: false });
    expect(screen.getByRole("button", { name: "Salvar como cadastro" })).toBeDisabled();
  });

  it("saves and shows the status message", async () => {
    const { onSave } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Salvar como cadastro" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Cadastro salvo.");
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("disables the save button while saving", async () => {
    let finish!: () => void;
    setup({ onSave: () => new Promise<void>((r) => (finish = r)) });
    fireEvent.click(screen.getByRole("button", { name: "Salvar como cadastro" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Salvar como cadastro" })).toBeDisabled(),
    );
    finish();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Salvar como cadastro" })).toBeEnabled(),
    );
  });

  it("shows an alert and handles the rejection when saving fails", async () => {
    setup({ onSave: vi.fn().mockRejectedValue(new Error("boom")) });
    fireEvent.click(screen.getByRole("button", { name: "Salvar como cadastro" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível salvar o cadastro.",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar como cadastro" })).toBeEnabled();
  });

  it("clears the status when the selection changes", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Salvar como cadastro" }));
    await screen.findByRole("status");
    fireEvent.change(screen.getByLabelText("Prestador salvo"), { target: { value: "p1" } });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("hides the delete button without a selection", () => {
    setup();
    expect(screen.queryByRole("button", { name: "Excluir cadastro" })).not.toBeInTheDocument();
  });

  it("asks for confirmation before deleting", async () => {
    const { onDelete } = setup({ selectedId: "p1" });
    fireEvent.click(screen.getByRole("button", { name: "Excluir cadastro" }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Excluir cadastro" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith("p1"));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("cancels the deletion", () => {
    const { onDelete } = setup({ selectedId: "p1" });
    fireEvent.click(screen.getByRole("button", { name: "Excluir cadastro" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByRole("button", { name: "Excluir cadastro" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirmar exclusão" })).not.toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("shows an alert and handles the rejection when deleting fails", async () => {
    setup({ selectedId: "p1", onDelete: vi.fn().mockRejectedValue(new Error("boom")) });
    fireEvent.click(screen.getByRole("button", { name: "Excluir cadastro" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível excluir o cadastro.",
    );
    expect(screen.getByRole("button", { name: "Excluir cadastro" })).toBeInTheDocument();
  });

  it("hides the save and delete buttons when no handlers are given", () => {
    setup({ selectedId: "p1", onSave: undefined, onDelete: undefined });
    expect(screen.queryByRole("button", { name: "Salvar como cadastro" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Excluir cadastro" })).not.toBeInTheDocument();
  });

  it("drops the delete confirmation when saving starts", async () => {
    setup({ selectedId: "p1" });
    fireEvent.click(screen.getByRole("button", { name: "Excluir cadastro" }));
    expect(screen.getByRole("button", { name: "Confirmar exclusão" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Salvar como cadastro" }));
    expect(screen.queryByRole("button", { name: "Confirmar exclusão" })).not.toBeInTheDocument();
    await screen.findByRole("status");
  });

  it("disables the select while a save is pending", async () => {
    let finish!: () => void;
    setup({ onSave: () => new Promise<void>((r) => (finish = r)) });
    fireEvent.click(screen.getByRole("button", { name: "Salvar como cadastro" }));
    await waitFor(() => expect(screen.getByLabelText("Prestador salvo")).toBeDisabled());
    finish();
    await waitFor(() => expect(screen.getByLabelText("Prestador salvo")).toBeEnabled());
  });

  it("clears the status message when the next save starts", async () => {
    let finish!: () => void;
    const onSave = vi
      .fn<() => Promise<void>>()
      .mockResolvedValueOnce(undefined)
      .mockImplementationOnce(() => new Promise<void>((r) => (finish = r)));
    setup({ onSave });
    fireEvent.click(screen.getByRole("button", { name: "Salvar como cadastro" }));
    await screen.findByRole("status");
    fireEvent.click(screen.getByRole("button", { name: "Salvar como cadastro" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    finish();
    expect(await screen.findByRole("status")).toHaveTextContent("Cadastro salvo.");
  });
});
