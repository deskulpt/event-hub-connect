## Deliverable

A single committed document, `PRD.md`, at the repo root — long-form, not a summary. No code, schema, or UI changes in this phase.

---

## PRD.md — full outline

### 1. Product definition
Repositioning from a generic event hub into a **multilingual, accessibility-first community engagement platform for adults 50+**. Core pillars: hyperlocal social connection, AI-assisted participation, senior-grade accessibility, multilingual use, and monetised professional/business tools. Launch market: India. Languages at launch: English, Hindi, Telugu, Urdu, Kannada, Bengali, Marathi, Tamil.

Problem statement, target cohorts (active retirees, semi-retired professionals, caregivers, NRI-returnee households, senior-living residents), value proposition per role, success metrics (activation, monthly proposal-to-event conversion, attendance rate vs. votes, repeat participation, professional bookings, sponsor renewals).

### 2. Roles and permissions
Member 50+, Volunteer Host, Professional, Business Sponsor, NGO/Association Admin, Moderator, Operations Admin, Super Admin.

- Per-role: goals, entry path, verification requirements, what they can create/see/monetise.
- A full **permission matrix**: rows = role, columns = module × action (view/create/edit/moderate/payout/configure).
- Enforcement model: roles in a dedicated role table (never on the profile), policy-based row access, security-definer role checks, matching route guards, and server-side enforcement for anything financial.

### 3. Member experience (detailed flows)
- **Onboarding**: age gate, location capture (radius bands from 1 mile outward), language selection, accessibility preferences (text scale, contrast, voice-first), interest picker, organisation/NGO discovery, optional caregiver contact.
- **Senior dashboard**: nearby circles, live proposals to vote on, upcoming activities, reminders, one-tap "join" and "call me" actions.
- **AI monthly activity ideas** and the voting surface.
- **Circles & clubs**: creation, membership, host handoff, recurring meetups.
- **Event discovery**: internal activities plus ingested external listings.
- **Senior perks**: discounts and offers from businesses.
- **Memorabilia marketplace**: member-to-member and curated listings.
- **Multilingual AI companion**: chat + voice, answers in the member's language, can read the screen aloud, can draft an RSVP or a message.
- **Fact-check & safety**: scam/misinformation checks on shared content.
- **Referrals** and family invites.

### 4. AI proposal engine (the core feature)
- **Inputs**: member density in configurable radius bands starting at 1 mile, declared interests, cohort/age band, language, cultural and festival profile, past attendance and no-show behaviour, nearby organisations and venues, seasonality/weather, host supply, professional supply.
- **Output**: a monthly slate of proposals per locality, ranked.
- **Per-proposal attributes**: title, description, minimum attendance, vote threshold, required professionals, venue type, sponsorship eligibility, accessibility suitability, indoor/outdoor, ticketed/free, estimated cost per head, suggested host.
- **Voting rule**: configurable threshold multiplier over minimum attendance (default 2–3×) to absorb dropouts; admin-tunable per locality.
- **Lifecycle**: generated → voting open → threshold met → host assigned → venue/professional confirmed → published event → attendance capture → post-event feedback fed back into the engine.
- **Failure modes**: not enough members, no host, no venue, threshold missed — each with a defined fallback (merge localities, widen radius, defer to next month, convert to online).

### 5. AI provider architecture
Provider-abstraction layer with per-feature routing and failover.
- **Lovable AI is the working default** for reasoning, chat, classification, image description, summarisation, and proposal generation.
- **Sarvam AI is specified as the pluggable slot** for Indian-language translation, speech-to-text, and text-to-speech; Google/Azure documented as fallbacks.
- A **feature → provider → fallback** mapping table, with per-feature latency/cost/quality notes.
- Rules: all keys server-side, all provider calls proxied through server functions, per-provider health checks, graceful degradation, usage metering per organisation.

### 6. Admin console — all twelve panels
Dashboard, User Management, Role & Permission Management, Module Toggles, AI & API Settings, Localization, Organizations & NGOs, Professional Services, Sponsors & Advertising, Events & Proposal Engine, Finance, Trust & Safety.

Each panel documented with: purpose, primary screens, key controls, the config keys it writes, and which roles can access it.

### 7. Configuration model
Runtime config domains so admin changes take effect without a redeploy: `app_settings`, `feature_flags`, `ai_provider_settings`, `localization_settings`, `commission_rules`, `event_generation_rules`, `sponsorship_packages`, `role_permissions`, `content_moderation_settings`. For each: shape, who can edit, audit behaviour, and cache/invalidation expectations.

### 8. Rename-in-place mapping
We keep the existing structure and extend it. The PRD documents the explicit old→new mapping so nothing is rebuilt unnecessarily:

```text
events        -> activities, circles, proposals, voting, hosted events
marketplace   -> senior perks, memorabilia, professional services
crm           -> organizations, sponsors, businesses, professionals, outreach
finance       -> ticketing, sponsorships, organizer billing, commissions, payouts
trust         -> moderation, fact-check, verification, abuse handling
settings      -> accessibility, language, AI prefs, notifications, privacy
home          -> senior dashboard: nearby circles, proposals, reminders
```

Plus a table-level view: which current tables are reused as-is, which gain columns, and which are net-new — `circles`, `generated_activity_proposals`, `proposal_votes`, `organizations`, `professionals`, `perks_offers`, `ai_provider_configs`, `feature_toggle_overrides`, `moderation_cases`, and the remaining listed entities. Existing seeded venue/vendor data stays valid.

### 9. API groups
Auth, Profile, AI, Event Engine, Voting, Event, Organization, Professional, Sponsor, Marketplace, Admin Config, Audit. Each with responsibilities, key operations, auth requirements, and the rule that every third-party call is proxied server-side.

### 10. Delivery phases
Six phases — foundation; onboarding + localization; proposal engine; professionals + sponsors; trust + assistant; external ingestion — each with scope, exit criteria, and dependencies.

### 11. Non-functional requirements
Accessibility targets (scalable text, high contrast, voice-first paths, large tap targets, screen-reader semantics), performance budgets on low-end Android, offline/poor-network tolerance, moderation SLAs, data privacy for a senior cohort, consent and disclosure for AI voice, and audit logging.

### 12. Open questions
Monetisation splits, background-verification vendor for professionals, external event sources, and age-verification method — flagged for decision before Phase 1 build.

---

## Technical notes
Written for both product and engineering readers. Schema and RBAC stay at entity/field-intent level rather than full DDL; a separate schema spec can follow once the PRD is approved.

## Out of scope for this phase
No migrations, no route changes, no Sarvam integration, no admin UI — those begin after sign-off.
