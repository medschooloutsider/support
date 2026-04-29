# Workspace Handoff

Updated: 2026-04-29

## Lane

- Branch: `main`
- Responsibility: public support site, private report intake, entitlement checks, moderation, and public grouped issue pages for GPT-MD, PDF-MD, and Alarmist.
- Merge target: `main`
- Master plan: `docs/coordination/MASTER_PLAN.md`

## Current Objective

First implementation slice is complete, verified locally, pushed to GitHub, and deployed to a Vercel project URL. The next objective is production Supabase/Vercel configuration plus custom-domain activation.

## What Is Already Done

- Fresh Next.js support repo scaffolded.
- Support-specific homepage copy and metadata replaced default Next starter content.
- Package verification scripts are working for lint, test, and build.
- Shared issue/report schema and validation added.
- Initial Supabase database schema migration added.
- Public reviewed issue pages, web report intake, app-originated signed report intake, and owner moderation surfaces are implemented.
- API and deployment handoff docs are in `docs/APP_REPORT_API.md` and `docs/DEPLOYMENT.md`.
- Final local verification passed on 2026-04-29: `npm run lint`, `npm run test` with 27 tests, `npm run e2e` with 2 Chromium smoke tests, `npm run build`, AppDev coordination readiness, master-plan, and scope checks.
- Public GitHub repo created and pushed: `https://github.com/medschooloutsider/support`.
- Vercel project `support` created under `earthpresident1030-3919s-projects`; latest deployment URL is `https://support-zeta-virid.vercel.app`.
- Vercel GitHub auto-link failed because the Vercel account needs a GitHub login connection before it can link `medschooloutsider/support`.
- Supabase production setup is blocked in this environment because `supabase projects list` reports no access token; run `supabase login` or set `SUPABASE_ACCESS_TOKEN` before applying migrations.

## Left To Do

- Configure production Supabase, then apply `supabase/migrations/0001_initial_support_schema.sql`.
- Set real Vercel environment variables for production and redeploy without placeholder values.
- Add a GitHub login connection in Vercel, then link `medschooloutsider/support` to the Vercel project.
- Point `support.medschooloutsider.com` to the Vercel project after real Supabase/Vercel envs are configured.
- Add app-side Report Issue buttons after the API contract is live.
