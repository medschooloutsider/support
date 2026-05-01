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
- Entitlement adapters now cover both Lemon Squeezy license validation and Apple receipt validation for the supported app purchase paths.
- Diagnostic API fields for `app_name`, `app_build`, `category`, `workflow_context`, and `diagnostics` are merged, deployed, and applied to production Supabase through `supabase/migrations/0002_app_diagnostics.sql`.
- Production deployment `dpl_EfbtGHQL2Nt2wZPYZyu5nyVpdCFg` is aliased to `https://medschooloutsider-support.vercel.app`; live API checks returned `422` for a missing diagnostics packet and `401` for a complete payload with an invalid app-origin signature.
- App-side support reporting branches are pushed:
  - GPT-MD: `codex/gpt-md-support-reporting` at `5bcca3a`.
  - PDF-MD: `codex/pdf-md-support-reporting` at `f66a4e1`.
  - Alarmist: `codex/alarmist-support-reporting` at `f0d13a7`.
- Production app-report intake e2e passed on 2026-05-01:
  - `npm run test` passed with 41 tests, `npm run build` passed, and `git diff --check` passed on support `main`.
  - Live Vercel `POST /api/app-reports` accepted valid GPT-MD smoke report `5596d14e-584b-4cce-bfa6-316698546aa5` with HTTP 201 and status `unverified`.
  - Live Vercel `POST /api/app-reports` accepted valid PDF-MD smoke report `1f0ef8c4-7b30-47ac-8b24-c1f4d78280c3` with HTTP 201 and status `unverified`.
  - `/issues` returned HTTP 200; `/admin/reports` remained owner auth-gated with HTTP 307.
- Clean support-only PR branches are also pushed against each GitHub `origin/main`:
  - GPT-MD: `codex/gpt-md-support-reporting-clean` at `2e45e58`; verified `swift build -c debug --product ChatGPTColumnReview` and `git diff --check`.
  - PDF-MD: `codex/pdf-md-support-reporting-clean` at `dadc77e`; verified `swift test --filter SupportReportingTests` and `git diff --check`.
  - Alarmist: `codex/alarmist-support-reporting-clean` at `8faaa7b`; verified `xcodebuild -project "Alarmist.xcodeproj" -scheme "Alarmist" -destination "platform=macOS" -only-testing:AlarmistTests/AlarmistSupportReportTests test` and `git diff --check`.
- GitHub `main` fast-forwarded for all three apps on 2026-04-29:
  - GPT-MD `main` now points at `2e45e58`; fresh bundle built at `worktrees/GPT-MD-support-reporting-clean/dist/GPT-MD.app`, executable timestamp `2026-04-29 11:00:41 CEST`, SHA-256 prefix `dec8ae39df7caad3e3e83247f3f7d4b501bdce290e6d624bbb6262f423b98b96`.
  - PDF-MD `main` now points at `dadc77e`; fresh bundle built at `worktrees/PDF-MD-support-reporting-clean/dist/pdf.md.app`, executable timestamp `2026-04-29 11:01:16 CEST`, SHA-256 prefix `e11cd0e78daea5d8f3e704d9b6fee4fdaa61a7bce07337415b175466ab1129d5`.
  - Alarmist `main` now points at `8faaa7b`; focused macOS test rebuilt DerivedData app executable at `2026-04-29 11:00:43 CEST`, SHA-256 prefix `5cff8a5c346af9dd7e5f9e1049dccf458e822363cbed9bf8c14721f278d71d0e`.
- Packaged nonfronting smoke passed for the exact rebuilt GPT-MD, PDF-MD, and Alarmist app paths: `open -g -n` launched each app, Chrome remained frontmost before and after launch, exact-path PIDs were observed, and only the newly launched PIDs were terminated.
- Vercel project renamed to `medschooloutsider-support` under `earthpresident1030-3919s-projects`.
- Active public support URL is `https://medschooloutsider-support.vercel.app`; live verification returned `200 OK` after SSO deployment protection was disabled.
- Supabase project `zhfcplmoijyrempppipo` linked and `supabase/migrations/0001_initial_support_schema.sql` applied successfully.
- Vercel production env vars are set for Supabase URL, Supabase publishable key, Supabase secret key, app-origin HMAC secret, owner email, site URL, and placeholder Lemon Squeezy vars.
- Vercel production redeploy with free site URL env succeeded as deployment `dpl_CdQX61Y7k9zuviTqnadQoNPwBMK8`.
- Custom domain `support.medschooloutsider.com` remains added to the Vercel project but is not needed unless the domain is purchased later.
- Vercel GitHub auto-link failed because the Vercel account needs a GitHub login connection before it can link `medschooloutsider/support`.

## Left To Do

- Replace placeholder Lemon Squeezy env vars if future code starts using private Lemon API credentials; current license validation route does not use the private Lemon API key.
- Set `APPLE_RECEIPT_SHARED_SECRET` in Vercel if Apple receipt validation is enabled for the support adapter.
- Add a GitHub login connection in Vercel, then link `medschooloutsider/support` to the Vercel project.
- Configure app-side support HMAC secrets outside source control before enabling direct submission in shipped builds.
- Optional deeper visible UI smoke can manually click through the Report Issue modal in each app; direct upload remains gated by out-of-source HMAC configuration.
