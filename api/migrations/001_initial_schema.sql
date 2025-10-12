-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Guests table
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    relationship VARCHAR(50) NOT NULL,
    sam_or_jonah VARCHAR(10) NOT NULL,
    maybe BOOLEAN DEFAULT false,
    unique_code VARCHAR(50) UNIQUE NOT NULL,
    invite_type VARCHAR(20) DEFAULT 'single',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email campaigns table
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    sent_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

-- Email sends tracking table
CREATE TABLE email_sends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    opened_at TIMESTAMPTZ,
    opened_count INT DEFAULT 0
);

-- RSVPs table
CREATE TABLE rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE UNIQUE,
    attending BOOLEAN NOT NULL,
    dietary_restrictions TEXT,
    message TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Honeymoon categories table
CREATE TABLE honeymoon_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Honeymoon items table
CREATE TABLE honeymoon_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES honeymoon_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    total_contributed DECIMAL(10, 2) DEFAULT 0,
    is_fully_funded BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registry contributions table
CREATE TABLE registry_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES honeymoon_items(id) ON DELETE CASCADE,
    contributor_name VARCHAR(255),
    contributor_email VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_unique_code ON guests(unique_code);
CREATE INDEX idx_email_sends_campaign ON email_sends(campaign_id);
CREATE INDEX idx_email_sends_guest ON email_sends(guest_id);
CREATE INDEX idx_rsvps_guest ON rsvps(guest_id);
CREATE INDEX idx_honeymoon_items_category ON honeymoon_items(category_id);
CREATE INDEX idx_registry_contributions_item ON registry_contributions(item_id);
