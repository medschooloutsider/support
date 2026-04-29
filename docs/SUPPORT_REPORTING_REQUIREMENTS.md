# Support Reporting Requirements

This document defines the app-side reporting contract for GPT-MD, PDF-MD, and Alarmist.

## Product Rule

Users should enter minimal information. Apps must submit maximal diagnostic information.

The app-side report flow should work like this:

1. User opens `Report Issue`.
2. App shows a compact modal with category chips, a short text box, an optional public GitHub issue link, and a submit button.
3. App forcefully includes the diagnostic packet described below.
4. Support API returns a private report ID.
5. App shows `Report uploaded` with a copyable report ID.

## Required App Payload

All app-originated reports must include these fields when technically available:

- App name.
- App version and build number.
- macOS version.
- License email, if known.
- Recent local diagnostic log.
- Selected file type or current workflow context.
- Current error message.
- Stack trace for caught errors, when captured at the failure site.

The user-entered portion should stay small:

- Category.
- Short summary or description.
- Optional reproduction detail.
- Optional consent checkbox for including local diagnostics if the app UI needs an explicit privacy affordance.

## Support API Shape

The current `POST /api/app-reports` endpoint already accepts signed app-origin reports. The next backend slice should extend the report schema with private diagnostic fields before app-side work lands:

```json
{
  "appId": "gpt_md",
  "appName": "GPT-MD",
  "appVersion": "1.2.3",
  "appBuild": "456",
  "platform": "macOS",
  "osVersion": "15.4",
  "reporterEmail": "known@example.com",
  "category": "bug",
  "summary": "Export failed",
  "description": "User-entered text.",
  "workflowContext": {
    "surface": "export",
    "selectedFileType": "markdown"
  },
  "diagnostics": {
    "recentLog": "bounded text or structured log tail",
    "lastError": "error message",
    "stackTrace": ["frame 1", "frame 2"]
  }
}
```

Raw diagnostics must remain private. Public issue pages and GitHub issues should contain only user-safe summaries unless the user explicitly publishes details.

## Crash Report Feasibility

Automatic capture of caught errors is feasible:

- Capture the error message at the catch site.
- Capture `Thread.callStackSymbols` at the catch site.
- Append a bounded diagnostic event before showing the report modal.

Automatic capture of hard process crashes is only partially feasible inside the app:

- A crashed process cannot reliably upload its own crash report after termination.
- The reliable first-party pattern is pre-crash breadcrumbs plus next-launch detection.
- Apps can persist a launch/session marker and recent event log, then on next launch detect an unexpected exit and offer to submit the previous session's diagnostic packet.
- Apps can optionally search `~/Library/Logs/DiagnosticReports` for matching `.ips` crash reports and ask the user before attaching or copying them.

External crash-reporting SDKs could automate more of this, but they add vendor dependency, privacy review, and release-compliance work. The recommended first implementation is first-party: persistent breadcrumbs, next-launch unexpected-exit detection, and optional local `.ips` attachment.

## App Findings

### GPT-MD

- Report modal should live beside the existing diagnostics sheet in `Sources/ChatGPTColumnReview/ChatGPTColumnReviewApp.swift`.
- Existing useful surfaces: `AppIdentity`, `AppSupportStore`, `runtime-events.json`, `last-unexpected-exit.json`, `ReviewViewModel.diagnosticsReportText`, and `ReviewViewModel.errorMessage`.
- Missing: persisted license email and stored stack traces.

### PDF-MD

- Report modal should live beside the existing diagnostics sheet in `Sources/PDFMD/PDFMDApp.swift`.
- Existing useful surfaces: `AppIdentity`, `SystemProfile`, `PDFMDLicenseStore`, `eventLog`, `diagnosticsLogEntries`, selected file/workflow state, `errorMessage`, and `diagnosticsReportText`.
- Missing: persistent file-backed diagnostic log and stored stack traces.

### Alarmist

- Report trigger should start in Settings, currently rooted in `Sources/Alarmist/Shared/Views/Sources/SourcesView.swift`.
- Existing useful surfaces: `AlarmistBuildIdentity.current`, active app section state, `AlarmistSystemBridge` status strings, and existing proof/smoke report helpers.
- Missing: macOS-version helper, license email model, general persistent diagnostic log, centralized workflow-context packet, and stored stack traces.

## Public GitHub Issues

The public GitHub support repo is `https://github.com/medschooloutsider/support`. It is public and Issues are enabled.

GitHub issues are for public discussion and closure tracking. They must not require private app source code access. The support website remains the private intake and moderation system.
