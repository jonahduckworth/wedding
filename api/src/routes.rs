use axum::{
    extract::{Path, State},
    http::{StatusCode, header},
    response::{Html, IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::email::EmailService;
use crate::models::{EmailCampaign, EmailSend, Guest, Invite, InviteWithGuests};

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
}

// CSV import structures
#[derive(Debug, Deserialize)]
pub struct CsvGuestRow {
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Relationship")]
    pub relationship: String,
    #[serde(rename = "Sam/Jonah")]
    pub sam_or_jonah: String,
    #[serde(rename = "Maybe")]
    pub maybe: String,
}

#[derive(Debug, Serialize)]
pub struct ImportResponse {
    pub success: bool,
    pub imported_count: usize,
    pub errors: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateGuestRequest {
    pub name: String,
    pub email: String,
    pub relationship: String,
    pub sam_or_jonah: String,
    pub maybe: bool,
    pub invite_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MarkRemovedRequest {
    pub removed: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateInviteRequest {
    pub guest_ids: Vec<Uuid>,
    pub invite_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateInviteRequest {
    pub guest_ids: Vec<Uuid>,
    pub invite_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCampaignRequest {
    pub name: String,
    pub subject: String,
    pub template_type: String,
}

#[derive(Debug, Serialize)]
pub struct CampaignStats {
    pub total_invites: i64,
    pub sent_count: i64,
    pub opened_count: i64,
    pub not_opened_count: i64,
    pub pending_count: i64,
}

#[derive(Debug, Serialize)]
pub struct RecipientStatus {
    pub invite: InviteWithGuests,
    pub sent_at: Option<time::OffsetDateTime>,
    pub opened_at: Option<time::OffsetDateTime>,
    pub opened_count: i32,
}

#[derive(Debug, Serialize)]
pub struct SendCampaignResponse {
    pub success: bool,
    pub sent_count: usize,
    pub message: String,
}

pub fn admin_routes() -> Router<AppState> {
    Router::new()
        .route("/guests", get(list_guests).post(create_guest))
        .route("/guests/import", post(import_guests_csv))
        .route("/guests/:id", get(get_guest).put(update_guest).delete(delete_guest))
        .route("/guests/:id/removed", axum::routing::patch(mark_guest_removed))
        .route("/invites", get(list_invites).post(create_invite))
        .route("/invites/:id", get(get_invite).put(update_invite).delete(delete_invite))
        .route("/invites/auto-suggest", post(auto_suggest_invites))
        .route("/campaigns", get(list_campaigns).post(create_campaign))
        .route("/campaigns/:id/preview", get(preview_campaign))
        .route("/campaigns/:id/send", post(send_campaign))
        .route("/campaigns/:id/stats", get(campaign_stats))
        .route("/campaigns/:id/recipients", get(campaign_recipients))
}

pub fn public_routes() -> Router<AppState> {
    Router::new()
        .route("/track/:email_send_id/open.png", get(track_email_open))
}

// List all guests
async fn list_guests(State(state): State<AppState>) -> Result<Json<Vec<Guest>>, StatusCode> {
    let guests = sqlx::query_as::<_, Guest>(
        "SELECT * FROM guests ORDER BY created_at DESC"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(guests))
}

// Get single guest
async fn get_guest(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Guest>, StatusCode> {
    let guest = sqlx::query_as::<_, Guest>(
        "SELECT * FROM guests WHERE id = $1"
    )
    .bind(id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(Json(guest))
}

// Create guest
async fn create_guest(
    State(state): State<AppState>,
    Json(req): Json<CreateGuestRequest>,
) -> Result<Json<Guest>, StatusCode> {
    let unique_code = Uuid::new_v4().to_string().replace("-", "")[..8].to_string();

    let guest = sqlx::query_as::<_, Guest>(
        "INSERT INTO guests (name, email, relationship, sam_or_jonah, maybe, unique_code, invite_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *"
    )
    .bind(&req.name)
    .bind(&req.email)
    .bind(&req.relationship)
    .bind(&req.sam_or_jonah)
    .bind(req.maybe)
    .bind(&unique_code)
    .bind(&req.invite_type)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(guest))
}

// Update guest
async fn update_guest(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateGuestRequest>,
) -> Result<Json<Guest>, StatusCode> {
    let guest = sqlx::query_as::<_, Guest>(
        "UPDATE guests
         SET name = $1, email = $2, relationship = $3, sam_or_jonah = $4, maybe = $5, invite_type = $6, updated_at = NOW()
         WHERE id = $7
         RETURNING *"
    )
    .bind(&req.name)
    .bind(&req.email)
    .bind(&req.relationship)
    .bind(&req.sam_or_jonah)
    .bind(req.maybe)
    .bind(&req.invite_type)
    .bind(id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(Json(guest))
}

// Delete guest
async fn delete_guest(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    sqlx::query("DELETE FROM guests WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::NO_CONTENT)
}

// Mark guest as removed
async fn mark_guest_removed(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(req): Json<MarkRemovedRequest>,
) -> Result<Json<Guest>, StatusCode> {
    let guest = sqlx::query_as::<_, Guest>(
        "UPDATE guests
         SET removed = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *"
    )
    .bind(req.removed)
    .bind(id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(Json(guest))
}

// Import guests from CSV
async fn import_guests_csv(
    State(state): State<AppState>,
    body: String,
) -> Result<Json<ImportResponse>, StatusCode> {
    let mut reader = csv::Reader::from_reader(body.as_bytes());
    let mut imported_count = 0;
    let mut errors = Vec::new();

    for (idx, result) in reader.deserialize().enumerate() {
        match result {
            Ok(row) => {
                let csv_row: CsvGuestRow = row;

                // Generate unique code
                let unique_code = Uuid::new_v4().to_string().replace("-", "")[..8].to_string();

                // Parse maybe field
                let maybe = csv_row.maybe.to_lowercase() == "yes";

                // Use name as temporary email to ensure uniqueness, can be edited later
                let temp_email = format!("{}_{}", csv_row.name.to_lowercase().replace(" ", "_"), unique_code);

                // Determine invite type based on relationship
                let invite_type = match csv_row.relationship.as_str() {
                    "+1" => "plus_one",
                    "1" => "single",
                    _ => "single",
                };

                match sqlx::query(
                    "INSERT INTO guests (name, email, relationship, sam_or_jonah, maybe, unique_code, invite_type)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     ON CONFLICT (email) DO NOTHING"
                )
                .bind(&csv_row.name)
                .bind(&temp_email)
                .bind(&csv_row.relationship)
                .bind(&csv_row.sam_or_jonah)
                .bind(maybe)
                .bind(&unique_code)
                .bind(invite_type)
                .execute(&state.db)
                .await {
                    Ok(_) => imported_count += 1,
                    Err(e) => errors.push(format!("Row {}: {}", idx + 1, e)),
                }
            }
            Err(e) => errors.push(format!("Row {}: {}", idx + 1, e)),
        }
    }

    Ok(Json(ImportResponse {
        success: errors.is_empty(),
        imported_count,
        errors,
    }))
}

// ============ INVITE ROUTES ============

// List all invites with their guests
async fn list_invites(State(state): State<AppState>) -> Result<Json<Vec<InviteWithGuests>>, StatusCode> {
    // Get all invites
    let invites = sqlx::query_as::<_, Invite>("SELECT * FROM invites ORDER BY created_at DESC")
        .fetch_all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // For each invite, get its guests
    let mut invites_with_guests = Vec::new();
    for invite in invites {
        let guests = sqlx::query_as::<_, Guest>(
            "SELECT * FROM guests WHERE invite_id = $1 AND removed = false ORDER BY name"
        )
        .bind(invite.id)
        .fetch_all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        invites_with_guests.push(InviteWithGuests {
            invite: invite.clone(),
            guests,
        });
    }

    Ok(Json(invites_with_guests))
}

// Get single invite with guests
async fn get_invite(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<InviteWithGuests>, StatusCode> {
    let invite = sqlx::query_as::<_, Invite>("SELECT * FROM invites WHERE id = $1")
        .bind(id)
        .fetch_one(&state.db)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;

    let guests = sqlx::query_as::<_, Guest>(
        "SELECT * FROM guests WHERE invite_id = $1 ORDER BY name"
    )
    .bind(invite.id)
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(InviteWithGuests {
        invite,
        guests,
    }))
}

// Create invite from guest IDs
async fn create_invite(
    State(state): State<AppState>,
    Json(req): Json<CreateInviteRequest>,
) -> Result<Json<InviteWithGuests>, StatusCode> {
    // Validate: 1-2 guests only
    if req.guest_ids.is_empty() || req.guest_ids.len() > 2 {
        return Err(StatusCode::BAD_REQUEST);
    }

    // Generate unique code
    let unique_code = format!("{:08x}", rand::random::<u32>());

    // Create invite
    let invite = sqlx::query_as::<_, Invite>(
        "INSERT INTO invites (unique_code, invite_type) VALUES ($1, $2) RETURNING *"
    )
    .bind(&unique_code)
    .bind(&req.invite_type)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Update guests to reference this invite
    for guest_id in &req.guest_ids {
        sqlx::query("UPDATE guests SET invite_id = $1 WHERE id = $2")
            .bind(invite.id)
            .bind(guest_id)
            .execute(&state.db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    // Fetch guests
    let guests = sqlx::query_as::<_, Guest>(
        "SELECT * FROM guests WHERE invite_id = $1 ORDER BY name"
    )
    .bind(invite.id)
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(InviteWithGuests {
        invite,
        guests,
    }))
}

// Update invite
async fn update_invite(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateInviteRequest>,
) -> Result<Json<InviteWithGuests>, StatusCode> {
    // Validate: 1-2 guests only
    if req.guest_ids.is_empty() || req.guest_ids.len() > 2 {
        return Err(StatusCode::BAD_REQUEST);
    }

    // Update invite type
    let invite = sqlx::query_as::<_, Invite>(
        "UPDATE invites SET invite_type = $1, updated_at = NOW() WHERE id = $2 RETURNING *"
    )
    .bind(&req.invite_type)
    .bind(id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::NOT_FOUND)?;

    // Remove old guest associations
    sqlx::query("UPDATE guests SET invite_id = NULL WHERE invite_id = $1")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Add new guest associations
    for guest_id in &req.guest_ids {
        sqlx::query("UPDATE guests SET invite_id = $1 WHERE id = $2")
            .bind(id)
            .bind(guest_id)
            .execute(&state.db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    // Fetch guests
    let guests = sqlx::query_as::<_, Guest>(
        "SELECT * FROM guests WHERE invite_id = $1 ORDER BY name"
    )
    .bind(id)
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(InviteWithGuests {
        invite,
        guests,
    }))
}

// Delete invite
async fn delete_invite(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    // First, clear invite_id from associated guests
    sqlx::query("UPDATE guests SET invite_id = NULL WHERE invite_id = $1")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Then delete the invite
    sqlx::query("DELETE FROM invites WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::NO_CONTENT)
}

// Auto-suggest invite pairings
async fn auto_suggest_invites(
    State(state): State<AppState>,
) -> Result<Json<Vec<Vec<Guest>>>, StatusCode> {
    // Get all guests without invites
    let guests = sqlx::query_as::<_, Guest>(
        "SELECT * FROM guests WHERE invite_id IS NULL AND removed = false ORDER BY name"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut suggestions: Vec<Vec<Guest>> = Vec::new();
    let mut used_guests: std::collections::HashSet<Uuid> = std::collections::HashSet::new();

    // Strategy 1: Pair guests with invite_type = 'couple' with same last name
    for i in 0..guests.len() {
        if used_guests.contains(&guests[i].id) {
            continue;
        }
        if guests[i].invite_type != "couple" {
            continue;
        }

        let name_parts: Vec<&str> = guests[i].name.split_whitespace().collect();
        if name_parts.len() < 2 {
            continue;
        }
        let last_name = name_parts.last().unwrap();

        // Look for another guest with same last name
        for j in (i + 1)..guests.len() {
            if used_guests.contains(&guests[j].id) {
                continue;
            }
            if guests[j].invite_type != "couple" {
                continue;
            }

            let other_name_parts: Vec<&str> = guests[j].name.split_whitespace().collect();
            if other_name_parts.len() < 2 {
                continue;
            }
            let other_last_name = other_name_parts.last().unwrap();

            if last_name.eq_ignore_ascii_case(other_last_name) {
                suggestions.push(vec![guests[i].clone(), guests[j].clone()]);
                used_guests.insert(guests[i].id);
                used_guests.insert(guests[j].id);
                break;
            }
        }
    }

    // Strategy 2: Singles and plus_ones get solo invites (for reference)
    for guest in guests.iter() {
        if !used_guests.contains(&guest.id) {
            suggestions.push(vec![guest.clone()]);
            used_guests.insert(guest.id);
        }
    }

    Ok(Json(suggestions))
}

// ============ CAMPAIGN ROUTES ============

// List all campaigns
async fn list_campaigns(State(state): State<AppState>) -> Result<Json<Vec<EmailCampaign>>, StatusCode> {
    let campaigns = sqlx::query_as::<_, EmailCampaign>(
        "SELECT * FROM email_campaigns ORDER BY created_at DESC"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(campaigns))
}

// Create campaign
async fn create_campaign(
    State(state): State<AppState>,
    Json(req): Json<CreateCampaignRequest>,
) -> Result<Json<EmailCampaign>, StatusCode> {
    let campaign = sqlx::query_as::<_, EmailCampaign>(
        "INSERT INTO email_campaigns (name, subject, template_type)
         VALUES ($1, $2, $3)
         RETURNING *"
    )
    .bind(&req.name)
    .bind(&req.subject)
    .bind(&req.template_type)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(campaign))
}

// Preview campaign email
async fn preview_campaign(
    State(state): State<AppState>,
    Path(_id): Path<Uuid>,
) -> Result<Html<String>, StatusCode> {
    // Get a sample invite for preview
    let invite = sqlx::query_as::<_, Invite>(
        "SELECT * FROM invites LIMIT 1"
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let invite = match invite {
        Some(inv) => inv,
        None => {
            // No invites, create sample data
            return Ok(Html(format!(
                "<html><body><h1>No invites found</h1><p>Create some invites first to preview the email template.</p></body></html>"
            )));
        }
    };

    // Get guests for this invite
    let guests = sqlx::query_as::<_, Guest>(
        "SELECT * FROM guests WHERE invite_id = $1"
    )
    .bind(invite.id)
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let invite_with_guests = InviteWithGuests {
        invite,
        guests,
    };

    // Create email service (API key not needed for preview)
    let frontend_url = std::env::var("FRONTEND_URL")
        .unwrap_or_else(|_| "http://localhost:3000".to_string());
    let resend_api_key = std::env::var("RESEND_API_KEY")
        .unwrap_or_else(|_| "".to_string());
    let from_email = std::env::var("FROM_EMAIL")
        .unwrap_or_else(|_| "contact@samandjonah.com".to_string());
    let email_service = EmailService::new(state.db.clone(), frontend_url, resend_api_key, from_email);

    // Generate preview HTML
    let tracking_pixel_url = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    let html = email_service.render_save_the_date(&invite_with_guests, tracking_pixel_url);

    Ok(Html(html))
}

// Send campaign
async fn send_campaign(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<SendCampaignResponse>, StatusCode> {
    let frontend_url = std::env::var("FRONTEND_URL")
        .unwrap_or_else(|_| "http://localhost:3000".to_string());
    let resend_api_key = std::env::var("RESEND_API_KEY")
        .map_err(|_| {
            tracing::error!("RESEND_API_KEY environment variable not set");
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
    let from_email = std::env::var("FROM_EMAIL")
        .unwrap_or_else(|_| "contact@samandjonah.com".to_string());

    let email_service = EmailService::new(state.db.clone(), frontend_url, resend_api_key, from_email);

    match email_service.send_campaign(id).await {
        Ok(sent_count) => Ok(Json(SendCampaignResponse {
            success: true,
            sent_count,
            message: format!("Successfully sent {} emails via Resend", sent_count),
        })),
        Err(e) => {
            tracing::error!("Failed to send campaign: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// Get campaign statistics
async fn campaign_stats(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<CampaignStats>, StatusCode> {
    // Count total invites with non-removed guests
    let total_invites: i64 = sqlx::query_scalar!(
        "SELECT COUNT(DISTINCT invite_id) FROM guests WHERE removed = false AND invite_id IS NOT NULL"
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .unwrap_or(0);

    // Count sent emails for this campaign
    let sent_count: i64 = sqlx::query_scalar!(
        "SELECT COUNT(*) FROM email_sends WHERE campaign_id = $1",
        id
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .unwrap_or(0);

    // Count opened emails
    let opened_count: i64 = sqlx::query_scalar!(
        "SELECT COUNT(*) FROM email_sends WHERE campaign_id = $1 AND opened_at IS NOT NULL",
        id
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .unwrap_or(0);

    let not_opened_count = sent_count - opened_count;
    let pending_count = total_invites - sent_count;

    Ok(Json(CampaignStats {
        total_invites,
        sent_count,
        opened_count,
        not_opened_count,
        pending_count,
    }))
}

// Get campaign recipients with status
async fn campaign_recipients(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<RecipientStatus>>, StatusCode> {
    // Get all email sends for this campaign
    let email_sends = sqlx::query_as::<_, EmailSend>(
        "SELECT * FROM email_sends WHERE campaign_id = $1 ORDER BY sent_at DESC"
    )
    .bind(id)
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut recipients = Vec::new();

    for send in email_sends {
        if let Some(invite_id) = send.invite_id {
            // Get invite
            let invite = sqlx::query_as::<_, Invite>(
                "SELECT * FROM invites WHERE id = $1"
            )
            .bind(invite_id)
            .fetch_optional(&state.db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            if let Some(invite) = invite {
                // Get guests
                let guests = sqlx::query_as::<_, Guest>(
                    "SELECT * FROM guests WHERE invite_id = $1"
                )
                .bind(invite.id)
                .fetch_all(&state.db)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

                recipients.push(RecipientStatus {
                    invite: InviteWithGuests {
                        invite,
                        guests,
                    },
                    sent_at: send.sent_at,
                    opened_at: send.opened_at,
                    opened_count: send.opened_count,
                });
            }
        }
    }

    Ok(Json(recipients))
}

// ============ TRACKING ROUTES ============

// Track email open via 1x1 pixel
async fn track_email_open(
    State(state): State<AppState>,
    Path(email_send_id): Path<Uuid>,
) -> Result<Response, StatusCode> {
    // Record the open
    let now = time::OffsetDateTime::now_utc();
    
    let result = sqlx::query(
        "UPDATE email_sends
         SET opened_at = COALESCE(opened_at, $1),
             opened_count = opened_count + 1
         WHERE id = $2"
    )
    .bind(now)
    .bind(email_send_id)
    .execute(&state.db)
    .await;

    if let Err(e) = result {
        tracing::warn!("Failed to track email open: {}", e);
    } else {
        tracing::info!("📬 Email opened: {}", email_send_id);
    }

    // Return 1x1 transparent PNG
    let png_bytes: Vec<u8> = vec![
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG header
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
        0x42, 0x60, 0x82,
    ];

    Ok((
        StatusCode::OK,
        [(header::CONTENT_TYPE, "image/png")],
        png_bytes,
    ).into_response())
}
