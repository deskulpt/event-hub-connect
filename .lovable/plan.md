# Migrate the backend to your own Supabase project

## Important constraint to know first

This app currently runs on Lovable Cloud, which manages the backend for you. Once Cloud is enabled on a project it cannot be disconnected, and the app's backend connection variables are generated automatically — they can't be repointed at an outside project from inside this app. So a full "switch the app over to project tfzzexodasqdzsrixnmg" is not something I can do here.

What I can do is make the new project a complete, working replica of this backend, so it is ready to serve an app you host outside Lovable, or to be the target if you later start a fresh project connected to your own Supabase account.

Also: the password you pasted in chat should be rotated once the migration is done. I have not stored it and won't repeat it.

## What gets moved

- **Schema**: all tables, enums, functions, triggers, and row-level security policies, replayed from the 12 migration files already in this repo (in timestamp order). This reproduces the structure exactly rather than hand-writing new SQL.
- **Data**: every row from the public schema tables, exported to CSV from here and loaded into the new project in dependency order (localities and profiles first, then events/circles/organizations, then dependent records like inquiries, bookings, proposals, votes, reviews).
- **Storage**: the `invites` bucket recreated as private, with its objects copied over and its access policies reapplied.
- **Edge functions**: the six functions in `supabase/functions/` (`generate-plan`, `generate-invite`, `generate-proposals`, `ai-call`, `moderate-content`, and the shared `_shared/ai.ts`) deployed to the new project, plus the list of secret names they need.
- **Auth users**: accounts in the managed auth system cannot be copied with SQL. Profiles rows will carry over, but each person will need to sign up again on the new project unless you run an auth export from the Supabase side yourself. I'll flag which profile rows would be orphaned.

## How it runs

1. Verify the new project is reachable and empty, so nothing is overwritten.
2. Replay the migration files in order; stop and report at the first failure rather than skipping ahead.
3. Export each public table to CSV from the current database, then load into the new one with foreign keys satisfied by ordering.
4. Recreate the storage bucket and copy its objects.
5. Deploy the edge functions and list the secrets you must set on the new project (`LOVABLE_API_KEY` and the Supabase service keys, which the new project issues itself).
6. Produce a verification report: row counts per table old vs new, RLS enabled on every public table, policy count per table, and function/trigger presence.

The current backend is left completely untouched and keeps running as your rollback.

## What I need from you

Direct database access to the new project. Pasting credentials in chat isn't safe — the way to hand them over is to add the connection string as a project secret, which I'll request when we start building. Confirm the plan and I'll ask for it.

## Deliverable

A written migration report at the end covering what moved, the row-count comparison, and the exact remaining manual steps (auth user export, secret values, and repointing whichever app you want to serve from the new project).
