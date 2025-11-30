-- Add evaluation_failed and error statuses to valid_status constraint
-- Update the submissions table constraint to include error states

ALTER TABLE submissions DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE submissions ADD CONSTRAINT valid_status 
  CHECK (status IN ('pending', 'evaluating', 'evaluation_failed', 'ai_complete', 'staff_reviewing', 'staff_approved', 'ready_to_share'));
