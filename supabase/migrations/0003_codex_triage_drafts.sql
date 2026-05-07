create table if not exists public.codex_triage_drafts (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'prepared'
    check (status in ('prepared', 'reviewed', 'archived')),
  title text not null,
  prompt text not null,
  policy jsonb not null,
  requested_output jsonb not null,
  input_payload jsonb not null,
  codex_output jsonb,
  owner_notes text,
  report_ids uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.codex_triage_drafts enable row level security;

create index if not exists codex_triage_drafts_created_at_idx
on public.codex_triage_drafts (created_at desc);

create index if not exists codex_triage_drafts_status_idx
on public.codex_triage_drafts (status);

create index if not exists codex_triage_drafts_report_ids_idx
on public.codex_triage_drafts using gin (report_ids);
