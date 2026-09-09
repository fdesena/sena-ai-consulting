export interface Option {
  value: string;
  label: string;
  description?: string;
}

export interface AreaDef {
  key: string;
  label: string;
  desc: string;
  question: string;
  symptoms: Option[];
  offer: string;
  metric: string;
  unit: string;
  volumeQuestion: string;
  volumes: Option[];
  first: string;
  pilot: string;
  verify: string;
  measure: string;
  dependency: string;
  why: string;
  fit: string;
}

// Every field is optional: answers accumulate one step at a time and can be
// cleared selectively when an earlier branching answer changes.
export interface Answers {
  goal?: string;
  role?: string;
  sector?: string;
  sectorDetail?: string;
  team?: string;
  areas?: string[];
  priority?: string;
  symptom?: string;
  example?: string;
  workflow?: string;
  tools?: string;
  impact?: string[];
  volume?: string;
  hours?: string;
  process?: string;
  sources?: string;
  owner?: string;
  barriers?: string[];
  ai?: string;
  support?: string;
  success?: string;
  target?: string;
  when?: string;
  decision?: string;
  budget?: string;
}

export type StepId =
  | "goal"
  | "profile"
  | "areas"
  | "priority"
  | "symptom"
  | "workflow"
  | "impact"
  | "scale"
  | "readiness"
  | "barriers"
  | "support"
  | "success"
  | "decision";

export interface ValidationResult {
  ok: boolean;
  keys: string[];
  message?: string;
}

export interface PlanAction {
  when: string;
  title: string;
  text: string;
}

export interface AlternativeOpportunity {
  key: string;
  label: string;
  hypothesis: string;
  question: string;
}

export interface DiagnosticoReport {
  version: string;
  key: string;
  goal: string;
  offer: string;
  symptom: string;
  impact: string[];
  path: string;
  ready: boolean;
  foundations: boolean;
  workload: string;
  format: string;
  actions: PlanAction[];
  blockers: string[];
  alternatives: AlternativeOpportunity[];
  metric: string;
  metricDefined: boolean;
  volume: string;
  why: string;
  fit: string;
  dependency: string;
  verify: string;
  confidence: string;
  urgency: string;
  decision: string;
  budget: string;
  context: {
    role: string;
    sector: string;
    team: string;
    workflow: string;
    ai: string;
  };
}
