// Declarative questions and deterministic recommendations.
// No remote AI call, no personality score, no inferred revenue, no invented ROI.
// Ported from the sena-labs-diagnostico.html reference — logic and copy preserved,
// only the sector "Outro" display was made consistent across transcript/result (see sectorLabel).
import type {
  AlternativeOpportunity,
  AreaDef,
  Answers,
  DiagnosticoReport,
  Option,
  StepId,
  ValidationResult,
} from "./types";

const o = (value: string, label: string, description = ""): Option => ({
  value,
  label,
  description,
});

export const GOALS: Option[] = [
  o("time", "Ganhar tempo", "Reduzir esforço e retrabalho."),
  o("growth", "Vender e me apresentar melhor", "Atrair oportunidades e acompanhar clientes."),
  o("control", "Decidir com mais clareza", "Conectar informações e enxergar o negócio."),
  o(
    "experience",
    "Melhorar a experiência do cliente",
    "Dar continuidade ao atendimento e à entrega.",
  ),
  o("build", "Tirar uma solução do papel", "Criar um site, ferramenta ou produto próprio."),
  o("skills", "Desenvolver pessoas", "Aplicar IA com mais segurança e autonomia."),
];

export const AREAS: Record<string, AreaDef> = {
  web: {
    key: "web",
    label: "Site e presença digital",
    desc: "Apresentar a oferta e facilitar o contato.",
    question: "O que sua presença digital precisa resolver primeiro?",
    symptoms: [
      o("new", "Ainda não tenho um site que apresente meu negócio"),
      o("unclear", "Meu site não explica bem o que ofereço"),
      o("contact", "As pessoas chegam, mas poucas entram em contato"),
      o("update", "Atualizar ou conectar meu site é trabalhoso"),
    ],
    offer: "Site orientado à oferta e ao contato",
    metric: "Contatos qualificados recebidos pelo site",
    unit: "visitas ao site",
    volumeQuestion: "Quantas visitas seu site recebe por mês?",
    volumes: [
      o("none", "Ainda não tenho site"),
      o("low", "Até 100"),
      o("medium", "101–1.000"),
      o("high", "Mais de 1.000"),
      o("unknown", "Não acompanho"),
    ],
    first:
      "Escreva para quem é sua oferta, qual problema resolve e qual ação o visitante deve tomar.",
    pilot:
      "Desenhe uma página para uma oferta, com mensagem clara e um caminho de contato. Se já existe um site, revise esse percurso antes de refazê-lo.",
    verify:
      "Há dados de visitas e contatos para distinguir falta de tráfego de dificuldade de conversão?",
    measure:
      "Registre visitas, contatos e quantos contatos correspondem ao cliente que você quer atender.",
    dependency: "Definir oferta, público, conteúdo e responsáveis por atualizar o site.",
    why: "Uma apresentação clara e um caminho de contato observável ajudam a avaliar se o site está apoiando o negócio.",
    fit: "Website, design e conexões com os sistemas do negócio",
  },
  content: {
    key: "content",
    label: "Conteúdo, imagens e vídeos",
    desc: "Explicar melhor a oferta e produzir com consistência.",
    question: "Onde produzir conteúdo fica mais difícil?",
    symptoms: [
      o("idea", "Não consigo transformar minha oferta em uma mensagem clara"),
      o("volume", "Falta tempo para produzir com frequência"),
      o("cost", "Gravar e editar exige mais estrutura do que tenho"),
      o("quality", "O conteúdo não representa a qualidade do meu negócio"),
    ],
    offer: "Produção de conteúdo com direção e IA",
    metric: "Tempo de produção por peça aprovada",
    unit: "peças de conteúdo",
    volumeQuestion: "Quantas peças você publica em um mês típico?",
    volumes: [
      o("none", "Ainda não publico"),
      o("low", "1–4"),
      o("medium", "5–15"),
      o("high", "Mais de 15"),
      o("unknown", "Varia muito / não sei"),
    ],
    first: "Escolha uma oferta e escreva uma única mensagem para um público específico.",
    pilot:
      "Produza uma peça piloto com roteiro, referência visual e revisão humana. Avalie qualidade e tempo antes de ampliar o volume.",
    verify: "Quais formatos, canais e critérios de aprovação realmente importam para sua oferta?",
    measure:
      "Compare horas de briefing, produção e revisão; acompanhe também a resposta do público à peça.",
    dependency:
      "Ter mensagem, materiais de referência, direitos de uso e responsável pela aprovação.",
    why: "Uma peça piloto permite avaliar qualidade e esforço sem assumir que produzir mais, por si só, gera mais vendas.",
    fit: "Vídeos e imagens com IA, direção criativa e processo de produção",
  },
  sales: {
    key: "sales",
    label: "Vendas e relacionamento",
    desc: "Propostas, acompanhamento e continuidade do contato.",
    question: "Em que ponto uma oportunidade comercial costuma travar?",
    symptoms: [
      o("follow", "Esquecemos ou atrasamos o próximo contato"),
      o("proposal", "Propostas e orçamentos dão muito trabalho"),
      o("pipeline", "Não consigo enxergar o andamento das oportunidades"),
      o("retention", "O cliente compra e depois perdemos o contato"),
    ],
    offer: "Processo comercial com continuidade",
    metric: "Oportunidades com próximo passo definido",
    unit: "oportunidades comerciais",
    volumeQuestion: "Quantas novas oportunidades comerciais chegam por mês?",
    volumes: [
      o("none", "Ainda estou começando"),
      o("low", "Até 20"),
      o("medium", "21–100"),
      o("high", "Mais de 100"),
      o("unknown", "Não acompanho"),
    ],
    first: "Liste as oportunidades em aberto, a etapa, o responsável e o próximo contato.",
    pilot:
      "Teste um único fluxo comercial, com critérios claros de entrada, ação e acompanhamento.",
    verify: "O gargalo é falta de demanda, demora na resposta, proposta ou acompanhamento?",
    measure:
      "Registre tempo de resposta, propostas enviadas e avanço de etapa. Não atribua toda venda à automação.",
    dependency:
      "Definir etapas, responsáveis e regras de contato; verificar os canais e sistemas envolvidos.",
    why: "Enxergar e acompanhar o próximo passo pode ser mais útil do que simplesmente aumentar o número de mensagens.",
    fit: "CRM, propostas assistidas e automações de relacionamento",
  },
  ops: {
    key: "ops",
    label: "Rotina e operação",
    desc: "Agendamentos, documentos e tarefas repetidas.",
    question: "Qual repetição mais atrapalha sua operação?",
    symptoms: [
      o("schedule", "Agendar, confirmar ou reagendar"),
      o("copy", "Copiar dados de um lugar para outro"),
      o("document", "Preparar documentos e atualizar controles"),
      o("handoff", "Cobrar o andamento das tarefas entre pessoas"),
    ],
    offer: "Automação de um processo delimitado",
    metric: "Tempo por execução, incluindo correções",
    unit: "execuções do processo",
    volumeQuestion: "Quantas vezes esse processo acontece por mês?",
    volumes: [
      o("low", "Até 20"),
      o("medium", "21–100"),
      o("high", "101–500"),
      o("veryhigh", "Mais de 500"),
      o("unknown", "Não sei estimar"),
    ],
    first: "Acompanhe uma execução completa: início, informações, etapas, exceções e resultado.",
    pilot:
      "Escolha uma etapa repetível para testar. Mantenha uma revisão humana e um caminho para tratar exceções.",
    verify: "Quais exceções exigem decisão humana e quais sistemas permitem acesso aos dados?",
    measure:
      "Meça tempo e erros em execuções comparáveis, incluindo o trabalho de conferir a automação.",
    dependency:
      "Ter regras explícitas, acesso autorizado aos sistemas e alguém para acompanhar falhas.",
    why: "Um recorte pequeno permite aprender se a automação realmente reduz esforço sem apenas transferir o trabalho para a conferência.",
    fit: "Automações, conexões entre sistemas e controles operacionais",
  },
  knowledge: {
    key: "knowledge",
    label: "Atendimento e conhecimento",
    desc: "Dúvidas recorrentes e informações espalhadas.",
    question: "Onde encontrar ou transmitir informação fica difícil?",
    symptoms: [
      o("repeat", "Respondemos as mesmas dúvidas muitas vezes"),
      o("search", "O time perde tempo procurando informação"),
      o("person", "As respostas dependem de uma pessoa específica"),
      o("inconsistent", "Cada pessoa responde de um jeito"),
    ],
    offer: "Conhecimento organizado para apoiar respostas",
    metric: "Perguntas resolvidas com uma fonte válida",
    unit: "dúvidas ou consultas",
    volumeQuestion: "Quantas dúvidas ou consultas desse tipo surgem por mês?",
    volumes: [
      o("low", "Até 20"),
      o("medium", "21–100"),
      o("high", "Mais de 100"),
      o("unknown", "Não acompanhamos"),
    ],
    first: "Reúna dez dúvidas frequentes e indique a fonte correta para responder cada uma.",
    pilot:
      "Teste uma base de respostas revisadas. Só então avalie um agente com fontes, limites e encaminhamento para uma pessoa.",
    verify:
      "Quem valida as respostas, quais fontes podem ser usadas e quando o agente deve pedir ajuda?",
    measure:
      "Avalie respostas corretas e apoiadas em fontes, tempo de busca e necessidade de correção humana.",
    dependency:
      "Organizar fontes atualizadas, permissões, responsável pelo conteúdo e critérios de encaminhamento.",
    why: "A qualidade das fontes e dos limites vem antes da interface do agente.",
    fit: "Base de conhecimento, agentes de IA e apoio ao atendimento",
  },
  data: {
    key: "data",
    label: "Dados e decisões",
    desc: "Relatórios, indicadores e informações confiáveis.",
    question: "O que impede uma decisão mais clara hoje?",
    symptoms: [
      o("manual", "Montar os relatórios leva muito tempo"),
      o("different", "Os números divergem entre os controles"),
      o("visibility", "Não enxergo bem vendas, custos ou resultados"),
      o("late", "A informação chega depois da decisão"),
    ],
    offer: "Dados confiáveis para uma decisão recorrente",
    metric: "Tempo para obter um indicador confiável",
    unit: "relatórios ou decisões",
    volumeQuestion: "Com que frequência você precisa dessa informação?",
    volumes: [
      o("daily", "Todo dia"),
      o("weekly", "Toda semana"),
      o("monthly", "Todo mês"),
      o("occasional", "Em ocasiões específicas"),
      o("unknown", "Ainda não defini"),
    ],
    first:
      "Escolha uma decisão recorrente e escreva quais informações ela exige, de onde vêm e quem as confere.",
    pilot:
      "Consolide um indicador com definição e fonte acordadas antes de montar um painel completo.",
    verify: "Qual número precisa ser confiável primeiro, e qual é a fonte usada para validá-lo?",
    measure:
      "Compare tempo de preparação, divergências e atualização disponível no momento da decisão.",
    dependency:
      "Definir os indicadores e conferir consistência, acesso e responsáveis pelas fontes.",
    why: "Um painel bem desenhado não resolve números que ainda significam coisas diferentes para cada pessoa.",
    fit: "Organização de dados, pipelines e dashboards",
  },
  software: {
    key: "software",
    label: "Ferramenta ou produto próprio",
    desc: "Um fluxo que os sistemas atuais não atendem.",
    question: "O que você precisa construir ou adaptar?",
    symptoms: [
      o("internal", "Uma ferramenta para o jeito que meu time trabalha"),
      o("client", "Uma área para meus clientes usarem"),
      o("product", "Um produto digital para oferecer ao mercado"),
      o("replace", "Uma alternativa a planilhas ou sistemas que me limitam"),
    ],
    offer: "Validação de uma solução sob medida",
    metric: "Conclusão da tarefa principal pelo usuário",
    unit: "pessoas usuárias",
    volumeQuestion: "Quantas pessoas usariam a primeira versão?",
    volumes: [
      o("low", "1–5"),
      o("medium", "6–20"),
      o("high", "21–100"),
      o("veryhigh", "Mais de 100"),
      o("unknown", "Ainda preciso validar"),
    ],
    first: "Defina quem usará a solução, qual tarefa precisa concluir e como faz isso hoje.",
    pilot:
      "Desenhe o fluxo principal e teste um protótipo com possíveis usuários antes de especificar todas as funções.",
    verify:
      "O que exige construção própria e o que poderia ser resolvido configurando ou conectando uma ferramenta existente?",
    measure:
      "Observe se as pessoas concluem a tarefa, onde travam e quais adaptações deixam de fazer.",
    dependency:
      "Validar demanda, fluxo principal, acesso aos dados e responsável pela evolução da solução.",
    why: "Validar o uso antes de ampliar o escopo reduz a chance de construir funções que não resolvem o problema principal.",
    fit: "Software sob medida, portais e protótipos de produto",
  },
  training: {
    key: "training",
    label: "IA e desenvolvimento do time",
    desc: "Aprender, aplicar e compartilhar boas práticas.",
    question: "O que falta para aplicar melhor a IA?",
    symptoms: [
      o("start", "Entender por onde começar no trabalho"),
      o("quality", "Conseguir resultados úteis e saber revisar"),
      o("adoption", "Levar o uso para o restante da equipe"),
      o("onboard", "Organizar treinamento e integração de pessoas"),
    ],
    offer: "Capacitação aplicada ao trabalho real",
    metric: "Tarefa concluída com qualidade e autonomia",
    unit: "pessoas participantes",
    volumeQuestion: "Quantas pessoas participariam primeiro?",
    volumes: [
      o("solo", "Só eu"),
      o("low", "2–5"),
      o("medium", "6–20"),
      o("high", "Mais de 20"),
      o("unknown", "Ainda não defini"),
    ],
    first:
      "Escolha uma tarefa real e escreva o que torna o resultado bom o suficiente para ser usado.",
    pilot:
      "Faça uma prática guiada com exemplos e revisão. Registre o método e repita a tarefa sem ajuda para verificar aprendizado.",
    verify:
      "O problema é conhecimento, confiança, tempo para praticar ou falta de um processo de aprendizagem?",
    measure:
      "Avalie qualidade, autonomia e uso posterior no trabalho; frequência de acesso não é suficiente.",
    dependency: "Separar tempo para prática, exemplos apropriados e critérios de revisão.",
    why: "Aprender em uma tarefa concreta permite avaliar aplicação no trabalho, não apenas familiaridade com ferramentas.",
    fit: "Treinamentos, workshops, trilhas e plataformas de aprendizagem",
  },
};

