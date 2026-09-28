export type Language = "pt" | "en";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatDate(iso: string, lang: Language): string {
  const m = ISO_DATE.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  return lang === "pt" ? `${d}/${mo}/${y}` : `${mo}/${d}/${y}`;
}

export function formatAmount(value: number, lang: Language): string {
  return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Aceita "5.300,00", "5,300.00", "5300", "5.300". Na dúvida (ex.: "1,234,567")
// devolve null em vez de adivinhar o valor.
export function parseAmount(input: string): number | null {
  let s = input.replace(/\s/g, "");
  if (!/^\d[\d.,]*$/.test(s)) return null;
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  if (lastDot >= 0 && lastComma >= 0) {
    const decimal = lastDot > lastComma ? "." : ",";
    const group = decimal === "." ? "," : ".";
    s = s.split(group).join("").replace(decimal, ".");
  } else if (lastComma >= 0) {
    s = s.replace(",", ".");
  } else if (lastDot >= 0 && /^[1-9]\d{0,2}(\.\d{3})+$/.test(s)) {
    s = s.split(".").join("");
  }
  // Mais de 2 casas decimais é ambíguo ("5,300" pode ser 5300 ou 5,30): recusa.
  if ((s.split(".")[1] ?? "").length > 2) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function formatZip(zip: string): string {
  const t = zip.trim();
  const digits = t.replace(/\D/g, "");
  if (/^[\d.\-\s]+$/.test(t) && digits.length === 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  return t;
}

export function joinAddress(address: string, cityState: string, zip: string): string {
  return [address.trim().replace(/[\s,]+$/, ""), cityState.trim(), formatZip(zip)]
    .filter(Boolean)
    .join(", ");
}

export function todayIso(now: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

export function addDays(iso: string, days: number): string {
  const m = ISO_DATE.exec(iso);
  if (!m) return iso;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3] + days)).toISOString().slice(0, 10);
}

export function suggestNumber(issueIso: string): string {
  const m = ISO_DATE.exec(issueIso);
  return m ? `${m[2]}${m[3]}${m[1]}` : "";
}
