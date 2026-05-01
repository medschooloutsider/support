# App Report API

App-originated reports are submitted to the private support intake API and stay private until the owner reviews and publishes a summarized public issue.

## Endpoint

`POST /api/app-reports`

## Headers

- `content-type: application/json`
- `x-support-timestamp: <unix timestamp string>`
- `x-support-signature: <hex HMAC SHA-256 signature>`

The signature is a lowercase hex HMAC SHA-256 digest over:

```text
{timestamp}.{rawBody}
```

Use `APP_ORIGIN_HMAC_SECRET` as the HMAC key. `rawBody` must be the exact JSON bytes sent in the request body, before parsing or reformatting.

## Request Body

```json
{
  "appId": "pdf_md",
  "appName": "PDF-MD",
  "appVersion": "1.2.3",
  "appBuild": "456",
  "platform": "macOS",
  "osVersion": "15.4",
  "reporterEmail": "reporter@example.com",
  "category": "bug",
  "summary": "Export preview fails",
  "description": "The export preview fails after choosing a valid Markdown file from the app.",
  "reproductionSteps": "Open the app, choose a Markdown file, then start the export preview.",
  "expectedResult": "The preview should render.",
  "actualResult": "The preview stays blank.",
  "workflowContext": {
    "surface": "export",
    "selectedFileType": "markdown"
  },
  "diagnostics": {
    "recentLog": "bounded recent diagnostic log text",
    "lastError": "The preview stayed blank.",
    "stackTrace": ["frame 1", "frame 2"],
    "metadata": {
      "exportMode": "preview"
    }
  }
}
```

Accepted `appId` values are `gpt_md`, `pdf_md`, and `alarmist`.
Accepted `category` values are `bug`, `bad_output`, `missing_feature`, `purchase_access`, `safety`, and `other`.

App-originated reports must include `appName`, `appBuild`, `category`, `workflowContext`, and `diagnostics`. The `diagnostics.recentLog` field is required and should be a bounded local log tail, not an unbounded file dump.

## Successful Response

Status: `201 Created`

```json
{
  "reportId": "uuid",
  "status": "new"
}
```

Signed, verified app-origin reports return `status: "new"`. Unsigned reports, reports with a missing app-origin secret, and reports with invalid app-origin signatures are still accepted when the JSON payload is valid, but they are saved with `status: "unverified"` and `entitlement_kind: "unverified"` for owner review.

## Privacy And Trust

Raw reports remain private. Reporter email, detailed reproduction notes, entitlement decisions, and moderation state are stored for owner review and are not exposed on public issue pages.

App-originated reports are purchase-trusted only when the HMAC signature is valid. A valid app-origin signature routes the report into the verified queue with `entitlement_kind` set to `app_origin`. Invalid, missing, or unverifiable signatures do not make the report trusted; they route the report into the unverified queue instead of rejecting it.

## Owner Review Workflow

Owner-only admin pages list private reports and expose review controls on each report detail page.

- `unverified` reports can be marked `new` after review or closed.
- `new` and `needs_info` reports can move between those two states, be closed, or be published.
- Publishing creates a summarized public issue with public-safe title, summary, public status, affected versions, affected platforms, workaround, and resolution notes. The raw report remains private.
- Reports linked to an existing public issue can update that public issue from the same detail page.
- Published reports can be closed when the public issue no longer needs active report tracking.
