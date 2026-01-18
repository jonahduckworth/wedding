use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Html,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::email::EmailService;
use crate::models::{
    EmailCampaign, EmailSend, Guest, Invite, InviteWithGuests,
    HoneymoonCategory, HoneymoonItem, RegistryContribution,
    CreateCategoryRequest, UpdateCategoryRequest,
    CreateItemRequest, UpdateItemRequest,
    CreateContributionRequest, UpdateContributionRequest,
    CategoryWithItems, ItemWithContributions, PublicContribution, RegistryStats,
};
use axum_extra::extract::Multipart;
use rust_decimal::Decimal;

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
        // Registry admin routes
        .route("/registry/categories", get(admin_list_categories).post(admin_create_category))
        .route("/registry/categories/:id", axum::routing::put(admin_update_category).delete(admin_delete_category))
        .route("/registry/items", get(admin_list_items).post(admin_create_item))
        .route("/registry/items/:id", axum::routing::put(admin_update_item).delete(admin_delete_item))
        .route("/registry/items/:id/image", post(admin_upload_item_image))
        .route("/registry/contributions", get(admin_list_contributions))
        .route("/registry/contributions/:id", axum::routing::put(admin_update_contribution).delete(admin_delete_contribution))
        .route("/registry/stats", get(admin_registry_stats))
}

pub fn public_routes() -> Router<AppState> {
    Router::new()
        // Public registry routes
        .route("/registry/categories", get(public_list_categories))
        .route("/registry/items/:id", get(public_get_item))
        .route("/registry/contributions", post(public_create_contribution))
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
    let venue_map_url = std::env::var("VENUE_MAP_URL")
        .unwrap_or_else(|_| "https://maps.google.com".to_string());
    let hotel_info_url = std::env::var("HOTEL_INFO_URL")
        .unwrap_or_else(|_| "http://localhost:3000".to_string());
    let email_service = EmailService::new(state.db.clone(), frontend_url, resend_api_key, from_email, venue_map_url, hotel_info_url);

    // Generate preview HTML
    let html = email_service.render_save_the_date(&invite_with_guests);

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
    let venue_map_url = std::env::var("VENUE_MAP_URL")
        .unwrap_or_else(|_| "https://maps.google.com".to_string());
    let hotel_info_url = std::env::var("HOTEL_INFO_URL")
        .unwrap_or_else(|_| "http://localhost:3000".to_string());

    let email_service = EmailService::new(state.db.clone(), frontend_url, resend_api_key, from_email, venue_map_url, hotel_info_url);

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

    let pending_count = total_invites - sent_count;

    Ok(Json(CampaignStats {
        total_invites,
        sent_count,
        opened_count: 0, // Tracking now done via Resend dashboard
        not_opened_count: 0, // Tracking now done via Resend dashboard
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
                    opened_at: None, // Tracking now done via Resend dashboard
                    opened_count: 0, // Tracking now done via Resend dashboard
                });
            }
        }
    }

    Ok(Json(recipients))
}

// ============ TRACKING ROUTES ============

// ============ REGISTRY PUBLIC ROUTES ============

