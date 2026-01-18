# Build stage
FROM rust:latest AS builder

WORKDIR /app

# Copy manifests
COPY Cargo.toml ./

# Create a dummy main.rs to cache dependencies
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Install sqlx-cli for migrations
RUN cargo install sqlx-cli --no-default-features --features postgres

# Copy the actual source code
COPY src ./src
COPY migrations ./migrations
COPY .sqlx ./.sqlx

# Build the application with offline mode (uses pre-generated query cache)
# Force rebuild by removing entire target directory
ENV SQLX_OFFLINE=true
RUN rm -rf /app/target/release && \
    cargo build --release

# Production stage
FROM debian:bookworm-slim

# Install required runtime dependencies
RUN apt-get update && \
    apt-get install -y \
        bash \
        libpq5 \
        ca-certificates \
        libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/target/release/wedding-api /usr/local/bin/wedding-api
RUN chmod +x /usr/local/bin/wedding-api

# Copy sqlx-cli for migrations
COPY --from=builder /usr/local/cargo/bin/sqlx /usr/local/bin/sqlx
RUN chmod +x /usr/local/bin/sqlx

# Copy migrations
COPY --from=builder /app/migrations ./migrations

# Create uploads directory for registry images
RUN mkdir -p /app/uploads/registry

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
