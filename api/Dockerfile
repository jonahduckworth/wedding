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

# Copy the actual source code
COPY src ./src
COPY migrations ./migrations

# Build the application
RUN cargo build --release

# Production stage
FROM debian:bookworm-slim

# Install required runtime dependencies
RUN apt-get update && \
    apt-get install -y libpq5 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/target/release/wedding-api /usr/local/bin/wedding-api

# Copy migrations
COPY --from=builder /app/migrations ./migrations

EXPOSE 8080

CMD ["wedding-api"]