// List all categories with their items (public)
async fn public_list_categories(State(state): State<AppState>) -> Result<Json<Vec<CategoryWithItems>>, StatusCode> {
    let categories = sqlx::query_as::<_, HoneymoonCategory>(
        "SELECT * FROM honeymoon_categories ORDER BY display_order, name"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut result = Vec::new();
    for category in categories {
        let items = sqlx::query_as::<_, HoneymoonItem>(
            "SELECT * FROM honeymoon_items WHERE category_id = $1 ORDER BY display_order, name"
        )
        .bind(category.id)
        .fetch_all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        result.push(CategoryWithItems {
            category,
            items,
        });
    }

    // Also add items without a category
    let uncategorized_items = sqlx::query_as::<_, HoneymoonItem>(
        "SELECT * FROM honeymoon_items WHERE category_id IS NULL ORDER BY display_order, name"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if !uncategorized_items.is_empty() {
        result.push(CategoryWithItems {
            category: HoneymoonCategory {
                id: Uuid::nil(),
                name: "Other".to_string(),
                display_order: 9999,
                created_at: None,
            },
            items: uncategorized_items,
        });
    }

    Ok(Json(result))
}

// Get single item with public contributions
async fn public_get_item(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<ItemWithContributions>, StatusCode> {
    let item = sqlx::query_as::<_, HoneymoonItem>(
        "SELECT * FROM honeymoon_items WHERE id = $1"
    )
    .bind(id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::NOT_FOUND)?;

    // Get all contributions for display (pending shown as if confirmed)
    let contributions = sqlx::query_as::<_, RegistryContribution>(
        "SELECT * FROM registry_contributions WHERE item_id = $1 AND status != 'rejected' ORDER BY created_at DESC"
    )
    .bind(id)
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let public_contributions: Vec<PublicContribution> = contributions
        .into_iter()
        .map(|c| PublicContribution {
            display_name: if c.is_anonymous {
                "Anonymous".to_string()
            } else {
                c.contributor_name.unwrap_or("Anonymous".to_string())
            },
            amount: c.amount,
            message: c.message,
            created_at: c.created_at,
        })
        .collect();

    Ok(Json(ItemWithContributions {
        item,
        contributions: public_contributions,
    }))
}

// Create contribution (public)
async fn public_create_contribution(
    State(state): State<AppState>,
    Json(req): Json<CreateContributionRequest>,
) -> Result<Json<RegistryContribution>, StatusCode> {
    // If item_id is provided, verify the item exists and isn't fully funded
    if let Some(item_id) = req.item_id {
        let item = sqlx::query_as::<_, HoneymoonItem>(
            "SELECT * FROM honeymoon_items WHERE id = $1"
        )
        .bind(item_id)
        .fetch_optional(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        if item.is_none() {
            return Err(StatusCode::NOT_FOUND);
        }

        if item.unwrap().is_fully_funded {
            return Err(StatusCode::BAD_REQUEST);
        }
    }

    let contribution = sqlx::query_as::<_, RegistryContribution>(
        "INSERT INTO registry_contributions (item_id, contributor_name, contributor_email, amount, is_anonymous, message, purpose)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *"
    )
    .bind(req.item_id)
    .bind(&req.contributor_name)
    .bind(&req.contributor_email)
    .bind(req.amount)
    .bind(req.is_anonymous)
    .bind(&req.message)
    .bind(&req.purpose)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Immediately update item's total (treat pending as confirmed for display)
    if let Some(item_id) = req.item_id {
        let item = sqlx::query_as::<_, HoneymoonItem>(
            "SELECT * FROM honeymoon_items WHERE id = $1"
        )
        .bind(item_id)
        .fetch_one(&state.db)
        .await
        .ok();

        if let Some(item) = item {
            // Sum all non-rejected contributions
            let total: Decimal = sqlx::query_scalar::<_, Decimal>(
                "SELECT COALESCE(SUM(amount), 0) FROM registry_contributions WHERE item_id = $1 AND status != 'rejected'"
            )
            .bind(item_id)
            .fetch_one(&state.db)
            .await
            .unwrap_or(Decimal::ZERO);

            let is_fully_funded = total >= item.price;
            let _ = sqlx::query(
                "UPDATE honeymoon_items SET total_contributed = $1, is_fully_funded = $2, updated_at = NOW() WHERE id = $3"
            )
            .bind(total)
            .bind(is_fully_funded)
            .bind(item_id)
            .execute(&state.db)
            .await;
        }
    }

    Ok(Json(contribution))
}

// ============ REGISTRY ADMIN ROUTES ============

// List all categories (admin)
async fn admin_list_categories(State(state): State<AppState>) -> Result<Json<Vec<HoneymoonCategory>>, StatusCode> {
    let categories = sqlx::query_as::<_, HoneymoonCategory>(
        "SELECT * FROM honeymoon_categories ORDER BY display_order, name"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(categories))
}

// Create category (admin)
async fn admin_create_category(
    State(state): State<AppState>,
    Json(req): Json<CreateCategoryRequest>,
) -> Result<Json<HoneymoonCategory>, StatusCode> {
    let display_order = req.display_order.unwrap_or(0);

    let category = sqlx::query_as::<_, HoneymoonCategory>(
        "INSERT INTO honeymoon_categories (name, display_order) VALUES ($1, $2) RETURNING *"
    )
    .bind(&req.name)
    .bind(display_order)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(category))
}

// Update category (admin)
async fn admin_update_category(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateCategoryRequest>,
) -> Result<Json<HoneymoonCategory>, StatusCode> {
    let display_order = req.display_order.unwrap_or(0);

    let category = sqlx::query_as::<_, HoneymoonCategory>(
        "UPDATE honeymoon_categories SET name = $1, display_order = $2 WHERE id = $3 RETURNING *"
    )
    .bind(&req.name)
    .bind(display_order)
    .bind(id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(Json(category))
}

// Delete category (admin)
async fn admin_delete_category(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    sqlx::query("DELETE FROM honeymoon_categories WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::NO_CONTENT)
}

// List all items (admin)
async fn admin_list_items(State(state): State<AppState>) -> Result<Json<Vec<HoneymoonItem>>, StatusCode> {
    let items = sqlx::query_as::<_, HoneymoonItem>(
        "SELECT * FROM honeymoon_items ORDER BY display_order, name"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(items))
}

// Create item (admin)
async fn admin_create_item(
    State(state): State<AppState>,
    Json(req): Json<CreateItemRequest>,
) -> Result<Json<HoneymoonItem>, StatusCode> {
    let display_order = req.display_order.unwrap_or(0);

    let item = sqlx::query_as::<_, HoneymoonItem>(
        "INSERT INTO honeymoon_items (category_id, name, description, price, display_order)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *"
    )
    .bind(req.category_id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(req.price)
    .bind(display_order)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(item))
}

// Update item (admin)
async fn admin_update_item(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateItemRequest>,
) -> Result<Json<HoneymoonItem>, StatusCode> {
    let display_order = req.display_order.unwrap_or(0);

    let item = sqlx::query_as::<_, HoneymoonItem>(
        "UPDATE honeymoon_items
         SET category_id = $1, name = $2, description = $3, price = $4, display_order = $5, updated_at = NOW()
         WHERE id = $6
         RETURNING *"
    )
    .bind(req.category_id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(req.price)
    .bind(display_order)
    .bind(id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(Json(item))
}

// Delete item (admin)
async fn admin_delete_item(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    sqlx::query("DELETE FROM honeymoon_items WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::NO_CONTENT)
}

// Upload image for item (admin)
async fn admin_upload_item_image(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    mut multipart: Multipart,
) -> Result<Json<HoneymoonItem>, StatusCode> {
    // Verify item exists
    let _item = sqlx::query_as::<_, HoneymoonItem>(
        "SELECT * FROM honeymoon_items WHERE id = $1"
    )
    .bind(id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::NOT_FOUND)?;

    // Process the upload
    while let Some(field) = multipart.next_field().await.map_err(|_| StatusCode::BAD_REQUEST)? {
        let filename = field.file_name()
            .map(|s| s.to_string())
            .unwrap_or_else(|| "image.jpg".to_string());

        // Get file extension
        let extension = filename.rsplit('.').next().unwrap_or("jpg");
        let allowed_extensions = ["jpg", "jpeg", "png", "webp", "gif"];
        if !allowed_extensions.contains(&extension.to_lowercase().as_str()) {
            return Err(StatusCode::BAD_REQUEST);
        }

        // Generate unique filename
        let new_filename = format!("{}.{}", Uuid::new_v4(), extension);
        let file_path = format!("./uploads/registry/{}", new_filename);

        // Save file
        let data = field.bytes().await.map_err(|_| StatusCode::BAD_REQUEST)?;
        tokio::fs::write(&file_path, &data).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        // Update item with image URL
        let image_url = format!("/uploads/registry/{}", new_filename);
        let item = sqlx::query_as::<_, HoneymoonItem>(
            "UPDATE honeymoon_items SET image_url = $1, updated_at = NOW() WHERE id = $2 RETURNING *"
        )
        .bind(&image_url)
        .bind(id)
        .fetch_one(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        return Ok(Json(item));
    }

    Err(StatusCode::BAD_REQUEST)
}

// List all contributions (admin)
async fn admin_list_contributions(State(state): State<AppState>) -> Result<Json<Vec<RegistryContribution>>, StatusCode> {
    let contributions = sqlx::query_as::<_, RegistryContribution>(
        "SELECT * FROM registry_contributions ORDER BY created_at DESC"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(contributions))
}

// Update contribution status (admin)
async fn admin_update_contribution(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateContributionRequest>,
) -> Result<Json<RegistryContribution>, StatusCode> {
    // Get the contribution first to check item_id
    let contribution = sqlx::query_as::<_, RegistryContribution>(
        "SELECT * FROM registry_contributions WHERE id = $1"
    )
    .bind(id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::NOT_FOUND)?;

    let confirmed_at = if req.status == "confirmed" {
        Some(time::OffsetDateTime::now_utc())
    } else {
        None
    };

    // Update the contribution
    let updated_contribution = sqlx::query_as::<_, RegistryContribution>(
        "UPDATE registry_contributions SET status = $1, confirmed_at = $2 WHERE id = $3 RETURNING *"
    )
    .bind(&req.status)
    .bind(confirmed_at)
    .bind(id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Always recalculate totals when status changes (include all non-rejected)
    if contribution.item_id.is_some() {
        let item_id = contribution.item_id.unwrap();

        // Recalculate total from all non-rejected contributions
        let total: Decimal = sqlx::query_scalar::<_, Decimal>(
            "SELECT COALESCE(SUM(amount), 0) FROM registry_contributions WHERE item_id = $1 AND status != 'rejected'"
        )
        .bind(item_id)
        .fetch_one(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        // Get item price to check if fully funded
        let item = sqlx::query_as::<_, HoneymoonItem>(
            "SELECT * FROM honeymoon_items WHERE id = $1"
        )
        .bind(item_id)
        .fetch_one(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        let is_fully_funded = total >= item.price;

        // Update item
        sqlx::query(
            "UPDATE honeymoon_items SET total_contributed = $1, is_fully_funded = $2, updated_at = NOW() WHERE id = $3"
        )
        .bind(total)
        .bind(is_fully_funded)
        .bind(item_id)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    Ok(Json(updated_contribution))
}

// Delete contribution (admin)
async fn admin_delete_contribution(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    // Get contribution first to update item totals if needed
    let contribution = sqlx::query_as::<_, RegistryContribution>(
        "SELECT * FROM registry_contributions WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    sqlx::query("DELETE FROM registry_contributions WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Update item totals if this was a non-rejected contribution
    if let Some(contribution) = contribution {
        if contribution.status != "rejected" && contribution.item_id.is_some() {
            let item_id = contribution.item_id.unwrap();

            let total: Decimal = sqlx::query_scalar::<_, Decimal>(
                "SELECT COALESCE(SUM(amount), 0) FROM registry_contributions WHERE item_id = $1 AND status != 'rejected'"
            )
            .bind(item_id)
            .fetch_one(&state.db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            let item = sqlx::query_as::<_, HoneymoonItem>(
                "SELECT * FROM honeymoon_items WHERE id = $1"
            )
            .bind(item_id)
            .fetch_one(&state.db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            let is_fully_funded = total >= item.price;

            sqlx::query(
                "UPDATE honeymoon_items SET total_contributed = $1, is_fully_funded = $2, updated_at = NOW() WHERE id = $3"
            )
            .bind(total)
            .bind(is_fully_funded)
            .bind(item_id)
            .execute(&state.db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        }
    }

    Ok(StatusCode::NO_CONTENT)
}

// Get registry stats (admin)
async fn admin_registry_stats(State(state): State<AppState>) -> Result<Json<RegistryStats>, StatusCode> {
    let total_confirmed: Decimal = sqlx::query_scalar::<_, Decimal>(
        "SELECT COALESCE(SUM(amount), 0) FROM registry_contributions WHERE status = 'confirmed'"
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let total_pending: Decimal = sqlx::query_scalar::<_, Decimal>(
        "SELECT COALESCE(SUM(amount), 0) FROM registry_contributions WHERE status = 'pending'"
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let contribution_count: i64 = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT COUNT(*) FROM registry_contributions"
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .unwrap_or(0);

    let item_count: i64 = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT COUNT(*) FROM honeymoon_items"
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .unwrap_or(0);

    Ok(Json(RegistryStats {
        total_confirmed,
        total_pending,
        contribution_count,
        item_count,
    }))
}

