#!/bin/bash
set -e

echo "=== Wedding API Docker Entrypoint ==="
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la
echo ""
echo "Migrations directory check:"
ls -la ./migrations 2>&1 || echo "No migrations directory in $(pwd)"
echo ""
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

# Check if binary exists and is executable
if [ ! -f /usr/local/bin/wedding-api ]; then
    echo "ERROR: Binary not found at /usr/local/bin/wedding-api"
    exit 1
fi

if [ ! -x /usr/local/bin/wedding-api ]; then
    echo "ERROR: Binary is not executable"
    exit 1
fi

# Check library dependencies
echo "Checking binary dependencies..."
ldd /usr/local/bin/wedding-api || echo "Failed to check dependencies"

# Force unbuffered output
export RUST_BACKTRACE=full
export RUST_LOG=debug

# Execute the binary and capture all output
echo "Starting wedding-api..."
exec /usr/local/bin/wedding-api
