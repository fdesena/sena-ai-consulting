// Provider de CNPJ: enriquece um CNPJ com dados cadastrais e quadro de sócios/administradores
// (QSA) via BrasilAPI (gratuita, sem chave). Em seguida monta deep-links de busca processual
// por NOME da parte (empresa e administradores) em agregadores e portais — porque o DataJud
// NÃO indexa partes/CNPJ, não há como buscar processos por documento direto na fonte pública.
// Docs BrasilAPI: https://brasilapi.com.br/docs#tag/CNPJ

import type { SearchLink } from "./webresearch";

export interface SocioQSA {
  nome: string;
  qualificacao?: string;
}

export interface EmpresaCnpj {
  cnpj: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  situacao?: string;
  dataInicioAtividade?: string;
  cnae?: string;
  cnaeDescricao?: string;
  municipio?: string;
  uf?: string;
  socios: SocioQSA[];
}

/** Mantém apenas os 14 dígitos do CNPJ. */
export function normalizarCnpj(cnpj: string): string {
  return String(cnpj || "").replace(/\D/g, "");
}

/** Formata 40962221000165 -> 40.962.221/0001-65 (para exibição). */
export function formatarCnpj(cnpj: string): string {
  const d = normalizarCnpj(cnpj);
  if (d.length !== 14) return cnpj;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

interface BrasilApiQsa {
  nome_socio?: string;
  qualificacao_socio?: string;
}

interface BrasilApiCnpj {
  razao_social?: string;
  nome_fantasia?: string;
  descricao_situacao_cadastral?: string;
  data_inicio_atividade?: string;
  cnae_fiscal?: number | string;
  cnae_fiscal_descricao?: string;
  municipio?: string;
  uf?: string;
  qsa?: BrasilApiQsa[];
  message?: string;
}

// Endpoints gratuitos (sem chave) com o MESMO formato de resposta (Receita Federal).
// Tenta na ordem; ambos retornam razao_social, qsa[].nome_socio etc.
const CNPJ_ENDPOINTS = [
  (d: string) => `https://brasilapi.com.br/api/cnpj/v1/${d}`,
  (d: string) => `https://minhareceita.org/${d}`,
];

const UA = "Mozilla/5.0 (compatible; Jurisprudencia.ai/1.0; +https://jurisprudencias.ai)";

/** Consulta os dados cadastrais e o QSA de um CNPJ (BrasilAPI, com fallback minhareceita.org). */
export async function consultarCnpj(cnpj: string): Promise<EmpresaCnpj> {
  const digits = normalizarCnpj(cnpj);
  if (digits.length !== 14) {
    throw new Error(`CNPJ inválido: "${cnpj}" (esperados 14 dígitos).`);
  }

  let d: BrasilApiCnpj | null = null;
  const erros: string[] = [];
  for (const build of CNPJ_ENDPOINTS) {
    const url = build(digits);
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": UA },
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        erros.push(`${url} → ${res.status} ${txt.slice(0, 120)}`);
        continue;
      }
      d = (await res.json()) as BrasilApiCnpj;
      break;
    } catch (e) {
      erros.push(`${url} → ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  if (!d) {
    throw new Error(`Falha ao consultar CNPJ em todas as fontes: ${erros.join(" | ")}`);
  }
  return {
    cnpj: formatarCnpj(digits),
    razaoSocial: d.razao_social,
    nomeFantasia: d.nome_fantasia || undefined,
    situacao: d.descricao_situacao_cadastral,
    dataInicioAtividade: d.data_inicio_atividade,
    cnae: d.cnae_fiscal != null ? String(d.cnae_fiscal) : undefined,
    cnaeDescricao: d.cnae_fiscal_descricao,
    municipio: d.municipio,
    uf: d.uf,
    socios: (d.qsa ?? [])
      .map((s) => ({
        nome: s.nome_socio ?? "",
        qualificacao: s.qualificacao_socio,
      }))
      .filter((s) => s.nome),
  };
}

/**
 * Monta deep-links de busca processual por NOME da parte (empresa ou administrador)
 * em agregadores (Escavador, Jusbrasil) e no e-SAJ do TJSP (consulta por nome da parte).
 * Não raspa nada — apenas constrói URLs de busca já preenchidas.
 */
export function buildBuscaProcessosPorParte(nome: string, cnpj?: string): SearchLink[] {
  const enc = encodeURIComponent(nome);
  const links: SearchLink[] = [
    { source: `Escavador — "${nome}"`, url: `https://www.escavador.com/busca?q=${enc}&qo=t` },
    { source: `Jusbrasil — "${nome}"`, url: `https://www.jusbrasil.com.br/busca?q=${enc}` },
    {
      source: `e-SAJ TJSP (consulta por nome da parte)`,
      url: `https://esaj.tjsp.jus.br/cpopg/open.do`,
    },
    {
      source: `Google — processos de "${nome}"`,
      url: `https://www.google.com/search?q=${enc}+processo+r%C3%A9u+OR+requerido`,
    },
  ];
  if (cnpj) {
    const encCnpj = encodeURIComponent(formatarCnpj(cnpj));
    links.unshift({
      source: `Escavador — CNPJ ${formatarCnpj(cnpj)}`,
      url: `https://www.escavador.com/busca?q=${encCnpj}&qo=t`,
    });
  }
  return links;
}
