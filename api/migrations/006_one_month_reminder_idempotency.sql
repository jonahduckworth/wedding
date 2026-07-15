-- Keep the one-month reminder campaign and each reminder delivery unique.
-- The delivery key is specific to this reminder flow, so existing campaign
-- history and invitation resend behavior are unaffected.

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_campaigns_one_month_reminder
    ON email_campaigns (template_type)
    WHERE template_type = 'one_month_reminder';

ALTER TABLE email_sends
    ADD COLUMN IF NOT EXISTS reminder_key VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_sends_reminder_key
    ON email_sends (reminder_key)
    WHERE reminder_key IS NOT NULL;
