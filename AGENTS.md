# AGENTS.md

## Cursor Cloud specific instructions

### Product
Vite + React + TypeScript frontend ("Vibely" / Evntr) for community event planning. Backend is **hosted Supabase** (no local Postgres/Docker required for normal app work). Edge functions live under `supabase/functions/`.

### Commands
See `package.json` scripts:
- `npm run dev` — Vite on port **8080** (`host: "::"`)
- `npm run lint` / `npm test` / `npm run build`

### Supabase
- Active project ref: `tfzzexodasqdzsrixnmg` (`supabase/config.toml` + `.env`).
- Put real API keys in **`.env.local`** (gitignored via `*.local`) or inject `VITE_SUPABASE_PUBLISHABLE_KEY` as a Cloud secret. Vite prefers process env over `.env` files.
- Prefer the **publishable/anon** key for the browser client — do not commit `sb_secret_*` / service-role keys.
- App talks to the cloud project; do not assume `supabase start` is needed.
- DB password (if provided as a secret) connects via the **session pooler**:
  `postgresql://postgres.<project-ref>:<password>@aws-1-us-west-2.pooler.supabase.com:5432/postgres`
  Direct `db.<ref>.supabase.co` may only resolve to IPv6 and fail in this environment.
- SQL migrations are in `supabase/migrations/`. Apply with `psql -f …` against the pooler when needed.

### Lint note
`npm run lint` currently reports a few pre-existing errors in shadcn/ui and `tailwind.config.ts`; that is existing repo debt, not an environment failure.
