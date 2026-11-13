# Vibely / Evntr

A Vite + React + TypeScript frontend for a multilingual, accessibility-first community engagement platform for everyone + <img width="890" height="775" alt="Screenshot 2026-11-13 at 10 20 06 AM" src="https://github.com/user-attachments/assets/30682182-e39d-4b3e-9cf7-bd8054f058e5" />
adults 50+.


This app helps members discover local activities, vote on community proposals, join circles, explore nearby businesses and perks, and manage events, organizations, and trust workflows through a modern web experience backed by Supabase.

## Product overview

Vibely is designed around a community-first model:

- Discover nearby activities and neighbourhood circles
- Vote on local proposals before they become real events
- Join groups based on interests and locality
- Browse and claim senior perks and offers
- Explore organisations, professionals, and sponsorship opportunities
- Manage events, CRM workflows, and staff/admin views
- Support multilingual and accessibility-focused experiences for older adults

The project is aligned with the product direction described in `PRD.md` and the repository instructions in `AGENTS.md`.

<img width="890" height="775" alt="Screenshot 2026-11-13 at 10 14 26 AM" src="https://github.com/user-attachments/assets/bf4a514d-6fc7-4289-802e-b4bcb08f348f" />



## Tech stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui component patterns
- React Router
- TanStack Query
- Supabase JavaScript client
- Vitest for tests

## Project structure

```text
.
├── src/
│   ├── components/
│   ├── contexts/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── lib/
│   └── App.tsx
├── supabase/
│   ├── config.toml
│   ├── functions/
│   └── migrations/
├── public/
├── AGENTS.md
├── PRD.md
├── README.md
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.ts
├── tsconfig*.json
└── .env
```

## Local development

### Install dependencies

```bash
npm install
```

### Start the app

```bash
npm run dev
```

The Vite app runs on port `8080` with `host: "::"` as configured in the project.

### Useful scripts

```bash
npm run dev      # start local frontend
npm run build    # production build
npm run lint     # eslint check
npm test         # run Vitest suite
npm run preview  # preview production build
```

## Environment and Supabase

This project uses a hosted Supabase backend rather than a local Postgres/Docker setup for normal development.

Create a local environment file for real credentials:

```bash
cp .env .env.local
```

Set the browser-safe publishable key (preferred for the frontend):

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

Notes:

- Prefer the publishable/anon key for browser code
- Do not commit service-role or secret keys
- The active project reference is `tfzzexodasqdzsrixnmg`
- You generally do not need to run `supabase start` for normal app work
- Edge functions live under `supabase/functions/`

## Supabase notes

The app is expected to connect to the cloud project, not a local database. If you need to work with the database directly, use the Supabase session pooler pattern and relevant SQL migrations under `supabase/migrations/`.

## App structure highlights

- `src/pages/Index.tsx` — marketing/landing experience for Vibely
- `src/App.tsx` — app routes and protected access flow
- `src/pages/app/*` — functional app areas such as home, events, CRM, marketplace, organizations, admin, and settings
- `supabase/functions/` — server-side edge functions and app logic
- `PRD.md` — the product requirements and roadmap for the platform

## Status

This repository is a frontend implementation of a broader community engagement platform, with a hosted Supabase backend and an emphasis on accessibility, multilingual support, local discovery, and senior-focused UX.

## Additional docs

- `AGENTS.md` — repository-specific instructions and environment notes
- `PRD.md` — product requirements and platform vision

## License

Check the repository for the current licensing details before redistribution or deployment.
