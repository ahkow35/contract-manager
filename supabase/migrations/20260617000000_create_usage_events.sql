-- Usage tracking for the admin dashboard. PDPA-safe: records WHO generated WHICH template WHEN —
-- never any document field values / employee PII. RLS locked; only the server (service_role) writes/reads.
create table if not exists public.usage_events (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users (id) on delete set null,
  user_email  text,
  template_id text not null,
  created_at  timestamptz not null default now()
);

create index if not exists usage_events_created_at_idx on public.usage_events (created_at desc);
create index if not exists usage_events_template_idx on public.usage_events (template_id);

alter table public.usage_events enable row level security;
-- No policies: anon/authenticated clients cannot read or write directly.
-- The Next.js server uses the service_role key (which bypasses RLS) for all access.
