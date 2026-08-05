# PRD — Community Engagement Platform for Adults 50+

**Status:** Draft for sign-off  
**Document type:** Product Requirements Document (long-form)  
**Scope of this document:** Product requirements only. No migrations, route changes, provider integrations, or admin UI are built as part of this document.  
**Approach:** Rename-in-place. The existing application structure is reused and extended rather than rebuilt.  
**Audience:** Product and engineering. Schema and RBAC are described at entity/field-intent level; a separate schema spec can follow after approval.  
**Launch market:** India · **Launch languages:** English, Hindi, Telugu, Urdu, Kannada, Bengali, Marathi, Tamil

---

## 1. Product definition

### 1.1 Repositioning

The product moves from a generic event-planning hub to a **multilingual, accessibility-first community engagement platform for adults 50 and over**.

The centre of gravity shifts from "a host plans one event" to "a locality of members continuously discovers, proposes, votes on, and attends activities together." Events remain, but they are an output of community demand rather than an input from a single organiser.

### 1.2 Core pillars

1. **Hyperlocal social connection** — the unit of community is a neighbourhood, not a city. Density is measured in radius bands starting at one mile.
2. **AI-assisted participation** — AI proposes activities, drafts messages, translates, reads content aloud, and lowers the effort required to take part.
3. **Senior-grade accessibility** — scalable text, high contrast, large tap targets, voice-first paths, and screen-reader semantics are requirements, not settings nobody finds.
4. **Multilingual by default** — the member's language is a first-class property of every surface, not an afterthought translation layer.
5. **Monetised professional and business tools** — professionals, venues, sponsors, and organisations pay for reach, bookings, and tooling; members do not pay to belong.

### 1.3 Launch market and languages

Launch market: **India**.

Launch languages: **English, Hindi, Telugu, Urdu, Kannada, Bengali, Marathi, Tamil**.

Every member-facing string, notification, AI response, and voice output must be renderable in all eight. Admin surfaces launch in English only.

### 1.4 Problem statement

Adults over 50 are systematically underserved by mainstream social and event products:

- Discovery products assume a dense, always-online, English-first user who browses for fun. This cohort wants a small number of relevant, trustworthy, nearby options.
- Group organising depends on one motivated volunteer. When that person stops, the group dies.
- Existing interfaces fail on text size, contrast, tap targets, and jargon.
- Language support is shallow — the shell is translated, the content is not.
- Loneliness and social isolation in this cohort are a health outcome, not a lifestyle preference; the cost of a failed onboarding is high.
- Scam exposure is disproportionate, so trust and fact-checking are product features rather than policy pages.

### 1.5 Target cohorts

| Cohort | Description | Primary need |
| --- | --- | --- |
| Active retirees | 55–75, mobile, time-rich, socially motivated | A steady supply of nearby things to do with peers |
| Semi-retired professionals | 50–65, still working part-time or consulting | Low-commitment, schedulable, interest-led activity |
| Caregivers | Supporting a spouse or parent | Activities that accommodate a companion and mobility limits |
| NRI-returnee households | Returned to India after years abroad | Rebuilding a local social graph from zero |
| Senior-living residents | Living in managed communities | On-site and near-site programming, coordinated with the operator |

### 1.6 Value proposition by role

- **Member** — "Things to do near you, with people like you, in your language, without having to organise anything."
- **Volunteer host** — "Turn a group idea into a real event with the logistics handled."
- **Professional** — "Reach a verified, local, intent-rich audience and get booked."
- **Business sponsor** — "Sponsor real gatherings in your catchment and reach an audience with time and disposable income."
- **NGO / association admin** — "Run your programme with member management, comms, and reporting built in."
- **Operations / super admin** — "Tune the engine, the economics, and the safety posture without a redeploy."

### 1.7 Success metrics

| Metric | Definition | Why it matters |
| --- | --- | --- |
| Activation rate | % of signups completing onboarding and casting a first vote or RSVP within 7 days | Onboarding quality |
| Proposal-to-event conversion | % of AI-generated monthly proposals that reach threshold and become published events | Engine quality |
| Attendance vs. votes | Actual attendance ÷ votes cast | Calibrates the threshold multiplier |
| Repeat participation | % of members attending ≥2 activities in 90 days | Community stickiness |
| Host supply ratio | Active hosts ÷ active localities | Predicts engine failure before it happens |
| Professional bookings | Confirmed paid bookings per month | Supply-side monetisation |
| Sponsor renewal rate | % of sponsors renewing after first package | Demand-side monetisation |
| Language mix | Share of sessions in a non-English language | Validates the multilingual thesis |
| Accessibility adoption | % of members with a non-default text scale, contrast, or voice setting | Validates the accessibility thesis |
| Safety response time | Median time from report to moderation decision | Trust posture |

---

## 2. Roles and permissions

### 2.1 Role catalogue

