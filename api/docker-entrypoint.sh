#!/bin/bash
set -e

echo "=== Starting Wedding API ==="
echo "Database: ${DATABASE_URL:0:50}..."
echo "Port: ${PORT:-8080}"

# Execute the wedding API (migrations run from within the app)
exec /usr/local/bin/wedding-api
