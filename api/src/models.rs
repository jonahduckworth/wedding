use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use rust_decimal::Decimal;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Invite {
    pub id: Uuid,
    pub unique_code: String,
    pub invite_type: String,
    pub created_at: Option<time::OffsetDateTime>,
    pub updated_at: Option<time::OffsetDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InviteWithGuests {
    #[serde(flatten)]
    pub invite: Invite,
    pub guests: Vec<Guest>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Guest {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub relationship: String,
    pub sam_or_jonah: String,
    pub maybe: bool,
    pub unique_code: String,
    pub invite_type: String,
    pub removed: bool,
    pub invite_id: Option<Uuid>,
    pub created_at: Option<time::OffsetDateTime>,
    pub updated_at: Option<time::OffsetDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct EmailCampaign {
    pub id: Uuid,
    pub name: String,
    pub subject: String,
    pub template_type: String,
    pub sent_count: i32,
    #[serde(with = "time::serde::rfc3339::option")]
    pub created_at: Option<time::OffsetDateTime>,
    #[serde(with = "time::serde::rfc3339::option")]
    pub sent_at: Option<time::OffsetDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct EmailSend {
    pub id: Uuid,
    pub campaign_id: Option<Uuid>,
    pub guest_id: Option<Uuid>,
    pub invite_id: Option<Uuid>,
    pub sent_at: Option<time::OffsetDateTime>,
    pub opened_at: Option<time::OffsetDateTime>,
    pub opened_count: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Rsvp {
    pub id: Uuid,
    pub guest_id: Uuid,
    pub attending: bool,
    pub dietary_restrictions: Option<String>,
    pub message: Option<String>,
    pub submitted_at: Option<time::OffsetDateTime>,
    pub updated_at: Option<time::OffsetDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct HoneymoonCategory {
    pub id: Uuid,
    pub name: String,
    pub display_order: i32,
    pub created_at: Option<time::OffsetDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct HoneymoonItem {
    pub id: Uuid,
    pub category_id: Option<Uuid>,
    pub name: String,
    pub description: Option<String>,
    pub price: Decimal,
    pub image_url: Option<String>,
    pub total_contributed: Decimal,
    pub is_fully_funded: bool,
    pub display_order: i32,
    pub created_at: Option<time::OffsetDateTime>,
    pub updated_at: Option<time::OffsetDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct RegistryContribution {
    pub id: Uuid,
    pub item_id: Option<Uuid>,
    pub contributor_name: Option<String>,
    pub contributor_email: Option<String>,
    pub amount: Decimal,
    pub status: String,
    pub is_anonymous: bool,
    pub message: Option<String>,
    pub purpose: Option<String>,
    pub confirmed_at: Option<time::OffsetDateTime>,
    pub created_at: Option<time::OffsetDateTime>,
}

// Registry request/response types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCategoryRequest {
    pub name: String,
    pub display_order: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCategoryRequest {
    pub name: String,
    pub display_order: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateItemRequest {
    pub category_id: Option<Uuid>,
    pub name: String,
    pub description: Option<String>,
    pub price: Decimal,
    pub display_order: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateItemRequest {
    pub category_id: Option<Uuid>,
    pub name: String,
    pub description: Option<String>,
    pub price: Decimal,
    pub display_order: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateContributionRequest {
    pub item_id: Option<Uuid>,
    pub contributor_name: String,
    pub contributor_email: String,
    pub amount: Decimal,
    pub is_anonymous: bool,
    pub message: Option<String>,
    pub purpose: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateContributionRequest {
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategoryWithItems {
    #[serde(flatten)]
    pub category: HoneymoonCategory,
    pub items: Vec<HoneymoonItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemWithContributions {
    #[serde(flatten)]
    pub item: HoneymoonItem,
    pub contributions: Vec<PublicContribution>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicContribution {
    pub display_name: String,
    pub amount: Decimal,
    pub message: Option<String>,
    pub created_at: Option<time::OffsetDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegistryStats {
    pub total_confirmed: Decimal,
    pub total_pending: Decimal,
    pub contribution_count: i64,
    pub item_count: i64,
}
