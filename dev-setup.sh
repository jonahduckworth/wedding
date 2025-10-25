#!/bin/bash

# Wedding App Development Setup Script

set -e

echo "🎉 Setting up Sam & Jonah's Wedding Application..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    echo "RESEND_API_KEY=your_resend_api_key_here" > .env
    echo "⚠️  Please edit .env and add your Resend API key"
fi

# Create frontend .env if it doesn't exist
if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend/.env file..."
    cp frontend/.env.example frontend/.env
fi

# Create backend .env if it doesn't exist
if [ ! -f api/.env ]; then
    echo "📝 Creating api/.env file..."
    cp api/.env.example api/.env
fi

echo ""
echo "🐳 Starting PostgreSQL database..."
docker-compose up -d postgres

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

echo ""
echo "🗄️  Running database migrations..."
docker-compose exec -T postgres psql -U wedding -d wedding < api/migrations/001_initial_schema.sql || true

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  Full stack (Docker):  docker-compose up"
echo "  Backend only:         cd api && cargo run"
echo "  Frontend only:        cd frontend && npm run dev"
echo ""
echo "URLs:"
echo "  Frontend: http://localhost:3000"
echo "  API:      http://localhost:8080"
echo "  DB:       postgresql://wedding:wedding@localhost:2026/wedding"
echo ""
echo "📖 See README.md for more information"
