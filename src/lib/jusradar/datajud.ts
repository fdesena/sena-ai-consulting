// Cliente da API Pública do DataJud (CNJ) — consulta gratuita de metadados de processos.
// Portado das funções puras do MCP server da raiz do projeto (../server.js):
// ALIASES, resolveAlias, datajud(), resumirHits(). Mantê-los em sincronia.
// Docs: https://datajud-wiki.cnj.jus.br/api-publica/

import type { Processo } from "./types";

// Chave pública oficial do CNJ (a mesma para todos; pode ser trocada pelo CNJ).
// Pode ser sobrescrita via variável de ambiente DATAJUD_API_KEY.
const API_KEY =
  process.env.DATAJUD_API_KEY || "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

const BASE = "https://api-publica.datajud.cnj.jus.br";

// Aliases de tribunais mais comuns. Para qualquer outro, passe o alias completo
// (ex: "api_publica_tjam") no parâmetro `tribunal`.
const ALIASES: Record<string, string> = {
  tjsp: "api_publica_tjsp",
  tjrj: "api_publica_tjrj",
  tjmg: "api_publica_tjmg",
  tjrs: "api_publica_tjrs",
  tjpr: "api_publica_tjpr",
  tjsc: "api_publica_tjsc",
  tjba: "api_publica_tjba",
  tjdft: "api_publica_tjdft",
  tjgo: "api_publica_tjgo",
  tjpe: "api_publica_tjpe",
  tjce: "api_publica_tjce",
  trf1: "api_publica_trf1",
  trf2: "api_publica_trf2",
  trf3: "api_publica_trf3",
  trf4: "api_publica_trf4",
  trf5: "api_publica_trf5",
  trf6: "api_publica_trf6",
  stj: "api_publica_stj",
  tst: "api_publica_tst",
  tse: "api_publica_tse",
  trt1: "api_publica_trt1",
  trt2: "api_publica_trt2",
  trt3: "api_publica_trt3",
  trt4: "api_publica_trt4",
  trt15: "api_publica_trt15",
};

function resolveAlias(t: string): string {
  const key = String(t || "")
    .toLowerCase()
    .trim();
  if (ALIASES[key]) return ALIASES[key];
  if (key.startsWith("api_publica_")) return key;
  return `api_publica_${key}`;
}

async function datajud(tribunal: string, body: Record<string, unknown>): Promise<unknown> {
  const alias = resolveAlias(tribunal);
  const url = `${BASE}/${alias}/_search`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `APIKey ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`DataJud ${res.status} (${url}): ${txt.slice(0, 500)}`);
  }
  return res.json();
}

interface EsHit {
  _source?: {
    numeroProcesso?: string;
    tribunal?: string;
    grau?: string;
    classe?: { nome?: string };
    assuntos?: { nome?: string }[];
    orgaoJulgador?: { nome?: string };
    dataAjuizamento?: string;
    dataHoraUltimaAtualizacao?: string;
    movimentos?: { dataHora?: string; nome?: string }[];
  };
}

function resumirHits(json: unknown): Processo[] {
  const hits: EsHit[] = (json as { hits?: { hits?: EsHit[] } })?.hits?.hits ?? [];
  return hits.map((h) => {
    const s = h._source ?? {};
    return {
      numeroProcesso: s.numeroProcesso,
      tribunal: s.tribunal,
      grau: s.grau,
      classe: s.classe?.nome,
      assuntos: (s.assuntos ?? []).map((a) => a.nome).filter(Boolean) as string[],
      orgaoJulgador: s.orgaoJulgador?.nome,
      dataAjuizamento: s.dataAjuizamento,
      ultimaAtualizacao: s.dataHoraUltimaAtualizacao,
      movimentos: (s.movimentos ?? []).slice(-5).map((m) => ({ data: m.dataHora, nome: m.nome })),
    };
  });
}

/** Busca avançada por query Elasticsearch (DSL) num tribunal. */
export async function buscarProcessos(
  tribunal: string,
  query: Record<string, unknown>,
  size = 10,
): Promise<Processo[]> {
  const json = await datajud(tribunal, { size, query });
  return resumirHits(json);
}

/** Consulta um processo pelo número único (CNJ) num tribunal. */
export async function consultarProcesso(
  numeroProcesso: string,
  tribunal: string,
): Promise<Processo[]> {
  const num = String(numeroProcesso).replace(/\D/g, "");
  const json = await datajud(tribunal, { query: { match: { numeroProcesso: num } } });
  return resumirHits(json);
}
