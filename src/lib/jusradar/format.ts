// Formatadores de exibição (datas do DataJud, número CNJ).

/** Formata datas do DataJud: "20210202175107" (yyyymmddHHMMSS) ou ISO. */
export function formatData(value?: string): string {
  if (!value) return "—";
  // yyyymmdd... (somente dígitos)
  if (/^\d{8}/.test(value)) {
    const y = value.slice(0, 4);
    const m = value.slice(4, 6);
    const d = value.slice(6, 8);
    return `${d}/${m}/${y}`;
  }
  const dt = new Date(value);
  if (!isNaN(dt.getTime())) {
    return dt.toLocaleDateString("pt-BR");
  }
  return value;
}

/** Aplica a pontuação CNJ NNNNNNN-DD.AAAA.J.TR.OOOO a um número só de dígitos. */
export function formatNumeroCNJ(num?: string): string {
  if (!num) return "—";
  const d = num.replace(/\D/g, "");
  if (d.length !== 20) return num;
  return `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d.slice(13, 14)}.${d.slice(14, 16)}.${d.slice(16, 20)}`;
}

/** Constrói links úteis para abrir/pesquisar um processo em portais públicos. */
export function buildProcessLinks(numero?: string, tribunal?: string) {
  if (!numero) return [] as { label: string; url: string }[];
  const enc = encodeURIComponent(numero);
  const links = [
    { label: "Jusbrasil", url: `https://www.jusbrasil.com.br/busca?q=${enc}` },
    { label: "Google (busca)", url: `https://www.google.com/search?q=${enc}` },
  ];

  if (tribunal) {
    const t = tribunal.toLowerCase();
    // mapa simples de alias → domínio
    const map: Record<string, string> = {
      tjsp: "tjsp.jus.br",
      trt2: "trt2.jus.br",
      trt15: "trt15.jus.br",
      trf3: "trf3.jus.br",
      trf4: "trf4.jus.br",
      tst: "tst.jus.br",
    };
    const d = map[t];
    if (d) links.unshift({ label: `Pesquisar no ${tribunal.toUpperCase()}`, url: `https://www.google.com/search?q=site:${d}+${enc}` });
  }

  return links;
}
