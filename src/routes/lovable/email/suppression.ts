import { createClient } from "@supabase/supabase-js";
import { Webhook, WebhookVerificationError } from "svix";
import { createFileRoute } from "@tanstack/react-router";

// Resend webhook receiver for bounces and complaints. Replaces the old
// Mailgun/Lovable suppression webhook. Configure in resend.com → Webhooks with
// URL https://www.senaconsulting.app/lovable/email/suppression and store the
// signing secret (whsec_...) as RESEND_WEBHOOK_SECRET.
//
// Resend signs webhooks with Svix (svix-id / svix-timestamp / svix-signature headers).

interface ResendWebhookEvent {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string[];
    bounce?: { type?: string; subType?: string; message?: string };
    [key: string]: unknown;
  };
}

// Resend event type -> our suppression reason. Returns null for events we ignore
// (delivered, sent, opened, clicked, delivery_delayed, etc.).
function reasonForEvent(type: string): "bounce" | "complaint" | null {
  switch (type) {
    case "email.bounced":
      return "bounce";
    case "email.complained":
      return "complaint";
    default:
      return null;
  }
}

function mapReasonToStatus(reason: "bounce" | "complaint"): "bounced" | "complained" {
  return reason === "bounce" ? "bounced" : "complained";
}

function mapReasonToMessage(reason: "bounce" | "complaint"): string {
  return reason === "bounce"
    ? "Permanent bounce — email address is invalid or rejected"
    : "Spam complaint — recipient marked email as spam";
}

function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  return `${local[0]}***@${domain}`;
}

export const Route = createFileRoute("/lovable/email/suppression")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

        if (!supabaseUrl || !supabaseServiceKey || !webhookSecret) {
          console.error("Missing required environment variables (suppression webhook)");
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Verify Svix signature against the raw body
        const rawBody = await request.text();
        let event: ResendWebhookEvent;
        try {
          const wh = new Webhook(webhookSecret);
          event = wh.verify(rawBody, {
            "svix-id": request.headers.get("svix-id") ?? "",
            "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
            "svix-signature": request.headers.get("svix-signature") ?? "",
          }) as ResendWebhookEvent;
        } catch (error) {
          if (error instanceof WebhookVerificationError) {
            console.error("Invalid Resend webhook signature");
            return Response.json({ error: "Invalid signature" }, { status: 401 });
          }
          console.error("Webhook verification error", { error });
          return Response.json({ error: "Internal error" }, { status: 500 });
        }

        const reason = reasonForEvent(event.type);
        if (!reason) {
          // Acknowledge events we don't suppress on (delivered, opened, etc.)
          return Response.json({ ignored: event.type });
        }

        const recipients = (event.data?.to ?? []).filter(Boolean);
        if (recipients.length === 0) {
          console.warn("Suppression event without recipients", { type: event.type });
          return Response.json({ success: true, suppressed: 0 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const status = mapReasonToStatus(reason);
        const message = mapReasonToMessage(reason);

        for (const raw of recipients) {
          const email = raw.toLowerCase();

          const { error: suppressError } = await supabase
            .from("suppressed_emails")
            .upsert({ email, reason }, { onConflict: "email" });
          if (suppressError) {
            console.error("Failed to upsert suppressed email", {
              error: suppressError,
              email_redacted: redactEmail(email),
            });
            return Response.json({ error: "Failed to write suppression" }, { status: 500 });
          }

          const { error: logError } = await supabase.from("email_send_log").insert({
            message_id: event.data?.email_id ?? null,
            template_name: "system",
            recipient_email: email,
            status,
            error_message: message,
          });
          if (logError) {
            // Non-fatal — suppression already recorded.
            console.warn("Failed to insert email_send_log", { error: logError });
          }

          console.log("Suppression processed", {
            email_redacted: redactEmail(email),
            reason,
          });
        }

        return Response.json({ success: true, suppressed: recipients.length });
      },
    },
  },
});
