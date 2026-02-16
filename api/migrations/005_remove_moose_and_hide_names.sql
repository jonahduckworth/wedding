-- Remove "Moose" registry contribution (by name match)
DELETE FROM registry_contributions WHERE contributor_name ILIKE '%moose%';

-- Also remove any honeymoon items named "Moose" if they exist
-- (this is a safety check — the item might be in honeymoon_items)
DELETE FROM honeymoon_items WHERE name ILIKE '%moose%';
