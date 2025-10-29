#!/bin/bash
set -e

echo "=== Wedding API Docker Entrypoint ==="
echo "Current directory: $(pwd)"
echo "Binary location check:"
ls -la /usr/local/bin/ | grep wedding || echo "Binary not found in /usr/local/bin/"

echo ""
echo "=== Environment Variables ==="
echo "DATABASE_URL: ${DATABASE_URL:0:50}..."
echo "PORT: ${PORT:-8080}"
echo "RUST_LOG: ${RUST_LOG:-info}"
echo "RESEND_API_KEY: ${RESEND_API_KEY:0:10}..."
echo "CORS_ORIGIN: ${CORS_ORIGIN:-not set}"
echo "FRONTEND_URL: ${FRONTEND_URL:-not set}"

echo ""
echo "=== Starting Wedding API ==="
echo "Executing: /usr/local/bin/wedding-api"

# Test database connectivity first
echo ""
echo "=== Testing Database Connection ==="
if command -v psql > /dev/null 2>&1; then
    echo "PostgreSQL client available, testing connection..."
else
    echo "PostgreSQL client not available, skipping connection test"
fi

echo ""
echo "=== Launching API Binary ==="
# Execute the binary
exec /usr/local/bin/wedding-api
