import { AREAS, LABELS, GOALS, areaFor } from "../engine";
import type { Answers, StepId } from "../types";
import {
  CheckboxCards,
  FieldSelect,
  FieldText,
  Fieldset,
  HelperNote,
  RadioCards,
} from "./Controls";

interface QuestionFieldsProps {
  stepId: StepId;
  answers: Answers;
  setSingle: (key: keyof Answers, value: string) => void;
  setText: (key: keyof Answers, value: string) => void;
  toggleMulti: (key: keyof Answers, value: string, limit: number, exclusive: string[]) => void;
}

export default function QuestionFields({
  stepId,
  answers,
  setSingle,
  setText,
  toggleMulti,
}: QuestionFieldsProps) {
  const b = areaFor(answers);

  switch (stepId) {
    case "goal":
      return (
        <>
          <RadioCards
            name="goal"
            options={GOALS}
            value={answers.goal}
            onChange={(v) => setSingle("goal", v)}
          />
          <HelperNote>
            <strong>Seu resultado será um plano inicial.</strong> Vamos identificar uma prioridade,
            o que observar e uma ação para começar. O percurso se ajusta às suas escolhas.
          </HelperNote>
        </>
      );

    case "profile":
      return (
        <>
          <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
            <FieldSelect
              id="role"
              label="Qual é seu papel?"
              options={LABELS.role}
              value={answers.role}
              onChange={(v) => setSingle("role", v)}
            />
            <FieldSelect
              id="sector"
              label="Em qual segmento você atua?"
              options={LABELS.sector}
              value={answers.sector}
              onChange={(v) => setSingle("sector", v)}
            />
            <div className="sm:col-span-2">
              <Fieldset legend="Quantas pessoas trabalham no negócio, incluindo você?">
                <RadioCards
                  name="team"
                  options={LABELS.team}
                  value={answers.team}
                  onChange={(v) => setSingle("team", v)}
                />
              </Fieldset>
            </div>
          </div>
          <FieldText
            id="sectorDetail"
            label='Se escolheu "Outro", qual segmento?'
            placeholder="Ex.: construção civil"
            value={answers.sectorDetail}
            onChange={(v) => setText("sectorDetail", v)}
          />
        </>
      );

    case "areas":
      return (
        <>
          <p className="mb-3.5 text-sm text-[#697179]">
            {answers.areas?.length || 0} de 3 áreas selecionadas
          </p>
          <CheckboxCards
            name="areas"
            options={Object.entries(AREAS).map(([value, def]) => ({
              value,
              label: def.label,
              description: def.desc,
            }))}
            value={answers.areas || []}
            onChange={(v) => toggleMulti("areas", v, 3, [])}
          />
        </>
      );

    case "priority":
      return (
        <RadioCards
          name="priority"
          columns={1}
          options={(answers.areas || []).map((value) => ({
            value,
            label: AREAS[value].label,
            description: AREAS[value].desc,
          }))}
          value={answers.priority}
          onChange={(v) => setSingle("priority", v)}
        />
      );

    case "symptom":
      return (
        <>
          <RadioCards
            name="symptom"
            columns={1}
            options={b.symptoms}
            value={answers.symptom}
            onChange={(v) => setSingle("symptom", v)}
          />
          <div className="mt-5">
            <FieldText
              id="example"
              label="Quer dar um exemplo recente?"
              placeholder="Sem nomes de clientes, dados pessoais ou informações confidenciais."
              long
              value={answers.example}
              onChange={(v) => setText("example", v)}
            />
          </div>
        </>
      );

    case "workflow":
      return (
        <>
          <RadioCards
            name="workflow"
            columns={1}
            options={LABELS.workflow}
            value={answers.workflow}
            onChange={(v) => setSingle("workflow", v)}
          />
          <div className="mt-5">
            <FieldText
              id="tools"
              label="Quais ferramentas ou sistemas participam?"
              placeholder="Ex.: Clinicorp, WhatsApp, Excel, CRM, plataforma de cursos..."
              value={answers.tools}
              onChange={(v) => setText("tools", v)}
            />
          </div>
        </>
      );

    case "impact":
      return (
        <>
          <CheckboxCards
            name="impact"
            options={LABELS.impact}
            value={answers.impact || []}
            onChange={(v) => toggleMulti("impact", v, 2, ["unknown"])}
          />
          <HelperNote>
            Não precisamos transformar todo benefício em dinheiro. Qualidade, autonomia e capacidade
            também podem ser resultados importantes.
          </HelperNote>
        </>
      );

    case "scale":
      return (
        <>
          <Fieldset legend={b.volumeQuestion}>
            <RadioCards
              name="volume"
              options={b.volumes}
              value={answers.volume}
              onChange={(v) => setSingle("volume", v)}
            />
          </Fieldset>
          <Fieldset
            legend={`Somando ${answers.team === "solo" ? "seu tempo" : "o tempo das pessoas envolvidas"}, quantas horas por semana vão para esse trabalho?`}
          >
            <RadioCards
              name="hours"
              options={LABELS.hours}
              value={answers.hours}
              onChange={(v) => setSingle("hours", v)}
            />
          </Fieldset>
          <HelperNote>
            Inclua execução e conferência. Esse número mede esforço atual; não presume quanto
            poderia ser economizado.
          </HelperNote>
        </>
      );

    case "readiness":
      return (
        <>
          <FieldSelect
            id="process"
            label="O caminho da tarefa está definido?"
            options={LABELS.process}
            value={answers.process}
            onChange={(v) => setSingle("process", v)}
          />
          <FieldSelect
            id="sources"
            label="Os dados, conteúdos ou materiais estão disponíveis?"
            options={LABELS.sources}
            value={answers.sources}
            onChange={(v) => setSingle("sources", v)}
          />
          <FieldSelect
            id="owner"
            label={
              answers.team === "solo"
                ? "Você consegue acompanhar e avaliar um primeiro teste?"
                : "Existe alguém para acompanhar e avaliar um primeiro teste?"
            }
            options={LABELS.owner}
            value={answers.owner}
            onChange={(v) => setSingle("owner", v)}
          />
        </>
      );

    case "barriers":
      return (
        <>
          <CheckboxCards
            name="barriers"
            options={LABELS.barriers}
            value={answers.barriers || []}
            onChange={(v) => toggleMulti("barriers", v, 2, ["none", "unknown"])}
          />
          <Fieldset legend="Como você usa IA no trabalho hoje?">
            <RadioCards
              name="ai"
              columns={1}
              options={LABELS.ai}
              value={answers.ai}
              onChange={(v) => setSingle("ai", v)}
            />
          </Fieldset>
        </>
      );

    case "support":
      return (
        <RadioCards
          name="support"
          columns={1}
          options={LABELS.support}
          value={answers.support}
          onChange={(v) => setSingle("support", v)}
        />
      );

    case "success": {
      const options = [
        { value: b.metric, label: b.metric },
        {
          value: "Menos retrabalho, mantendo a qualidade",
          label: "Menos retrabalho, mantendo a qualidade",
        },
        { value: "Mais autonomia para quem executa", label: "Mais autonomia para quem executa" },
        { value: "custom", label: "Quero acompanhar outro resultado" },
        { value: "unknown", label: "Ainda preciso definir um indicador" },
      ];
      return (
        <>
          <RadioCards
            name="success"
            columns={1}
            options={options}
            value={answers.success}
            onChange={(v) => setSingle("success", v)}
          />
          <div className="mt-5">
            <FieldText
              id="target"
              label="Se quiser, descreva o resultado ou a meta desejada"
              placeholder="Ex.: preparar uma proposta em até 30 minutos, com revisão."
              value={answers.target}
              onChange={(v) => setText("target", v)}
            />
          </div>
        </>
      );
    }

    case "decision":
      return (
        <>
          <Fieldset legend="Quando você gostaria de começar?">
            <RadioCards
              name="when"
              options={LABELS.when}
              value={answers.when}
              onChange={(v) => setSingle("when", v)}
            />
          </Fieldset>
          <Fieldset legend="Quem participa da decisão de investir?">
            <RadioCards
              name="decision"
              options={LABELS.decision}
              value={answers.decision}
              onChange={(v) => setSingle("decision", v)}
            />
          </Fieldset>
          <FieldSelect
            id="budget"
            label="Existe uma faixa disponível para um primeiro passo?"
            options={LABELS.budget}
            value={answers.budget}
            onChange={(v) => setSingle("budget", v)}
            optional
          />
          <HelperNote>
            A faixa é opcional e não é um orçamento da Sena Labs. Se ainda não sabe, podemos começar
            entendendo o valor e o escopo.
          </HelperNote>
        </>
      );

    default:
      return null;
  }
}
