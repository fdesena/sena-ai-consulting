// Cliente da API gratuita do Jurisprudências.ai — busca de decisões por linguagem natural.
// Base: https://jurisprudencias.ai/api/v1 | Auth: Bearer $JURISPRUDENCIAS_API_TOKEN
// IMPORTANTE: o parâmetro `q` é LINGUAGEM NATURAL (sem operadores booleanos/aspas).
// Cota gratuita ~5 buscas/dia → 429 = cota esgotada. Só cobre TST entre os trabalhistas.

import type { Decisao } from "./types";

const BASE = "https://jurisprudencias.ai/api/v1";

const TOKEN = process.env.JURISPRUDENCIAS_API_TOKEN || "";

/** Tribunais cobertos pela API do Jurisprudências.ai. */
export const COURTS = [
  "stf",
  "stj",
  "tst",
  "trf3",
  "trf4",
  "tjmg",
  "tjpr",
  "tjrj",
  "tjrs",
  "tjsc",
  "tjsp",
  "carf",
] as const;

/** Erro lançado quando a cota gratuita diária é atingida (HTTP 429). */
export class QuotaExceededError extends Error {
  constructor() {
    super("Cota gratuita diária do Jurisprudências.ai atingida (HTTP 429).");
    this.name = "QuotaExceededError";
  }
}

export function hasToken(): boolean {
  return TOKEN.length > 0;
}

interface DecisionsResponse {
  data?: Decisao[];
  results?: Decisao[];
  decisions?: Decisao[];
}

/**
 * Busca decisões por texto em linguagem natural num tribunal.
 * Lança QuotaExceededError em 429; retorna [] em 404 (nada encontrado).
 */
export async function buscarJurisprudencia(
  court: string,
  q: string,
  opts?: { pub_from?: string; pub_to?: string; page?: number },
): Promise<Decisao[]> {
  if (!TOKEN) throw new Error("JURISPRUDENCIAS_API_TOKEN não configurado.");

  const params = new URLSearchParams({ q, page: String(opts?.page ?? 0) });
  if (opts?.pub_from) params.set("pub_from", opts.pub_from);
  if (opts?.pub_to) params.set("pub_to", opts.pub_to);

  const url = `${BASE}/courts/${court.toLowerCase()}/decisions?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  if (res.status === 429) throw new QuotaExceededError();
  if (res.status === 404) return [];
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Jurisprudências.ai ${res.status}: ${txt.slice(0, 300)}`);
  }

  const json = (await res.json()) as DecisionsResponse;
  const items = json.data ?? json.results ?? json.decisions ?? [];
  return items.map((d) => ({ ...d, court: d.court ?? court.toLowerCase() }));
}
