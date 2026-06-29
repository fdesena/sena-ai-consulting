// Gera links de pesquisa úteis para fallback quando a API do Jurisprudências.ai
// estiver sem cota. Não raspa sites — apenas constrói URLs de busca em portais úteis.

export interface SearchLink {
  source: string;
  url: string;
}

const TRIBUNAL_DOMAINS: Record<string, string> = {
  stf: "portal.stf.jus.br",
  stj: "stj.jus.br",
  tst: "tst.jus.br",
  tjsp: "tjsp.jus.br",
  tjrj: "tjrj.jus.br",
  tjmg: "tjmg.jus.br",
  tjrs: "tjrs.jus.br",
  tjpr: "tjpr.jus.br",
  tjsc: "tjsc.jus.br",
  trt2: "trt2.jus.br",
  trt15: "trt15.jus.br",
  trf3: "trf3.jus.br",
  trf4: "trf4.jus.br",
};

/**
 * Monta links de pesquisa jurisprudencial em portais web (Escavador, Jusbrasil,
 * tribunal, Google Acadêmico). Usado como FALLBACK quando a API do Jurisprudências.ai
 * não devolve resultados (busca vazia), está sem cota (429) ou sem token configurado.
 * Não raspa nada — apenas constrói URLs de busca já preenchidas.
 */
export function buildJurisprudenciaFallbackLinks(q: string, court?: string): SearchLink[] {
  const enc = encodeURIComponent(q);
  const links: SearchLink[] = [];

  // Escavador — busca de jurisprudência (qo=j filtra por decisões).
  links.push({ source: "Escavador (jurisprudência)", url: `https://www.escavador.com/busca?q=${enc}&qo=j` });

  // Jusbrasil — busca específica de jurisprudência (ementas/decisões).
  links.push({ source: "Jusbrasil (jurisprudência)", url: `https://www.jusbrasil.com.br/jurisprudencia/busca?q=${enc}` });

  // Jurisprudências.ai — interface web do próprio serviço.
  links.push({ source: "Jurisprudências.ai (web)", url: `https://jurisprudencias.ai/search?q=${enc}` });

  // Tribunal específico (se informado), busca no domínio oficial via Google site:.
  if (court) {
    const d = TRIBUNAL_DOMAINS[court.toLowerCase()];
    if (d) {
      links.push({ source: `Busca no site do ${court.toUpperCase()}`, url: `https://www.google.com/search?q=site:${d}+${enc}` });
    }
  }

  // Google Acadêmico (doutrina/jurisprudência) e Google geral com recorte jurídico.
  links.push({ source: "Google Acadêmico", url: `https://scholar.google.com.br/scholar?q=${enc}` });
  links.push({ source: "Google", url: `https://www.google.com/search?q=${enc}+jurisprud%C3%AAncia` });

  return links;
}
