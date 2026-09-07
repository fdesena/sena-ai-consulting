export type OrbitItem = {
  tag: string;
  short: string;
  result: string;
  area: number;
  desafio: string;
  solucao: string;
  tags: string[];
};
export type OrbitArea = { label: string; color: string };

export const ITEMS: OrbitItem[] = [
  {
    tag: "Site",
    short: "Esperar meses por um site novo",
    result: "Do zero ao ar em dias, não meses.",
    area: 0,
    desafio:
      "Site genérico, lento ou dependente de templates prontos — sem controle sobre design, performance ou dados.",
    solucao:
      "Website sob medida, com design, performance e integrações pensadas para o negócio do cliente.",
    tags: ["Website", "Design", "Performance"],
  },
  {
    tag: "Vídeos",
    short: "Regravar tudo porque mudou uma frase",
    result: "Vídeo gerado por IA em alta qualidade, fração do tempo e do custo.",
    area: 0,
    desafio:
      "Produção tradicional de vídeo institucional e fotos profissionais exige equipe, estúdio e semanas de trabalho.",
    solucao:
      "Vídeos institucionais e fotos gerados com IA, com direção criativa e curadoria humana — sem abrir mão de qualidade profissional.",
    tags: ["Vídeo com IA", "Geração de imagem"],
  },
  {
    tag: "Propostas",
    short: "Montar a mesma proposta de novo",
    result: "Proposta gerada por IA, com −80% no tempo de elaboração.",
    area: 1,
    desafio:
      "Elaboração de propostas comerciais feita à mão: lenta, inconsistente entre a equipe e dependente de poucas pessoas.",
    solucao:
      "Fluxo que monta a proposta a partir de poucos inputs, padronizando texto, escopo e precificação.",
    tags: ["Automação", "IA generativa", "Documentos"],
  },
  {
    tag: "Retenção",
    short: "Lembrar cada cliente, um por um",
    result: "Disparo automático no momento certo, zero mensagem esquecida.",
    area: 1,
    desafio:
      "Acompanhamento do cliente feito na mão, do lembrete ao follow-up — com risco constante de esquecimento.",
    solucao:
      "Automação conectada ao sistema de gestão, disparando mensagens automaticamente a partir do próprio agendamento.",
    tags: ["WhatsApp Business API", "Automação de CRM"],
  },
  {
    tag: "Agentes",
    short: "Responder o que já foi respondido",
    result: "Agente de IA treinado no seu conteúdo, respondendo em escala, a qualquer hora.",
    area: 2,
    desafio:
      "Conhecimento espalhado em documentos e pessoas, dificultando suporte e decisões rápidas.",
    solucao:
      "Agente de IA treinado no conteúdo da empresa, respondendo com base nas fontes internas.",
    tags: ["Agentes de IA", "RAG", "Base de conhecimento"],
  },
  {
    tag: "CRM DE VENDAS",
    short: "Adaptar o processo a um SaaS genérico",
    result: "CRM sob medida, construído para o seu processo, não o contrário.",
    area: 2,
    desafio:
      "Times adaptando o próprio processo comercial a um SaaS genérico, cheio de campos que não fazem sentido.",
    solucao: "CRM construído sob medida, seguindo exatamente o processo do time — não o contrário.",
    tags: ["CRM", "Sob medida", "Processo comercial"],
  },
  {
    tag: "Dados",
    short: "Copiar e colar planilha todo mês",
    result: "Dados atualizados automaticamente, com IA ajudando na decisão.",
    area: 3,
    desafio: "Relatórios manuais, demorados e quase sempre desatualizados para a gestão.",
    solucao:
      "Pipeline que consolida os dados e gera dashboards executivos atualizados automaticamente.",
    tags: ["Dados", "Dashboards", "Automação"],
  },
  {
    tag: "Treino",
    short: "Treinar o time do zero toda vez",
    result: "Plataforma de cursos e vídeos com a sua marca, treinando o time sozinha.",
    area: 3,
    desafio: "Treinamentos dispersos, sem trilha clara e com baixo engajamento do time.",
    solucao:
      "Plataforma de ensino própria com trilhas, vídeos, quizzes e rankings — com identidade da marca.",
    tags: ["Plataforma", "LMS", "Gamificação"],
  },
];

export const AREAS: OrbitArea[] = [
  { label: "Marketing e Divulgação", color: "#C9853B" },
  { label: "Vendas", color: "#D9843E" },
  { label: "Operacional", color: "#EA8039" },
  { label: "Gerencial", color: "#FC7C34" },
];

export const SOFT = "#6E675E";
export const LINE = "#E7E2D9";
export const AMBER = "#C9853B";
export const ORBIT_SANS =
  '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

export const N = ITEMS.length;
export const NA = AREAS.length;
export const TAU = Math.PI * 2;
export const FILLERS = 13;
export const TOTAL = N + FILLERS;
export const GOLDEN = Math.PI * (3 - Math.sqrt(5));
export const LEAD = 0.055;
export const TAIL = 0.115;
export const SLOT_MS = 2400;
export const AUTO_EPS = 0.002;
export const SMOOTHING = 0.12;

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
export function clamp01(t: number) {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}
export function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
export type SpherePoint = { x: number; y: number; z: number; phi: number; label: number | null };

function buildSphere(): SpherePoint[] {
  const raw: SpherePoint[] = [];
  for (let k = 0; k < TOTAL; k++) {
    const y = 1 - (k / (TOTAL - 1)) * 2;
    const rY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN * k;
    const x = Math.cos(theta) * rY;
    const z = Math.sin(theta) * rY;
    raw.push({ x, y, z, phi: Math.atan2(x, z), label: null });
  }
  const chosenIdx: number[] = [];
  for (let i = 0; i < N; i++) chosenIdx.push(Math.floor((i * TOTAL) / N));
  const chosen = chosenIdx.map((ci) => raw[ci]);
  chosen.sort((a, b) => a.phi - b.phi);
  chosen.forEach((pt, i) => {
    pt.label = i;
  });
  return raw;
}

export const SPHERE_POINTS = buildSphere();
export const PHI: number[] = new Array(N);
SPHERE_POINTS.forEach((pt) => {
  if (pt.label !== null) PHI[pt.label] = pt.phi;
});

export function angleFor(c: number) {
  const idx = Math.min(N - 1, Math.floor(c));
  const loc = c - idx;
  const approach = easeOutCubic(Math.min(1, loc / 0.45));
  const prevPhi = idx === 0 ? PHI[N - 1] - TAU : PHI[idx - 1];
  return lerp(prevPhi, PHI[idx], approach);
}

export function textOpacityAt(loc: number) {
  if (loc < 0.3) return 0;
  if (loc < 0.46) return (loc - 0.3) / 0.16;
  if (loc < 0.9) return 1;
  return Math.max(0, (1 - loc) / 0.1);
}
