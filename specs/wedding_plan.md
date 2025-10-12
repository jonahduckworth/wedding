# Wedding Application - Technical Specification
**Sam & Jonah - August 15, 2026 at Rouge, Calgary, Alberta**

## Project Overview
Full-stack wedding application featuring save-the-date emails, wedding website, RSVP system, and honeymoon registry.

---

## Technical Stack

### Frontend
- **Framework**: Rsbuild + React 18 + TypeScript
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form + Zod validation
- **Image Optimization**: Sharp (via Rsbuild plugins)
- **Deployment**: Docker container on Dokploy

### Backend
- **Language**: Rust
- **Web Framework**: Axum
- **Database**: PostgreSQL with SQLx (compile-time checked queries)
- **Async Runtime**: Tokio
- **Email Service**: Resend (free tier: 3,000 emails/month, includes open tracking)
- **Authentication**: JWT tokens for admin, UUID codes for guest links
- **Deployment**: Docker container on Dokploy

### Infrastructure
- **Hosting**: Hetzner server via Dokploy
- **Database**: PostgreSQL container
- **Domain**: samandjonah.com
- **Admin Panel**: panel.samandjonah.com (Dokploy)
- **Deployment Method**: Docker (multi-stage builds)

---

## Database Schema

### Tables

#### `guests`
```sql
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    relationship VARCHAR(50) NOT NULL, -- Friend, Family, +1, 1
    sam_or_jonah VARCHAR(10) NOT NULL, -- Sam, Jonah, Both, Maybe
    maybe BOOLEAN DEFAULT false,
    unique_code VARCHAR(50) UNIQUE NOT NULL,
    invite_type VARCHAR(20) DEFAULT 'single', -- single, couple, plus_one
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `email_campaigns`
```sql
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL, -- save_the_date, invitation
    sent_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP
);
```

#### `email_sends`
```sql
CREATE TABLE email_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES email_campaigns(id),
    guest_id UUID REFERENCES guests(id),
    sent_at TIMESTAMP DEFAULT NOW(),
    opened_at TIMESTAMP,
    opened_count INT DEFAULT 0
);
```

#### `rsvps`
```sql
CREATE TABLE rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID REFERENCES guests(id) UNIQUE,
    attending BOOLEAN NOT NULL,
    dietary_restrictions TEXT,
    message TEXT,
    submitted_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `honeymoon_categories`
```sql
CREATE TABLE honeymoon_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### `honeymoon_items`
```sql
CREATE TABLE honeymoon_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES honeymoon_categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    total_contributed DECIMAL(10, 2) DEFAULT 0,
    is_fully_funded BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `registry_contributions`
