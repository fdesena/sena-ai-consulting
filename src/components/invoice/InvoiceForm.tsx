import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addDays, suggestNumber, type Language } from "@/lib/invoice/format";
import type { PartyKind, SavedParty } from "@/lib/invoice/parties";
import {
  CURRENCIES,
  descriptionLabel,
  parseInvoiceForm,
  type Currency,
  type Description,
  type InvoiceData,
  type InvoiceFormValues,
  type Payer,
  type PaymentDetails,
  type Provider,
} from "@/lib/invoice/schema";
import { selectClass } from "./fieldStyles";
import { PartyPicker } from "./PartyPicker";

interface Props {
  initial: InvoiceFormValues;
  onSubmit: (data: InvoiceData) => Promise<void>;
  error?: string | null;
  providers?: SavedParty<Provider>[];
  payers?: SavedParty<Payer>[];
  initialProviderId?: string | null;
  initialPayerId?: string | null;
  descriptions?: SavedParty<Description>[];
  initialDescriptionId?: string | null;
  onSaveProvider?: (data: Provider) => Promise<SavedParty<Provider>>;
  onSavePayer?: (data: Payer) => Promise<SavedParty<Payer>>;
  onSaveDescription?: (data: Description) => Promise<SavedParty<Description>>;
  payments?: SavedParty<PaymentDetails>[];
  initialPaymentId?: string | null;
  onSavePayment?: (data: PaymentDetails) => Promise<SavedParty<PaymentDetails>>;
  onDeleteParty?: (kind: PartyKind, id: string) => Promise<void>;
}

