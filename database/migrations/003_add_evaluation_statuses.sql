-- Add evaluation_failed to valid submission statuses
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE submissions ADD CONSTRAINT valid_status 
  CHECK (status IN ('pending', 'evaluating', 'evaluation_failed', 'ai_complete', 'staff_reviewing', 'staff_approved', 'ready_to_share'));

-- Evaluations table already has correct constraint (ai_generated, staff_modified)
-- No changes needed to evaluation_type constraint
