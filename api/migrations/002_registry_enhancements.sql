-- Add fields for anonymous display, messages, and general contributions
ALTER TABLE registry_contributions
ADD COLUMN is_anonymous BOOLEAN DEFAULT false,
ADD COLUMN message TEXT,
ADD COLUMN purpose VARCHAR(255);

-- Add index for filtering by status
CREATE INDEX idx_registry_contributions_status ON registry_contributions(status);
