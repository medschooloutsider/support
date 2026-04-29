alter table public.reports
  add column if not exists app_name text,
  add column if not exists app_build text,
  add column if not exists category text,
  add column if not exists workflow_context jsonb,
  add column if not exists diagnostics jsonb;

create index if not exists reports_category_idx on public.reports (category);
create index if not exists reports_workflow_context_gin_idx on public.reports using gin (workflow_context);
create index if not exists reports_diagnostics_gin_idx on public.reports using gin (diagnostics);
