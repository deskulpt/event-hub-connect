# Real listings go public + partner onboarding with 20% fee and per-event insurance

## 1. Clean out demo data, keep only real Toronto listings
- Delete the older sample venues/providers (US names like "Sunset Loft Brooklyn") and every demo-tagged event, booking, task and contact.
- Keep the 105 real Toronto businesses from OpenStreetMap.
- Turn Demo mode off by default. The switch stays in the profile menu for the owner account only.

## 2. Real photos and rates
- **Photos (recommended route):** for each listing that has a website, pull the photo the business shows when its link is shared, plus a few images from its homepage, using the Firecrawl website reader. This is free of licensing risk because the images come from the business's own site. If no photo is found, the listing keeps its category illustration and a "Add your photos" prompt the owner sees after claiming.
- **Google / Yelp:** both are possible, but they need your own paid key (Google Places costs about $7 per 1,000 photo lookups) and their terms don't allow storing photos permanently. I can add either one later if you give me a key.
- **Rates:** most businesses don't publish prices. I'll capture any price or package text the website reader finds and show it as "From $X (from their website)". Otherwise the listing shows "Rates on request" until the owner adds their own rates during onboarding.

## 3. Fix navigation
- **Top menu (public):** Explore venues · Find pros · How it works · Pricing & insurance · For businesses · Log in / Start planning.
- **Footer:** every link goes to a real page. New public pages: Explore (venues and pros, with filters), How it works, For partners (List your service), Trust & safety, Terms, Privacy.
- **"View site" button** in the app's top bar and profile menu for everyone:
  - Admin: opens the public site, plus "View as public" on any listing in Admin.
  - Pro / Business: "View my public listing" (or "Create your listing" if they have none yet).
  - Host / Member: "Back to homepage".

## 4. Push listings live
- New public pages anyone can open without signing in: `/explore`, `/explore/venues`, `/explore/pros`, and one page per listing at `/l/venue/:slug` and `/l/pro/:slug`.
- Each listing page gets its own title, description and business details for Google, and every listing is added to the sitemap.
- Unclaimed listings show a clear "Unclaimed — is this your business?" banner.

## 5. Claim this listing → register as Business or Pro
- "Claim this listing" button on every unclaimed public page. Not signed in → sign-up with the role already chosen (Business for venues, Pro for providers) → claim form opens pre-filled.
- Admin approves in the existing "Claims & outreach" tab; ownership moves to the claimant and they're sent into onboarding.

## 6. Partner onboarding, contracted hours, 20% fee and insurance
Step-by-step setup after approval (also reachable from Settings):
1. **Profile** — name, photos, description, languages, service area.
2. **Offerings** — packages/services with an hourly rate or flat price, and a risk type (low-risk e.g. photography, workshop; high-risk e.g. alcohol, live music, physical activity, 100+ guests).
3. **Engagement terms** — minimum and maximum contracted hours per event, notice period, cancellation policy.
4. **Partner agreement** — they review and accept: platform fee is 20% added on top of their rate, plus per-event insurance. Acceptance is recorded with date and version.
5. **Publish** — listing becomes "Claimed" and bookable.

**Price shown to the host at booking (example: pro charges $100/h for 4 h, small private event):**
```text
Pro's rate      4 h x $100   = $400.00   (pro receives this in full)
Platform fee    20% of rate  =  $80.00
Event insurance (small event, $2M) = $55.00
Ontario 8% tax on insurance  =   $4.40
Host pays                    = $539.40
```

**Insurance per event, based on your benchmarks (CAD, $2M liability, 1 day):**
- Low-risk booth / pop-up: $30
- Small private event, under 100 guests, no alcohol: $55
- High-risk (alcohol, 100+ guests, or physical activity): $150, plus $1 per guest over 150
- Extra days: +40% each. $5M limit: +40%. Minimum $25.
- Ontario 8% tax added on the insurance only.
- Admin can change all these numbers. This is a price estimate; no real insurer is connected yet (that's a later step with a partner like an insurance API provider).

## Open items / your decisions
- I'll change the platform fee from 10% to 20% added on top of the partner's rate (the old 10% was taken out of the partner's price). Payments themselves still need Stripe turned on.
- Insurance amounts above are midpoints from your document; tell me if you want different defaults.

## Technical details
- Data cleanup via delete queries on `venues`/`vendors` where `source is null` and demo-tagged rows; demo seeding code kept but off.
- New edge function `listings-enrich` (Firecrawl, batched, admin-triggered) writing `photo_url`, a new `gallery` text[] and `rate_card` hints; new `slug` column on venues/vendors.
- Public RLS: anon SELECT on published venues/vendors (published + toronto rows set `published=true`), with matching GRANTs.
- New tables: `partner_offerings` (rate_cents, pricing_unit, risk_class), `partner_terms` (min/max hours, notice, cancellation), `partner_agreements` (version, fee_percent, accepted_at), `insurance_rate_rules` (admin-editable); all RLS owner/staff.
- `src/lib/platform-fee.ts` rewritten: fee = 20% added on top; new `src/lib/insurance-quote.ts`; unit tests for both using the example figures above.
- New public pages + `SiteHeader`/`SiteFooter` updates, `TopBar` "View site" menu, sitemap generator reads listing slugs.
- Update `AGENTS.md` fee rule and `mem://business/launch` (20% on top + insurance).