**Member 50+**
Goal: find and attend nearby activities. Entry: self-signup with age gate. Verification: age attestation plus phone. Can: set profile, interests, language, accessibility; join circles; vote on proposals; RSVP; buy tickets; claim perks; list and buy memorabilia; report content; refer others. Cannot monetise.

**Volunteer host**
Goal: turn a passing proposal into a real gathering. Entry: promotion by a member, invitation by an org admin, or application. Verification: phone plus identity check plus moderator approval. Can: claim proposals, create activities directly, manage attendee lists, mark attendance, request venue/professional/sponsor support, post updates. Monetises only via optional honorarium where the org allows it.

**Professional**
Goal: get booked for activities (instructors, therapists, guides, musicians, caterers, trainers). Entry: application. Verification: identity, credentials, background check, and category-specific documents. Can: maintain a service profile and rate card, set availability, receive and quote on requests, accept bookings, invoice, receive payouts, collect reviews. Monetises through bookings and commission.

**Business sponsor**
Goal: reach a local 50+ audience. Entry: application. Verification: business registration and billing details. Can: buy sponsorship packages, publish senior perks and offers, sponsor specific activities or localities, view aggregate (never individual) performance reporting. Monetises indirectly; pays the platform.

**NGO / association admin**
Goal: run an existing organisation's programme on the platform. Entry: invitation or application. Verification: organisation registration documents. Can: manage the organisation profile, invite and manage members and hosts, create activities, view organisation-scoped reporting, manage organisation billing. Scope is strictly limited to their own organisation.

**Moderator**
Goal: keep the community safe. Entry: internal appointment. Can: review reports and moderation queues, take down content, warn/suspend accounts, escalate, review fact-check flags, view moderation audit history. Cannot change configuration or touch money.

**Operations admin**
Goal: run the platform day to day. Can: everything moderators can, plus user management, organisation and professional approvals, sponsorship management, proposal-engine tuning, localization management, finance operations, and most configuration. Cannot change super-admin-only settings.

**Super admin**
Goal: own the system. Can: everything, including role and permission definitions, AI provider credentials and routing, commission rules, destructive operations, and audit export.

### 2.2 Permission matrix

Actions: **V** view · **C** create · **E** edit · **M** moderate · **P** payout/financial · **X** configure.
"own" means the actor's own records; "org" means records scoped to their organisation.

| Module | Member | Host | Professional | Sponsor | Org admin | Moderator | Ops admin | Super admin |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Profile | V C E (own) | V C E (own) | V C E (own) | V C E (own) | V C E (own) | V (all) | V E (all) | V C E (all) |
| Circles | V C (own) | V C E | V | — | V C E (org) | V M | V C E M | all |
| Proposals | V | V E (claimed) | V | V | V (org) | V M | V C E X | all |
| Voting | V C (own) | V | — | — | V (org) | V M | V X | all |
| Activities | V | V C E (own) | V | V | V C E (org) | V M | V C E M | all |
| External listings | V | V | V | V | V (org) | V M | V C E M X | all |
| Perks | V | V | V | V C E (own) | V | V M | V C E M | all |
| Memorabilia | V C E (own) | V C E (own) | V | — | V | V M | V C E M | all |
| Professional services | V | V | V C E (own) | V | V (org) | V M | V C E M X | all |
| Bookings | V (own) | V C E | V C E (own) | — | V (org) | V | V C E | all |
| Ticketing & payments | V C (own) | V | V (own) | V (own) | V (org) | — | V P | V P X |
| Sponsorships | — | V | — | V C E (own) | V (org) | — | V C E P | all |
| Organisations | V | V | V | V | V E (own org) | V M | V C E M | all |
| Moderation & reports | C (own) | C | C | C | C (org) | V M | V M | all |
| AI assistant | V C (own) | V C | V C | V C | V C | V | V X | all |
| Admin config | — | — | — | — | — | — | V X (subset) | V X (all) |
| Audit log | — | — | — | — | V (org) | V (moderation) | V | V + export |

### 2.3 Enforcement model

- Roles live in a **dedicated role table**, never as a column on the profile. A user may hold multiple roles simultaneously (a member can also be a host and a professional).
- Row access is enforced by **database policies**, using **security-definer role-check functions** to avoid recursive policy evaluation.
- Every public table has row-level security enabled and explicit grants; a table without policies is treated as locked.
- Route guards in the client mirror the permission matrix, but are treated as **UX only** — the database and server functions are the enforcement boundary.
- All financial operations (ticketing, commissions, sponsorships, payouts, refunds) execute **server-side only**. No client path may compute or mutate a money value.
- Organisation-scoped roles carry an organisation identifier; every org-scoped query is filtered by it.
- Privilege changes, moderation actions, financial operations, and configuration edits all write to the audit log with actor, before/after, and reason.

---

## 3. Member experience

### 3.1 Onboarding

Designed to complete in under three minutes on a low-end Android phone, with every step skippable except the age gate and location.

