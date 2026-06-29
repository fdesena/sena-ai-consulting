// Busca processual por NOME DA PARTE no DJEN (Diário de Justiça Eletrônico Nacional)
// via API pública Comunica/PJe do CNJ. É uma fonte NACIONAL, gratuita e — ao contrário do
// DataJud — pesquisável por parte (nome/empresa). Retorna comunicações processuais
// (intimações/notificações) que carregam número do processo, tribunal, classe e órgão.
// Endpoint: https://comunicaapi.pje.jus.br/api/v1/comunicacao

import type { Processo } from "./types";

const DJEN_URL = "https://comunicaapi.pje.jus.br/api/v1/comunicacao";
const UA =
  "Mozilla/5.0 (compatible; Jurisprudencia.ai/1.0; +https://jurisprudencias.ai)";

interface DjenDestinatario {
  nome?: string;
  polo?: string;
}

interface DjenItem {
  numeroprocessocommascara?: string;
  numero_processo?: string;
  siglaTribunal?: string;
  nomeClasse?: string;
  nomeOrgao?: string;
  data_disponibilizacao?: string;
  tipoComunicacao?: string;
  tipoDocumento?: string;
  texto?: string;
  link?: string;
  destinatarios?: DjenDestinatario[];
}

interface DjenResponse {
  status?: string;
  count?: number;
  items?: DjenItem[];
}

/** Remove tags HTML e normaliza espaços do texto de uma publicação. */
function limparTexto(s: string): string {
  return (s || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Uma publicação oficial (teor) de um processo, vinda do DJEN. */
export interface Publicacao {
  data?: string;
  tribunal?: string;
  orgao?: string;
  tipo?: string;
  documento?: string;
  texto: string;
  link?: string;
}

/**
 * Busca o TEOR de um processo: todas as publicações oficiais (despachos, decisões,
 * sentenças, intimações) registradas no DJEN para aquele número. Não acessa os autos
 * integrais (PDFs/peças), que ficam no PJe sob login — só o que foi publicado no Diário.
 */
export async function consultarTeorPorNumero(
  numeroProcesso: string,
  limite = 50,
): Promise<Publicacao[]> {
  const url = new URL(DJEN_URL);
  url.searchParams.set("numeroProcesso", numeroProcesso);
  url.searchParams.set("pagina", "1");
  url.searchParams.set("itensPorPagina", String(Math.min(limite, 100)));

  const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": UA } });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`DJEN ${res.status} (${url.pathname}): ${txt.slice(0, 200)}`);
  }
  const data = (await res.json()) as DjenResponse;
  return (data.items ?? [])
    .map((it) => ({
      data: it.data_disponibilizacao,
      tribunal: it.siglaTribunal,
      orgao: it.nomeOrgao,
      tipo: it.tipoComunicacao,
      documento: it.tipoDocumento,
      texto: limparTexto(it.texto ?? ""),
      link: it.link,
    }))
    .sort((a, b) => String(a.data).localeCompare(String(b.data)));
}

function normalizeNome(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Busca comunicações de um nome de parte no DJEN e consolida em processos únicos.
 * @param nome  Razão social ou nome do administrador.
 * @param limite Máximo de comunicações a varrer (padrão 30).
 */
export async function buscarProcessosPorParte(
  nome: string,
  limite = 30,
): Promise<Processo[]> {
  const url = new URL(DJEN_URL);
  url.searchParams.set("nomeParte", nome);
  url.searchParams.set("pagina", "1");
  url.searchParams.set("itensPorPagina", String(Math.min(limite, 100)));

  const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": UA } });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`DJEN ${res.status} (${url.pathname}): ${txt.slice(0, 200)}`);
  }
  const data = (await res.json()) as DjenResponse;
  const items = data.items ?? [];

  const alvo = normalizeNome(nome);
  // Mantém só comunicações em que o nome buscado realmente consta entre os destinatários,
  // reduzindo falsos positivos (ex.: homônimos de administradores).
  const relevantes = items.filter((it) => {
    const dests = (it.destinatarios ?? []).map((d) => normalizeNome(d.nome ?? ""));
    return dests.some((d) => d.includes(alvo) || alvo.includes(d));
  });

  // Consolida por número de processo, agregando as comunicações como "movimentos".
  const porProcesso = new Map<string, Processo>();
  for (const it of relevantes) {
    const num = it.numeroprocessocommascara || it.numero_processo;
    if (!num) continue;
    const movimento = {
      data: it.data_disponibilizacao,
      nome: [it.tipoComunicacao, it.tipoDocumento].filter(Boolean).join(" — "),
    };
    const existente = porProcesso.get(num);
    if (existente) {
      existente.movimentos.push(movimento);
      if (!existente.url && it.link) existente.url = it.link;
    } else {
      porProcesso.set(num, {
        numeroProcesso: num,
        tribunal: it.siglaTribunal,
        classe: it.nomeClasse,
        orgaoJulgador: it.nomeOrgao,
        assuntos: [],
        ultimaAtualizacao: it.data_disponibilizacao,
        movimentos: [movimento],
        fonte: "DJEN/Comunica (CNJ)",
        parte: nome,
        url: it.link,
      });
    }
  }

  // Ordena movimentos por data (mais recentes ao final) e limita a 5 por processo.
  return [...porProcesso.values()].map((p) => ({
    ...p,
    movimentos: p.movimentos
      .sort((a, b) => String(a.data).localeCompare(String(b.data)))
      .slice(-5),
  }));
}
