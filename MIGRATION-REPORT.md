# Backend migration report

Target project: `tfzzexodasqdzsrixnmg`
Source: the Lovable Cloud backend currently powering this app (left untouched, still running as rollback).

## Completed

### Schema
All 12 migration files in `supabase/migrations/` were replayed in timestamp order. Verified identical to the source, object for object:

| Object set | Source | New project |
| --- | --- | --- |
| Public columns | 471 | 471 |
| RLS policies | 134 | 134 |
| Public functions | 10 | 10 |
| Triggers | 34 | 34 |

Row-level security is enabled on all 41 public tables. All 20 enum types present.

### Data
Every non-empty table copied, row counts verified equal:

| Table | Rows |
| --- | --- |
| ai_provider_settings | 9 |
| app_settings | 2 |
| circle_members | 1 |
| circles | 1 |
| content_moderation_settings | 2 |
| events | 5 |
| feature_flags | 8 |
| localities | 6 |
| localization_settings | 8 |
| perks_offers | 1 |
| profiles | 9 |
| sponsorship_packages | 3 |
| user_roles | 14 |
| vendors | 14 |
| venues | 12 |

All other public tables were empty in the source and are empty in the target.

### User accounts
The 9 accounts were recreated in the new project with their original user IDs and email addresses, so `profiles`, `user_roles`, and every owner reference stay intact — no orphaned rows.

Passwords could not be copied (they live in a schema the source does not expose). Each user must either sign in with Google or use "Forgot password" to set a new one on the new project. Emails are marked confirmed so no re-verification is needed.

### Storage
The `invites` bucket exists, is private, and carries all four owner-scoped access policies. It held zero objects in the source, so nothing needed copying.

## Remaining manual steps

1. **Rotate the database password.** It was pasted in chat, so treat it as exposed. Change it in the new project's database settings.
2. **Apply the realtime policy migration.** `supabase/migrations/20260804045649_*.sql` enables RLS on `realtime.messages` and scopes conversation channels to inquiry participants. It requires an ownership level the direct `postgres` connection does not have. Run that file from the new project's SQL editor as a privileged role.
3. **Deploy the six edge functions.** From this repo:
   ```
   supabase link --project-ref tfzzexodasqdzsrixnmg
   supabase functions deploy generate-plan generate-invite generate-proposals ai-call moderate-content
   ```
   (`_shared/ai.ts` ships automatically with them.)
4. **Set function secrets on the new project.** `LOVABLE_API_KEY` must be supplied by you. `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are issued by the new project itself.
5. **Point an app at it.** This Lovable app stays on Lovable Cloud — that connection cannot be repointed. To serve from the new project, set `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID` to the new project's values wherever you host the code outside Lovable.

## Rollback

Nothing in the current backend was modified. If the new project is abandoned, no action is needed.
