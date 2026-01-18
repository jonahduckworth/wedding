#!/bin/bash
set -e

echo "=== Starting Wedding API ==="
echo "Database: ${DATABASE_URL:0:50}..."
echo "Port: ${PORT:-8080}"

# Run database migrations
echo "Running database migrations..."
cd /app
if sqlx migrate run --database-url "$DATABASE_URL"; then
    echo "Migrations completed successfully!"
else
    echo "Warning: Migration failed or already applied, continuing..."
fi

# Execute the wedding API
exec /usr/local/bin/wedding-api
