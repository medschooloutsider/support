# Deployment

The support site deploys to Vercel at:

`support.medschooloutsider.com`

## Vercel Environment Variables

Set these variables in the Vercel project before release:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `LEMON_SQUEEZY_API_KEY`
- `LEMON_SQUEEZY_STORE_ID`
- `APPLE_RECEIPT_SHARED_SECRET`
- `APP_ORIGIN_HMAC_SECRET`
- `OWNER_EMAIL`
- `NEXT_PUBLIC_SITE_URL`

`SUPABASE_SECRET_KEY`, `LEMON_SQUEEZY_API_KEY`, `APP_ORIGIN_HMAC_SECRET`, and `APPLE_RECEIPT_SHARED_SECRET` are server-only values. Do not expose them to browser code or public logs.

Set `NEXT_PUBLIC_SITE_URL` to `https://support.medschooloutsider.com` for production.

## Release Checks

Run these checks before promoting a deployment:

```bash
npm run lint
npm run test
npm run e2e
npm run build
```

The release is ready to hand off when all checks pass, the production Vercel environment variables are present, and the domain points to the Vercel project.