export const AREA_ORDER = [
  "web",
  "content",
  "sales",
  "ops",
  "knowledge",
  "data",
  "software",
  "training",
];

const sectorOptions: Option[] = [
  "Saúde e bem-estar",
  "Beleza e estética",
  "Serviços",
  "Comércio e varejo",
  "Alimentação",
  "Marketing e criação",
  "Contábil e financeiro",
  "Educação",
  "Tecnologia",
  "Outro",
].map((x) => o(x, x));

export const LABELS: Record<string, Option[]> = {
  role: [
    o("owner", "Dono(a) ou sócio(a)"),
    o("manager", "Gestor(a) ou coordenador(a)"),
    o("professional", "Autônomo(a) / profissional liberal"),
    o("team", "Faço parte da equipe"),
    o("other", "Outro papel"),
  ],
  sector: sectorOptions,
  team: [
    o("solo", "Trabalho sozinho(a)"),
    o("small", "2–5 pessoas"),
    o("medium", "6–20 pessoas"),
    o("large", "Mais de 20 pessoas"),
  ],
  workflow: [
    o("none", "Ainda não existe um processo", "Estou começando ou desenhando algo novo."),
    o(
      "manual",
      "Faço na mão ou em controles simples",
      "Mensagens, documentos, papel ou planilhas.",
    ),
    o(
      "separate",
      "Uso ferramentas, mas o trabalho fica fragmentado",
      "Preciso copiar, conferir ou completar fora delas.",
    ),
    o("connected", "Já existe um fluxo conectado", "Quero melhorar uma etapa ou um resultado."),
  ],
  impact: [
    o("time", "Tempo que falta para outras atividades"),
    o("rework", "Erros, retrabalho ou inconsistência"),
    o("sales", "Oportunidades de venda que se perdem"),
    o("customer", "Espera ou dificuldade para o cliente"),
    o("decision", "Decisões sem informação suficiente"),
    o("capacity", "Dificuldade de crescer ou atender mais"),
    o("unknown", "Ainda quero entender o impacto"),
  ],
  hours: [
    o("zero", "Não ocupa tempo hoje / é algo novo"),
    o("under2", "Menos de 2 horas"),
    o("2to5", "De 2 a 5 horas"),
    o("5to10", "Mais de 5 a 10 horas"),
    o("10to20", "Mais de 10 a 20 horas"),
    o("over20", "Mais de 20 horas"),
    o("unknown", "Não sei estimar"),
  ],
  process: [
    o("yes", "As etapas e exceções estão claras"),
    o("partial", "Parte está definida"),
    o("no", "Ainda precisamos organizar"),
  ],
  sources: [
    o("yes", "Sei onde estão e consigo acessá-los"),
    o("partial", "Estão espalhados / preciso confirmar o acesso"),
    o("no", "Ainda não tenho ou não sei"),
  ],
  owner: [
    o("yes", "Sim, há uma pessoa responsável"),
    o("partial", "Podemos definir alguém"),
    o("no", "Ainda não sei quem acompanharia"),
  ],
  ai: [
    o("none", "Ainda não uso no trabalho"),
    o("trial", "Uso em algumas tarefas, sem avaliar o resultado"),
    o("reviewed", "Uso e reviso os resultados"),
    o("structured", "Tenho usos definidos, com critérios e acompanhamento"),
  ],
  barriers: [
    o("time", "Tempo para tocar a mudança"),
    o("money", "Recursos para investir"),
    o("knowledge", "Conhecimento para escolher e aplicar"),
    o("systems", "Ferramentas ou dados difíceis de acessar"),
    o("adoption", "Adesão das pessoas envolvidas"),
    o("sensitive", "Informações que exigem cuidado de acesso"),
    o("none", "Nada relevante por enquanto"),
    o("unknown", "Ainda não sei"),
  ],
  support: [
    o("self", "Quero começar por conta própria"),
    o("training", "Quero orientação ou capacitação"),
    o("done", "Quero ajuda para construir e colocar em uso"),
    o("together", "Quero desenvolver junto com um parceiro"),
    o("unknown", "Ainda preciso entender o melhor caminho"),
  ],
  when: [
    o("urgent", "Quero começar agora"),
    o("quarter", "Nos próximos 1–3 meses"),
    o("explore", "Estou explorando, sem prazo definido"),
  ],
  decision: [
    o("me", "Eu decido"),
    o("shared", "Decido com outra pessoa"),
    o("recommend", "Recomendo; outra pessoa aprova"),
    o("unknown", "Ainda não está definido"),
  ],
  budget: [
    o("unknown", "Ainda não defini"),
    o("small", "Até R$ 2 mil"),
    o("medium", "Mais de R$ 2 mil a R$ 5 mil"),
    o("large", "Mais de R$ 5 mil a R$ 15 mil"),
    o("larger", "Mais de R$ 15 mil"),
    o("private", "Prefiro não informar"),
  ],
};

