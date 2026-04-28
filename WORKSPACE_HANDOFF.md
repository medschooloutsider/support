# Workspace Handoff

Updated: 2026-04-29

## Lane

- Branch: `main`
- Responsibility: public support site, private report intake, entitlement checks, moderation, and public grouped issue pages for GPT-MD, PDF-MD, and Alarmist.
- Merge target: `main`

## Current Objective

Build the first support hub release with public reviewed issues, private verified reports, app-originated report intake, and owner moderation.

## What Is Already Done

- Fresh Next.js support repo scaffolded.
- Support-specific homepage copy and metadata replaced default Next starter content.
- Package verification scripts are working for lint, test, and build.
- Shared issue/report schema and validation added.
- Initial Supabase database schema migration added.

## Left To Do

- Add Supabase auth utilities.
- Add entitlement and app-origin validation services.
- Add private report intake routes and owner moderation surfaces.
- Deploy to `support.medschooloutsider.com`.
- Add app-side Report Issue buttons after the API contract is live.
