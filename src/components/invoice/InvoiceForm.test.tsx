import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { InvoiceForm } from "./InvoiceForm";
import {
  emptyFormValues,
  type Description,
  type Payer,
  type PaymentDetails,
  type Provider,
} from "@/lib/invoice/schema";
import type { SavedParty } from "@/lib/invoice/parties";

const initial = () => emptyFormValues("2026-09-28");

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillRequired() {
  fill("Razão social", "Acme Ltda");
  fill("Nome da empresa pagadora", "Cliente Exemplo LLC");
  fill("Descrição do serviço", "Training");
  fill("Valor da invoice", "5.300,00");
}

const acme: SavedParty<Provider> = {
  id: "prov-1",
  kind: "provider",
  label: "Acme Serviços Ltda",
  data: {
    name: "Acme Serviços Ltda",
    taxId: "12.345.678/0001-90",
    email: "contato@example.com",
    address: "Rua Exemplo, 100",
    cityState: "Cidade, UF",
    zip: "12345-000",
  },
  createdAt: "2026-09-01T00:00:00Z",
};

const cliente: SavedParty<Payer> = {
  id: "pay-1",
  kind: "payer",
  label: "Cliente Exemplo LLC",
  data: { name: "Cliente Exemplo LLC", address: "100 Example St, MA, 02100" },
  createdAt: "2026-09-01T00:00:00Z",
};

const modelo: SavedParty<Description> = {
  id: "desc-1",
  kind: "description",
  label: "Consultoria mensal",
  data: { text: "Consultoria mensal\n\n- item A\n- item B" },
  createdAt: "2026-09-01T00:00:00Z",
};

const banco: SavedParty<PaymentDetails> = {
  id: "bank-1",
  kind: "payment",
  label: "Bank Account Details for Payment",
  data: {
    text: "Bank Account Details for Payment:\n\n- Bank: Acme Bank\n- Routing number: 000000000\n- Account number: 000000000000",
  },
  createdAt: "2026-09-01T00:00:00Z",
};

const banco2: SavedParty<PaymentDetails> = {
  id: "bank-2",
  kind: "payment",
  label: "Outra conta",
  data: { text: "Outra conta\n- Bank: Example Bank" },
  createdAt: "2026-09-02T00:00:00Z",
};

// Vitest runs without globals here, so Testing Library's auto-cleanup never registers.
afterEach(cleanup);