export const STAGE_NAMES = ["Seu contexto", "A oportunidade", "Condições reais", "Próximo passo"];

const STAGE_OF_STEP: Record<StepId, number> = {
  goal: 0,
  profile: 0,
  areas: 0,
  priority: 1,
  symptom: 1,
  workflow: 1,
  impact: 1,
  scale: 1,
  readiness: 2,
  barriers: 2,
  support: 2,
  success: 3,
  decision: 3,
};

export const STEP_TITLES: Record<StepId, string> = {
  goal: "O que você quer melhorar no seu negócio?",
  profile: "Conte um pouco sobre seu contexto.",
  areas: "Onde você enxerga uma oportunidade?",
  priority: "Qual dessas áreas merece atenção primeiro?",
  symptom: "",
  workflow: "Como esse trabalho acontece hoje?",
  impact: "O que essa situação impede ou dificulta?",
  scale: "Vamos dar dimensão a essa oportunidade.",
  readiness: "O que já existe para dar o próximo passo?",
  barriers: "O que pode dificultar a mudança?",
  support: "Como você prefere avançar?",
  success: "Como você perceberia que melhorou?",
  decision: "O que faz sentido para você agora?",
};

export const STEP_DESCRIPTIONS: Record<StepId, string> = {
  goal: "Comece pelo resultado que importa para você. Não é preciso saber qual tecnologia usar.",
  profile: "Isso ajuda a manter as recomendações proporcionais à sua realidade.",
  areas:
    "Escolha até três. Vamos aprofundar uma delas e registrar as outras como hipóteses para explorar depois.",
  priority:
    "Pense no que tem mais impacto hoje, ou no que abriria uma possibilidade importante para o negócio.",
  symptom:
    "Escolha a situação mais próxima da sua realidade. Isso define o recorte do seu resultado.",
  workflow:
    "A melhor resposta pode estar em ajustar o que você já tem, conectar ferramentas ou criar algo novo.",
  impact:
    "Marque até dois efeitos. Se ainda está explorando uma ideia, você pode indicar que não sabe.",
  scale:
    "Considere somente a oportunidade escolhida, não todo o trabalho da empresa. Estimativas são suficientes.",
  readiness: "Não é uma avaliação de desempenho. O que falta organizar também é parte do plano.",
  barriers: "Escolha até duas barreiras. Vamos usá-las para propor um começo viável.",
  support:
    "Você terá acesso ao resultado em qualquer opção. Conversar com a Sena Labs é uma escolha posterior.",
  success:
    "Escolha um sinal concreto para acompanhar. Não é preciso definir uma meta numérica agora.",
  decision:
    "Essas respostas ajudam a orientar uma eventual conversa. Não alteram seu acesso ao resultado.",
};

