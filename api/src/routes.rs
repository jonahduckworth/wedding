use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::Guest;

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

pub fn admin_routes() -> Router<AppState> {
    Router::new()
        .route("/guests", get(list_guests).post(create_guest))
        .route("/guests/import", post(import_guests_csv))
        .route("/guests/:id", get(get_guest).put(update_guest).delete(delete_guest))
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
