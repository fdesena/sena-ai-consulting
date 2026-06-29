-- =============================================================================
-- Email queue dispatcher (pg_cron)  —  run this AFTER deploying the app.
--
-- Replaces the dynamic "setup_email_infra" step that Lovable Cloud used to apply.
-- It is NOT a numbered migration because it is environment-specific (depends on
-- the deployed app URL) and references a vault secret.
--
-- PREREQUISITE: the service_role key must be stored in Vault under the name
-- 'email_queue_service_role_key'. See README/handoff notes — that step carries
-- the secret and is run separately (never committed).
--
-- The job runs every 10s, skips while rate-limited, and only calls the endpoint
-- when one of the queues actually has messages. The endpoint authenticates the
-- caller by comparing the Bearer token against SUPABASE_SERVICE_ROLE_KEY.
--
-- To change the target URL, edit the value below and re-run this file.
-- To remove: select cron.unschedule('process-email-queue');
-- =============================================================================

select cron.unschedule('process-email-queue')
where exists (select 1 from cron.job where jobname = 'process-email-queue');

select cron.schedule(
  'process-email-queue',
  '10 seconds',
  $job$
  do $cron$
  declare
    cooldown timestamptz;
    has_msgs boolean;
  begin
    select retry_after_until into cooldown
      from public.email_send_state where id = 1;
    if cooldown is not null and cooldown > now() then
      return;
    end if;

    select
      (exists (select 1 from pgmq.q_auth_emails))
      or (exists (select 1 from pgmq.q_transactional_emails))
      into has_msgs;

    if has_msgs then
      perform net.http_post(
        url := 'https://senaconsulting.app/lovable/email/queue/process',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (
            select decrypted_secret from vault.decrypted_secrets
            where name = 'email_queue_service_role_key'
            order by created_at desc limit 1
          )
        ),
        body := '{}'::jsonb
      );
    end if;
  end;
  $cron$;
  $job$
);
