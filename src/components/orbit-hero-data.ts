export type IconKey = "web" | "video" | "file" | "retention" | "agent" | "crm" | "chart" | "learn";

export type OrbitItem = {
  tag: string;
  category: string;
  icon: IconKey;
  short: string;
  result: string;
  area: number;
  desafio: string;
  solucao: string;
  tags: string[];
  /** Índice do case correspondente em TrackRecord.tsx (seção Cases/Resultados). */
  caseIndex: number;
};
export type OrbitArea = { label: string; color: string };

export const ITEMS: OrbitItem[] = [
  {
    tag: "Site",
    category: "Websites sob medida",
    icon: "web",
    short: "Esperar meses por um site novo",
    result: "Do zero ao ar em dias, não meses.",
    area: 0,
    desafio:
      "Site genérico, lento ou dependente de templates prontos — sem controle sobre design, performance ou dados.",
    solucao:
      "Website sob medida, com design, performance e integrações pensadas para o negócio do cliente.",
    tags: ["Website", "Design", "Performance"],
    caseIndex: 0,
  },
  {
    tag: "Vídeos",
    category: "Criação com IA",
    icon: "video",
    short: "Regravar tudo porque mudou uma frase",
    result: "Vídeo gerado por IA em alta qualidade, fração do tempo e do custo.",
    area: 0,
    desafio:
      "Produção tradicional de vídeo institucional e fotos profissionais exige equipe, estúdio e semanas de trabalho.",
    solucao:
      "Vídeos institucionais e fotos gerados com IA, com direção criativa e curadoria humana — sem abrir mão de qualidade profissional.",
    tags: ["Vídeo com IA", "Geração de imagem"],
    caseIndex: 1,
  },
  {
    tag: "Propostas",
    category: "Automação comercial",
    icon: "file",
    short: "Montar a mesma proposta de novo",
    result: "Proposta gerada por IA, com −80% no tempo de elaboração.",
    area: 1,
    desafio:
      "Elaboração de propostas comerciais feita à mão: lenta, inconsistente entre a equipe e dependente de poucas pessoas.",
    solucao:
      "Fluxo que monta a proposta a partir de poucos inputs, padronizando texto, escopo e precificação.",
    tags: ["Automação", "IA generativa", "Documentos"],
    caseIndex: 3,
  },
  {
    tag: "Retenção",
    category: "Relacionamento contínuo",
    icon: "retention",
    short: "Lembrar cada cliente, um por um",
    result: "Disparo automático no momento certo, zero mensagem esquecida.",
    area: 1,
    desafio:
      "Acompanhamento do cliente feito na mão, do lembrete ao follow-up — com risco constante de esquecimento.",
    solucao:
      "Automação conectada ao sistema de gestão, disparando mensagens automaticamente a partir do próprio agendamento.",
    tags: ["WhatsApp Business API", "Automação de CRM"],
    caseIndex: 7,
  },
  {
    tag: "Agentes",
    category: "Inteligência aplicada",
    icon: "agent",
    short: "Responder o que já foi respondido",
    result: "Agente de IA treinado no seu conteúdo, respondendo em escala, a qualquer hora.",
    area: 2,
    desafio:
      "Conhecimento espalhado em documentos e pessoas, dificultando suporte e decisões rápidas.",
    solucao:
      "Agente de IA treinado no conteúdo da empresa, respondendo com base nas fontes internas.",
    tags: ["Agentes de IA", "RAG", "Base de conhecimento"],
    caseIndex: 4,
  },
  {
    tag: "CRM DE VENDAS",
    category: "Software sob medida",
    icon: "crm",
    short: "Adaptar o processo a um SaaS genérico",
    result: "CRM sob medida, construído para o seu processo, não o contrário.",
    area: 2,
    desafio:
      "Times adaptando o próprio processo comercial a um SaaS genérico, cheio de campos que não fazem sentido.",
    solucao: "CRM construído sob medida, seguindo exatamente o processo do time — não o contrário.",
    tags: ["CRM", "Sob medida", "Processo comercial"],
    caseIndex: 2,
  },
  {
    tag: "Dados",
    category: "Decisões com dados",
    icon: "chart",
    short: "Copiar e colar planilha todo mês",
    result: "Dados atualizados automaticamente, com IA ajudando na decisão.",
    area: 3,
    desafio: "Relatórios manuais, demorados e quase sempre desatualizados para a gestão.",
    solucao:
      "Pipeline que consolida os dados e gera dashboards executivos atualizados automaticamente.",
    tags: ["Dados", "Dashboards", "Automação"],
    caseIndex: 5,
  },
  {
    tag: "Treino",
    category: "Aprendizado em escala",
    icon: "learn",
    short: "Treinar o time do zero toda vez",
    result: "Plataforma de cursos e vídeos com a sua marca, treinando o time sozinha.",
    area: 3,
    desafio: "Treinamentos dispersos, sem trilha clara e com baixo engajamento do time.",
    solucao:
      "Plataforma de ensino própria com trilhas, vídeos, quizzes e rankings — com identidade da marca.",
    tags: ["Plataforma", "LMS", "Gamificação"],
    caseIndex: 6,
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

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
export function clamp01(t: number) {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}
