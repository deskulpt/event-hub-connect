ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read own conversation channels" ON realtime.messages;
CREATE POLICY "Participants can read own conversation channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.inquiries i
    WHERE realtime.topic() = 'messages-' || i.id::text
      AND (i.sender_id = auth.uid() OR i.recipient_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Participants can write own conversation channels" ON realtime.messages;
CREATE POLICY "Participants can write own conversation channels"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.inquiries i
    WHERE realtime.topic() = 'messages-' || i.id::text
      AND (i.sender_id = auth.uid() OR i.recipient_id = auth.uid())
  )
);