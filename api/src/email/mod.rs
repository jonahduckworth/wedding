pub mod templates;

use crate::models::InviteWithGuests;
use sqlx::PgPool;
use uuid::Uuid;
use serde::{Deserialize, Serialize};

pub const ONE_MONTH_REMINDER_TEMPLATE: &str = "one_month_reminder";
pub const ONE_MONTH_REMINDER_NAME: &str = "One Month Reminder - July 2026";
pub const ONE_MONTH_REMINDER_SUBJECT: &str = "One month to go! Sam & Jonah's wedding";

fn one_month_reminder_idempotency_key(campaign_id: Uuid, invite_id: Uuid) -> String {
    format!("one_month_reminder_{}_{}", campaign_id, invite_id)
}

#[derive(Debug, Serialize)]
struct ResendEmail {
    from: String,
    to: Vec<String>,
    subject: String,
    html: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    tags: Option<Vec<ResendTag>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    reply_to: Option<Vec<String>>,
}

#[derive(Debug, Serialize)]
struct ResendTag {
    name: String,
    value: String,
}

#[derive(Debug, Deserialize)]
struct ResendResponse {
    id: String,
}

pub struct EmailService {
    pub db: PgPool,
    pub frontend_url: String,
    pub resend_api_key: String,
    pub from_email: String,
    pub venue_map_url: String,
    pub hotel_info_url: String,
}

impl EmailService {
    pub fn new(db: PgPool, frontend_url: String, resend_api_key: String, from_email: String, venue_map_url: String, hotel_info_url: String) -> Self {
        Self {
            db,
            frontend_url,
            resend_api_key,
            from_email,
            venue_map_url,
            hotel_info_url,
        }
    }

    /// Render save-the-date email HTML
    pub fn render_save_the_date(&self, invite: &InviteWithGuests) -> String {
        let guest_names: Vec<String> = invite.guests.iter().map(|g| g.name.clone()).collect();

        templates::save_the_date_html(
            &guest_names,
            &self.frontend_url,
            &self.venue_map_url,
            &self.hotel_info_url,
        )
    }

    /// Render the one-month reminder for confirmed attendees only.
    pub fn render_one_month_reminder(&self, invite: &InviteWithGuests) -> String {
        let guest_names: Vec<String> = invite.guests.iter().map(|g| g.name.clone()).collect();

        templates::one_month_reminder_html(&guest_names, &self.frontend_url)
    }

