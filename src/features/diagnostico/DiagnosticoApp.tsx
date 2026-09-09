import { useEffect, useMemo, useRef, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import {
  AREAS,
  STAGE_NAMES,
  STEP_DESCRIPTIONS,
  STEP_TITLES,
  areaFor,
  buildResult,
  changeAnswer,
  primaryArea,
  stageOf,
  stepsFor,
  validateStep,
} from "./engine";
import type { Answers, DiagnosticoReport, StepId } from "./types";
import QuestionFields from "./components/QuestionFields";
import StepRail from "./components/StepRail";
import ResultView from "./components/ResultView";
import ContactDialog from "./components/ContactDialog";
import IntroCapture, { type LeadFields } from "./components/IntroCapture";
import { PrimaryButton, TextButton } from "./components/Controls";

const DIAGNOSTIC_VERSION = "sena-diagnostico-1.0";
const EMPTY_LEAD: LeadFields = { nome: "", email: "", whatsapp: "", negocio: "" };

interface DiagnosticoAppProps {
  // Renderiza sem <SiteHeader/> nem o fundo full-bleed — usado quando o
  // componente é embutido dentro de outro layout (ex.: /painel/diagnostico),
  // que já tem seu próprio chrome.
  embedded?: boolean;
  // Id do usuário logado, repassado como userId ao criar o lead — vincula a
  // linha de diagnostico_leads à conta.
  authUserId?: string;
  // Pré-preenche a captura de contato (ex.: e-mail já conhecido da conta).
  initialLead?: Partial<LeadFields>;
  // Hidrata direto na fase de resultado a partir de um diagnóstico já salvo,
  // em vez de sempre começar em "intro".
  initialCompleted?: { leadId: string; answers: Answers; report: DiagnosticoReport };
}

export default function DiagnosticoApp({
  embedded = false,
  authUserId,
  initialLead,
  initialCompleted,
}: DiagnosticoAppProps = {}) {
  const [phase, setPhase] = useState<"intro" | "questions" | "result">(
    initialCompleted ? "result" : "intro",
  );
  const [lead, setLead] = useState<LeadFields>({ ...EMPTY_LEAD, ...initialLead });
  const [consent, setConsent] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(initialCompleted?.leadId ?? null);
  const [leadStatus, setLeadStatus] = useState<"idle" | "saving" | "error">("idle");
  const [leadError, setLeadError] = useState("");
  const [completionSaveFailed, setCompletionSaveFailed] = useState(false);

  const [answers, setAnswers] = useState<Answers>(initialCompleted?.answers ?? {});
  const [position, setPosition] = useState(0);
  const [report, setReport] = useState<DiagnosticoReport | null>(initialCompleted?.report ?? null);
  const [formError, setFormError] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const steps = useMemo(() => stepsFor(answers), [answers]);
  const activeIndex = Math.max(0, Math.min(position, steps.length - 1));
  const stepId = steps[activeIndex];
  const stage = stageOf(stepId);
  const pct = Math.round((activeIndex / steps.length) * 100);
  const areaKey = primaryArea(answers);
  const areaLabel = areaKey ? (AREAS[areaKey]?.label ?? null) : null;
  const showContext =
    Boolean(areaKey) && !["goal", "profile", "areas", "priority"].includes(stepId);

  useEffect(() => {
    if (phase !== "questions") return;
    titleRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeIndex, phase]);

  useEffect(() => {
    if (phase === "result" || phase === "intro") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [phase]);

  async function handleLeadSubmit() {
    if (leadId) {
      // Already captured this session (e.g. user went back to review contact info) — don't duplicate the row.
      setPhase("questions");
      return;
    }
    setLeadStatus("saving");
    setLeadError("");
    try {
      const resp = await fetch("/api/public/diagnostico/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemaVersion: DIAGNOSTIC_VERSION,
          nome: lead.nome.trim(),
          email: lead.email.trim(),
          whatsapp: lead.whatsapp.trim(),
          negocio: lead.negocio.trim() || null,
          consentimento: true,
          userId: authUserId,
        }),
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok || !data?.ok || !data?.id) throw new Error("start_failed");
      setLeadId(data.id);
      setLeadStatus("idle");
      setPhase("questions");
    } catch (err) {
      console.error("diagnostico start failed", err);
      setLeadStatus("error");
      setLeadError(
        "Não foi possível registrar seus dados agora. Verifique sua conexão e tente novamente.",
      );
    }
  }

  function setSingle(key: keyof Answers, value: string) {
    setAnswers((prev) => changeAnswer(prev, key, value));
    setFormError("");
  }

  function setText(key: keyof Answers, value: string) {
    setAnswers((prev) => changeAnswer(prev, key, value));
  }

  function toggleMulti(key: keyof Answers, value: string, limit: number, exclusive: string[]) {
    setAnswers((prev) => {
      const current = (prev[key] as string[] | undefined) ?? [];
      let selected: string[];
      if (current.includes(value)) {
        selected = current.filter((v) => v !== value);
      } else if (exclusive.includes(value)) {
        selected = [value];
      } else {
        selected = [...current.filter((v) => !exclusive.includes(v)), value];
      }
      if (selected.length > limit) {
        setFormError(`Escolha até ${limit} opções. Desmarque uma para selecionar outra.`);
        return prev;
      }
      setFormError("");
      return changeAnswer(prev, key, selected);
    });
  }

  function handleBack() {
    if (activeIndex === 0) {
      setPhase("intro");
      return;
    }
    setFormError("");
    setPosition(activeIndex - 1);
  }

  function persistCompletion(finalAnswers: Answers, finalReport: DiagnosticoReport) {
    if (!leadId) return;
    fetch("/api/public/diagnostico/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: leadId,
        schemaVersion: DIAGNOSTIC_VERSION,
        answers: finalAnswers,
        report: finalReport,
      }),
    })
      .then((resp) => {
        if (!resp.ok) throw new Error(`status ${resp.status}`);
        setCompletionSaveFailed(false);
      })
      .catch((err) => {
        console.error("diagnostico submit (completion) failed", err);
        setCompletionSaveFailed(true);
      });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = validateStep(stepId, answers);
    if (!result.ok) {
      setFormError(result.message ?? "");
      return;
    }
    if (activeIndex === steps.length - 1) {
      const finalReport = buildResult(answers);
      setReport(finalReport);
      setPhase("result");
      persistCompletion(answers, finalReport);
    } else {
      setFormError("");
      setPosition(activeIndex + 1);
    }
  }

  function handleRestart() {
    if (
      Object.keys(answers).length &&
      !window.confirm("Recomeçar e apagar as respostas desta aba?")
    )
      return;
    setAnswers({});
    setPosition(0);
    setReport(null);
    setFormError("");
    setCompletionSaveFailed(false);
    setPhase("questions");
  }

  function handleEditStep(id: StepId) {
    const idx = steps.indexOf(id);
    setPosition(idx >= 0 ? idx : steps.indexOf("areas"));
    setPhase("questions");
  }

  function handleBackToQuestions() {
    setPosition(steps.length - 1);
    setPhase("questions");
  }

  // Evita aninhar <main> quando embutido dentro de um layout que já tem o seu.
  const Wrapper = embedded ? "div" : "main";

  return (
    <>
      {embedded ? null : (
        <div className="diagnostico-no-print">
          <SiteHeader />
        </div>
      )}
      <Wrapper className={embedded ? "bg-ink text-paper" : "min-h-screen bg-ink text-paper"}>
        <div
          className={
            phase === "result"
              ? "mx-auto max-w-[1300px] px-6 sm:px-8 diagnostico-print-area"
              : "mx-auto max-w-[1300px] px-6 sm:px-8"
          }
        >
          {phase === "intro" ? (
            <IntroCapture
              lead={lead}
              onChange={setLead}
              consent={consent}
              onConsentChange={setConsent}
              onSubmit={handleLeadSubmit}
              status={leadStatus}
              errorMessage={leadError}
            />
          ) : phase === "questions" ? (
            <div className="grid grid-cols-1 gap-8 py-8 sm:py-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
              <StepRail stage={stage} areaLabel={areaKey ? areaLabel : null} />
              <div>
                <section className="overflow-hidden rounded-2xl border border-white/25 bg-[var(--paper)] text-[var(--ink)] shadow-[0_24px_70px_rgba(0,0,0,0.2)]">
                  <div className="h-1 bg-[#dadddf]">
                    <div
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={pct}
                      aria-label="Progresso do diagnóstico"
                      className="h-full bg-bronze transition-[width] duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="px-6 pt-7 sm:px-11">
                      <div className="mb-6 flex items-center justify-between gap-5 font-mono text-xs text-[#677078]">
                        <span className="text-[#a44714]">
                          {String(stage + 1).padStart(2, "0")} / {STAGE_NAMES[stage]}
                        </span>
                        <span>
                          Passo {activeIndex + 1} de {steps.length}
                        </span>
                      </div>
                      <div
                        key={stepId}
                        className="animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none"
                      >
                        {showContext ? (
                          <div className="mb-5 inline-flex rounded bg-[#e7eaec] px-2.5 py-1.5 text-sm text-[#4b555e]">
                            {areaLabel}
                          </div>
                        ) : null}
                        <h1
                          ref={titleRef}
                          tabIndex={-1}
                          className="max-w-[23ch] text-[2rem] font-medium leading-[1.12] tracking-tight outline-none sm:text-4xl"
                        >
                          {stepId === "symptom" ? areaFor(answers).question : STEP_TITLES[stepId]}
                        </h1>
                        <p className="mt-3 mb-7 max-w-[64ch] text-base text-[#5e666c]">
                          {STEP_DESCRIPTIONS[stepId]}
                        </p>
                        <QuestionFields
                          stepId={stepId}
                          answers={answers}
                          setSingle={setSingle}
                          setText={setText}
                          toggleMulti={toggleMulti}
                        />
                      </div>
                      <p role="alert" className="mt-5 min-h-6 text-[15px] text-[#aa351b]">
                        {formError}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#d5d9dc] px-6 py-5 sm:px-11">
                      <TextButton
                        type="button"
                        onClick={handleBack}
                        className="border-transparent text-[#56606a]"
                      >
                        ← Voltar
                      </TextButton>
                      <PrimaryButton type="submit">
                        {activeIndex === steps.length - 1 ? "Ver meu diagnóstico →" : "Continuar →"}
                      </PrimaryButton>
                    </div>
                  </form>
                </section>
                <p className="mt-4.5 text-center text-[13px] text-[#979fa7]">
                  Seus dados são tratados conforme nossa{" "}
                  <a
                    href="/politica-de-privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Política de Privacidade
                  </a>
                  . Recarregar a página mantém seus dados de contato, mas apaga o progresso destas
                  perguntas nesta aba.
                </p>
              </div>
            </div>
          ) : report ? (
            <ResultView
              answers={answers}
              report={report}
              lead={lead}
              leadId={leadId}
              onEditStep={handleEditStep}
              onBackToQuestions={handleBackToQuestions}
              onOpenContact={() => setContactOpen(true)}
              saveFailed={completionSaveFailed}
            />
          ) : null}
        </div>
        {phase !== "intro" ? (
          <footer className="diagnostico-no-print mx-auto flex max-w-[1300px] flex-col gap-3 px-6 pb-9 text-[13px] text-[#838e97] sm:flex-row sm:justify-between sm:px-8">
            <span>Sena Labs · Estratégia, IA &amp; Software sob medida</span>
            <button
              type="button"
              onClick={handleRestart}
              className="text-left text-[#aab2ba] underline decoration-[#aab2ba]/60 underline-offset-2"
            >
              Recomeçar diagnóstico
            </button>
          </footer>
        ) : null}
      </Wrapper>
      {report ? (
        <ContactDialog
          open={contactOpen}
          onOpenChange={setContactOpen}
          answers={answers}
          report={report}
          nome={lead.nome}
          negocio={lead.negocio}
        />
      ) : null}
    </>
  );
}
