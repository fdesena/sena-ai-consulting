import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { InvoiceHistory } from "@/components/invoice/InvoiceHistory";
import { deleteInvoice, insertInvoice, listInvoices } from "@/lib/invoice/api";
import { downloadInvoice } from "@/lib/invoice/download";
import {
  deleteParty,
  listParties,
  saveParty,
  type PartyKind,
  type SavedParty,
} from "@/lib/invoice/parties";
import {
  descriptionLabel,
  formValuesFromInvoice,
  initialFormValues,
  type Description,
  type InvoiceData,
  type InvoiceFormValues,
  type Payer,
  type PaymentDetails,
  type Provider,
  type SavedInvoice,
} from "@/lib/invoice/schema";

function upsertParty<T>(list: SavedParty<T>[], saved: SavedParty<T>): SavedParty<T>[] {
  return list.some((p) => p.id === saved.id)
    ? list.map((p) => (p.id === saved.id ? saved : p))
    : [...list, saved];
}

export const Route = createFileRoute("/_authenticated/painel/invoice")({
  component: InvoicePage,
});

function InvoicePage() {
  const navigate = useNavigate();
  // null = verificando, true/false = resultado
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) {
        setAllowed(false);
        return;
      }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      if ((roles ?? []).some((r) => r.role === "admin")) {
        setAllowed(true);
        return;
      }
      const { data: access } = await supabase
        .from("user_app_access")
        .select("app_slug")
        .eq("user_id", uid)
        .eq("app_slug", "invoice")
        .maybeSingle();
      setAllowed(!!access);
    })();
  }, []);

  if (allowed === null) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (!allowed) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 text-foreground">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-muted">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você ainda não tem acesso ao Invoice. Fale com a equipe Sena Labs para liberar este app.
        </p>
        <button
          onClick={() => navigate({ to: "/painel" })}
          className="mt-6 rounded-xl bg-bronze px-5 py-2.5 text-sm font-semibold text-white"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  return <InvoiceApp />;
}

