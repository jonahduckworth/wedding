use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use rust_decimal::Decimal;

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
    pub created_at: Option<time::OffsetDateTime>,
    pub sent_at: Option<time::OffsetDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct EmailSend {
    pub id: Uuid,
    pub campaign_id: Option<Uuid>,
    pub guest_id: Option<Uuid>,
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
    pub confirmed_at: Option<time::OffsetDateTime>,
    pub created_at: Option<time::OffsetDateTime>,
}
