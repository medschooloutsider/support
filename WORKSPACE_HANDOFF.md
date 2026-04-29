# Workspace Handoff

Updated: 2026-04-29

## Lane

- Branch: `main`
- Responsibility: public support site, private report intake, entitlement checks, moderation, and public grouped issue pages for GPT-MD, PDF-MD, and Alarmist.
- Merge target: `main`
- Master plan: `docs/coordination/MASTER_PLAN.md`

## Current Objective

First implementation slice is complete, verified locally, pushed to GitHub, deployed to Vercel with real Supabase runtime values, and registered with the target custom domain. The next objective is DNS activation plus post-DNS verification.

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
- Vercel project `support` created under `earthpresident1030-3919s-projects`; latest production alias is `https://support-zeta-virid.vercel.app`.
- Supabase project `zhfcplmoijyrempppipo` linked and `supabase/migrations/0001_initial_support_schema.sql` applied successfully.
- Vercel production env vars are set for Supabase URL, Supabase publishable key, Supabase secret key, app-origin HMAC secret, owner email, site URL, and placeholder Lemon Squeezy vars.
- Vercel production redeploy with stored env vars succeeded as deployment `dpl_Cwf1pyVkw3zQ3UZFgG1tTnni2iqT`.
- Custom domain `support.medschooloutsider.com` added to the Vercel project.
- Vercel reports DNS is not configured yet; required DNS record is `A support.medschooloutsider.com 76.76.21.21`.
- Vercel GitHub auto-link failed because the Vercel account needs a GitHub login connection before it can link `medschooloutsider/support`.

## Left To Do

- Add DNS record: `A support.medschooloutsider.com 76.76.21.21`.
- After DNS propagates, verify `https://support.medschooloutsider.com`.
- Replace placeholder Lemon Squeezy env vars if future code starts using private Lemon API credentials; current license validation route does not use the private Lemon API key.
- Add a GitHub login connection in Vercel, then link `medschooloutsider/support` to the Vercel project.
- Add app-side Report Issue buttons after the API contract is live.
