// Tipos compartilhados entre backend (route handler / agente) e frontend.

/** Resumo de um processo, como retornado pela API pública do DataJud (CNJ). */
export interface Processo {
  numeroProcesso?: string;
  tribunal?: string;
  grau?: string;
  classe?: string;
  assuntos: string[];
  orgaoJulgador?: string;
  dataAjuizamento?: string;
  ultimaAtualizacao?: string;
  movimentos: { data?: string; nome?: string }[];
  /** Origem do dado quando NÃO vem do DataJud (ex.: "DJEN/Comunica (CNJ)"). */
  fonte?: string;
  /** Nome da parte que casou na busca por parte (DJEN). */
  parte?: string;
  /** Link público para a comunicação/processo na fonte externa. */
  url?: string;
}

/** Decisão/ementa retornada pela API do Jurisprudências.ai. */
export interface Decisao {
  court?: string;
  process_number?: string;
  publication_date?: string;
  excerpt?: string;
  full_text?: string;
  url?: string;
  /** Quando preenchido, este "card" é um link de pesquisa web (Escavador, Jusbrasil
   *  etc.), não uma decisão da API — usado no fallback quando não há resultados. */
  source?: string;
}

/**
 * Eventos enviados via SSE do route handler para o navegador.
 * Cada linha do stream é um JSON destes (precedido por "data: ").
 */
export type ProgressEvent =
  | { type: "step"; phase: string; message: string }
  | { type: "processos"; data: Processo[] }
  | { type: "decisoes"; data: Decisao[] }
  | { type: "synthesis_delta"; text: string }
  | { type: "defesa_delta"; text: string } // argumentos para o réu/requerido
  | { type: "requerente_delta"; text: string } // argumentos para o autor/requerente
  | { type: "reset" } // limpa texto de síntese acumulado (narração antes de ferramentas)
  | { type: "quota_exceeded" }
  | { type: "done" }
  | { type: "error"; message: string };