    /// Send save-the-date email via Resend API
    pub async fn send_save_the_date(
        &self,
        campaign_id: Uuid,
        invite: &InviteWithGuests,
        subject: &str,
    ) -> Result<Uuid, String> {
        // Generate email send ID for tracking
        let email_send_id = Uuid::new_v4();

        // Render HTML
        let html = self.render_save_the_date(invite);

        // Get all valid recipient emails from guests in this invite
        let recipient_emails: Vec<String> = invite.guests.iter()
            .filter(|guest| {
                // Valid email must contain @ and . after the @
                let is_valid = guest.email.contains('@') && guest.email.split('@').nth(1).map_or(false, |domain| domain.contains('.'));
                if !is_valid {
                    tracing::debug!("Skipping invalid email for {}: {}", guest.name, guest.email);
                }
                is_valid
            })
            .map(|guest| guest.email.clone())
            .collect();

        if recipient_emails.is_empty() {
            let guest_names: Vec<String> = invite.guests.iter().map(|g| format!("{} ({})", g.name, g.email)).collect();
            return Err(format!("No valid email addresses found for invite with guests: {}", guest_names.join(", ")));
        }

        // Prepare email payload for Resend with tags for tracking
        let email_payload = ResendEmail {
            from: format!("Sam & Jonah <{}>", self.from_email),
            to: recipient_emails.clone(),
            subject: subject.to_string(),
            html,
            tags: Some(vec![
                ResendTag {
                    name: "campaign_id".to_string(),
                    value: campaign_id.to_string(),
                },
                ResendTag {
                    name: "invite_id".to_string(),
                    value: invite.invite.id.to_string(),
                },
            ]),
            reply_to: Some(vec![self.from_email.clone()]),
        };

        // Send via Resend API
        let client = reqwest::Client::new();
        let response = client
            .post("https://api.resend.com/emails")
            .header("Authorization", format!("Bearer {}", self.resend_api_key))
            .header("Content-Type", "application/json")
            .json(&email_payload)
            .send()
            .await
            .map_err(|e| format!("Failed to send email via Resend: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            return Err(format!("Resend API error ({}): {}", status, error_body));
        }

        let resend_response: ResendResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse Resend response: {}", e))?;

        tracing::info!(
            "📧 Sent save-the-date email to {} (invite: {}, resend_id: {})",
            recipient_emails.join(", "),
            invite.invite.unique_code,
            resend_response.id
        );

        // Record the email send in database
        sqlx::query(
            "INSERT INTO email_sends (id, campaign_id, invite_id, sent_at)
             VALUES ($1, $2, $3, NOW())"
        )
        .bind(email_send_id)
        .bind(campaign_id)
        .bind(invite.invite.id)
        .execute(&self.db)
        .await
        .map_err(|e| format!("Failed to record email send: {}", e))?;

        Ok(email_send_id)
    }

    /// Send the one-month reminder to the confirmed attendees on an invite.
    pub async fn send_one_month_reminder(
        &self,
        campaign_id: Uuid,
        invite: &InviteWithGuests,
        subject: &str,
    ) -> Result<Uuid, String> {
        let email_send_id = Uuid::new_v4();
        let html = self.render_one_month_reminder(invite);
        let idempotency_key = one_month_reminder_idempotency_key(
            campaign_id,
            invite.invite.id,
        );

        let recipient_emails: Vec<String> = invite.guests.iter()
            .filter(|guest| {
                let is_valid = guest.email.contains('@') && guest.email.split('@').nth(1).map_or(false, |domain| domain.contains('.'));
                if !is_valid {
                    tracing::debug!("Skipping invalid email for {}: {}", guest.name, guest.email);
                }
                is_valid
            })
            .map(|guest| guest.email.clone())
            .collect();

        if recipient_emails.is_empty() {
            return Err(format!(
                "No valid email addresses found for attending guests on invite {}",
                invite.invite.unique_code
            ));
        }

        let email_payload = ResendEmail {
            from: format!("Sam & Jonah <{}>", self.from_email),
            to: recipient_emails.clone(),
            subject: subject.to_string(),
            html,
            tags: Some(vec![
                ResendTag {
                    name: "campaign_id".to_string(),
                    value: campaign_id.to_string(),
                },
                ResendTag {
                    name: "invite_id".to_string(),
                    value: invite.invite.id.to_string(),
                },
                ResendTag {
                    name: "template".to_string(),
                    value: ONE_MONTH_REMINDER_TEMPLATE.to_string(),
                },
            ]),
            reply_to: Some(vec![self.from_email.clone()]),
        };

        let client = reqwest::Client::new();
        let response = client
            .post("https://api.resend.com/emails")
            .header("Authorization", format!("Bearer {}", self.resend_api_key))
            .header("Content-Type", "application/json")
            .header("Idempotency-Key", &idempotency_key)
            .json(&email_payload)
            .send()
            .await
            .map_err(|e| format!("Failed to send email via Resend: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            return Err(format!("Resend API error ({}): {}", status, error_body));
        }

        let resend_response: ResendResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse Resend response: {}", e))?;

        sqlx::query(
            "INSERT INTO email_sends (id, campaign_id, invite_id, sent_at, reminder_key)
             VALUES ($1, $2, $3, NOW(), $4)
             ON CONFLICT (reminder_key) WHERE reminder_key IS NOT NULL
             DO UPDATE SET reminder_key = EXCLUDED.reminder_key"
        )
        .bind(email_send_id)
        .bind(campaign_id)
        .bind(invite.invite.id)
        .bind(&idempotency_key)
        .execute(&self.db)
        .await
        .map_err(|e| format!("Failed to record email send: {}", e))?;

        tracing::info!(
            "Sent one-month reminder to {} (invite: {}, resend_id: {})",
            recipient_emails.join(", "),
            invite.invite.unique_code,
            resend_response.id
        );

        Ok(email_send_id)
    }

    /// Send campaign to all invites
    pub async fn send_campaign(&self, campaign_id: Uuid) -> Result<usize, String> {
        // Get campaign details for subject
        let campaign = sqlx::query!(
            "SELECT subject FROM email_campaigns WHERE id = $1",
            campaign_id
        )
        .fetch_one(&self.db)
        .await
        .map_err(|e| format!("Failed to fetch campaign: {}", e))?;

        // Get all invites with non-removed guests that haven't been sent yet
        let invites = sqlx::query!(
            "SELECT DISTINCT i.* FROM invites i
             INNER JOIN guests g ON g.invite_id = i.id
             WHERE g.removed = false
             AND NOT EXISTS (
                 SELECT 1 FROM email_sends es
                 WHERE es.invite_id = i.id AND es.campaign_id = $1
             )",
            campaign_id
        )
        .fetch_all(&self.db)
        .await
        .map_err(|e| format!("Failed to fetch invites: {}", e))?;

        let mut sent_count = 0;
        let mut errors = Vec::new();

        for invite_row in invites {
            // Get guests for this invite
            let guests = sqlx::query_as::<_, crate::models::Guest>(
                "SELECT * FROM guests WHERE invite_id = $1 AND removed = false"
            )
            .bind(invite_row.id)
            .fetch_all(&self.db)
            .await
            .map_err(|e| format!("Failed to fetch guests: {}", e))?;

            let unique_code = invite_row.unique_code.clone();
            let invite = InviteWithGuests {
                invite: crate::models::Invite {
                    id: invite_row.id,
                    unique_code: invite_row.unique_code,
                    invite_type: invite_row.invite_type.unwrap_or_else(|| "single".to_string()),
                    invite_sent_at: None,
                    created_at: invite_row.created_at,
                    updated_at: invite_row.updated_at,
                },
                guests,
            };

            // Send email - continue on error instead of stopping
            match self.send_save_the_date(campaign_id, &invite, &campaign.subject).await {
                Ok(_) => {
                    sent_count += 1;
                    tracing::info!("✓ Successfully sent email for invite {}", unique_code);
                }
                Err(e) => {
                    let error_msg = format!("Failed to send to invite {}: {}", unique_code, e);
                    tracing::error!("✗ {}", error_msg);
                    errors.push(error_msg);
                }
            }
        }

        // Update campaign
        sqlx::query(
            "UPDATE email_campaigns
             SET sent_count = $1, sent_at = NOW()
             WHERE id = $2"
        )
        .bind(sent_count as i32)
        .bind(campaign_id)
        .execute(&self.db)
        .await
        .map_err(|e| format!("Failed to update campaign: {}", e))?;

        // Return success if at least some emails were sent, or error if all failed
        if sent_count == 0 && !errors.is_empty() {
            Err(format!("Failed to send all emails. Errors: {}", errors.join("; ")))
        } else if !errors.is_empty() {
            tracing::warn!("Campaign completed with {} successes and {} errors", sent_count, errors.len());
            Ok(sent_count)
        } else {
            Ok(sent_count)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::one_month_reminder_idempotency_key;
    use uuid::Uuid;

    #[test]
    fn reminder_idempotency_key_is_stable_per_campaign_and_invite() {
        let campaign_id = Uuid::parse_str("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa").unwrap();
        let invite_id = Uuid::parse_str("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb").unwrap();

        let first = one_month_reminder_idempotency_key(campaign_id, invite_id);
        let retry = one_month_reminder_idempotency_key(campaign_id, invite_id);

        assert_eq!(first, retry);
        assert!(first.len() <= 256);
    }
}
