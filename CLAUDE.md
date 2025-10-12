# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack wedding application for Sam & Jonah's wedding on August 15, 2026 at Rouge, Calgary, Alberta.

**Key Features:**
- Wedding website with multiple pages (Home, Story, Details, Travel, FAQ)
- Email campaign management (Save the Date, Invitations with open tracking)
- RSVP system with unique guest codes
- Honeymoon registry for Italy trip (contribution-based)
- Admin dashboard for managing guests, emails, RSVPs, and registry

**Tech Stack:**
- Frontend: Rsbuild + React 18 + TypeScript + shadcn/ui + TanStack Query
- Backend: Rust + Axum + SQLx
- Database: PostgreSQL 16
- Email: Resend API
- Deployment: Docker on Dokploy/Hetzner
- Domain: samandjonah.com

## Project Structure

```
wedding/
├── frontend/          # React frontend with Rsbuild
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components (Home, Story, Details, etc.)
│   │   ├── lib/           # Utilities (cn function, etc.)
│   │   └── styles/        # Global CSS with Tailwind
│   └── Dockerfile
├── api/              # Rust backend with Axum
│   ├── src/
│   │   ├── main.rs        # Entry point
│   │   ├── models.rs      # Database models
│   │   ├── routes.rs      # API routes
│   │   └── db.rs          # Database connection pool
│   ├── migrations/        # SQL migration files
│   └── Dockerfile
├── specs/            # Technical specifications
│   └── wedding_plan.md    # Detailed project plan
├── docker-compose.yml
├── dev-setup.sh      # Quick setup script
└── README.md

```

## Development Commands

### Quick Start
```bash
# One-time setup (creates .env files, starts DB, runs migrations)
./dev-setup.sh

# Start everything with Docker
docker-compose up --build

# Or run services individually:
# Backend
cd api && cargo run

# Frontend
cd frontend && npm run dev
```

### Frontend Commands
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Commands
```bash
cd api
cargo build          # Build
cargo run            # Run (port 8080)
cargo test           # Run tests

# Database migrations
cargo install sqlx-cli --no-default-features --features postgres
sqlx migrate run --database-url "postgres://wedding:wedding@localhost:5432/wedding"
```

### Docker Commands
```bash
# Start all services
docker-compose up

# Rebuild and start
docker-compose up --build

# Start specific service
docker-compose up postgres

# Stop all services
docker-compose down

# Clean everything
docker-compose down -v
```

## Architecture

### Frontend Architecture
- **Routing:** React Router with routes for all pages
- **State Management:** TanStack Query for server state
- **Styling:** Tailwind CSS with shadcn/ui components
- **Layout:** Shared Layout component with navigation and footer
- **Pages:**
  - Home (countdown, quick links)
  - Story (how we met, timeline, photos)
  - Details (venue, timeline, dress code)
  - Travel (directions, parking, hotels)
  - FAQ
  - RSVP (unique code authentication)
  - Registry (categorized items with progress bars)
  - Admin Dashboard (guest management, email campaigns, RSVP tracking)

### Backend Architecture
- **Framework:** Axum (async Rust web framework)
- **Database:** PostgreSQL via SQLx (compile-time checked queries)
- **Models:** Guests, EmailCampaigns, EmailSends, RSVPs, HoneymoonItems, RegistryContributions
- **Routes:**
  - Public: RSVP, Registry, Content
  - Admin: Guest management, Email campaigns, RSVP management, Registry management
- **Email:** Resend API integration with tracking pixels

### Database Schema
Key tables (see [specs/wedding_plan.md](specs/wedding_plan.md) for full schema):
- `guests` - Guest list with unique RSVP codes
- `email_campaigns` - Email campaign tracking
- `email_sends` - Individual email sends with open tracking
- `rsvps` - Guest responses
- `honeymoon_categories` - Registry categories
- `honeymoon_items` - Registry items with prices and contributed amounts
- `registry_contributions` - Individual contributions (pending/confirmed)

### Deployment
- **Hosting:** Hetzner server via Dokploy
- **Frontend:** Docker container with Nginx (samandjonah.com)
- **Backend:** Docker container (api.samandjonah.com)
- **Database:** PostgreSQL container
- **Method:** Docker builds with multi-stage optimization

## Important Notes

### Guest Data
- Guests are imported via CSV with columns: Name, Relationship, Sam/Jonah, Maybe
- Each guest gets a unique RSVP code (UUID-based)
- Email addresses are required for sending invitations

### Email System
- Uses Resend (free tier: 3,000 emails/month)
- Tracking pixels for open tracking
- Two campaign types: save_the_date, invitation
- Admin can see who opened emails

### Registry System
- Items are categorized (Experiences, Dining, Accommodation, etc.)
- Multiple people can contribute to single items
- Contributions are "pending" until admin confirms payment
- Uses honor system with e-transfer instructions

### Admin Access
- No authentication in development (localhost only)
- All admin routes are under `/admin/*`
- Consider adding basic auth for production

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080
```

### Backend (.env)
```
DATABASE_URL=postgres://wedding:wedding@localhost:5432/wedding
PORT=8080
RESEND_API_KEY=your_resend_api_key_here
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

## Next Steps / Roadmap

Phase 1 (COMPLETE): Foundation
- ✅ Project setup
- ✅ Database schema
- ✅ Docker configuration
- ✅ Basic UI layout

Phase 2 (TODO): Admin & Email
- CSV import functionality
- Resend email integration
- Save the date sending
- Open tracking dashboard

Phase 3 (TODO): Public Website
- Complete all public pages with real content
- Add photos
- Finalize copy/text

Phase 4 (TODO): RSVP System
- Connect RSVP form to API
- Email sending with unique links
- Admin RSVP viewing

Phase 5 (TODO): Honeymoon Registry
- Registry item CRUD
- Contribution flow with e-transfer instructions
- Admin confirmation system

Phase 6 (TODO): Polish & Deploy
- Production deployment to Dokploy
- Domain configuration
- Testing and bug fixes
