
The user wants the public homepage (`/`, `src/pages/Index.tsx`) redesigned in a "new-age" style inspired by Uber, Airbnb, and top travel apps — and the onboarding flow tightened so a brand-new visitor lands → signs up → picks a role → creates their first event without friction.

Let me inspect the current state quickly to ground the plan.
<lov-tool-use id="toolu_vrtx_01AxeDXBMRnD3JY7RCoS4XNj" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/Index.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01KAo9Xo3yN9DsL7RWrxhPYG" name="code--view" integration-id="code" data="{\"file_path\": \"src/components/SiteHeader.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01VbHbvzJBsFeYJM1bDRYD9k" name="code--view" integration-id="code" data="{\"file_path\": \"src/components/SiteFooter.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01RQm235fMRbHg1HYdbJAzbd" name="code--view" integration-id="code" data="{\"file_path\": \"src/contexts/AuthContext.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01KVjrDabSHAhQ3SndfuDu2U" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/auth/Auth.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_0164m7DN87FVtV9kWaiT9RXN" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/Index.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_012W4ghAXKnjcQRkkMFrDYDX" name="code--view" integration-id="code" data="{\"file_path\": \"src/components/SiteHeader.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01LKaESoDuqpFDfSF6o9aFRS" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/auth/Auth.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_017AUVeckmCsuPZ98h7nFtMw" name="code--view" integration-id="code" data="{\"file_path\": \"src/contexts/AuthContext.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01KYrW9M4KuuBNGPuKhHwuuG" name="code--view" integration-id="code" data="{\"file_path\": \"src/App.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01U7aEBvwaXpNaeygqYEvTRS" name="code--view" integration-id="code" data="{\"file_path\": \"src/components/events/EventBriefForm.tsx\"}">
</lov-tool-use>
<lov-plan>
## Goal
Redesign the public homepage and onboarding-to-first-event flow into a single, intuitive, modern experience inspired by Airbnb/Uber/top travel apps. End state: a visitor lands, sees an immersive hero with a one-line "tell us your event" search, signs up in one tap, picks a role inline, and lands on their first auto-drafted event in under 60 seconds.

## Inspiration applied
- **Airbnb**: large editorial hero, bento category grid, sticky search pill that morphs on scroll, soft shadows, generous whitespace.
- **Uber**: big input-led CTA "where to" pattern → here it's "What are you planning?" with one prominent field and chip suggestions.
- **Linear/Arc/travel apps**: glass nav, gradient orbs, animated value props, micro-interactions, social proof strip.

## What changes

### 1. New public landing (`src/pages/Index.tsx`)
- **Sticky glass header** (`SiteHeader.tsx`): logo, slim nav (Explore · For pros · Pricing), and a morphing "Plan an event" pill that appears after scrolling past the hero.
- **Hero (full-bleed)**: ambient gradient mesh + soft animated orbs (bento system) over a muted photo. Headline "Plan any event in 60 seconds." Subhead. One large pill input: "What are you planning?" with auto-suggest chips (Birthday · Wedding · Corporate offsite · Dinner party · Conference). CTA `Start planning` opens the inline brief sheet.
- **Inline brief sheet** (new, replaces clunky QuickCreateForm card on hero): 3-tap flow — type → guests slider → date+city → `See matches`. If signed out, opens auth sheet inline (no redirect break).
- **Trust strip**: logos / stats row ("10k pros · 6 cities · Verified & insured").
- **Bento "How it works"**: 3 large bento cards (Tell us → We match → You book) with gradient orbs, hover lift, microcopy.
- **Category bento**: 6-tile asymmetric grid (Venues, Chefs, Artists, Photographers, DJs, Planners) with gradient covers, replacing today's 3 plain cards.
- **For Pros / For Businesses** dual CTA section.
- **Testimonial carousel** (3 quotes, real-feeling).
- **Final CTA band** with gradient sunset.
- New `SiteFooter` polish (mini sitemap + socials).

### 2. Streamlined onboarding → first event
Today: signup → `/onboarding` (role pick) → `/app` → user must navigate to Events → New. Too many steps.

New flow:
- **Auth as a sheet/modal** triggered from hero (not a separate page navigation when possible). Keep `/auth` as fallback.
- After signup (`Auth.tsx` / hero brief sheet), if the user filled the hero brief, **persist it to sessionStorage** as `pendingBrief`.
- **Onboarding (`Onboarding.tsx`)** redesigned to a single screen with 2 micro-steps:
  1. **Role pick** — same 3 cards but visually upgraded (bento glass, animated check).
  2. **Confirm + create first event** — shows the pendingBrief prefilled in a compact card with `Create my event` primary CTA. If no pendingBrief, shows a tiny "Name your first event" mini-form.
- On submit: writes roles + profile + creates the event in one go, then routes straight to `/app/events/:id` (not `/app`). User lands on their first event with the brief already populated and a clear "Generate plan" CTA → instant aha moment.
- For users who skip the brief on the homepage, onboarding still ends on event detail (with a freshly-created draft event) so the next step is always obvious.

### 3. Files to touch
- Edit: `src/pages/Index.tsx`, `src/components/SiteHeader.tsx`, `src/components/SiteFooter.tsx`, `src/components/QuickCreateForm.tsx` (refactor into `HeroBriefSheet`), `src/pages/auth/Auth.tsx` (visual polish + accept `?next=` and `pendingBrief` handoff), `src/pages/auth/Onboarding.tsx` (2-step + auto-create event), `src/index.css` (add a couple of hero-specific utilities if needed).
- Create: `src/components/landing/HeroBriefSheet.tsx`, `src/components/landing/HowItWorks.tsx`, `src/components/landing/CategoryBento.tsx`, `src/components/landing/Testimonials.tsx`, `src/components/landing/TrustStrip.tsx`, `src/components/landing/FinalCta.tsx`, `src/lib/pendingBrief.ts` (sessionStorage helpers + types).
- Reuse: existing `createEvent` service, bento primitives, `EVENT_TYPES`, `Slider`, `Calendar`.

### 4. Design system specifics
- Reuse Bento + Glass tokens already shipped (sunset/aurora/ocean/mint, glass blur, gradient orbs, fade-up animation).
- Hero typography: `font-display` 5xl–7xl, tight tracking, gradient text on key word.
- Pill input: 64px tall, rounded-full, glass background, focus ring in primary.
- Motion: `animate-fade-up` staggered on hero, `orb-drift` on background orbs, hover-lift on bento tiles.
- Mobile-first: hero stacks; brief sheet becomes a bottom drawer on `<sm`.

### 5. Acceptance criteria
- Homepage feels editorial and modern; no plain card grid above the fold.
- New visitor can go from landing → typed brief → signed up → role picked → first event created in ≤60 seconds and ≤4 taps.
- All copy uses sentence case + verb-led CTAs ("Start planning", "Create my event", "See matches").
- Works at 375px, 994px (current viewport), and 1440px.
- Light/dark both render cleanly; tabular numerals on guest count.
- No regressions to existing `/app` shell.

### 6. Out of scope (this pass)
- Real auto-suggest backend (chips are static).
- Social/Google auth (mentioned earlier but not added unless asked).
- Pricing / For pros / How-it-works full pages — only landing sections.