export function stageOf(id: StepId): number {
  return STAGE_OF_STEP[id];
}

export function stepsFor(a: Answers): StepId[] {
  const base: StepId[] = ["goal", "profile", "areas"];
  if ((a.areas?.length ?? 0) > 1) base.push("priority");
  base.push(
    "symptom",
    "workflow",
    "impact",
    "scale",
    "readiness",
    "barriers",
    "support",
    "success",
    "decision",
  );
  return base;
}

export function primaryArea(a: Answers): string | undefined {
  return (a.areas?.length ?? 0) === 1 ? a.areas![0] : a.priority;
}

export function labelFor(key: string, value?: string): string {
  return (LABELS[key] || []).find((x) => x.value === value)?.label || value || "Não informado";
}

export function sectorLabel(a: Answers): string {
  return a.sector === "Outro" ? a.sectorDetail?.trim() || "Outro" : a.sector || "Não informado";
}

// Keep the suggested measurement tied to the specific job, not just its area.
export function areaFor(a: Answers): AreaDef {
  const key = primaryArea(a);
  const base = { ...(AREAS[key || ""] || AREAS.ops) };
  if (key === "sales" && a.symptom === "proposal") {
    base.metric = "Tempo para preparar uma proposta revisada";
    base.measure =
      "Compare tempo de preparação e correções em propostas semelhantes; acompanhe o avanço comercial separadamente.";
  }
  if (key === "sales" && a.symptom === "retention") {
    base.metric = "Clientes acompanhados no momento combinado";
    base.measure =
      "Acompanhe contatos pertinentes realizados no momento definido e o retorno dos clientes, sem atribuir toda recompra à mensagem.";
  }
  if (key === "sales" && a.symptom === "follow") {
    base.metric = "Tempo até o próximo contato comercial";
    base.measure =
      "Observe oportunidades sem retorno, tempo até o contato e avanço de etapa, mantendo uma referência anterior ao teste.";
  }
  if (key === "content" && a.symptom === "quality") {
    base.metric = "Peças aprovadas nos critérios de qualidade";
    base.measure =
      "Defina critérios de mensagem, imagem e acabamento; compare aprovação e retrabalho, além da resposta do público.";
  }
  if (key === "data" && a.symptom === "different") {
    base.metric = "Divergências no indicador escolhido";
    base.measure =
      "Compare o mesmo indicador nas fontes definidas e registre diferenças, causas e tempo necessário para conferir.";
  }
  return base;
}