1. **Language first** — the language picker is the first screen, before any prose the member might not read.
2. **Age gate** — self-attested date of birth with a minimum age of 50. Under-50 users are offered a caregiver/family account instead of being rejected outright.
3. **Phone verification** — OTP. Email optional.
4. **Location** — device location or manual locality search. Stored as a locality plus coordinates so radius bands can be computed. Precise location is never shown to other members.
5. **Accessibility preferences** — text scale, high contrast, reduce motion, voice-first mode. Previewed live on the same screen.
6. **Interests** — large tappable tiles (walking, music, devotional, cards and board games, gardening, health talks, travel, food, crafts, technology help, volunteering, language and literature, films, yoga). Minimum three.
7. **Organisation discovery** — nearby NGOs, associations, and senior-living operators are surfaced for optional joining.
8. **Caregiver contact (optional)** — a family member who can receive reminders and emergency notifications, with explicit member consent.

Exit state: the member lands on a dashboard already populated with nearby circles, live proposals, and at least one thing they can act on. An empty dashboard at the end of onboarding is treated as a product failure and triggers a widened-radius fallback.

### 3.2 Senior dashboard

The home surface. One clear primary action above the fold. Contents, in priority order:

- **Proposals to vote on** — the highest-value action; shows what the neighbourhood is considering this month.
- **Upcoming activities** — what the member has already committed to, with date, time, place, and a "how do I get there" affordance.
- **Nearby circles** — groups matching their interests and locality.
- **Reminders** — RSVPs awaiting response, tickets to collect, feedback to give.
- **One-tap actions** — "Join", "Call me about this", "Read this to me", "Bring a friend".

Every list has an intentional loading, empty, and error state. Empty states always propose the next best action rather than simply reporting emptiness.

### 3.3 AI monthly activity ideas and the voting surface

The primary monthly ritual for members. At the start of each voting window the member sees a short, local slate — not an infinite feed.

- Each proposal card shows title, plain-language summary, suggested date/time, indoor/outdoor, accessibility tags, estimated cost per head, and a live vote count against the threshold.
- Primary action is a single large **Vote for this** control; withdrawing a vote is equally easy.
- Threshold-met and scheduled states are visually distinct so members know when an idea becomes real.
- Members who vote are nudged later to RSVP once a host publishes the activity.
- The surface is language-aware: titles and summaries render in the member's preferred language; vote counts use tabular numerals.
- Empty slate (no proposals yet for the locality) explains why and offers a widened-radius view or a path to join a circle instead of a blank page.

Detailed engine behaviour is specified in §4.

### 3.4 Circles and clubs

Persistent interest groups within a locality — the connective tissue between one-off activities.

- Creation by a member (subject to moderation) or an organisation.
- Membership: open, request-to-join, or invite-only.
- Each circle has a host; hosts can hand off to another member, which prevents the single-volunteer failure mode.
- Circles can run recurring meetups that bypass the proposal-voting cycle.
- Circle activity feeds the proposal engine as a strong signal of local interest.

### 3.5 Event discovery

- **Internal activities** — generated from proposals or created directly by hosts and organisations.
- **External listings** — ingested public events (municipal, cultural, temple/community, health camps), clearly labelled as external and unverified, with attribution to the source.
- Filters: distance, date, interest, language of the event, accessibility suitability, free vs. ticketed, indoor vs. outdoor.
- Sorting defaults to distance and date, not popularity — relevance for this cohort is local and imminent.

### 3.6 Senior perks

Discounts and offers published by verified businesses, scoped by locality and category (pharmacy, diagnostics, eyewear, physiotherapy, food, travel, home services). Claim flow issues a redeemable code and records redemption for sponsor reporting in aggregate only.

### 3.7 Memorabilia marketplace

A low-pressure, member-to-member listing surface for books, records, collectibles, craft output, and home-made goods, plus curated listings. Deliberately small in scope: list, browse, message, arrange offline. Payments are out of scope for phase one; every listing carries a safety notice about meeting in public places.

### 3.8 Multilingual AI companion

Available from every screen through a persistent, large, clearly labelled control.

- Chat and voice, both input and output, in the member's chosen language.
- Can read the current screen aloud.
- Can explain what a proposal, activity, or perk means in plain language.
- Can draft an RSVP, a message to a host, or a circle post.
- Can answer "what's happening near me this weekend".
- Always discloses that it is an AI. Never gives medical, legal, or financial advice — those requests route to a canned referral response.
- All companion calls are proxied server-side; conversation history is member-scoped and deletable.

### 3.9 Fact-check and safety

- Members can submit a forwarded message, image, or link for a scam and misinformation check.
- The response is a plain-language verdict with reasoning, not a score.
- Known scam patterns (OTP requests, KYC fraud, lottery, fake pension/subsidy schemes, impersonation of banks and government) are matched against a maintained pattern set before any model call.
- Anything flagged as high-risk offers a one-tap path to report and to alert the member's caregiver contact.

