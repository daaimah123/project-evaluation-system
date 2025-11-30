-- Add evaluation_failed status to submissions constraint
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE submissions ADD CONSTRAINT valid_status 
  CHECK (status IN ('pending', 'evaluating', 'ai_complete', 'staff_reviewing', 'staff_approved', 'ready_to_share', 'evaluation_failed'));

-- No changes needed for evaluations - ai_generated type will handle fallback cases
-- The evaluation service will set an error flag in development_observations instead of using a separate type
