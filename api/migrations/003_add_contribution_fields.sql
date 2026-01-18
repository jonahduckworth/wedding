-- Add missing fields to registry_contributions (idempotent)
-- These were supposed to be added by migration 002 but it failed partway through

DO $$
BEGIN
    -- Add is_anonymous column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'registry_contributions' AND column_name = 'is_anonymous'
    ) THEN
        ALTER TABLE registry_contributions ADD COLUMN is_anonymous BOOLEAN DEFAULT false;
    END IF;

    -- Add message column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'registry_contributions' AND column_name = 'message'
    ) THEN
        ALTER TABLE registry_contributions ADD COLUMN message TEXT;
    END IF;

    -- Add purpose column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'registry_contributions' AND column_name = 'purpose'
    ) THEN
        ALTER TABLE registry_contributions ADD COLUMN purpose VARCHAR(255);
    END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_registry_contributions_status ON registry_contributions(status);