### 3.10 Referrals and family invites

- Members can invite peers by phone number or share link; referral credit is tracked for community-building recognition, not cash.
- Family members can be invited as caregiver-linked accounts with limited, consented visibility (upcoming activities and reminders only — never messages or votes).

---

## 4. AI proposal engine (the core feature)

The core differentiator. Each month, for each locality, the engine generates a ranked slate of candidate activities that the community then votes into existence.

### 4.1 Inputs

- **Member density** in configurable radius bands, starting at 1 mile and widening (1, 3, 5, 10, 25 miles).
- **Declared interests**, weighted by recency of expression.
- **Cohort and age band distribution** within the locality.
- **Language distribution** — a proposal must be runnable in a language its likely attendees speak.
- **Cultural and festival calendar**, including regional and religious observances relevant to the locality.
- **Past attendance and no-show behaviour**, both individual and aggregate.
- **Nearby organisations and venues**, with capacity and accessibility attributes.
- **Seasonality and weather** — outdoor proposals are suppressed in monsoon and peak-heat windows.
- **Host supply** — proposals are not generated at volume where no host can claim them.
- **Professional supply** — proposals requiring an instructor are weighted by local availability.

### 4.2 Output

A ranked monthly slate per locality (default 5–8 proposals), each carrying:

| Attribute | Description |
| --- | --- |
| Title | Plain-language, translated into all locality languages |
| Description | What it is, who it suits, what to bring |
| Minimum attendance | Below this the activity is not viable |
| Vote threshold | Votes needed to trigger; derived from minimum attendance × multiplier |
| Required professionals | Category and count, if any |
| Venue type | Indoor hall, park, community centre, member home, online |
| Sponsorship eligibility | Whether a sponsor may attach |
| Accessibility suitability | Mobility, hearing, vision, seating, restroom availability |
| Indoor / outdoor | Drives weather sensitivity |
| Ticketed / free | And, if ticketed, the price band |
| Estimated cost per head | Used for sponsorship sizing and pricing |
| Suggested host | Ranked candidates from the local host pool |

### 4.3 Voting rule

Votes required = minimum attendance × **threshold multiplier**, default **2.5×** (tunable range 2–3×), to absorb the gap between intent and attendance.

- The multiplier is admin-configurable globally and overridable per locality.
- It self-calibrates: localities whose historic attendance-to-vote ratio is strong get a lower multiplier; weak localities get a higher one.
- Voting windows are configurable (default 10 days).
- One vote per member per proposal. Members may vote for multiple proposals.
- Vote counts are visible to build momentum; voter identity is not.

### 4.4 Lifecycle

```text
generated -> voting open -> threshold met -> host assigned
          -> venue / professional confirmed -> published event
          -> attendance captured -> post-event feedback -> engine feedback loop
```

Each transition is recorded with a timestamp and actor. Post-event feedback (attendance, ratings, comments, no-show reasons) feeds directly back into density weighting, multiplier calibration, and future proposal ranking.

### 4.5 Failure modes and fallbacks

| Failure | Fallback |
| --- | --- |
| Insufficient member density | Widen the radius band one step and regenerate |
| No host claims the proposal | Escalate to nearby organisations; then to ops; then defer |
| No suitable venue | Substitute venue type; offer online format |
| Threshold missed | Extend the window once; then merge with an adjacent locality's similar proposal; then defer to next month |
| Professional unavailable | Re-rank to a proposal not requiring one, or source from a wider radius |
| Weather event | Auto-flag outdoor activities for host confirmation 48h ahead |
| Repeated locality failure | Flag to ops as a supply problem, not an engine problem |

### 4.6 Model usage

Proposal generation runs server-side on a schedule, never client-triggered. Generation is deterministic in its inputs (a snapshot of density and signals is stored with each slate) so any proposal can be explained and audited after the fact. Every generated slate is reviewable and editable by ops before it goes live, with an auto-publish toggle per locality.

---

## 5. AI provider architecture

### 5.1 Principles

- A **provider-abstraction layer** sits between every feature and every model. Features request a capability, not a vendor.
- Routing is **per feature**, configurable at runtime, with a defined fallback chain.
- **All credentials are server-side.** No provider key ever reaches the client, and no client calls a provider directly.
- Every provider call is proxied through a server function that enforces auth, rate limits, and logging.
- Provider health is checked continuously; a failing provider is bypassed automatically.
- Usage is metered per feature and per organisation for cost attribution.

### 5.2 Provider roles

- **Lovable AI is the working default** for reasoning, chat, classification, image description, summarisation, moderation triage, and proposal generation. It is what ships.
- **Sarvam AI is specified as the pluggable slot** for Indian-language translation, speech-to-text, and text-to-speech. The abstraction layer is built with that slot defined from day one; the integration itself is a later phase.
- **Google and Azure speech/translation services** are documented as fallbacks behind the same slot.

### 5.3 Feature → provider → fallback mapping

