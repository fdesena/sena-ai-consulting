import { useState } from "react";
import { FieldText, PrimaryButton } from "./Controls";

export interface LeadFields {
  nome: string;
  email: string;
  whatsapp: string;
  negocio: string;
}

interface IntroCaptureProps {
  lead: LeadFields;
  onChange: (fields: LeadFields) => void;
  consent: boolean;
  onConsentChange: (consent: boolean) => void;
  onSubmit: () => void;
  status: "idle" | "saving" | "error";
  errorMessage?: string;
}

const RECEIVES = [
  "Uma oportunidade prioritária, com justificativa ligada às suas respostas",
  "Ações para agora, para os próximos 7 dias e para os próximos 30 dias",
  "Um indicador para acompanhar se a mudança está funcionando",
  "Pontos que ainda precisam ser validados antes de investir tempo ou dinheiro",
];

export default function IntroCapture({
  lead,
  onChange,
  consent,
  onConsentChange,
  onSubmit,
  status,
  errorMessage,
}: IntroCaptureProps) {
  const [touched, setTouched] = useState(false);

  const nomeValid = lead.nome.trim().length > 0;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim());
  const whatsappValid = lead.whatsapp.replace(/\D/g, "").length >= 10;
  const canSubmit = nomeValid && emailValid && whatsappValid && consent && status !== "saving";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    onSubmit();
  }

  return (
    <div className="py-8 sm:py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.09em] text-[#ffb081]">
            Diagnóstico de oportunidades
          </div>
          <h1 className="mt-3 max-w-[20ch] text-[2.1rem] font-medium leading-[1.1] tracking-tight sm:text-5xl">
            Descubra sua próxima oportunidade com IA e automação.
          </h1>
          <p className="mt-5 max-w-[52ch] text-[#b4bdc5]">
            Em cerca de 8 minutos, mapeamos sua situação real em oito frentes do negócio — sites,
            conteúdo, vendas, operação, atendimento, dados, ferramentas próprias e capacitação — e
            priorizamos uma única oportunidade para você começar. Sem precisar conhecer ferramentas
            de IA.
          </p>
          <h2 className="mt-8 text-lg font-medium text-white">O que você recebe ao final</h2>
          <ul className="mt-4 space-y-3">
            {RECEIVES.map((item) => (
              <li key={item} className="flex gap-3 text-[#b4bdc5]">
                <span className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-bronze" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-[var(--paper)] p-7 text-[var(--ink)] sm:p-9">
          <h2 className="text-xl font-medium">Para começar, conte como falamos com você.</h2>
          <p className="mt-2 text-[15px] text-[#5e666c]">
            Usamos esses dados para preparar seu diagnóstico e, se você quiser, dar continuidade à
            conversa.
          </p>
          <form onSubmit={handleSubmit} noValidate className="mt-6">
            <FieldText
              id="lead-nome"
              label="Seu nome"
              optional={false}
              autoComplete="name"
              value={lead.nome}
              onChange={(v) => onChange({ ...lead, nome: v })}
            />
            <FieldText
              id="lead-email"
              label="Seu e-mail"
              optional={false}
              type="email"
              autoComplete="email"
              value={lead.email}
              onChange={(v) => onChange({ ...lead, email: v })}
            />
            <FieldText
              id="lead-whatsapp"
              label="Seu WhatsApp"
              optional={false}
              type="tel"
              autoComplete="tel"
              placeholder="Ex.: (19) 99999-9999"
              value={lead.whatsapp}
              onChange={(v) => onChange({ ...lead, whatsapp: v })}
            />
            <FieldText
              id="lead-negocio"
              label="Seu negócio"
              value={lead.negocio}
              onChange={(v) => onChange({ ...lead, negocio: v })}
            />

            <label className="mt-2 flex items-start gap-3 text-sm text-[#4d5861]">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => onConsentChange(e.target.checked)}
                className="mt-0.5 h-4.5 w-4.5 flex-none accent-bronze"
              />
              <span>
                Autorizo a Sena Labs a usar meus dados para preparar e me apresentar este
                diagnóstico e um eventual contato sobre o resultado, conforme os{" "}
                <a
                  href="/termos-de-uso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Termos de Uso
                </a>{" "}
                e a{" "}
                <a
                  href="/politica-de-privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Política de Privacidade
                </a>
                . Base legal: consentimento (Art. 7º, I — LGPD).
              </span>
            </label>

            {touched && !canSubmit ? (
              <p role="alert" className="mt-4 text-sm text-[#aa351b]">
                {!nomeValid || !emailValid || !whatsappValid
                  ? "Preencha nome, e-mail e WhatsApp válidos para continuar."
                  : "Você precisa aceitar os termos para continuar."}
              </p>
            ) : null}
            {status === "error" ? (
              <p role="alert" className="mt-4 text-sm text-[#aa351b]">
                {errorMessage || "Não foi possível registrar seus dados agora. Tente novamente."}
              </p>
            ) : null}

            <PrimaryButton type="submit" className="mt-6 w-full" disabled={status === "saving"}>
              {status === "saving" ? "Salvando…" : "Começar meu diagnóstico →"}
            </PrimaryButton>
          </form>
        </div>
      </div>
    </div>
  );
}
