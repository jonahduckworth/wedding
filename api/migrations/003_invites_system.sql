-- Migration: Invites System
-- Creates invites table to group 1-2 guests together
-- Updates guests and email_sends tables to reference invites

-- Create invites table
CREATE TABLE invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_code VARCHAR(50) UNIQUE NOT NULL,
    invite_type VARCHAR(20) DEFAULT 'single', -- single, couple, plus_one
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add invite_id foreign key to guests table
ALTER TABLE guests ADD COLUMN invite_id UUID REFERENCES invites(id) ON DELETE SET NULL;

-- Add invite_id reference to email_sends table
ALTER TABLE email_sends ADD COLUMN invite_id UUID REFERENCES invites(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX idx_invites_unique_code ON invites(unique_code);
CREATE INDEX idx_guests_invite_id ON guests(invite_id);
CREATE INDEX idx_email_sends_invite ON email_sends(invite_id);

-- Note: Guests can still have unique_code for backwards compatibility
-- but the invite's unique_code will be used for RSVP links going forward
