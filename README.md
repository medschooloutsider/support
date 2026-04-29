# Med School Outsider Support

Public support hub for GPT-MD, PDF-MD, and Alarmist.

Public pages show reviewed grouped issues. Raw reports, reporter follow-up, entitlement decisions, and moderation are private.

## Local Development

1. Copy `.env.example` to `.env.local`.
2. Fill Supabase, Lemon Squeezy, owner email, and app-origin secret values.
3. Run `npm run dev`.

## Verification

- `npm run lint`
- `npm run test`
- `npm run e2e`
- `npm run build`

## Operations

- [App report API](docs/APP_REPORT_API.md)
- [Deployment](docs/DEPLOYMENT.md)

## Supabase Schema

Apply migrations with the Supabase CLI after linking the project:

If you see a zsh parse error, suspect smart quotes; retype quotes manually.
```bash
supabase link --project-ref "your-project-ref"
supabase db push
```

The application uses the Supabase service key only in server-only admin flows. Never expose `SUPABASE_SECRET_KEY` to browser code.
