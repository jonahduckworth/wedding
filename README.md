# Sam & Jonah Wedding Application

Full-stack wedding application for managing guests, RSVPs, email campaigns, and a honeymoon registry.

**Wedding Date:** August 15, 2026
**Venue:** Rouge, Calgary, Alberta
**Domain:** [samandjonah.com](https://samandjonah.com)

## Tech Stack

### Frontend
- **Framework:** Rsbuild + React 18 + TypeScript
- **UI:** shadcn/ui (Radix UI + Tailwind CSS)
- **Routing:** React Router v6
- **State Management:** TanStack Query
- **Deployment:** Docker + Nginx

### Backend
- **Language:** Rust
- **Framework:** Axum
- **Database:** PostgreSQL with SQLx
- **Email:** Resend API
- **Deployment:** Docker

### Infrastructure
- **Hosting:** Hetzner via Dokploy
- **Database:** PostgreSQL 16
- **Deployment:** Docker containers

## Features

- ✅ Wedding website (Home, Story, Details, Travel, FAQ)
- ✅ RSVP system with unique guest codes
- ✅ Honeymoon registry with contribution tracking
- ✅ Email campaign management (Save the Date, Invitations)
- ✅ Email open tracking
- ✅ Admin dashboard for managing guests and campaigns
- ✅ CSV guest import

## Project Structure

```
wedding/
├── frontend/               # React + Rsbuild frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities
│   │   └── styles/        # CSS files
│   ├── Dockerfile
│   └── nginx.conf
├── api/                   # Rust + Axum backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── models.rs      # Database models
│   │   ├── routes.rs      # API routes
│   │   └── db.rs          # Database connection
│   ├── migrations/        # SQL migrations
│   └── Dockerfile
├── specs/                 # Technical specifications
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- Rust 1.75+
- PostgreSQL 16
- Docker & Docker Compose (optional)

### Local Development Setup

#### 1. Clone the repository

```bash
git clone <repository-url>
cd wedding
```

#### 2. Set up the database

Start PostgreSQL using Docker:

```bash
docker-compose up postgres -d
```

Or install PostgreSQL locally and create a database:

```bash
createdb wedding
```

Run migrations:

```bash
cd api
# Install sqlx-cli if not already installed
cargo install sqlx-cli --no-default-features --features postgres
sqlx migrate run --database-url "postgres://wedding:wedding@localhost:5432/wedding"
```

#### 3. Set up the backend

```bash
cd api
cp .env.example .env
# Edit .env with your configuration
cargo run
```

The API will be available at `http://localhost:8080`

#### 4. Set up the frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if needed (default API URL is http://localhost:8080)
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Using Docker Compose

The easiest way to run the entire stack:

```bash
# Create a .env file in the root with your Resend API key
echo "RESEND_API_KEY=your_key_here" > .env

# Start all services
docker-compose up --build

# Frontend: http://localhost:3000
# API: http://localhost:8080
# Database: localhost:5432
```

## Deployment (Dokploy)

### Prerequisites

1. Dokploy installed on Hetzner server
2. GitHub repository connected to Dokploy
3. Domain (samandjonah.com) configured

### Deployment Steps

#### 1. Create PostgreSQL Database in Dokploy

- Go to Dokploy dashboard
- Create a new PostgreSQL database named `wedding`
- Note the connection string

#### 2. Deploy Backend (API)

- Create new app: `wedding-api`
- Build Type: **Docker**
- Dockerfile Path: `api/Dockerfile`
- Port: `8080`
- Environment Variables:
  ```
  DATABASE_URL=<your-postgres-connection-string>
  PORT=8080
  RESEND_API_KEY=<your-resend-api-key>
  CORS_ORIGIN=https://samandjonah.com
  FRONTEND_URL=https://samandjonah.com
  ```
- Domain: `api.samandjonah.com`

#### 3. Deploy Frontend

- Create new app: `wedding-frontend`
- Build Type: **Docker**
- Dockerfile Path: `frontend/Dockerfile`
- Port: `80`
- Environment Variables:
  ```
  VITE_API_URL=https://api.samandjonah.com
  ```
- Domain: `samandjonah.com`

#### 4. Run Database Migrations

SSH into your server and run:

```bash
# Install sqlx-cli
cargo install sqlx-cli --no-default-features --features postgres

# Run migrations
sqlx migrate run --database-url "<your-postgres-connection-string>"
```

## API Endpoints

### Public Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/rsvp/:code` - Get guest info by code
- `POST /api/rsvp/:code` - Submit RSVP
- `GET /api/registry/categories` - Get registry categories
- `GET /api/registry/items` - Get all registry items
- `POST /api/registry/items/:id/contribute` - Submit contribution

### Admin Endpoints (Dev Only)

- `POST /api/admin/guests/import` - Import guest CSV
- `GET /api/admin/guests` - List all guests
- `POST /api/admin/campaigns` - Create email campaign
- `GET /api/admin/campaigns` - List campaigns
- `POST /api/admin/campaigns/:id/send` - Send campaign
- `GET /api/admin/rsvps` - List all RSVPs
- `POST /api/admin/registry/items` - Create registry item
- `PUT /api/admin/registry/contributions/:id/confirm` - Confirm contribution

## Database Schema

See [specs/wedding_plan.md](specs/wedding_plan.md) for complete database schema documentation.

Key tables:
- `guests` - Guest list with unique RSVP codes
- `email_campaigns` - Email campaign tracking
- `email_sends` - Individual email tracking with opens
- `rsvps` - Guest responses
- `honeymoon_categories` - Registry categories
- `honeymoon_items` - Registry items
- `registry_contributions` - Guest contributions

## Guest CSV Import Format

The admin dashboard supports CSV import with the following format:

```csv
Name,Relationship,Sam/Jonah,Maybe
John Doe,Friend,Jonah,Yes
Jane Smith,Family,Sam,No
```

Required columns:
- **Name:** Guest name
- **Relationship:** Friend, Family, +1, 1
- **Sam/Jonah:** Sam, Jonah, Both, Maybe
- **Maybe:** Yes, No

## Email Configuration

The application uses [Resend](https://resend.com) for email delivery:

1. Sign up for a free Resend account (3,000 emails/month)
2. Verify your domain (samandjonah.com)
3. Get your API key
4. Add to environment variables: `RESEND_API_KEY`

Email tracking is automatically enabled via tracking pixels.

## Environment Variables

### Frontend

```env
VITE_API_URL=http://localhost:8080
```

### Backend

```env
DATABASE_URL=postgres://user:password@host:5432/wedding
PORT=8080
RESEND_API_KEY=re_xxxxxxxxxxxxx
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

## Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and test locally**

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add feature"
   git push origin feature/your-feature
   ```

4. **Dokploy auto-deploys** on push to main (configure webhook)

## Troubleshooting

### Frontend won't build

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Backend compilation errors

```bash
cd api
cargo clean
cargo build
```

### Database connection issues

Check your `DATABASE_URL` and ensure PostgreSQL is running:

```bash
psql $DATABASE_URL
```

### Docker build fails

Clear Docker cache and rebuild:

```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## License

Private project - All rights reserved

## Contact

For questions or issues, contact:
- Email: contact@samandjonah.com
- Admin Panel: https://panel.samandjonah.com

---

**Made with ❤️ for Sam & Jonah's special day**