| Feature | Primary | Fallback | Latency | Cost posture | Quality notes |
| --- | --- | --- | --- | --- | --- |
| Proposal generation | Lovable AI | — | Batch (minutes OK) | Moderate, monthly | Snapshot inputs for auditability |
| AI companion chat | Lovable AI | Scripted help menu | Interactive (<3s target) | High volume | Keep answers short; disclose AI |
| Content summarisation | Lovable AI | Truncation | Near-interactive | Low | Prefer batching |
| Moderation triage | Lovable AI | Rules-only | Interactive | Low–moderate | Never auto-takedown without human |
| Fact-check reasoning | Lovable AI | Pattern set only | Interactive | Low | Pattern match always runs first |
| Image description (a11y) | Lovable AI | Alt-text fallback | Interactive | Low | Required for screen-reader path |
| Indian-language translation | Sarvam (planned) | Google / Azure | Interactive | Moderate | Slot defined now, wired later |
| Speech-to-text | Sarvam (planned) | Google / Azure | Interactive | Moderate | Voice-first input |
| Text-to-speech | Sarvam (planned) | Google / Azure | Interactive | Moderate | Read-aloud, reminders |
| Outbound voice calls | Existing caller service | — | Async | Per-minute | Must disclose automation |

### 5.4 Degradation behaviour

If a capability is unavailable, the feature degrades rather than fails: translation falls back to the source language with a notice, TTS falls back to on-device speech synthesis, the companion falls back to a scripted help menu, and proposal generation defers rather than emitting low-confidence output.

---

## 6. Admin console — all twelve panels

Admin surfaces launch in **English only** and are gated by the permission matrix in §2.2. Each panel below documents purpose, primary screens, key controls, configuration domains written, and role access.

### 6.1 Dashboard

- **Purpose:** Give ops and super admins a single view of platform health so problems are spotted before members feel them.
- **Primary screens:** Overview grid; locality drill-down; conversion funnel (proposals → votes → published → attended); spend summary.
- **Key controls:** Time-range selector; locality filter; alert thresholds for host-supply ratio and open high-risk reports.
- **Config keys written:** none (read-only aggregation over operational data and §7 domains).
- **Access:** Operations admin, Super admin.

### 6.2 User management

- **Purpose:** Find, inspect, and act on any account without leaving the console.
- **Primary screens:** Search/filter list; account detail (profile, roles, votes, bookings, reports); action history.
- **Key controls:** Verify, suspend, restore, merge, soft-delete; force password/OTP reset; attach/detach caregiver link.
- **Config keys written:** account status and verification state on `profiles` / related verification records (not a §7 domain).
- **Access:** Operations admin, Super admin.

### 6.3 Role and permission management

- **Purpose:** Assign roles and own the permission matrix that every server path must honour.
- **Primary screens:** Role assignment per user; organisation-scoped role binding; matrix editor.
- **Key controls:** Grant/revoke role; bind role to organisation; edit module × action cells; freeze destructive roles behind dual control.
- **Config keys written:** `role_permissions`.
- **Access:** Super admin for matrix edits; Operations admin for assignment only.

### 6.4 Module toggles

- **Purpose:** Turn whole product areas on or off globally, per locality, or per organisation without a deploy.
- **Primary screens:** Global flag board; override list by locality/org; blast-radius preview before save.
- **Key controls:** Toggle memorabilia, perks, external listings, companion, fact-check, ticketing, sponsorships; schedule enable/disable windows.
- **Config keys written:** `feature_flags`, `feature_toggle_overrides`.
- **Access:** Operations admin, Super admin.

### 6.5 AI and API settings

- **Purpose:** Route every AI capability through the abstraction layer with safe credentials, limits, and failover.
- **Primary screens:** Feature → provider map; provider health; usage and spend; credential vault (masked).
- **Key controls:** Set primary/fallback chain; model selection; rate limits; monthly spend caps; disable a feature capability; rotate credentials.
- **Config keys written:** `ai_provider_settings`, `ai_provider_configs`.
- **Access:** Super admin for credentials; Operations admin for routing and limits.

### 6.6 Localization

- **Purpose:** Keep the eight launch languages current and locality-aware.
- **Primary screens:** Language inventory; coverage by surface; string override editor; festival calendar; locality default language.
- **Key controls:** Enable/disable language; set default; import/export string packs; attach regional festival calendars that feed the proposal engine.
- **Config keys written:** `localization_settings` (and string override store).
- **Access:** Operations admin, Super admin.

### 6.7 Organizations and NGOs

- **Purpose:** Verify and govern organisations that run programmes on the platform.
- **Primary screens:** Application queue; org profile and documents; membership roster; org billing snapshot.
- **Key controls:** Approve, reject, suspend; request more documents; toggle org-scoped modules; open org billing.
- **Config keys written:** organisation status fields; may apply `feature_toggle_overrides` at org scope.
- **Access:** Operations admin, Super admin.

