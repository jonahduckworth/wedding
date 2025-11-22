pub mod templates;

use crate::models::InviteWithGuests;
use sqlx::PgPool;
use uuid::Uuid;
use serde::{Deserialize, Serialize};

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
                guest.email.contains('@') && guest.email.split('@').nth(1).map_or(false, |domain| domain.contains('.'))
            })
            .map(|guest| guest.email.clone())
            .collect();

        if recipient_emails.is_empty() {
            return Err("No valid email addresses found for invite".to_string());
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

        // Get all invites with non-removed guests
        let invites = sqlx::query!(
            "SELECT DISTINCT i.* FROM invites i
             INNER JOIN guests g ON g.invite_id = i.id
             WHERE g.removed = false"
        )
        .fetch_all(&self.db)
        .await
        .map_err(|e| format!("Failed to fetch invites: {}", e))?;

        let mut sent_count = 0;

        for invite_row in invites {
            // Get guests for this invite
            let guests = sqlx::query_as::<_, crate::models::Guest>(
                "SELECT * FROM guests WHERE invite_id = $1 AND removed = false"
            )
            .bind(invite_row.id)
            .fetch_all(&self.db)
            .await
            .map_err(|e| format!("Failed to fetch guests: {}", e))?;

            let invite = InviteWithGuests {
                invite: crate::models::Invite {
                    id: invite_row.id,
                    unique_code: invite_row.unique_code,
                    invite_type: invite_row.invite_type.unwrap_or_else(|| "single".to_string()),
                    created_at: invite_row.created_at,
                    updated_at: invite_row.updated_at,
                },
                guests,
            };

            // Send email
            self.send_save_the_date(campaign_id, &invite, &campaign.subject).await?;
            sent_count += 1;
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

        Ok(sent_count)
    }
}
