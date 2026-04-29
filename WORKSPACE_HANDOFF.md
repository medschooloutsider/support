# Workspace Handoff

Updated: 2026-04-29

## Lane

- Branch: `main`
- Responsibility: public support site, private report intake, entitlement checks, moderation, and public grouped issue pages for GPT-MD, PDF-MD, and Alarmist.
- Merge target: `main`
- Master plan: `docs/coordination/MASTER_PLAN.md`

## Current Objective

First implementation slice is complete, verified locally, pushed to GitHub, deployed to Vercel with real Supabase runtime values, and available on a free branded Vercel alias. The next objective is app-side Report Issue integration.

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
- Public GitHub Issues are enabled for `medschooloutsider/support`; issue templates route public-safe discussion to GitHub and private diagnostics to the support site.
- App-side maximal diagnostics requirements are recorded in `docs/SUPPORT_REPORTING_REQUIREMENTS.md`.
- Diagnostic API fields for `app_name`, `app_build`, `category`, `workflow_context`, and `diagnostics` are merged, deployed, and applied to production Supabase through `supabase/migrations/0002_app_diagnostics.sql`.
- Production deployment `dpl_EfbtGHQL2Nt2wZPYZyu5nyVpdCFg` is aliased to `https://medschooloutsider-support.vercel.app`; live API checks returned `422` for a missing diagnostics packet and `401` for a complete payload with an invalid app-origin signature.
- App-side support reporting branches are pushed:
  - GPT-MD: `codex/gpt-md-support-reporting` at `5bcca3a`.
  - PDF-MD: `codex/pdf-md-support-reporting` at `f66a4e1`.
  - Alarmist: `codex/alarmist-support-reporting` at `f0d13a7`.
- Vercel project renamed to `medschooloutsider-support` under `earthpresident1030-3919s-projects`.
- Active public support URL is `https://medschooloutsider-support.vercel.app`; live verification returned `200 OK` after SSO deployment protection was disabled.
- Supabase project `zhfcplmoijyrempppipo` linked and `supabase/migrations/0001_initial_support_schema.sql` applied successfully.
- Vercel production env vars are set for Supabase URL, Supabase publishable key, Supabase secret key, app-origin HMAC secret, owner email, site URL, and placeholder Lemon Squeezy vars.
- Vercel production redeploy with free site URL env succeeded as deployment `dpl_CdQX61Y7k9zuviTqnadQoNPwBMK8`.
- Custom domain `support.medschooloutsider.com` remains added to the Vercel project but is not needed unless the domain is purchased later.
- Vercel GitHub auto-link failed because the Vercel account needs a GitHub login connection before it can link `medschooloutsider/support`.

## Left To Do

- Replace placeholder Lemon Squeezy env vars if future code starts using private Lemon API credentials; current license validation route does not use the private Lemon API key.
- Add a GitHub login connection in Vercel, then link `medschooloutsider/support` to the Vercel project.
- Review and merge the app-side support reporting branches into their app `main` lanes when ready.
- Configure app-side support HMAC secrets outside source control before enabling direct submission in shipped builds.