### 6.8 Professional services

- **Purpose:** Onboard, verify, and quality-manage the professional supply side.
- **Primary screens:** Application queue; credential review; category catalogue; complaint history; delist actions.
- **Key controls:** Approve credentials and background checks; set category policy; delist; freeze payouts pending dispute.
- **Config keys written:** professional verification state; category policy (may live under `app_settings`).
- **Access:** Operations admin, Super admin.

### 6.9 Sponsors and advertising

- **Purpose:** Define packages, approve sponsors, and keep perk placements honest.
- **Primary screens:** Package catalogue; sponsor applications; placement calendar; perk approval queue; aggregate campaign reporting.
- **Key controls:** Create/edit packages; approve sponsors; approve or pause perks; attach placements to localities or activities.
- **Config keys written:** `sponsorship_packages`.
- **Access:** Operations admin, Super admin.

### 6.10 Events and proposal engine

- **Purpose:** Tune the monthly engine and intervene when a locality needs help.
- **Primary screens:** Locality rules; slate review/edit; generation run history and diagnostics; regeneration console.
- **Key controls:** Radius bands, threshold multiplier, voting window, slate size, auto-publish toggle; edit or kill a proposal before publish; force regenerate; merge adjacent localities.
- **Config keys written:** `event_generation_rules`.
- **Access:** Operations admin, Super admin.

### 6.11 Finance

- **Purpose:** Operate money flows and own commission economics.
- **Primary screens:** Ticketing ledger; sponsor invoices; professional payouts; refunds/disputes; reconciliation export.
- **Key controls:** Issue/void invoices; approve payouts; process refunds; edit commission rules (super); export for accounting.
- **Config keys written:** `commission_rules` (super); operational finance records otherwise.
- **Access:** Operations admin (view and operate); Super admin (rule changes and destructive overrides).

### 6.12 Trust and safety

- **Purpose:** Keep members safe and keep response times inside SLA.
- **Primary screens:** Moderation queue; report detail; fact-check flags; appeal board; banned-pattern library; moderation audit trail.
- **Key controls:** Triage, action, dismiss; warn/suspend accounts; take down content; manage scam pattern set; answer appeals (human confirmation required for permanent bans).
- **Config keys written:** `content_moderation_settings`.
- **Access:** Moderator (queue and actions); Operations admin; Super admin.

---

## 7. Configuration model

All operational behaviour is runtime-configurable so admin changes take effect **without a redeploy**.

| Domain | Shape | Editable by | Audit | Cache |
| --- | --- | --- | --- | --- |
| `app_settings` | Key/value with typed schema | Super | Full | Long TTL, invalidated on write |
| `feature_flags` | Flag → boolean/variant, global | Ops, super | Full | Short TTL |
| `feature_toggle_overrides` | Flag → scope (locality/org) → value | Ops, super | Full | Short TTL |
| `ai_provider_settings` | Feature → provider chain, limits, caps | Ops (routing), super (all) | Full, credential values redacted | No cache for credentials |
| `ai_provider_configs` | Provider → endpoint, model, credentials ref | Super | Full, redacted | No cache |
| `localization_settings` | Language set, defaults, string overrides | Ops, super | Full | Long TTL |
| `commission_rules` | Category → rate, floor, cap, effective dates | Super | Full, immutable history | Long TTL |
| `event_generation_rules` | Locality → bands, multiplier, window, slate size | Ops, super | Full | Short TTL |
| `sponsorship_packages` | Package → placements, duration, price | Ops, super | Full | Long TTL |
| `role_permissions` | Role → module → actions | Super | Full, immutable history | Short TTL |
| `content_moderation_settings` | Thresholds, banned patterns, auto-actions | Ops, super | Full | Short TTL |

Rules: every write is audited with actor, timestamp, before/after, and reason. Financial and permission domains keep immutable history — edits create new effective-dated rows rather than overwriting. Configuration reads are cached with explicit invalidation on write; no surface may read configuration from a build-time constant.

---

## 8. Rename-in-place mapping

The existing structure is kept and extended. Nothing is rebuilt that can be renamed and widened.

### 8.1 Module mapping

```text
events        -> activities, circles, proposals, voting, hosted events
marketplace   -> senior perks, memorabilia, professional services
crm           -> organizations, sponsors, businesses, professionals, outreach
finance       -> ticketing, sponsorships, organizer billing, commissions, payouts
trust         -> moderation, fact-check, verification, abuse handling
settings      -> accessibility, language, AI prefs, notifications, privacy
home          -> senior dashboard: nearby circles, proposals, reminders
```

### 8.2 Data mapping

**Reused as-is**