const EMPTY_PROVIDER: Provider = {
  name: "",
  taxId: "",
  email: "",
  address: "",
  cityState: "",
  zip: "",
};
const EMPTY_PAYER: Payer = { name: "", address: "" };
const NO_PROVIDERS: SavedParty<Provider>[] = [];
const NO_PAYERS: SavedParty<Payer>[] = [];
const NO_DESCRIPTIONS: SavedParty<Description>[] = [];
const NO_PAYMENTS: SavedParty<PaymentDetails>[] = [];

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function InvoiceForm({
  initial,
  onSubmit,
  error,
  providers = NO_PROVIDERS,
  payers = NO_PAYERS,
  initialProviderId = null,
  initialPayerId = null,
  descriptions = NO_DESCRIPTIONS,
  initialDescriptionId = null,
  onSaveProvider,
  onSavePayer,
  onSaveDescription,
  payments = NO_PAYMENTS,
  initialPaymentId = null,
  onSavePayment,
  onDeleteParty,
}: Props) {
  const [values, setValues] = useState<InvoiceFormValues>(initial);
  const [providerId, setProviderId] = useState<string | null>(initialProviderId);
  const [payerId, setPayerId] = useState<string | null>(initialPayerId);
  const [descriptionId, setDescriptionId] = useState<string | null>(initialDescriptionId);
  const [paymentId, setPaymentId] = useState<string | null>(initialPaymentId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = <K extends keyof InvoiceFormValues>(key: K, value: InvoiceFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));
  const setProvider = (key: keyof Provider, value: string) =>
    setValues((v) => ({ ...v, provider: { ...v.provider, [key]: value } }));
  const setPayer = (key: keyof Payer, value: string) =>
    setValues((v) => ({ ...v, payer: { ...v.payer, [key]: value } }));

  function selectProvider(id: string | null) {
    const party = id === null ? undefined : providers.find((p) => p.id === id);
    setProviderId(party?.id ?? null);
    // Cadastros antigos podem não ter taxId.
    setValues((v) => ({
      ...v,
      provider: party ? { ...EMPTY_PROVIDER, ...party.data } : { ...EMPTY_PROVIDER },
    }));
  }

  function selectPayer(id: string | null) {
    const party = id === null ? undefined : payers.find((p) => p.id === id);
    setPayerId(party?.id ?? null);
    setValues((v) => ({
      ...v,
      payer: party ? { ...EMPTY_PAYER, ...party.data } : { ...EMPTY_PAYER },
    }));
  }

  function selectDescription(id: string | null) {
    const party = id === null ? undefined : descriptions.find((d) => d.id === id);
    setDescriptionId(party?.id ?? null);
    setField("description", party?.data.text ?? "");
  }

  function selectPayment(id: string | null) {
    const party = id === null ? undefined : payments.find((p) => p.id === id);
    setPaymentId(party?.id ?? null);
    setField("paymentDetails", party?.data.text ?? "");
  }

  async function saveProvider() {
    if (!onSaveProvider) return;
    const saved = await onSaveProvider(values.provider);
    setProviderId(saved.id);
  }

  async function savePayer() {
    if (!onSavePayer) return;
    const saved = await onSavePayer(values.payer);
    setPayerId(saved.id);
  }

  async function saveDescription() {
    if (!onSaveDescription) return;
    const saved = await onSaveDescription({ text: values.description });
    setDescriptionId(saved.id);
  }

  async function savePayment() {
    if (!onSavePayment) return;
    const saved = await onSavePayment({ text: values.paymentDetails });
    setPaymentId(saved.id);
  }

  async function deletePayment(id: string) {
    await onDeleteParty?.("payment", id);
    setPaymentId((current) => (current === id ? null : current));
  }

  async function deleteDescription(id: string) {
    await onDeleteParty?.("description", id);
    setDescriptionId((current) => (current === id ? null : current));
  }

  async function deleteProvider(id: string) {
    await onDeleteParty?.("provider", id);
    setProviderId((current) => (current === id ? null : current));
  }

  async function deletePayer(id: string) {
    await onDeleteParty?.("payer", id);
    setPayerId((current) => (current === id ? null : current));
  }

  // Número e validade só acompanham a emissão enquanto ainda estão no padrão.
  function setIssueDate(next: string) {
    setValues((v) => ({
      ...v,
      issueDate: next,
      dueDate: v.dueDate === addDays(v.issueDate, 7) ? addDays(next, 7) : v.dueDate,
      number: v.number === suggestNumber(v.issueDate) ? suggestNumber(next) : v.number,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseInvoiceForm(values);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    setSubmitError(null);
    setBusy(true);
    try {
      await onSubmit(parsed.data);
    } catch {
      setSubmitError("Não foi possível gerar o PDF.");
    } finally {
      setBusy(false);
    }
  }

  const languages: { value: Language; label: string }[] = [
    { value: "pt", label: "Português" },
    { value: "en", label: "Inglês" },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Idioma da invoice</span>
        <div className="inline-flex rounded-full bg-muted p-1">
          {languages.map((l) => (
            <button
              key={l.value}
              type="button"
              aria-pressed={values.language === l.value}
              onClick={() => setField("language", l.value)}
              className="rounded-full px-4 py-1 text-sm transition-colors aria-pressed:bg-foreground aria-pressed:text-background"
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <Section title="Prestador">
        <PartyPicker
          id="provider-party"
          label="Prestador salvo"
          parties={providers}
          selectedId={providerId}
          onSelect={selectProvider}
          canSave={values.provider.name.trim() !== ""}
          onSave={onSaveProvider ? saveProvider : undefined}
          onDelete={onDeleteParty ? deleteProvider : undefined}
        />
        <Field id="provider-name" label="Razão social" error={errors["provider.name"]}>
          <Input
            id="provider-name"
            value={values.provider.name}
            onChange={(e) => setProvider("name", e.target.value)}
          />
        </Field>
        <Field id="provider-tax-id" label="CNPJ">
          <Input
            id="provider-tax-id"
            value={values.provider.taxId}
            onChange={(e) => setProvider("taxId", e.target.value)}
          />
        </Field>
        <Field id="provider-email" label="E-mail" error={errors["provider.email"]}>
          <Input
            id="provider-email"
            type="email"
            value={values.provider.email}
            onChange={(e) => setProvider("email", e.target.value)}
          />
        </Field>
        <Field id="provider-address" label="Endereço">
          <Input
            id="provider-address"
            value={values.provider.address}
            onChange={(e) => setProvider("address", e.target.value)}
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-[1fr_180px]">
          <Field id="provider-city" label="Cidade e Estado">
            <Input
              id="provider-city"
              value={values.provider.cityState}
              onChange={(e) => setProvider("cityState", e.target.value)}
            />
          </Field>
          <Field id="provider-zip" label="CEP">
            <Input
              id="provider-zip"
              value={values.provider.zip}
              onChange={(e) => setProvider("zip", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Pagador">
        <PartyPicker
          id="payer-party"
          label="Pagador salvo"
          parties={payers}
          selectedId={payerId}
          onSelect={selectPayer}
          canSave={values.payer.name.trim() !== ""}
          onSave={onSavePayer ? savePayer : undefined}
          onDelete={onDeleteParty ? deletePayer : undefined}
        />
        <Field id="payer-name" label="Nome da empresa pagadora" error={errors["payer.name"]}>
          <Input
            id="payer-name"
            value={values.payer.name}
            onChange={(e) => setPayer("name", e.target.value)}
          />
        </Field>
        <Field id="payer-address" label="Endereço completo">
          <Input
            id="payer-address"
            value={values.payer.address}
            onChange={(e) => setPayer("address", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Sobre a invoice">
        <div className="grid gap-4 md:grid-cols-3">
          <Field
            id="number"
            label="Número da invoice"
            hint="Para seu controle"
            error={errors.number}
          >
            <Input
              id="number"
              value={values.number}
              maxLength={40}
              onChange={(e) => setField("number", e.target.value)}
            />
          </Field>
          <Field id="issue-date" label="Data de emissão" error={errors.issueDate}>
            <Input
              id="issue-date"
              type="date"
              value={values.issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </Field>
          <Field id="due-date" label="Data de validade" error={errors.dueDate}>
            <Input
              id="due-date"
              type="date"
              value={values.dueDate}
              onChange={(e) => setField("dueDate", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Descrição do serviço">
        <PartyPicker
          id="description-party"
          label="Descrição salva"
          parties={descriptions}
          selectedId={descriptionId}
          onSelect={selectDescription}
          canSave={descriptionLabel(values.description) !== ""}
          onSave={onSaveDescription ? saveDescription : undefined}
          onDelete={onDeleteParty ? deleteDescription : undefined}
        />
        <Field id="description" label="Descrição do serviço" error={errors.description}>
          <Textarea
            id="description"
            rows={6}
            placeholder="Faça uma descrição detalhada dos serviços prestados."
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="currency" label="Moeda">
            <select
              id="currency"
              className={selectClass}
              value={values.currency}
              onChange={(e) => setField("currency", e.target.value as Currency)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field id="amount" label="Valor da invoice" error={errors.amount}>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="0,00"
              value={values.amount}
              onChange={(e) => setField("amount", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Dados para pagamento">
        <PartyPicker
          id="payment-party"
          label="Dados salvos"
          parties={payments}
          selectedId={paymentId}
          onSelect={selectPayment}
          canSave={descriptionLabel(values.paymentDetails) !== ""}
          onSave={onSavePayment ? savePayment : undefined}
          onDelete={onDeleteParty ? deletePayment : undefined}
        />
        <Field id="payment-details" label="Dados para pagamento">
          <Textarea
            id="payment-details"
            rows={8}
            placeholder="Banco, conta, chave de pagamento…"
            value={values.paymentDetails}
            onChange={(e) => setField("paymentDetails", e.target.value)}
          />
        </Field>
      </Section>

      {error || submitError ? (
        <p role="alert" className="text-sm text-destructive">
          {error ?? submitError}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={busy} className="w-full md:w-auto">
        {busy ? "Gerando…" : "Gerar PDF"}
      </Button>
    </form>
  );
}
