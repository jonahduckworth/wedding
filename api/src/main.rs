use axum::{
    routing::get,
    Router,
    extract::DefaultBodyLimit,
};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;
use axum::http::{Method, header};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod models;
mod routes;
mod db;
mod email;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "wedding_api=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load environment variables
    dotenvy::dotenv().ok();

    // Connect to database
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    eprintln!("Connecting to database: {}...", &database_url[..database_url.find('@').unwrap_or(20)]);

    let db = match sqlx::postgres::PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
    {
        Ok(pool) => {
            eprintln!("Successfully connected to database!");
            pool
        }
        Err(e) => {
            eprintln!("FATAL: Failed to connect to database!");
            eprintln!("Error: {}", e);
            eprintln!("Database URL (redacted): {}", &database_url[..database_url.find('@').unwrap_or(20)]);
            std::process::exit(1);
        }
    };

    tracing::info!("Connected to database");

    // Run database migrations with timeout
    eprintln!("Running database migrations...");
    let migration_result = tokio::time::timeout(
        std::time::Duration::from_secs(10),
        sqlx::migrate!("./migrations").run(&db)
    ).await;

    match migration_result {
        Ok(Ok(_)) => {
            eprintln!("Migrations completed successfully!");
            tracing::info!("Database migrations applied");
        }
        Ok(Err(e)) => {
            eprintln!("WARNING: Migration failed: {}", e);
            eprintln!("Continuing anyway - this might be okay if migrations were already applied");
            tracing::warn!("Migration error (continuing): {}", e);
        }
        Err(_) => {
            eprintln!("WARNING: Migration timeout after 10 seconds");
            eprintln!("Continuing anyway - migrations may have already been applied");
            tracing::warn!("Migration timeout - continuing startup");
        }
    }

    // Create app state
    let state = routes::AppState { db };

    // Set up CORS - be explicit about allowed methods and headers for multipart uploads
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            header::CONTENT_TYPE,
            header::AUTHORIZATION,
            header::ACCEPT,
            header::ORIGIN,
            header::ACCESS_CONTROL_REQUEST_METHOD,
            header::ACCESS_CONTROL_REQUEST_HEADERS,
        ])
        .expose_headers([header::CONTENT_TYPE])
        .max_age(std::time::Duration::from_secs(3600));

    // Create uploads directory if it doesn't exist
    std::fs::create_dir_all("./uploads/registry").ok();

    // Build our application with routes
    let app = Router::new()
        .route("/", get(root_handler))
        .route("/health", get(health_handler))
        .nest("/api/admin", routes::admin_routes())
        .nest("/api", routes::public_routes())
        .nest_service("/uploads", ServeDir::new("./uploads"))
        .with_state(state)
        .layer(DefaultBodyLimit::max(50 * 1024 * 1024)) // 50MB max upload size
        .layer(cors)
        .layer(tower_http::trace::TraceLayer::new_for_http());

    // Get port from environment or use default
    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .expect("PORT must be a valid number");

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("Wedding API listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}

async fn root_handler() -> &'static str {
    "Sam & Jonah Wedding API"
}

async fn health_handler() -> &'static str {
    "OK"
}