```sql
CREATE TABLE registry_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES honeymoon_items(id),
    contributor_name VARCHAR(255), -- NULL for anonymous
    contributor_email VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Features & Pages

### 1. Admin Dashboard (Dev Only - No Auth)

#### Guest Management
- Import guests from CSV (Name, Relationship, Sam/Jonah, Maybe columns)
- View/edit guest list
- Automatically generate unique RSVP codes for each guest

#### Email Campaign Manager
- **Save the Date**
  - Create email campaign
  - Preview email template
  - Send to all/filtered guests
  - Track opens (via Resend tracking pixel)
  - Dashboard showing opened/not opened

- **Invitations**
  - Create invitation campaign
  - Include unique RSVP link for each guest
  - Send to all/filtered guests
  - Track opens and RSVP status

#### RSVP Management
- View all RSVPs (attending/not attending)
- Filter and search
- Export to CSV
- View dietary restrictions and messages

#### Honeymoon Registry Manager
- Create/edit categories
- Create/edit items (name, description, price, image, category)
- View all contributions (pending/confirmed)
- Confirm contributions (mark as received)
- View total raised per item

### 2. Public Wedding Website

#### Home Page
- Hero image with names and date
- Countdown to wedding day
- Quick links to other sections
- Beautiful, elegant design

#### Our Story
- "How We Met" narrative
- Relationship timeline
- Photo gallery (with placeholders initially)
- Image optimization for fast loading

#### Wedding Details
- **Venue**: Rouge, Calgary, Alberta
- **Date**: August 15, 2026
- **Timeline of Day**:
  ```
  12:00pm - Getting Ready Photos (guys)
  1:00pm - Getting Ready Photos (girls)
  2:00pm - First Look
  2:15pm - Wedding Party Portraits
  2:45pm - Couples Portraits
  3:30pm - Head to Rogue
  4:00pm - Ceremony
  4:30pm - Family Portraits/Cocktail Hour
  5:00pm - Bride & Groom Join Cocktail Hour
  6:00pm - Reception Begins
  6:15pm - Dinner with Speeches
  8:00pm - Cake Cutting
  8:15pm - Dance Floor Opens
  ```

#### Travel & Accommodations
- Directions to venue
- Parking information
- Recommended hotels with links
- Map integration (optional)

#### FAQ
- Common questions and answers
- Dress code
- Kids policy (if any)
- Contact information

### 3. RSVP System

#### Guest Access
- Unique link sent via email: `samandjonah.com/rsvp/{unique_code}`
- No password required
- Shows guest name(s) on their invitation
- RSVP form:
  - Will you attend? (Yes/No)
  - Dietary restrictions (text field)
  - Message to couple (text field)
  - Submit button
- Confirmation message after submission
- Ability to update RSVP before deadline

### 4. Honeymoon Registry

#### Public Registry Page
- Category navigation
- Grid/list of items with:
  - Item name and description
  - Price
  - Progress bar (total contributed / price)
  - "Contribute" button
  - Show anonymous or named contributors

#### Contribution Flow
1. Click "Contribute" on an item
2. Modal opens with:
   - Item details and remaining amount needed
   - Input for contribution amount
   - Optional: contributor name (or stay anonymous)
   - Required: contributor email
   - e-Transfer instructions displayed
   - Checkbox: "I have sent the e-Transfer"
3. Submit creates pending contribution
4. Confirmation message with reference number
5. Admin confirms later when payment received

---

## API Endpoints

### Admin Endpoints (No auth in dev)

#### Guests
- `POST /api/admin/guests/import` - Import CSV
- `GET /api/admin/guests` - List all guests
- `PUT /api/admin/guests/:id` - Update guest
- `DELETE /api/admin/guests/:id` - Delete guest

#### Email Campaigns
- `POST /api/admin/campaigns` - Create campaign
- `GET /api/admin/campaigns` - List campaigns
- `POST /api/admin/campaigns/:id/send` - Send campaign
- `GET /api/admin/campaigns/:id/stats` - Get open/send stats
- `GET /api/admin/campaigns/:id/recipients` - Get recipient list with open status

#### RSVPs
- `GET /api/admin/rsvps` - List all RSVPs
- `GET /api/admin/rsvps/stats` - Get attendance stats
- `GET /api/admin/rsvps/export` - Export CSV

#### Registry
- `POST /api/admin/registry/categories` - Create category
- `PUT /api/admin/registry/categories/:id` - Update category
- `DELETE /api/admin/registry/categories/:id` - Delete category
- `POST /api/admin/registry/items` - Create item
- `PUT /api/admin/registry/items/:id` - Update item
- `DELETE /api/admin/registry/items/:id` - Delete item
- `GET /api/admin/registry/contributions` - List all contributions
- `PUT /api/admin/registry/contributions/:id/confirm` - Confirm contribution

### Public Endpoints

#### Website Content
- `GET /api/content/timeline` - Get wedding day timeline
- `GET /api/content/faq` - Get FAQ items
- `GET /api/content/story` - Get "Our Story" content

#### RSVP
- `GET /api/rsvp/:code` - Get guest info by unique code
- `POST /api/rsvp/:code` - Submit RSVP
- `PUT /api/rsvp/:code` - Update RSVP

#### Registry
- `GET /api/registry/categories` - List categories with items
- `GET /api/registry/items` - List all items
- `GET /api/registry/items/:id` - Get item details
- `POST /api/registry/items/:id/contribute` - Submit contribution

#### Email Tracking
- `GET /api/track/:email_send_id/open.png` - 1x1 tracking pixel

---

## Email Templates

### Save the Date
- Subject: "Save the Date - Sam & Jonah's Wedding"
- Hero image
- Wedding date and location
- Link to website
- Tracking pixel embedded

### Invitation
- Subject: "You're Invited - Sam & Jonah's Wedding"
- Personalized greeting
- Wedding details
- Unique RSVP link
- Timeline overview
- Travel information link
- Tracking pixel embedded

---

## Deployment Configuration

### Frontend Dockerfile
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile
```dockerfile
# Multi-stage build
FROM rust:1.75 AS builder
WORKDIR /app
COPY Cargo.* ./
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y libpq5 ca-certificates
COPY --from=builder /app/target/release/wedding-api /usr/local/bin/
EXPOSE 8080
CMD ["wedding-api"]
```

### Docker Compose (for local dev)
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: wedding
      POSTGRES_USER: wedding
      POSTGRES_PASSWORD: wedding
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: ./api
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://wedding:wedding@postgres/wedding
      RESEND_API_KEY: ${RESEND_API_KEY}
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - api

volumes:
  postgres_data:
```

