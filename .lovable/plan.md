# Rewrite README with project details, architecture and screenshots

## What you get
A complete README.md (no mention of the build platform anywhere in the text) covering:

1. **Overview** - Vibely: a hyperlocal community platform for adults 50+, with its goal and north-star metric.
2. **Objectives** - hyperlocal connection, AI-assisted participation, accessibility, multilingual (8 Indian languages), monetized pro tools.
3. **Features by area** - Home, Activities, Circles, Proposals (AI monthly slates), Perks, Orgs, Calendar, Billing, Trust and credentials, Memorabilia, Sponsorship, shareable AI invites, admin suite.
4. **User roles** - the role list and what each can do.
5. **Tech architecture** - stack (React 18, Vite, TypeScript, Tailwind, shadcn/ui, TanStack Query, Zustand, React Hook Form + Zod), Postgres with row-level security, auth (email + Google), storage, serverless functions (generate-plan, generate-invite, generate-proposals, moderate-content, ai-call), AI provider abstraction, OpenStreetMap places. Includes a text architecture diagram and folder map.
6. **Security** - RLS on all tables, role checks via secure functions, private invite storage.
7. **Getting started** - install, env variables, run, test, sitemap script.

## Images and GIFs
- Screenshots captured from the running app into `docs/screenshots/` (landing page, sign-in, home dashboard, marketplace/perks, event detail, admin, mobile view).
- Animated GIFs in `docs/gifs/` for interactive flows: hero "What are you planning?" brief sheet, city autocomplete, accessibility/language preferences switch, proposal voting.
- Captured by recording browser sessions and converting to compressed GIFs; signed-in screens use a test session.

## Notes
- Signed-in screens show whatever real data exists in the database.
- PRD.md and MIGRATION-REPORT.md stay as they are, linked from the README.
