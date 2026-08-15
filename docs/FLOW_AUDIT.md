# Flow audit — 2026-08-15

## Method
- Static review of routes, auth, services, and edge cases
- API E2E against `tfzzexodasqdzsrixnmg` (12/12 pass)
- Headless Chrome E2E for public landing → auth, reset-password, `/app` redirect, 404

## Critical fixes shipped
| Issue | Fix |
| --- | --- |
| Null profile skipped onboarding | `ProtectedRoute` forces `/onboarding` when profile missing/not onboarded |
| Silent profile load failures | `AuthContext` tracks `profileError` + awaits load |
| Signup always navigated to onboarding | Wait for session; if email confirm required, stay on auth |
| Default role forced `host` | Prefer `member` when present |
| Reset password no session/confirm | Recovery-session gate + confirm field + min 8 chars |
| Proposal claim orphan / publish unlink | Rollback event or unclaim on failure |
| Booking accept orphan | Delete booking if inquiry update fails |
| Org create without owner membership | Rollback org on member insert failure |
| Prefs writes ignored errors | Persist throws + UI state rollback |
| Onboarding without locality | Require locality before finish |
| City autocomplete PopoverTrigger ate input | Native dropdown; no Radix trigger wrap |
| Landing fieldsets disabled later steps | All steps interactive; validate on CTA |
| Memorabilia route redirected away | Restored route + sidebar entry |
| Page title still “Evntr” | Retitled to Vibely |

## E2E results
- **API:** create user → roles → onboard → event → inquiry → booking → deposit paid → venues → email lookup → circle (**12/12**)
- **Browser public:** landing prefs → `/auth?mode=signup&next=/onboarding` ✅; reset-password guidance ✅; `/app` → `/auth` ✅; `/nope` 404 ✅
- **Browser authenticated:** blocked — Cloud secret is `sb_secret_*`; browser Supabase calls return **401** / forbidden secret key

## Still open
1. Provide **publishable/anon** key for browser auth + locality suggestions
2. Run realtime.messages policies in Supabase SQL Editor
3. Placeholder shells (finance/calendar/inbox/insights) intentionally redirected for seniors
4. Deeper CRM empty-error coverage beyond inquiries/bookings