function InvoiceApp() {
  const [invoices, setInvoices] = useState<SavedInvoice[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [providers, setProviders] = useState<SavedParty<Provider>[]>([]);
  const [payers, setPayers] = useState<SavedParty<Payer>[]>([]);
  const [descriptions, setDescriptions] = useState<SavedParty<Description>[]>([]);
  const [payments, setPayments] = useState<SavedParty<PaymentDetails>[]>([]);
  const [partiesError, setPartiesError] = useState<string | null>(null);
  const [initial, setInitial] = useState<InvoiceFormValues | null>(null);
  const [initialProviderId, setInitialProviderId] = useState<string | null>(null);
  const [initialPayerId, setInitialPayerId] = useState<string | null>(null);
  const [initialPaymentId, setInitialPaymentId] = useState<string | null>(null);
  // Troca a chave para o formulário remontar com os valores duplicados.
  const [formKey, setFormKey] = useState(0);
  // A página rola dentro do <main> do layout, não na window.
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.allSettled([
      listInvoices(),
      listParties<Provider>("provider"),
      listParties<Payer>("payer"),
      listParties<Description>("description"),
      listParties<PaymentDetails>("payment"),
    ]).then(
      ([invoicesResult, providersResult, payersResult, descriptionsResult, paymentsResult]) => {
        const providerList = providersResult.status === "fulfilled" ? providersResult.value : [];
        const payerList = payersResult.status === "fulfilled" ? payersResult.value : [];
        const descriptionList =
          descriptionsResult.status === "fulfilled" ? descriptionsResult.value : [];
        const paymentList = paymentsResult.status === "fulfilled" ? paymentsResult.value : [];
        if (
          providersResult.status === "rejected" ||
          payersResult.status === "rejected" ||
          descriptionsResult.status === "rejected" ||
          paymentsResult.status === "rejected"
        ) {
          setPartiesError("Não foi possível carregar os cadastros.");
        }
        setProviders(providerList);
        setPayers(payerList);
        setDescriptions(descriptionList);
        setPayments(paymentList);
        setInitialProviderId(providerList[0]?.id ?? null);
        setInitialPaymentId(paymentList[0]?.id ?? null);
        const defaultPaymentText = paymentList[0]?.data.text;
        if (invoicesResult.status === "fulfilled") {
          setInvoices(invoicesResult.value);
          setInitial(
            initialFormValues(
              invoicesResult.value[0],
              undefined,
              providerList[0]?.data,
              defaultPaymentText,
            ),
          );
        } else {
          setInvoices([]);
          setInitial(
            initialFormValues(undefined, undefined, providerList[0]?.data, defaultPaymentText),
          );
          setLoadError("Não foi possível carregar o histórico.");
        }
      },
    );
  }, []);

  async function handleSubmit(data: InvoiceData) {
    setSaveError(null);
    setActionError(null);
    // Baixa primeiro: o PDF sai mesmo que o salvamento falhe.
    await downloadInvoice(data);
    try {
      const saved = await insertInvoice(data);
      setInvoices((prev) => [saved, ...(prev ?? [])]);
    } catch {
      setSaveError("O PDF foi baixado, mas não foi possível salvar no histórico.");
    }
  }

  async function handleDownload(inv: SavedInvoice) {
    setActionError(null);
    try {
      await downloadInvoice(inv);
    } catch {
      setActionError("Não foi possível gerar o PDF.");
    }
  }

  // Rejeita em caso de falha: o InvoiceHistory mostra o erro no próprio diálogo.
  async function handleDelete(inv: SavedInvoice) {
    await deleteInvoice(inv.id);
    setInvoices((prev) => (prev ?? []).filter((i) => i.id !== inv.id));
  }

  // Os handlers de salvar e excluir rejeitam em caso de falha: o PartyPicker mostra o erro.
  async function handleSaveProvider(data: Provider) {
    const saved = await saveParty("provider", data.name, data);
    setProviders((prev) => upsertParty(prev, saved));
    return saved;
  }

  async function handleSavePayer(data: Payer) {
    const saved = await saveParty("payer", data.name, data);
    setPayers((prev) => upsertParty(prev, saved));
    return saved;
  }

  async function handleSaveDescription(data: Description) {
    const saved = await saveParty("description", descriptionLabel(data.text), data);
    setDescriptions((prev) => upsertParty(prev, saved));
    return saved;
  }

  async function handleSavePayment(data: PaymentDetails) {
    const saved = await saveParty("payment", descriptionLabel(data.text), data);
    setPayments((prev) => upsertParty(prev, saved));
    return saved;
  }

  async function handleDeleteParty(kind: PartyKind, id: string) {
    await deleteParty(id);
    if (kind === "provider") setProviders((prev) => prev.filter((p) => p.id !== id));
    else if (kind === "payer") setPayers((prev) => prev.filter((p) => p.id !== id));
    else if (kind === "payment") setPayments((prev) => prev.filter((d) => d.id !== id));
    else setDescriptions((prev) => prev.filter((d) => d.id !== id));
  }

  function handleDuplicate(inv: SavedInvoice) {
    setInitial(formValuesFromInvoice(inv));
    setInitialProviderId(null);
    setInitialPayerId(null);
    setInitialPaymentId(null);
    setSaveError(null);
    setFormKey((k) => k + 1);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!invoices || !initial) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold">Invoice</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">
        Preencha os dados e baixe o PDF em português ou inglês.
      </p>

      {partiesError ? (
        <p role="alert" className="mb-4 text-xs text-muted-foreground">
          {partiesError}
        </p>
      ) : null}

      <div ref={formRef}>
        <InvoiceForm
          key={formKey}
          initial={initial}
          onSubmit={handleSubmit}
          error={saveError}
          providers={providers}
          payers={payers}
          initialProviderId={initialProviderId}
          initialPayerId={initialPayerId}
          descriptions={descriptions}
          payments={payments}
          initialPaymentId={initialPaymentId}
          onSaveProvider={handleSaveProvider}
          onSavePayer={handleSavePayer}
          onSaveDescription={handleSaveDescription}
          onSavePayment={handleSavePayment}
          onDeleteParty={handleDeleteParty}
        />
      </div>

      <section className="mt-14">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em]">Anteriores</h2>
        {loadError ? (
          <p role="alert" className="mb-3 text-sm text-destructive">
            {loadError}
          </p>
        ) : null}
        {actionError ? (
          <p role="alert" className="mb-3 text-sm text-destructive">
            {actionError}
          </p>
        ) : null}
        {loadError ? null : (
          <InvoiceHistory
            invoices={invoices}
            onDownload={handleDownload}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        )}
      </section>
    </div>
  );
}