describe("InvoiceForm", () => {
  it("shows required-field errors and does not submit an empty form", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<InvoiceForm initial={initial()} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Gerar PDF" }));
    expect(await screen.findByText("Informe a razão social")).toBeInTheDocument();
    expect(screen.getByText("Informe um valor maior que zero")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits parsed data including the chosen language and currency", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<InvoiceForm initial={initial()} onSubmit={onSubmit} />);
    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: "Inglês" }));
    fireEvent.change(screen.getByLabelText("Moeda"), { target: { value: "EUR" } });
    fireEvent.click(screen.getByRole("button", { name: "Gerar PDF" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      language: "en",
      currency: "EUR",
      amount: 5300,
      number: "09282026",
      issueDate: "2026-09-28",
      dueDate: "2026-10-05",
      provider: { name: "Acme Ltda" },
      payer: { name: "Cliente Exemplo LLC" },
    });
  });

  it("submits the provider CNPJ typed in the form", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<InvoiceForm initial={initial()} onSubmit={onSubmit} />);
    fillRequired();
    fill("CNPJ", "12.345.678/0001-90");
    expect(screen.getByLabelText("CNPJ")).toHaveAttribute("id", "provider-tax-id");
    fireEvent.click(screen.getByRole("button", { name: "Gerar PDF" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].provider).toMatchObject({ taxId: "12.345.678/0001-90" });
  });

  it("moves the default due date and number with the issue date", () => {
    render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} />);
    fill("Data de emissão", "2026-12-30");
    expect(screen.getByLabelText("Data de validade")).toHaveValue("2027-01-06");
    expect(screen.getByLabelText("Número da invoice")).toHaveValue("12302026");
  });

  it("limits the invoice number length", () => {
    render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText("Número da invoice")).toHaveAttribute("maxLength", "40");
  });

  it("keeps a manually edited due date and number when the issue date changes", () => {
    render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} />);
    fill("Número da invoice", "INV-7");
    fill("Data de validade", "2026-11-01");
    fill("Data de emissão", "2026-09-29");
    expect(screen.getByLabelText("Data de validade")).toHaveValue("2026-11-01");
    expect(screen.getByLabelText("Número da invoice")).toHaveValue("INV-7");
  });

  it("shows the error prop and disables the button while submitting", async () => {
    let finish!: () => void;
    const onSubmit = vi.fn(() => new Promise<void>((r) => (finish = r)));
    render(<InvoiceForm initial={initial()} onSubmit={onSubmit} error="Falhou ao salvar" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Falhou ao salvar");
    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: "Gerar PDF" }));
    expect(await screen.findByRole("button", { name: "Gerando…" })).toBeDisabled();
    finish();
    expect(await screen.findByRole("button", { name: "Gerar PDF" })).toBeEnabled();
  });

  it("shows an error and re-enables the button when onSubmit rejects", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("boom"));
    render(<InvoiceForm initial={initial()} onSubmit={onSubmit} />);
    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: "Gerar PDF" }));
    expect(await screen.findByText("Não foi possível gerar o PDF.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gerar PDF" })).toBeEnabled();
  });

  it("clears the submit error on the next attempt", async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValue(undefined);
    render(<InvoiceForm initial={initial()} onSubmit={onSubmit} />);
    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: "Gerar PDF" }));
    await screen.findByText("Não foi possível gerar o PDF.");
    fireEvent.click(screen.getByRole("button", { name: "Gerar PDF" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.queryByText("Não foi possível gerar o PDF.")).not.toBeInTheDocument(),
    );
  });

  it("shows only the error prop when both it and a submit error exist", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("boom"));
    render(<InvoiceForm initial={initial()} onSubmit={onSubmit} error="Falhou ao salvar" />);
    fillRequired();
    fireEvent.click(screen.getByRole("button", { name: "Gerar PDF" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Gerar PDF" })).toBeEnabled());
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByRole("alert")).toHaveTextContent("Falhou ao salvar");
  });

  describe("saved parties", () => {
    it("fills the provider section when a saved provider is chosen", () => {
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} providers={[acme]} />);
      fireEvent.change(screen.getByLabelText("Prestador salvo"), { target: { value: "prov-1" } });
      expect(screen.getByLabelText("Razão social")).toHaveValue("Acme Serviços Ltda");
      expect(screen.getByLabelText("CNPJ")).toHaveValue("12.345.678/0001-90");
      expect(screen.getByLabelText("E-mail")).toHaveValue("contato@example.com");
      expect(screen.getByLabelText("Endereço")).toHaveValue("Rua Exemplo, 100");
      expect(screen.getByLabelText("Cidade e Estado")).toHaveValue("Cidade, UF");
      expect(screen.getByLabelText("CEP")).toHaveValue("12345-000");
    });

    it("defaults a missing CNPJ to empty for older saved providers", () => {
      const { taxId: _taxId, ...legacyData } = acme.data;
      const legacy = { ...acme, data: legacyData as Provider };
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} providers={[legacy]} />);
      fireEvent.change(screen.getByLabelText("Prestador salvo"), { target: { value: "prov-1" } });
      expect(screen.getByLabelText("CNPJ")).toHaveValue("");
    });

    it("clears the provider section on 'Digitar à mão'", () => {
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} providers={[acme]} />);
      fireEvent.change(screen.getByLabelText("Prestador salvo"), { target: { value: "prov-1" } });
      fireEvent.change(screen.getByLabelText("Prestador salvo"), { target: { value: "" } });
      expect(screen.getByLabelText("Prestador salvo")).toHaveValue("");
      expect(screen.getByLabelText("Razão social")).toHaveValue("");
      expect(screen.getByLabelText("CNPJ")).toHaveValue("");
      expect(screen.getByLabelText("CEP")).toHaveValue("");
    });

    it("keeps the selection when the fields are edited afterwards", () => {
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} providers={[acme]} />);
      fireEvent.change(screen.getByLabelText("Prestador salvo"), { target: { value: "prov-1" } });
      fill("Razão social", "Acme Serviços Ltda ME");
      expect(screen.getByLabelText("Prestador salvo")).toHaveValue("prov-1");
    });

    it("starts with the initial provider selected", () => {
      render(
        <InvoiceForm
          initial={initial()}
          onSubmit={vi.fn()}
          providers={[acme]}
          initialProviderId="prov-1"
        />,
      );
      expect(screen.getByLabelText("Prestador salvo")).toHaveValue("prov-1");
      expect(screen.getByLabelText("Pagador salvo")).toHaveValue("");
    });

    it("fills the payer section when a saved payer is chosen", () => {
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} payers={[cliente]} />);
      fireEvent.change(screen.getByLabelText("Pagador salvo"), { target: { value: "pay-1" } });
      expect(screen.getByLabelText("Nome da empresa pagadora")).toHaveValue("Cliente Exemplo LLC");
      expect(screen.getByLabelText("Endereço completo")).toHaveValue("100 Example St, MA, 02100");
      fireEvent.change(screen.getByLabelText("Pagador salvo"), { target: { value: "" } });
      expect(screen.getByLabelText("Nome da empresa pagadora")).toHaveValue("");
      expect(screen.getByLabelText("Endereço completo")).toHaveValue("");
    });

    it("saves the current provider section and selects the returned party", async () => {
      const onSaveProvider = vi.fn().mockResolvedValue(acme);
      render(
        <InvoiceForm
          initial={initial()}
          onSubmit={vi.fn()}
          providers={[acme]}
          onSaveProvider={onSaveProvider}
        />,
      );
      fill("Razão social", "Acme Serviços Ltda");
      fill("CNPJ", "12.345.678/0001-90");
      fireEvent.click(screen.getAllByRole("button", { name: "Salvar como cadastro" })[0]);
      await waitFor(() => expect(onSaveProvider).toHaveBeenCalledTimes(1));
      expect(onSaveProvider).toHaveBeenCalledWith({
        name: "Acme Serviços Ltda",
        taxId: "12.345.678/0001-90",
        email: "",
        address: "",
        cityState: "",
        zip: "",
      });
      await waitFor(() => expect(screen.getByLabelText("Prestador salvo")).toHaveValue("prov-1"));
      expect(await screen.findByRole("status")).toHaveTextContent("Cadastro salvo.");
    });

    it("disables saving a provider or payer while the name is empty", () => {
      render(
        <InvoiceForm
          initial={initial()}
          onSubmit={vi.fn()}
          onSaveProvider={vi.fn()}
          onSavePayer={vi.fn()}
        />,
      );
      for (const button of screen.getAllByRole("button", { name: "Salvar como cadastro" })) {
        expect(button).toBeDisabled();
      }
    });

    it("saves the current payer section and selects the returned party", async () => {
      const onSavePayer = vi.fn().mockResolvedValue(cliente);
      render(
        <InvoiceForm
          initial={initial()}
          onSubmit={vi.fn()}
          payers={[cliente]}
          onSavePayer={onSavePayer}
        />,
      );
      fill("Nome da empresa pagadora", "Cliente Exemplo LLC");
      fill("Endereço completo", "100 Example St, MA, 02100");
      fireEvent.click(screen.getByRole("button", { name: "Salvar como cadastro" }));
      await waitFor(() =>
        expect(onSavePayer).toHaveBeenCalledWith({
          name: "Cliente Exemplo LLC",
          address: "100 Example St, MA, 02100",
        }),
      );
      await waitFor(() => expect(screen.getByLabelText("Pagador salvo")).toHaveValue("pay-1"));
    });

    it("deletes the selected provider, deselects it and keeps the fields", async () => {
      const onDeleteParty = vi.fn().mockResolvedValue(undefined);
      render(
        <InvoiceForm
          initial={initial()}
          onSubmit={vi.fn()}
          providers={[acme]}
          initialProviderId="prov-1"
          onDeleteParty={onDeleteParty}
        />,
      );
      fireEvent.change(screen.getByLabelText("Prestador salvo"), { target: { value: "prov-1" } });
      fireEvent.click(screen.getByRole("button", { name: "Excluir cadastro" }));
      fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
      await waitFor(() => expect(onDeleteParty).toHaveBeenCalledWith("provider", "prov-1"));
      await waitFor(() => expect(screen.getByLabelText("Prestador salvo")).toHaveValue(""));
      expect(screen.getByLabelText("Razão social")).toHaveValue("Acme Serviços Ltda");
    });

    it("deletes the selected payer through onDeleteParty", async () => {
      const onDeleteParty = vi.fn().mockResolvedValue(undefined);
      render(
        <InvoiceForm
          initial={initial()}
          onSubmit={vi.fn()}
          payers={[cliente]}
          initialPayerId="pay-1"
          onDeleteParty={onDeleteParty}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Excluir cadastro" }));
      fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
      await waitFor(() => expect(onDeleteParty).toHaveBeenCalledWith("payer", "pay-1"));
    });

    it("keeps the selection and shows an alert when deleting fails", async () => {
      const onDeleteParty = vi.fn().mockRejectedValue(new Error("boom"));
      render(
        <InvoiceForm
          initial={initial()}
          onSubmit={vi.fn()}
          providers={[acme]}
          initialProviderId="prov-1"
          onDeleteParty={onDeleteParty}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Excluir cadastro" }));
      fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Não foi possível excluir o cadastro.",
      );
      expect(screen.getByLabelText("Prestador salvo")).toHaveValue("prov-1");
    });

    it("hides save and delete buttons without handlers", () => {
      render(
        <InvoiceForm
          initial={initial()}
          onSubmit={vi.fn()}
          providers={[acme]}
          initialProviderId="prov-1"
        />,
      );
      expect(
        screen.queryByRole("button", { name: "Salvar como cadastro" }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Excluir cadastro" })).not.toBeInTheDocument();
    });
  });

  describe("saved descriptions", () => {
    it("fills the textarea when a saved description is chosen", () => {
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} descriptions={[modelo]} />);
      fireEvent.change(screen.getByLabelText("Descrição salva"), { target: { value: "desc-1" } });
      expect(screen.getByLabelText("Descrição do serviço")).toHaveValue(modelo.data.text);
    });

    it("starts with no description selected", () => {
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} descriptions={[modelo]} />);
      expect(screen.getByLabelText("Descrição salva")).toHaveValue("");
    });

    it("clears the textarea on 'Digitar à mão'", () => {
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} descriptions={[modelo]} />);
      fireEvent.change(screen.getByLabelText("Descrição salva"), { target: { value: "desc-1" } });
      fireEvent.change(screen.getByLabelText("Descrição salva"), { target: { value: "" } });
      expect(screen.getByLabelText("Descrição salva")).toHaveValue("");
      expect(screen.getByLabelText("Descrição do serviço")).toHaveValue("");
    });

    it("keeps the selection when the text is edited afterwards", () => {
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} descriptions={[modelo]} />);
      fireEvent.change(screen.getByLabelText("Descrição salva"), { target: { value: "desc-1" } });
      fill("Descrição do serviço", "Outro texto");
      expect(screen.getByLabelText("Descrição salva")).toHaveValue("desc-1");
    });

    it("saves the current text and selects the returned description", async () => {
      const onSaveDescription = vi.fn().mockResolvedValue(modelo);
      render(
        <InvoiceForm
          initial={initial()}
          onSubmit={vi.fn()}
          descriptions={[modelo]}
          onSaveDescription={onSaveDescription}
        />,
      );
      fill("Descrição do serviço", "Consultoria mensal\n\n- item A");
      fireEvent.click(screen.getByRole("button", { name: "Salvar como cadastro" }));
      await waitFor(() =>
        expect(onSaveDescription).toHaveBeenCalledWith({ text: "Consultoria mensal\n\n- item A" }),
      );
      await waitFor(() => expect(screen.getByLabelText("Descrição salva")).toHaveValue("desc-1"));
    });

    it("disables saving while the text is empty or blank", () => {
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} onSaveDescription={vi.fn()} />);
      const button = screen.getByRole("button", { name: "Salvar como cadastro" });
      expect(button).toBeDisabled();
      fill("Descrição do serviço", "  \n ");
      expect(button).toBeDisabled();
      fill("Descrição do serviço", "Consultoria mensal");
      expect(button).toBeEnabled();
    });

    it("deletes the selected description, deselects it and keeps the text", async () => {
      const onDeleteParty = vi.fn().mockResolvedValue(undefined);
      render(
        <InvoiceForm
          initial={initial()}
          onSubmit={vi.fn()}
          descriptions={[modelo]}
          onDeleteParty={onDeleteParty}
        />,
      );
      fireEvent.change(screen.getByLabelText("Descrição salva"), { target: { value: "desc-1" } });
      fireEvent.click(screen.getByRole("button", { name: "Excluir cadastro" }));
      fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
      await waitFor(() => expect(onDeleteParty).toHaveBeenCalledWith("description", "desc-1"));
      await waitFor(() => expect(screen.getByLabelText("Descrição salva")).toHaveValue(""));
      expect(screen.getByLabelText("Descrição do serviço")).toHaveValue(modelo.data.text);
    });

    it("hides the save button without onSaveDescription", () => {
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} descriptions={[modelo]} />);
      expect(
        screen.queryByRole("button", { name: "Salvar como cadastro" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("payment details", () => {
    it("shows the picker and an empty textarea by default", () => {
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} />);
      expect(screen.getByLabelText("Dados salvos")).toHaveAttribute("id", "payment-party");
      const textarea = screen.getByLabelText("Dados para pagamento");
      expect(textarea).toHaveAttribute("id", "payment-details");
      expect(textarea).toHaveAttribute("rows", "8");
      expect(textarea).toHaveValue("");
    });

    it("places the section after the currency and amount, before the submit button", () => {
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} />);
      const amount = screen.getByLabelText("Valor da invoice");
      const payment = screen.getByLabelText("Dados para pagamento");
      const submit = screen.getByRole("button", { name: "Gerar PDF" });
      expect(
        amount.compareDocumentPosition(payment) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        payment.compareDocumentPosition(submit) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("fills the textarea when a saved option is chosen", () => {
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} payments={[banco, banco2]} />);
      fireEvent.change(screen.getByLabelText("Dados salvos"), { target: { value: "bank-2" } });
      expect(screen.getByLabelText("Dados para pagamento")).toHaveValue(banco2.data.text);
    });

    it("clears the textarea on 'Digitar à mão'", () => {
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} payments={[banco]} />);
      fireEvent.change(screen.getByLabelText("Dados salvos"), { target: { value: "bank-1" } });
      fireEvent.change(screen.getByLabelText("Dados salvos"), { target: { value: "" } });
      expect(screen.getByLabelText("Dados salvos")).toHaveValue("");
      expect(screen.getByLabelText("Dados para pagamento")).toHaveValue("");
    });

    it("keeps the selection when the text is edited afterwards", () => {
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} payments={[banco]} />);
      fireEvent.change(screen.getByLabelText("Dados salvos"), { target: { value: "bank-1" } });
      fill("Dados para pagamento", "Outro texto");
      expect(screen.getByLabelText("Dados salvos")).toHaveValue("bank-1");
    });

    it("starts with the initial option selected and its text filled in", () => {
      render(
        <InvoiceForm
          initial={{ ...initial(), paymentDetails: banco.data.text }}
          onSubmit={vi.fn()}
          payments={[banco, banco2]}
          initialPaymentId="bank-1"
        />,
      );
      expect(screen.getByLabelText("Dados salvos")).toHaveValue("bank-1");
      expect(screen.getByLabelText("Dados para pagamento")).toHaveValue(banco.data.text);
    });

    it("saves the current text and selects the returned option", async () => {
      const onSavePayment = vi.fn().mockResolvedValue(banco2);
      render(
        <InvoiceForm
          initial={initial()}
          onSubmit={vi.fn()}
          payments={[banco, banco2]}
          onSavePayment={onSavePayment}
        />,
      );
      fill("Dados para pagamento", "Outra conta\n- Bank: Example Bank");
      fireEvent.click(screen.getByRole("button", { name: "Salvar como cadastro" }));
      await waitFor(() =>
        expect(onSavePayment).toHaveBeenCalledWith({ text: "Outra conta\n- Bank: Example Bank" }),
      );
      await waitFor(() => expect(screen.getByLabelText("Dados salvos")).toHaveValue("bank-2"));
    });

    it("disables saving while the text is blank", () => {
      render(<InvoiceForm initial={initial()} onSubmit={vi.fn()} onSavePayment={vi.fn()} />);
      const button = screen.getByRole("button", { name: "Salvar como cadastro" });
      expect(button).toBeDisabled();
      fill("Dados para pagamento", "  \n ");
      expect(button).toBeDisabled();
      fill("Dados para pagamento", "Acme Bank");
      expect(button).toBeEnabled();
    });

    it("deletes the selected option, deselects it and keeps the text", async () => {
      const onDeleteParty = vi.fn().mockResolvedValue(undefined);
      render(
        <InvoiceForm
          initial={{ ...initial(), paymentDetails: banco.data.text }}
          onSubmit={vi.fn()}
          payments={[banco]}
          initialPaymentId="bank-1"
          onDeleteParty={onDeleteParty}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Excluir cadastro" }));
      fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
      await waitFor(() => expect(onDeleteParty).toHaveBeenCalledWith("payment", "bank-1"));
      await waitFor(() => expect(screen.getByLabelText("Dados salvos")).toHaveValue(""));
      expect(screen.getByLabelText("Dados para pagamento")).toHaveValue(banco.data.text);
    });

    it("includes the trimmed payment details in the submitted data", async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<InvoiceForm initial={initial()} onSubmit={onSubmit} />);
      fillRequired();
      fill("Dados para pagamento", "  Acme Bank\nRouting: 000000000\n\n");
      fireEvent.click(screen.getByRole("button", { name: "Gerar PDF" }));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit.mock.calls[0][0].paymentDetails).toBe("Acme Bank\nRouting: 000000000");
    });

    it("submits with the field empty", async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<InvoiceForm initial={initial()} onSubmit={onSubmit} />);
      fillRequired();
      fireEvent.click(screen.getByRole("button", { name: "Gerar PDF" }));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit.mock.calls[0][0].paymentDetails).toBe("");
    });
  });
});
