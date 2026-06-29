-- Keep-alive heartbeat to prevent Supabase free-tier pausing.
-- Free projects pause after 7 days with no database activity. A daily write from
-- pg_cron counts as activity and resets the timer. This is belt-and-suspenders on
-- top of the every-10s process-email-queue job.

create table if not exists public.keep_alive (
  id smallint primary key default 1,
  last_ping timestamptz not null default now(),
  constraint keep_alive_singleton check (id = 1)
);

insert into public.keep_alive (id) values (1) on conflict (id) do nothing;

-- Internal-only table: enable RLS with no policies so it is not exposed via the API
-- (the pg_cron job runs as postgres and bypasses RLS).
alter table public.keep_alive enable row level security;

-- Daily heartbeat write at 07:17 UTC. Unschedule first for idempotency.
select cron.unschedule('keep-alive')
where exists (select 1 from cron.job where jobname = 'keep-alive');

select cron.schedule(
  'keep-alive',
  '17 7 * * *',
  $$ update public.keep_alive set last_ping = now() where id = 1; $$
);