const REQUIRED_KEYS: Record<StepId, (keyof Answers)[]> = {
  goal: ["goal"],
  profile: ["role", "sector", "team"],
  areas: ["areas"],
  priority: ["priority"],
  symptom: ["symptom"],
  workflow: ["workflow"],
  impact: ["impact"],
  scale: ["volume", "hours"],
  readiness: ["process", "sources", "owner"],
  barriers: ["barriers", "ai"],
  support: ["support"],
  success: ["success"],
  decision: ["when", "decision"],
};

export function validateStep(id: StepId, a: Answers): ValidationResult {
  const missing = (REQUIRED_KEYS[id] || []).filter((k) => {
    const v = a[k];
    return !v || (Array.isArray(v) && v.length === 0);
  });
  if (missing.length) {
    return {
      ok: false,
      keys: missing as string[],
      message:
        "Escolha uma resposta para continuar. Você pode usar “Não sei” quando essa opção estiver disponível.",
    };
  }
  if (id === "areas" && (a.areas?.length ?? 0) > 3) {
    return { ok: false, keys: ["areas"], message: "Escolha até três áreas." };
  }
  if (id === "priority" && !a.areas?.includes(a.priority || "")) {
    return { ok: false, keys: ["priority"], message: "Escolha uma das áreas que você marcou." };
  }
  return { ok: true, keys: [] };
}

