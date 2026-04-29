# App Development Log

Append new entries at the end of this file.

## Entry Format

- `YYYY-MM-DD HH:MM TZ | scope | factual summary`

## Entries

- 2026-04-29 00:00 CEST | bootstrap | Created the support site repo coordination log.
- 2026-04-29 01:00 CEST | scaffold | Created the fresh Next.js support repo with support-specific homepage copy, metadata, lint/test/build verification, shared issue schema validation, and the initial Supabase database migration.
- 2026-04-29 02:27 CEST | first-implementation | Completed the first support hub implementation slice: public issue pages, verified web report form, signed app-origin report API, Lemon license validation, owner report dashboard, smoke tests, API/deployment docs, and coordination handoff. Final local verification passed `npm run lint`, `npm run test` with 27 tests, `npm run e2e` with 2 Chromium smoke tests, `npm run build`, AppDev coordination readiness, master-plan, and scope checks.
- 2026-04-29 02:07 CEST | public issues | Added public issue status badge/card components plus reviewed issue list and detail pages backed by `public_issues`; verification passed lint, tests, build, and diff whitespace checks.
- 2026-04-29 02:13 CEST | web reports | Added the signed-in web report form and Supabase-backed server action for private report intake; verification passed lint, tests, build, and diff whitespace checks.
- 2026-04-29 02:30 CEST | deployment handoff | Added app report API and Vercel deployment handoff docs, linked them from README, and refreshed workspace handoff state for deployment readiness.
- 2026-04-29 02:36 CEST | deployment setup | Created and pushed public GitHub repo `https://github.com/medschooloutsider/support`, created Vercel project `support`, and deployed latest build to `https://support-zeta-virid.vercel.app` using placeholder non-secret environment values. Production custom-domain activation remains blocked until real Supabase credentials/env vars are configured; Vercel GitHub auto-link is blocked by missing GitHub login connection in the Vercel account, and Supabase CLI is blocked by missing access token.
- 2026-04-29 02:57 CEST | production setup | Linked Supabase project `zhfcplmoijyrempppipo`, applied migration `0001_initial_support_schema.sql`, set Vercel production env vars with real Supabase runtime values and generated app-origin secret, redeployed production to `https://support-zeta-virid.vercel.app`, and added `support.medschooloutsider.com` to the Vercel project. Remaining blocker is DNS: Vercel requires `A support.medschooloutsider.com 76.76.21.21`. Vercel GitHub auto-link still requires adding a GitHub login connection in the Vercel account.
- 2026-04-29 03:15 CEST | free deployment URL | Renamed Vercel project to `medschooloutsider-support`, assigned `https://medschooloutsider-support.vercel.app` to the latest production deployment, updated `NEXT_PUBLIC_SITE_URL` to that free URL, disabled SSO deployment protection for public access, and verified the alias returns `200 OK`.
- 2026-04-29 03:47 CEST | diagnostics contract | Recorded app-side maximal diagnostics requirements, crash-report feasibility, per-app implementation findings, and public GitHub issue routing. Added a public GitHub issue form while keeping private diagnostics routed through the support site.
- 2026-04-29 10:09 CEST | diagnostic API | Extended the app report schema and admin detail view for private app diagnostics, added Supabase migration `0002_app_diagnostics.sql`, updated the app report API docs, and verified lint, tests, build, and diff whitespace checks in branch `codex/support-diagnostics-api`.
