# Support Hub Master Plan

Updated: 2026-04-29

## End Goal

Build a public support hub for Med School Outsider apps where users can read reviewed grouped issue status, verified users can submit private reports, and the owner can moderate reports into public known-issue entries.

## App Scope

- GPT-MD
- PDF-MD
- Alarmist

## Non-Negotiables

- Product behavior remains in the owning app repos.
- Raw reports stay private unless the owner manually publishes summarized content.
- Public issue status vocabulary is `known`, `being_resolved`, and `to_be_resolved`.
- Website reports require verified email and purchase verification where available.
- App-originated reports with valid support API signatures are treated as app-trusted; unsigned or invalidly signed app payloads are accepted into the unverified owner-review queue.

## Execution Model

This repo owns the support website, private report intake, entitlement adapters, moderation dashboard, and deployment handoff. App-side Report Issue buttons should be implemented in the owning app repos after the support API contract is live.
