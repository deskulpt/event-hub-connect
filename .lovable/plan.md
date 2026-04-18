

This is a massive architectural spec. The right move is to approve a **Wave 1 skeleton** build only — get navigation, routes, layout grammar, and page shells in place. Wave 2/3 features come later as separate approvals.

## Scope: Wave 1 Skeleton Only

Build the **multi-tenant role-aware app shell** with all primary routes, navigation, and consistent page-shell grammar. No AI, no real data, no booking logic yet — just the operating-system frame that everything else slots into.

## What gets built

### 1. Foundation
- Enable **Lovable Cloud** (auth + Postgres)
- Auth: email/password, sign-up, login, password reset, `/reset-password` route
- `profiles` table + `user_roles` table with `app_role` enum (`host`, `pro`, `business`, `admin`) + `has_role()` security-definer function
- Role selector during onboarding (one user can hold multiple roles; default active role stored on profile)
- Trigger to auto-create profile on signup

### 2. App shell (authenticated layout)
- **Left persistent sidebar** (shadcn `sidebar`, `collapsible="icon"`) — desktop rail / mobile drawer
- **Universal top bar**: workspace switcher (stub), event switcher (stub), global search input, AI command bar trigger (stub modal), notifications bell (stub), **Quick Create** dropdown, profile menu
- **Quick Create menu** with all 9 actions (route to relevant create page or open a stub modal)
- Role-adaptive nav: same 10 primary items, but the home dashboard cards reorder per role

### 3. Reusable page-shell primitives
Create `src/components/shell/`:
- `PageHeader` (title, subtitle, status badge slot, primary CTA, secondary CTA)
- `ActionStrip` (filters, search, date range, role shortcuts)
- `PageLayout` (main + optional right rail for AI/alerts)
- `FooterUtility` (export, audit link, last-synced, help)
- `EmptyState`, `LoadingState`, `ErrorState`

Every page below uses these — guarantees the "one platform" feel.

### 4. Routes & page shells (all 10 domains)

```text
/                       → marketing landing (existing Index)
/auth, /reset-password
/app                    → Home (role-adaptive dashboard)
/app/events             → All Events
/app/events/:id         → Event Detail (with tabs: brief, plan, vendors, tasks, guests, docs, recap)
/app/events/new         → Event Brief builder shell
/app/marketplace        → Discover
/app/marketplace/venues
/app/marketplace/pros
/app/marketplace/businesses
/app/marketplace/compare
/app/marketplace/saved
/app/marketplace/:type/:id  → Listing Detail
/app/crm                → Pipeline
/app/crm/contacts
/app/crm/conversations
/app/crm/inquiries
/app/crm/calls          → AI Call Console shell
/app/crm/bookings
/app/crm/tasks
/app/calendar           → Master Calendar
/app/calendar/availability
/app/calendar/scheduling
/app/finance            → Overview
/app/finance/transactions
/app/finance/invoices
/app/finance/receipts
/app/finance/payouts
/app/finance/pnl
/app/finance/integrations
/app/trust              → Verification Center
/app/trust/insurance
/app/trust/reviews
/app/trust/disputes
/app/inbox
/app/insights
/app/settings/*         → profile, workspace, team, notifications, billing, integrations, ai, security
```

Each shell renders: PageHeader with the **exact CTA from the matrix** + matching CEJ subtitle + ActionStrip + a placeholder content area with EmptyState that points to the next-step action.

### 5. Design language
- Keep the existing Vibely warm/social tokens (gradient-sunset, secondary, soft shadows)
- Compact app density (no marketing hero sizing inside `/app/*`)
- Tabular numerals for dates/currency
- Status chips, trust badges, urgency pills as small reusable components

## What is NOT in this wave (explicit deferrals)
- Real data / CRUD beyond profiles + roles
- Google Places / Foursquare integration
- Capacity engine
- AI Gateway / any AI skill
- Stripe / payments / payouts
- Insurance partners
- Outbound AI calls
- Sponsored listings
- iOS/Android (web responsive only)

## Open choice (one decision)

The marketing landing at `/` already exists. After login, users land at `/app`. Do you want a separate **role chooser onboarding step** the first time a user signs up (Host / Pro / Business / "I'm exploring"), or auto-default everyone to **Host** and let them add Pro/Business roles later from Settings → Workspace?

Recommended: **role chooser on first signup** (3 big cards) — sets expectations, drives the right home dashboard immediately, and we capture supply-side intent from day one.

## Files (high level)
- `src/integrations/supabase/*` (auto on Cloud enable)
- Migration: profiles, user_roles, app_role enum, has_role(), trigger
- `src/contexts/AuthContext.tsx`, `src/hooks/useRole.ts`, `ProtectedRoute.tsx`
- `src/components/shell/{AppSidebar,TopBar,QuickCreate,PageHeader,ActionStrip,PageLayout,EmptyState,...}.tsx`
- `src/layouts/AppLayout.tsx`, `MarketingLayout.tsx`
- `src/pages/auth/{Login,SignUp,ResetPassword,Onboarding}.tsx`
- `src/pages/app/**` — one file per route above (~35 page shells)
- `src/App.tsx` — full route tree

Estimated: ~50 new files, ~1 migration. Big in count, but each page shell is small and uses the same primitives.

