# Complete the remaining community platform features

Phase 1 delivered the backend: tables (localities, circles, proposals, organizations, perks, memorabilia, admin settings), role helpers, RLS, AI edge functions (generate-proposals, moderate-content, provider abstraction), plus frontend services and i18n/accessibility infrastructure. None of it has a user interface yet — `src/App.tsx` still routes only the original event-planning pages, and the preferences context is not mounted.

This plan builds the missing screens and wires the existing services in.

## Wave A — Shell, language and accessibility

- Mount the preferences provider so language, text scale, contrast and reduced-motion settings actually apply app-wide.
- Rename navigation in place: Events to Activities, Marketplace to Perks, CRM to Orgs, Finance to Billing. Routes keep working; labels and icons change.
- Add a language switcher and accessibility controls to the top bar and settings.
- Role-aware sidebar: members see Activities, Circles, Perks, Marketplace of memorabilia; professionals and sponsors see their tools; staff see Admin.

## Wave B — Member community experience

- **Circles**: browse and search circles by locality and interest, circle detail with members, join and leave, organizer view to create and edit a circle.
- **Proposals**: monthly AI proposal slate for the member's locality, vote up, live vote count against threshold, threshold-met and scheduled states, claim-to-host action that turns a proposal into an activity.
- **Activities**: the existing events list and detail relabelled, with locality, language, indoor/outdoor and accessibility attributes surfaced and filterable.
- **Perks**: offer discovery by category and locality, perk detail, redeem action with redemption tracking and limits, and a creator view for businesses and sponsors.
- **Memorabilia**: simple listing grid, listing detail, create and withdraw own listing.
- **Onboarding additions**: age band, locality (with the existing city autocomplete), preferred language, interests and accessibility preferences.

## Wave C — Organizations and professional tools

- Org directory and org detail; create org, invite and manage members, org status badge.
- Professional credentials: upload credential, see verification state, reviewer notes.
- Sponsorship packages: browse packages, express interest.

## Wave D — Admin console (`/app/admin`, staff only)

Panels backed by the existing settings tables: feature flags and toggle overrides, AI provider settings, localization settings, content moderation settings and report queue, localities management, event generation rules, commission rules, sponsorship packages, org verification queue, credential review queue, proposal generation runs with diagnostics, and the audit log viewer.

## Wave E — Carry-over from earlier waves

- Complete the inquiry to booking flow (accept an inquiry, create the booking, deposit state).
- Trust badges surfaced on listings and profiles.
- CRM/Orgs view of AI call outcomes.

## Technical notes

- New pages under `src/pages/app/{circles,proposals,perks,memorabilia,orgs,admin}/`, registered in `src/App.tsx` under the existing `/app` layout.
- All data access goes through the existing service modules; no direct Supabase calls in components.
- Admin routes guarded by a role check using `is_staff` / `is_moderator`, not client-side state.
- TanStack Query for server state, React Hook Form and Zod for the create/edit forms, shadcn components throughout.
- Every list gets loading, empty and error states; monetary values stay in cents.
- No new database migrations expected — the Phase 1 schema covers these screens.

## Verification

Build and lint after each wave, then walk the key flows in the browser: onboarding to first activity, vote a proposal to threshold, join a circle, redeem a perk, and an admin toggling a feature flag.
