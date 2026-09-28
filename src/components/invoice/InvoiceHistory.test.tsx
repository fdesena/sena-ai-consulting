import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { InvoiceHistory } from "./InvoiceHistory";
import type { SavedInvoice } from "@/lib/invoice/schema";

const inv: SavedInvoice = {
  id: "1",
  createdAt: "2026-09-28T12:00:00Z",
  language: "en",
  number: "09282026",
  issueDate: "2026-09-28",
  dueDate: "2026-10-05",
  provider: { name: "P", taxId: "", email: "", address: "", cityState: "", zip: "" },
  payer: { name: "Cliente Exemplo LLC", address: "" },
  description: "Work",
  paymentDetails: "",
  currency: "USD",
  amount: 5300,
};

function setup(overrides: Partial<Parameters<typeof InvoiceHistory>[0]> = {}) {
  const props = {
    invoices: [inv],
    onDownload: vi.fn(),
    onDuplicate: vi.fn(),
    onDelete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  render(<InvoiceHistory {...props} />);
  return props;
}

// Vitest runs without globals here, so Testing Library's auto-cleanup never registers.
afterEach(cleanup);

describe("InvoiceHistory", () => {
  it("renders nothing helpful-looking when empty", () => {
    setup({ invoices: [] });
    expect(screen.getByText("Nenhuma invoice gerada ainda.")).toBeInTheDocument();
  });

  it("shows number, payer, amount in pt-BR and issue date", () => {
    setup();
    expect(screen.getByText("09282026")).toBeInTheDocument();
    expect(screen.getByText("Cliente Exemplo LLC")).toBeInTheDocument();
    expect(screen.getByText("USD 5.300,00")).toBeInTheDocument();
    expect(screen.getByText("28/09/2026")).toBeInTheDocument();
  });

  it("calls download and duplicate with the invoice", () => {
    const p = setup();
    fireEvent.click(screen.getByRole("button", { name: "Baixar" }));
    fireEvent.click(screen.getByRole("button", { name: "Duplicar" }));
    expect(p.onDownload).toHaveBeenCalledWith(inv);
    expect(p.onDuplicate).toHaveBeenCalledWith(inv);
  });

  it("asks for confirmation before deleting", async () => {
    const p = setup();
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(p.onDelete).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByRole("button", { name: "Excluir invoice" }));
    await waitFor(() => expect(p.onDelete).toHaveBeenCalledWith(inv));
  });

  it("does not delete when the confirmation is cancelled", async () => {
    const p = setup();
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    fireEvent.click(await screen.findByRole("button", { name: "Cancelar" }));
    expect(p.onDelete).not.toHaveBeenCalled();
  });

  it("closes the dialog after a successful delete", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    fireEvent.click(await screen.findByRole("button", { name: "Excluir invoice" }));
    await waitFor(() => expect(screen.queryByText("Excluir invoice?")).not.toBeInTheDocument());
  });

  it("keeps the dialog open and shows an error when the delete fails", async () => {
    const p = setup({ onDelete: vi.fn().mockRejectedValue(new Error("boom")) });
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    fireEvent.click(await screen.findByRole("button", { name: "Excluir invoice" }));
    expect(await screen.findByText("Não foi possível excluir a invoice.")).toBeInTheDocument();
    expect(p.onDelete).toHaveBeenCalledWith(inv);
    expect(screen.getByText("Excluir invoice?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir invoice" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeEnabled();
  });

  it("disables both dialog buttons while the delete is pending", async () => {
    let finish!: () => void;
    setup({ onDelete: vi.fn(() => new Promise<void>((r) => (finish = r))) });
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    fireEvent.click(await screen.findByRole("button", { name: "Excluir invoice" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled());
    expect(screen.getByRole("button", { name: "Excluir invoice" })).toBeDisabled();
    finish();
    await waitFor(() => expect(screen.queryByText("Excluir invoice?")).not.toBeInTheDocument());
  });

  it("clears the delete error when the dialog is cancelled and reopened", async () => {
    setup({ onDelete: vi.fn().mockRejectedValue(new Error("boom")) });
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    fireEvent.click(await screen.findByRole("button", { name: "Excluir invoice" }));
    await screen.findByText("Não foi possível excluir a invoice.");
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByText("Excluir invoice?")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    await screen.findByText("Excluir invoice?");
    expect(screen.queryByText("Não foi possível excluir a invoice.")).not.toBeInTheDocument();
  });
});
