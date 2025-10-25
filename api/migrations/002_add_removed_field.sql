-- Add removed field to guests table
ALTER TABLE guests ADD COLUMN IF NOT EXISTS removed BOOLEAN DEFAULT false;

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_guests_removed ON guests(removed);
