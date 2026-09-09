// Resend transactional email sender. Replaces @lovable.dev/email-js.
//
// Throws EmailSendError carrying the HTTP status (and Retry-After when present),
// so the queue dispatcher's existing 429 (rate-limit backoff) and 403 (move to
// DLQ) handling keeps working unchanged.

interface ResendAttachment {
  filename: string;
  content: string; // base64-encoded file content
}

interface ResendSendInput {
  to: string;
  from: string;
  subject: string;
  html?: string | null;
  text?: string | null;
  unsubscribe_token?: string | null;
  bcc?: string[];
  attachments?: ResendAttachment[];
}

export class EmailSendError extends Error {
  status: number;
  retryAfterSeconds: number | null;
  constructor(message: string, status: number, retryAfterSeconds: number | null) {
    super(message);
    this.name = "EmailSendError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// Public base URL used to build the one-click unsubscribe link (RFC 8058).
// Matches the /email/unsubscribe route handler.
function siteBaseUrl(): string {
  const fromEnv =
    process.env.PUBLIC_SITE_URL || process.env.VITE_PUBLIC_SITE_URL || "https://www.senalabs.tech";
  return fromEnv.replace(/\/$/, "");
}

// Domínio antigo — usado só como fallback se o remetente principal
// (RESEND_FROM, esperado em @senalabs.tech) falhar o envio.
const DEFAULT_FALLBACK_FROM = "contato@senaconsulting.app";

async function attemptResendSend(
  input: ResendSendInput,
  from: string,
  apiKey: string,
): Promise<{ id: string }> {
  const headers: Record<string, string> = {};
  if (input.unsubscribe_token) {
    const url = `${siteBaseUrl()}/email/unsubscribe?token=${input.unsubscribe_token}`;
    headers["List-Unsubscribe"] = `<${url}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      bcc: input.bcc?.length ? input.bcc : undefined,
      subject: input.subject,
      html: input.html ?? undefined,
      text: input.text ?? undefined,
      attachments: input.attachments?.length ? input.attachments : undefined,
      headers: Object.keys(headers).length ? headers : undefined,
    }),
  });

  if (!res.ok) {
    let message = `Resend send failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
      else if (body?.error)
        message = typeof body.error === "string" ? body.error : JSON.stringify(body.error);
    } catch {
      // ignore body parse errors — keep the status-based message
    }
    const retryAfterHeader = res.headers.get("retry-after");
    const parsed = retryAfterHeader ? Number(retryAfterHeader) : NaN;
    throw new EmailSendError(message, res.status, Number.isFinite(parsed) ? parsed : null);
  }

  const data = await res.json().catch(() => ({}));
  return { id: data?.id ?? "" };
}

export async function sendResendEmail(
  input: ResendSendInput,
  opts: { apiKey: string; from?: string; fromFallback?: string },
): Promise<{ id: string }> {
  // Prefer the verified RESEND_FROM sender (senalabs.tech); fall back to the
  // payload's from, then to the old senaconsulting.app domain only if the
  // primary send fails (e.g. domain not yet verified in Resend).
  const from = opts.from || input.from;
  const fallbackFrom = opts.fromFallback || DEFAULT_FALLBACK_FROM;

  try {
    return await attemptResendSend(input, from, opts.apiKey);
  } catch (err) {
    if (!fallbackFrom || fallbackFrom === from) throw err;
    console.error(
      `Resend send from "${from}" failed, retrying with fallback "${fallbackFrom}"`,
      err,
    );
    return await attemptResendSend(input, fallbackFrom, opts.apiKey);
  }
}