// Reusing answers from another opportunity would silently distort the result,
// so every dependent field is cleared when the priority area changes.
const DEPENDENT_ON_AREA: (keyof Answers)[] = [
  "symptom",
  "example",
  "volume",
  "success",
  "target",
  "workflow",
  "tools",
  "impact",
  "hours",
  "process",
  "sources",
  "owner",
  "barriers",
];

export function changeAnswer(a: Answers, key: keyof Answers, value: unknown): Answers {
  const next: Answers = { ...a, [key]: value } as Answers;
  if (key === "areas") {
    const areas = value as string[];
    if (!next.priority || !areas.includes(next.priority)) delete next.priority;
    if (areas.length === 1) next.priority = areas[0];
  }
  if (primaryArea(a) !== primaryArea(next)) {
    DEPENDENT_ON_AREA.forEach((k) => delete next[k]);
  }
  if (key === "symptom" && a.symptom !== value) {
    delete next.success;
    delete next.target;
  }
  return next;
}

export function buildResult(a: Answers): DiagnosticoReport {
  const key = primaryArea(a);
  if (!key || !AREAS[key]) throw new Error("Prioridade não definida");
  const b = areaFor(a);
  const symptom = b.symptoms.find((s) => s.value === a.symptom)?.label || "Ponto a confirmar";
  const goal = GOALS.find((g) => g.value === a.goal)?.label || "Melhorar o negócio";
  const impact = (a.impact || []).map((v) => labelFor("impact", v));

  const blockers: string[] = [];
  if (a.process !== "yes") blockers.push("Definir o fluxo e suas principais exceções.");
  if (a.sources !== "yes")
    blockers.push("Localizar os materiais e confirmar o acesso às informações.");
  if (a.owner !== "yes") blockers.push("Escolher quem vai acompanhar e validar o resultado.");
  if (a.barriers?.includes("sensitive"))
    blockers.push(
      "Delimitar quais informações podem ser usadas e por quem; começar com exemplos sem dados pessoais.",
    );
  if (a.barriers?.includes("systems"))
    blockers.push(
      "Confirmar se os sistemas permitem exportação ou conexão antes de definir a solução.",
    );
  if (a.barriers?.includes("adoption"))
    blockers.push("Ouvir as pessoas afetadas e incluir uma delas no primeiro teste.");

  const foundations = a.process === "no" || a.sources === "no" || a.owner === "no";
  const ready = a.process === "yes" && a.sources === "yes" && a.owner === "yes";
  const path = foundations
    ? "Organizar a base primeiro"
    : ready
      ? "Testar um recorte pequeno"
      : "Definir a base e testar um recorte";

  let offer = b.offer;
  let pilot = b.pilot;
  if (key === "sales") {
    if (a.symptom === "proposal") {
      offer = "Propostas com estrutura e revisão";
      pilot =
        "Padronize uma proposta e teste a geração de um rascunho a partir de poucos dados, mantendo revisão de escopo e valores.";
    }
    if (a.symptom === "pipeline") {
      offer = "Visibilidade do processo comercial";
      pilot =
        "Configure etapas, responsáveis e próximos passos em um controle único. Avalie um CRM próprio apenas se o fluxo exigir.";
    }
    if (a.symptom === "retention") {
      offer = "Relacionamento após a primeira compra";
      pilot =
        "Defina um momento de acompanhamento e teste uma mensagem pertinente, observando regras do canal e preferências do cliente.";
    }
  }
  if (key === "web" && a.symptom === "contact") {
    offer = "Melhorar o caminho até o contato";
    pilot =
      "Observe de onde vêm as visitas, revise uma oferta e teste um único CTA. Compare contatos qualificados antes de ampliar a mudança.";
  }
  if (key === "training" && a.symptom === "onboard") {
    offer = "Trilha de aprendizagem reutilizável";
    pilot =
      "Organize um primeiro módulo com uma tarefa, material de referência e verificação de aprendizagem. Avalie uma plataforma própria depois de validar a trilha.";
  }
  if (key === "knowledge" && a.symptom === "person")
    offer = "Conhecimento que não depende de uma pessoa";
  if (key === "software" && a.symptom === "product")
    pilot =
      "Converse com possíveis usuários e teste o fluxo principal com um protótipo. Valide interesse e uso antes de financiar a construção completa.";

  const workload =
    (
      {
        zero: "Não há carga atual informada: a oportunidade está em criar ou melhorar uma capacidade.",
        under2: "Menos de 8 horas em um ciclo de 4 semanas.",
        "2to5": "De 8 a 20 horas em um ciclo de 4 semanas.",
        "5to10": "Mais de 20 a 40 horas em um ciclo de 4 semanas.",
        "10to20": "Mais de 40 a 80 horas em um ciclo de 4 semanas.",
        over20: "Mais de 80 horas em um ciclo de 4 semanas.",
        unknown:
          "Ainda falta medir o esforço atual. Acompanhe uma semana típica antes de estimar ganhos.",
      } as Record<string, string>
    )[a.hours || ""] || "";

  const format =
    (
      {
        self: "Começar com o plano por conta própria",
        training: "Orientação ou capacitação aplicada",
        done: "Avaliar um projeto com escopo delimitado",
        together: "Construção acompanhada, com responsabilidades combinadas",
        unknown: "Uma conversa para escolher o formato",
      } as Record<string, string>
    )[a.support || ""] || "Uma conversa para escolher o formato";

  const actions = [
    { when: "Agora", title: "Tornar o problema observável", text: b.first },
    {
      when: "Próximos 7 dias",
      title: foundations ? "Preparar as condições do teste" : "Desenhar um primeiro teste",
      text: foundations ? blockers.slice(0, 3).join(" ") : pilot,
    },
    {
      when: "Próximos 30 dias",
      title: foundations
        ? "Validar um recorte, se a base estiver pronta"
        : "Comparar e decidir o próximo passo",
      text: foundations
        ? pilot + " " + b.measure
        : b.measure + " Amplie apenas se o resultado justificar o esforço.",
    },
  ];

  const alternatives: AlternativeOpportunity[] = (a.areas || [])
    .filter((x) => x !== key)
    .map((x) => ({
      key: x,
      label: AREAS[x].label,
      hypothesis: AREAS[x].offer,
      question: AREAS[x].verify,
    }));

  const metric =
    a.success === "custom"
      ? a.target?.trim() || b.metric
      : a.success === "unknown"
        ? b.metric
        : a.success || b.metric;
  const metricDefined =
    a.success !== "unknown" && (a.success !== "custom" || Boolean(a.target?.trim()));

  return {
    version: "sena-diagnostico-1.0",
    key,
    goal,
    offer,
    symptom,
    impact,
    path,
    ready,
    foundations,
    workload,
    format,
    actions,
    blockers,
    alternatives,
    metric,
    metricDefined,
    volume: b.volumes.find((v) => v.value === a.volume)?.label || "Não informado",
    why: b.why,
    fit: b.fit,
    dependency: b.dependency,
    verify: b.verify,
    confidence:
      "Hipóteses baseadas nas suas respostas, ainda sem verificar processos, dados ou sistemas.",
    urgency: labelFor("when", a.when),
    decision: labelFor("decision", a.decision),
    budget: labelFor("budget", a.budget || "unknown"),
    context: {
      role: labelFor("role", a.role),
      sector: sectorLabel(a),
      team: labelFor("team", a.team),
      workflow: labelFor("workflow", a.workflow),
      ai: labelFor("ai", a.ai),
    },
  };
}