| Existing | New meaning |
| --- | --- |
| `profiles` | Member profile; gains language, accessibility, locality, age band |
| `user_roles` | Unchanged mechanism; new role values |
| `events` | Activities (generated, hosted, or organisation-run) |
| `venues` | Venues, including community centres and org premises |
| `vendors` | Professionals (instructors, therapists, guides, performers) |
| `bookings` | Professional and venue bookings for activities |
| `inquiries` / `messages` | Outreach to organisations, professionals, and venues |
| `reviews` | Activity, host, and professional reviews |
| `tasks` | Host run-of-show and organisation operations |
| `transactions` / `invoices` / `payouts` / `receipts` | Ticketing, sponsorship, commission, and payout records |
| `event_plans` | Run-of-show for hosted activities |
| `event_invites` | Shareable activity invitations |
| `voice_calls` | Outbound confirmation and reminder calls |
| `saved_listings` | Saved perks, professionals, and venues |
| `contacts` | Organisation and sponsor outreach contacts |

**Extended with new columns**

- `profiles` — `preferred_language`, `accessibility_prefs`, `locality_id`, `coordinates`, `age_band`, `caregiver_contact_id`, `voice_first_enabled`.
- `events` — `origin` (proposal / host / organisation / external), `proposal_id`, `circle_id`, `organization_id`, `locality_id`, `accessibility_attributes`, `language`, `indoor_outdoor`, `min_attendance`, `external_source`.
- `venues` — `accessibility_attributes`, `organization_id`, `locality_id`.
- `vendors` — `verification_state`, `background_check_state`, `credentials`, `languages_spoken`, `rate_card`.
- `reviews` — `subject_kind` widened to include host, activity, and organisation.

**Net-new**

`localities`, `circles`, `circle_members`, `generated_activity_proposals`, `proposal_votes`, `proposal_generation_runs`, `organizations`, `organization_members`, `professionals` (profile extension over `vendors`), `professional_credentials`, `perks_offers`, `perk_redemptions`, `memorabilia_listings`, `sponsorships`, `sponsorship_packages`, `external_event_sources`, `external_listings`, `ai_provider_configs`, `ai_usage_ledger`, `feature_toggle_overrides`, `app_settings`, `localization_strings`, `moderation_cases`, `moderation_actions`, `fact_check_requests`, `audit_log`, `caregiver_links`, `referrals`.

Existing seeded venue and vendor data remains valid under this mapping and does not need to be discarded.

---

## 9. API groups

Every third-party call is **proxied server-side**. No provider key, payment secret, or verification vendor credential ever reaches the client. Every group enforces authentication and the permission matrix at the server boundary; client route guards are UX only.

| Group | Responsibilities | Key operations | Auth |
| --- | --- | --- | --- |
| **Auth** | Signup with age gate, phone OTP, session handling, caregiver-linked accounts | `signup`, `verifyOtp`, `signIn`, `signOut`, `linkCaregiver`, `refreshSession` | Public for signup/OTP; authenticated thereafter |
| **Profile** | Profile CRUD, language, accessibility, locality, interests, privacy | `getProfile`, `updateProfile`, `setPreferences`, `setLocality`, `setInterests`, `exportData`, `deleteAccount` | Authenticated; own profile only unless staff |
| **AI** | Companion chat/voice, translation, TTS/STT, summarisation, image description, fact-check via abstraction layer | `chat`, `transcribe`, `speak`, `translate`, `summarise`, `describeImage`, `factCheck` | Authenticated; usage metered |
| **Event engine** | Slate generation, regeneration, diagnostics, snapshots, engine config reads | `generateSlate`, `regenerate`, `getSnapshot`, `getDiagnostics`, `listRuns` | Staff for generate/regenerate; authenticated read of published slate |
| **Voting** | Cast/withdraw votes, tallies, threshold evaluation, windows | `castVote`, `withdrawVote`, `getTally`, `listOpenProposals` | Authenticated member; one vote per proposal |
| **Event** | Activity CRUD, RSVP, attendance, run-of-show, reminders, feedback | `createActivity`, `updateActivity`, `rsvp`, `markAttendance`, `postFeedback`, `listNearby` | Authenticated; create/edit by host/org/staff |
| **Organization** | Org CRUD, membership, verification, org reporting and billing | `createOrg`, `updateOrg`, `inviteMember`, `listMembers`, `submitVerification`, `orgReport` | Authenticated; org-scoped for admins |
| **Professional** | Service profiles, availability, quotes, bookings, credentials, payouts | `upsertService`, `setAvailability`, `quote`, `acceptBooking`, `submitCredential`, `requestPayout` | Authenticated professional (or staff) |
| **Sponsor** | Package purchase, placements, perk publishing, aggregate reporting | `listPackages`, `purchasePackage`, `publishPerk`, `campaignReport` | Authenticated sponsor; aggregate reports only |
| **Marketplace** | Perks browse/claim, memorabilia listings, saved items | `listPerks`, `claimPerk`, `listMemorabilia`, `createListing`, `withdrawListing`, `saveItem` | Authenticated |
| **Admin config** | Read/write every §7 domain with validation and audit | `getConfig`, `setConfig`, `listFlags`, `setFlag`, `setProviderRoute`, `setGenerationRules` | Staff; super for credentials and permission matrix |
| **Audit** | Query and export the audit log | `queryAudit`, `exportAudit` | Staff read; super-admin export only |