### Dokploy Configuration
- Create two apps: `wedding-frontend` and `wedding-api`
- Create one database: `wedding-postgres`
- Set environment variables in Dokploy UI
- Configure domains:
  - Frontend: samandjonah.com
  - API: api.samandjonah.com
- Use Docker buildpacks for both

---

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://api.samandjonah.com
```

### Backend (.env)
```
DATABASE_URL=postgres://user:password@host:5432/wedding
RESEND_API_KEY=re_xxxxx
CORS_ORIGIN=https://samandjonah.com
FRONTEND_URL=https://samandjonah.com
PORT=8080
```

---

## Development Workflow

### Initial Setup
1. Clone repository
2. Set up frontend: `cd frontend && npm install`
3. Set up backend: `cd api && cargo build`
4. Start PostgreSQL: `docker-compose up postgres`
5. Run migrations: `cd api && sqlx migrate run`
6. Start backend: `cd api && cargo run`
7. Start frontend: `cd frontend && npm run dev`

### Deployment
1. Push to GitHub repository
2. Dokploy auto-deploys on push (configure webhooks)
3. Or manually trigger deploy from Dokploy UI

---

## Security Considerations

### Admin Access
- No authentication in development (localhost only)
- Add basic auth or IP whitelist in production if needed
- Consider adding simple password protection later

### Guest Links
- UUID-based unique codes (non-guessable)
- No PII in URLs
- Rate limiting on RSVP submissions

### Email Security
- Use Resend's verified domain
- SPF/DKIM/DMARC configuration
- Unsubscribe links (required by law)

### Data Privacy
- HTTPS enforced
- Email addresses encrypted at rest (optional)
- GDPR compliance (if applicable)

---

## Future Enhancements (Post-Wedding)
- Photo upload from guests
- Guest messaging/comments
- Live wedding day updates
- Thank you note tracker
- Anniversary reminders

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- ✅ Project setup (frontend + backend)
- ✅ Database schema and migrations
- ✅ Docker configuration
- Basic UI layout with shadcn/ui

### Phase 2: Admin & Email (Week 2)
- CSV import functionality
- Email integration (Resend)
- Send save-the-date feature
- Open tracking dashboard

### Phase 3: Public Website (Week 3)
- Home, Story, Details, Travel, FAQ pages
- Responsive design
- Image placeholders
- Timeline display

### Phase 4: RSVP System (Week 4)
- Unique code authentication
- RSVP form and validation
- Admin RSVP management
- Invitation email sending

### Phase 5: Honeymoon Registry (Week 5)
- Registry item management
- Contribution flow
- Progress tracking
- Admin confirmation system

### Phase 6: Polish & Deploy (Week 6)
- UI/UX refinements
- Testing
- Production deployment
- Domain configuration

---

**Last Updated**: October 12, 2025
**Wedding Date**: August 15, 2026
**Domain**: samandjonah.com
