import { buildInvoicePdf, pdfFileName } from "./pdf";
import type { InvoiceData } from "./schema";

const LOGO_URL = "/sena-labs-brand-kit/png/sena-labs-symbol-dark.png";
let logoPromise: Promise<string | undefined> | undefined;

function loadLogo(): Promise<string | undefined> {
  logoPromise ??= fetch(LOGO_URL)
    .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(String(res.status)))))
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        }),
    )
    .catch(() => {
      logoPromise = undefined;
      return undefined;
    });
  return logoPromise;
}

export async function downloadInvoice(inv: InvoiceData): Promise<void> {
  const logo = await loadLogo();
  buildInvoicePdf(inv, logo).save(pdfFileName(inv.number));
}
