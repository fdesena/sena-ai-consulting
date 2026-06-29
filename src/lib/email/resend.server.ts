// Resend transactional email sender. Replaces @lovable.dev/email-js.
//
// Throws EmailSendError carrying the HTTP status (and Retry-After when present),
// so the queue dispatcher's existing 429 (rate-limit backoff) and 403 (move to
// DLQ) handling keeps working unchanged.

interface ResendSendInput {
  to: string
  from: string
  subject: string
  html?: string | null
  text?: string | null
  unsubscribe_token?: string | null
}

export class EmailSendError extends Error {
  status: number
  retryAfterSeconds: number | null
  constructor(message: string, status: number, retryAfterSeconds: number | null) {
    super(message)
    this.name = 'EmailSendError'
    this.status = status
    this.retryAfterSeconds = retryAfterSeconds
  }
}

// Public base URL used to build the one-click unsubscribe link (RFC 8058).
// Matches the /email/unsubscribe route handler.
function siteBaseUrl(): string {
  const fromEnv =
    process.env.PUBLIC_SITE_URL ||
    process.env.VITE_PUBLIC_SITE_URL ||
    'https://senaconsulting.app'
  return fromEnv.replace(/\/$/, '')
}

export async function sendResendEmail(
  input: ResendSendInput,
  opts: { apiKey: string; from?: string },
): Promise<{ id: string }> {
  // Prefer the verified RESEND_FROM sender; fall back to the payload's from.
  const from = opts.from || input.from

  const headers: Record<string, string> = {}
  if (input.unsubscribe_token) {
    const url = `${siteBaseUrl()}/email/unsubscribe?token=${input.unsubscribe_token}`
    headers['List-Unsubscribe'] = `<${url}>`
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click'
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html ?? undefined,
      text: input.text ?? undefined,
      headers: Object.keys(headers).length ? headers : undefined,
    }),
  })

  if (!res.ok) {
    let message = `Resend send failed with status ${res.status}`
    try {
      const body = await res.json()
      if (body?.message) message = body.message
      else if (body?.error)
        message = typeof body.error === 'string' ? body.error : JSON.stringify(body.error)
    } catch {
      // ignore body parse errors — keep the status-based message
    }
    const retryAfterHeader = res.headers.get('retry-after')
    const parsed = retryAfterHeader ? Number(retryAfterHeader) : NaN
    throw new EmailSendError(message, res.status, Number.isFinite(parsed) ? parsed : null)
  }

  const data = await res.json().catch(() => ({}))
  return { id: data?.id ?? '' }
}
