pub mod templates;

use crate::models::InviteWithGuests;
use sqlx::PgPool;
use uuid::Uuid;

pub struct EmailService {
    pub db: PgPool,
    pub frontend_url: String,
}

impl EmailService {
    pub fn new(db: PgPool, frontend_url: String) -> Self {
        Self { db, frontend_url }
    }

    /// Render save-the-date email HTML
    pub fn render_save_the_date(&self, invite: &InviteWithGuests, tracking_pixel_url: &str) -> String {
        let guest_names: Vec<String> = invite.guests.iter().map(|g| g.name.clone()).collect();

        templates::save_the_date_html(
            &guest_names,
            "August 15, 2026",
            "Rouge, Calgary, Alberta",
            &self.frontend_url,
            tracking_pixel_url,
        )
    }

    /// Send save-the-date email (stubbed for now - logs instead of sending)
    pub async fn send_save_the_date(
        &self,
        campaign_id: Uuid,
        invite: &InviteWithGuests,
    ) -> Result<Uuid, String> {
        // Generate tracking pixel URL
        let email_send_id = Uuid::new_v4();
        let tracking_pixel_url = format!("{}/api/track/{}/open.png", self.frontend_url, email_send_id);

        // Render HTML
        let html = self.render_save_the_date(invite, &tracking_pixel_url);

        // STUBBED: In production, this would send via Resend API
        tracing::info!(
            "📧 [STUBBED] Would send save-the-date email to invite {} ({} guests)",
            invite.invite.unique_code,
            invite.guests.len()
        );
        tracing::debug!("Email HTML length: {} bytes", html.len());

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
            self.send_save_the_date(campaign_id, &invite).await?;
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
