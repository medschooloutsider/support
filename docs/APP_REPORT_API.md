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
  "appVersion": "1.2.3",
  "platform": "macOS",
  "osVersion": "15.4",
  "reporterEmail": "reporter@example.com",
  "summary": "Export preview fails",
  "description": "The export preview fails after choosing a valid Markdown file from the app.",
  "reproductionSteps": "Open the app, choose a Markdown file, then start the export preview.",
  "expectedResult": "The preview should render.",
  "actualResult": "The preview stays blank."
}
```

Accepted `appId` values are `gpt_md`, `pdf_md`, and `alarmist`.

## Successful Response

Status: `201 Created`

```json
{
  "reportId": "uuid",
  "status": "new"
}
```

## Privacy And Trust

Raw reports remain private. Reporter email, detailed reproduction notes, entitlement decisions, and moderation state are stored for owner review and are not exposed on public issue pages.

App-originated reports are purchase-trusted when the HMAC signature is valid. A valid app-origin signature routes the report into the verified queue with `entitlement_kind` set to `app_origin`; an invalid signature is rejected before the report is saved.