export interface TranscriptRow {
  id: string;
  title: string;
  value: string;
}

export function transcriptFor(a: Answers): TranscriptRow[] {
  const b = areaFor(a);
  const areas = a.areas || [];
  return [
    {
      id: "goal",
      title: "Objetivo",
      value: GOALS.find((g) => g.value === a.goal)?.label || "Não informado",
    },
    {
      id: "profile",
      title: "Papel / segmento / equipe",
      value: [labelFor("role", a.role), sectorLabel(a), labelFor("team", a.team)].join(" · "),
    },
    {
      id: "areas",
      title: "Áreas selecionadas",
      value: areas
        .map((k) => AREAS[k]?.label)
        .filter(Boolean)
        .join(" · "),
    },
    { id: "priority", title: "Prioridade", value: b.label },
    {
      id: "symptom",
      title: b.question,
      value: b.symptoms.find((s) => s.value === a.symptom)?.label || "Não informado",
    },
    { id: "symptom", title: "Exemplo relatado", value: a.example || "Não informado" },
    { id: "workflow", title: "Forma atual de trabalho", value: labelFor("workflow", a.workflow) },
    { id: "workflow", title: "Ferramentas envolvidas", value: a.tools || "Não informadas" },
    {
      id: "impact",
      title: "Efeitos percebidos",
      value: (a.impact || []).map((v) => labelFor("impact", v)).join(" · "),
    },
    {
      id: "scale",
      title: b.volumeQuestion,
      value: b.volumes.find((v) => v.value === a.volume)?.label || "Não informado",
    },
    { id: "scale", title: "Horas semanais somadas", value: labelFor("hours", a.hours) },
    { id: "readiness", title: "Processo", value: labelFor("process", a.process) },
    { id: "readiness", title: "Fontes e acesso", value: labelFor("sources", a.sources) },
    { id: "readiness", title: "Responsável", value: labelFor("owner", a.owner) },
    {
      id: "barriers",
      title: "Barreiras",
      value: (a.barriers || []).map((v) => labelFor("barriers", v)).join(" · "),
    },
    { id: "barriers", title: "Uso de IA", value: labelFor("ai", a.ai) },
    { id: "support", title: "Formato preferido", value: labelFor("support", a.support) },
    {
      id: "success",
      title: "Indicador de sucesso",
      value:
        a.success === "unknown"
          ? "Ainda precisa definir"
          : a.success === "custom"
            ? "Outro resultado"
            : a.success || "Não informado",
    },
    { id: "success", title: "Resultado ou meta descrita", value: a.target || "Não informado" },
    { id: "decision", title: "Momento", value: labelFor("when", a.when) },
    { id: "decision", title: "Decisão de investimento", value: labelFor("decision", a.decision) },
    {
      id: "decision",
      title: "Faixa para o primeiro passo",
      value: labelFor("budget", a.budget || "unknown"),
    },
  ];
}
