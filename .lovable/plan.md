# Sync check and remaining build items

## Current state (verified)

- Git working tree is clean; latest commit is "Implemented role-based sidebar". Lovable pushes to GitHub automatically, so no manual sync is needed — nothing is pending on the code side.
- 11 migration files exist locally and the live database already contains every table, enum, function and trigger they define (localities, circles, proposals, organizations, perks, memorabilia, admin settings, security-definer role helpers). No migration is outstanding, so there is nothing to re-run.

## Completed

- Backend schema, RLS, role helpers, security hardening (user_roles, event_invites, profiles, realtime).
- Edge functions: generate-plan, generate-invite, ai-call, generate-proposals, moderate-content, shared AI provider layer.
- Services and types for events, marketplace, CRM, finance, invites, plans, reviews, plus community services (localities, circles, proposals, perks, organizations, adminConfig).
- Landing page redesign, streamlined onboarding, city autocomplete and nearby places.
- Shell: role-aware sidebar, top bar language and accessibility menus, quick create.
- Community pages: Circles, Proposals, Perks (browse + manage), Memorabilia, Organisations — all routed under `/app`.

## Pending

1. **PreferencesProvider is not mounted** — `src/App.tsx` never wraps the tree, so language, text scale, contrast and reduced-motion settings do not apply. Mount it inside `AuthProvider`.
2. **Admin console** — `src/pages/app/admin/` does not exist. Build `/app/admin` behind `RequireStaff` with panels for feature flags and overrides, AI provider settings, localization settings, localities, event generation rules, commission rules, sponsorship packages, content reports queue, org verification queue, credential review queue, proposal generation runs, and the audit log.
3. **Wave C professional tools** — org detail with member management, professional credentials upload and verification state, sponsorship package browsing.
4. **Wave E carry-over** — inquiry to booking conversion flow, trust badges on listings and profiles, AI call outcomes in the Orgs/CRM view.

## Technical notes

- Admin panels use the existing `src/services/adminConfig.ts` functions; add service functions rather than calling the database from components.
- Guard admin routes with the existing `RequireStaff` component, which relies on server-side role checks.
- TanStack Query for data, React Hook Form and Zod for forms, shadcn components, loading/empty/error states on every panel.
- No new migrations expected.

## Verification

Typecheck and lint after each item, then walk: preferences change persists across reload, staff user reaches `/app/admin` and toggles a feature flag, non-staff user is blocked.