**Hard rule:** monetary calculation and mutation (ticketing, commissions, sponsorships, payouts, refunds) happen only inside server functions. Clients may display amounts returned by the server; they may never invent or alter them.

---

## 10. Delivery phases

**Phase 1 — Foundation**
Scope: role model and permission matrix, localities and radius bands, data extensions, audit log, configuration domains, admin shell with dashboard and user management.
Exit: a super admin can assign roles, define localities, and change configuration at runtime with full audit.
Depends on: nothing.

**Phase 2 — Onboarding and localization**
Scope: the full onboarding flow, language framework across all eight languages, accessibility preference system, senior dashboard, circles.
Exit: a new member completes onboarding in their language in under three minutes and lands on a non-empty dashboard.
Depends on: Phase 1.

**Phase 3 — Proposal engine**
Scope: generation, slate review, voting, thresholds and multipliers, lifecycle, host claiming, publication, attendance capture, feedback loop.
Exit: a locality receives a monthly slate, votes it, and at least one proposal becomes a published, attended activity.
Depends on: Phase 2.

**Phase 4 — Professionals and sponsors**
Scope: professional onboarding and verification, bookings and payouts, sponsorship packages, senior perks, commission rules, finance operations.
Exit: a professional is booked and paid, and a sponsor's package runs against a real activity.
Depends on: Phase 3.

**Phase 5 — Trust and assistant**
Scope: moderation queue and actions, reporting, appeals, fact-check, the multilingual AI companion with voice, caregiver links.
Exit: reports are triaged within SLA and a member can complete a full task using voice alone.
Depends on: Phase 2 (companion), Phase 3 (moderation volume).

**Phase 6 — External ingestion**
Scope: external event sources, ingestion pipeline, deduplication, labelling and attribution, moderation of external content.
Exit: external listings appear alongside internal activities, clearly labelled, without degrading discovery quality.
Depends on: Phase 3, Phase 5.

---

## 11. Non-functional requirements

**Accessibility**
- Text scale up to 200% without layout breakage; no fixed-height text containers.
- High-contrast theme meeting WCAG AA at minimum, AAA for body text where achievable.
- Minimum tap target 44×44 px; primary actions larger.
- Full screen-reader semantics: single `main` per route, correct heading order, labelled controls, no icon-only buttons without accessible names.
- Voice-first path for every core task: find, vote, RSVP, contact host.
- Reduce-motion honoured throughout.
- No colour-only status encoding.

**Performance**
- Usable on a low-end Android device over a 3G connection.
- Dashboard interactive within 3 seconds on that baseline.
- Lists paginated; images lazy-loaded and responsively sized.
- Tolerant of poor networks: retries, cached last-known state, and clear offline messaging rather than blank screens.

**Moderation SLAs**
- High-risk reports (safety, scam, harassment) triaged within 4 hours.
- Standard reports within 24 hours.
- Appeals answered within 72 hours.
- No fully automated permanent bans; a human confirms every terminal action.

**Data privacy**
- Precise location never exposed to other members — locality granularity only.
- Caregiver visibility is opt-in, granular, and revocable at any time.
- Sponsor and organisation reporting is aggregate only; no individual member data leaves the platform.
- Data export and deletion available to every member.
- Health, mobility, and accessibility data treated as sensitive: minimised, access-restricted, and never used for ad targeting.

**AI disclosure and consent**
- The companion identifies itself as AI on first interaction in every session.
- Outbound automated voice calls disclose automation at the start and follow regional consent and calling-hour rules.
- AI-generated proposals and copy are labelled as AI-generated where a member could reasonably mistake them for human-authored.

**Audit logging**
- Every privilege change, moderation action, financial operation, and configuration edit is logged with actor, timestamp, before/after, and reason.
- Logs are append-only and exportable by super admin only.

---

## 12. Open questions

1. **Monetisation splits** — what commission rate applies to professional bookings, and does it vary by category? Is ticketing revenue shared with hosts or organisations?
2. **Background verification vendor** — which provider performs professional background checks in India, at what cost, and who bears it?
3. **External event sources** — which sources are in scope at launch (municipal portals, cultural bodies, temple and community boards, health-camp organisers), and what are the licensing and attribution terms?
4. **Age verification method** — is self-attestation sufficient at launch, or is a document check required, and does that change by role (member vs. host vs. professional)?
5. **Caregiver account model** — is a caregiver a distinct role with its own login, or a linked contact on a member account?
6. **Offline participation** — do we need SMS or IVR paths for members who will not install an app?

---

## Out of scope for this document

No migrations, no route changes, no Sarvam integration, and no admin UI are produced here. Implementation begins after sign-off, starting with Phase 1.
