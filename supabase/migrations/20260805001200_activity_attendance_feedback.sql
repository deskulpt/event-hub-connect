-- Phase 3: attendance capture and post-event feedback on activities
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS attended_count integer,
  ADD COLUMN IF NOT EXISTS no_show_count integer,
  ADD COLUMN IF NOT EXISTS feedback_rating integer,
  ADD COLUMN IF NOT EXISTS feedback_notes text;

COMMENT ON COLUMN public.events.attended_count IS 'Heads counted at the activity; feeds proposal-engine calibration';
COMMENT ON COLUMN public.events.no_show_count IS 'Votes/RSVPs that did not attend';
COMMENT ON COLUMN public.events.feedback_rating IS 'Host or member post-event rating 1-5';
COMMENT ON COLUMN public.events.feedback_notes IS 'Free-text post-event feedback for the engine loop';
