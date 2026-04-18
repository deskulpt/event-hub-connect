
## Vibely — Events Marketplace

A three-sided platform: **users** create events and book venues/services, **professionals** (artists, chefs, caterers) list services, and **venues** are discovered via Google Places. Browsing is open; booking requires login.

### Design direction
- Modern, warm, social — think Airbnb-meets-Eventbrite. Rounded cards, soft shadows, generous whitespace, photography-forward.
- Primary accent: vibrant coral/sunset; secondary: deep aubergine; neutral cream background. Defined as HSL tokens in `index.css`.
- Inter for UI, a display serif (e.g. Fraunces) for headlines to add a celebratory feel.
- Mobile-first (your viewport is 384px wide) with bottom-tab nav on mobile, top nav on desktop.

### Phase 1 — Foundation (this build)

**Public/browse experience (no login required)**
- **Home / Quick Create** — hero with a one-line "What are you planning?" form: event type chips (Casual meetup · Birthday · Wedding/Conference · At-home experience), guest count slider (2–500+), date, city. CTA: *Find options*.
- **Discovery results page** — three tabbed sections based on event type:
  - **Venues** (cafes, restaurants, event spaces) filtered by capacity + city
  - **Professionals** (artists, chefs, hosts) filtered by category
  - **Caterers / services**
- **Venue detail page** — photos, address, capacity, hours, rating, "Request booking" CTA.
- **Professional detail page** — bio, gallery, categories (violinist, comedian, chef, wine & paint host, etc.), price range, ratings (hidden until reviews exist), "Book" CTA.

**Auth (login required to book)**
- Email + password sign-up/login (Lovable Cloud).
- Two account types selectable at signup: **Customer** or **Professional/Venue partner**.
- Roles stored in a separate `user_roles` table (customer, professional, admin) — never on profiles.

**Customer dashboard (after login)**
- My events (upcoming/past), my bookings, favorites ("places I've been" vs "explore new"), profile.

**Professional portal (after login as pro)**
- Onboarding form: business name, category, service description, photos, pricing, service area, instruments/specialties.
- **Vetting status badge**: Pending → Under review → Verified. Admin manually approves in Phase 1; document upload (ID, business license, background-check reference) collected upfront.
- Listings only become publicly visible once Verified.
- Bookings inbox: accept/decline incoming requests.

**Booking flow**
- Customer requests booking with date/time/guests/notes → pro or venue confirms → status tracked (Requested → Confirmed → Completed → Reviewed).
- For venues: availability check is manual confirmation in Phase 1 (Google Places doesn't expose real-time availability).

**Reviews & ratings**
- After a booking is marked Completed, customer can leave star rating + written feedback.
- Aggregate ratings on listings are **hidden until a listing has ≥3 reviews** (per your direction — collect first, show later).
- Pros can respond to reviews.

**Admin view (you)**
- Simple admin route to approve/reject professional applications and review reported content.

### Phase 1 — Technical foundations
- **Backend**: Lovable Cloud (Supabase) with RLS on every table.
- **Tables**: profiles, user_roles, professionals, venues_cache (for favorited Google Places), events, bookings, reviews, professional_documents, categories.
- **Google Places integration** via an edge function (API key stored as a secret) — you'll need to provide a Google Places API key when we get there.
- **Geolocation**: browser geolocation + city autocomplete for "near me" search.
- **Trust & safety copy**: clear T&Cs page, vetting promise, in-home safety guidelines.

### Out of scope for Phase 1 (planned for later phases)
- Payments / billing for in-home cooking ingredients (Phase 2 — Stripe)
- Real-time messaging between customers and pros (Phase 2)
- Background-check API integration (Phase 3 — e.g. Checkr)
- Multi-vendor coordination for large events (Phase 3)
- In-app shopping list / receipts for chef bookings (Phase 2)
- Push notifications, calendar sync (Phase 2)

### What I need from you before/during Phase 1
1. A **Google Places API key** (I'll request it as a secret when we hit that step).
2. Confirmation you're OK with **email/password auth only** for Phase 1 (Google sign-in can be added later).
3. A **brand name** — happy to use "Vibely" as a placeholder, swap anytime.
