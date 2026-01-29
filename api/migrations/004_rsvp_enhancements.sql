-- RSVP System Enhancements
-- Add song_requests to rsvps table
-- Change rsvps to be keyed by invite_id for couple support
-- Add invite_sent_at tracking to invites

-- Add song_requests column to rsvps
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS song_requests TEXT;

-- Add invite_id to rsvps (for invite-level grouping)
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS invite_id UUID REFERENCES invites(id) ON DELETE CASCADE;

-- Remove the unique constraint on guest_id so we can have multiple per invite
-- (the old schema had UNIQUE on guest_id, but we keep one RSVP per guest)
-- guest_id stays as the primary key for individual responses

-- Add invite_sent_at to invites table to track invitation email status
ALTER TABLE invites ADD COLUMN IF NOT EXISTS invite_sent_at TIMESTAMPTZ;

-- Create index for RSVP lookups by invite
CREATE INDEX IF NOT EXISTS idx_rsvps_invite_id ON rsvps(invite_id);
