# Supabase migration audit — `tfzzexodasqdzsrixnmg`

**Audited:** 2026-08-12  
**Connection:** session pooler `aws-1-us-west-2.pooler.supabase.com`  
**Previous project** `spramnsijazzevffugqs`: not reachable (tenant gone / password mismatch). Treat this project as the sole live DB.

## Result: PASS (with one dashboard follow-up)

| Check | Status |
| --- | --- |
| All 13 on-disk migrations recorded in `supabase_migrations.schema_migrations` | ✅ |
| Enums from migrations present | ✅ 20/20 |
| Tables from migrations present | ✅ 42/42 |
| Public functions from migrations present | ✅ 9/9 |
| `ALTER TABLE … ADD COLUMN` extensions present | ✅ |
| RLS enabled on all public app tables | ✅ |
| Phase 3 attendance/feedback columns on `events` | ✅ |
| `profiles.marital_status` (20260805143000) | ✅ applied this session |
| Realtime channel policies on `realtime.messages` | ⚠️ see below |

## Realtime follow-up (manual)

Migration `20260804045649_*.sql` enables RLS + participant policies on `realtime.messages`.  
The `postgres` pooler role **cannot** alter that table (`owner = supabase_realtime_admin`).

Run this in the Supabase SQL Editor (Dashboard) as the project owner:

```sql
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read own conversation channels" ON realtime.messages;
CREATE POLICY "Participants can read own conversation channels"
ON realtime.messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.inquiries i
    WHERE realtime.topic() = 'messages-' || i.id::text
      AND (i.sender_id = auth.uid() OR i.recipient_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Participants can write own conversation channels" ON realtime.messages;
CREATE POLICY "Participants can write own conversation channels"
ON realtime.messages FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.inquiries i
    WHERE realtime.topic() = 'messages-' || i.id::text
      AND (i.sender_id = auth.uid() OR i.recipient_id = auth.uid())
  )
);
```

## Migrations applied (history)

```
20260418203813  profiles / roles foundation
20260418203825  set_updated_at
20260418212454  events
20260418214111  inquiries
20260418214907  bookings
20260418220557  venues / vendors
20260420024857  finance tables
20260527124715  (intermediate)
20260802030227  community platform (localities, circles, proposals, orgs, …)
20260804045612  RLS hardening / claim_self_service_role
20260804045649  realtime.messages policies  ← needs Dashboard if not owner
20260805001200  activity attendance + feedback
20260805143000  profiles.marital_status
```
