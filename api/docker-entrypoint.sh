#!/bin/bash
set -e

echo "=== Starting Wedding API ==="
echo "Database: ${DATABASE_URL:0:50}..."
echo "Port: ${PORT:-8080}"

# Execute the wedding API
exec /usr/local/bin/wedding-api
