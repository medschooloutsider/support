create extension if not exists pgcrypto;

create type app_id as enum ('gpt_md', 'pdf_md', 'alarmist');
create type public_issue_status as enum ('known', 'being_resolved', 'to_be_resolved');
create type report_status as enum ('new', 'needs_info', 'merged', 'published', 'closed', 'unverified');
create type report_source as enum ('web', 'app');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  is_owner boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.public_issues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  app_id app_id not null,
  status public_issue_status not null,
  severity text not null default 'normal',
  title text not null,
  summary text not null,
  affected_versions text not null default 'Unknown',
  affected_platforms text not null default 'Unknown',
  workaround text,
  resolution_notes text,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  app_id app_id not null,
  app_version text not null,
  platform text not null,
  os_version text not null,
  reporter_email text not null,
  reporter_user_id uuid references auth.users(id) on delete set null,
  source report_source not null,
  status report_status not null default 'new',
  entitlement_kind text not null,
  public_issue_id uuid references public.public_issues(id) on delete set null,
  summary text not null,
  description text not null,
  reproduction_steps text not null,
  expected_result text not null,
  actual_result text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.report_followups (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  author_email text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete set null,
  public_issue_id uuid references public.public_issues(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.public_issues enable row level security;
alter table public.reports enable row level security;
alter table public.report_followups enable row level security;
alter table public.moderation_events enable row level security;

create policy "public issues are readable by everyone"
on public.public_issues for select
using (true);

create policy "users can read their own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "users can read their own reports"
on public.reports for select
using (auth.uid() = reporter_user_id);

create policy "users can read followups for their own reports"
on public.report_followups for select
using (
  exists (
    select 1 from public.reports
    where reports.id = report_followups.report_id
      and reports.reporter_user_id = auth.uid()
  )
);
