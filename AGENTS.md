# Sam and Jonah Wedding

Codex guidance for the wedding website, RSVP/admin tools, email workflows, and
honeymoon registry. Work in this repository is collaborative only; never start
wedding work, send messages, or mutate live data autonomously.

## Context

- Repository: `jonahduckworth/wedding`.
- Canonical path: `/Users/jonah/dev/personal/wedding`.
- Production: `samandjonah.com` and `api.samandjonah.com` on Dokploy/Hetzner.
- Stack: React 19, React Router 7, Rsbuild, TypeScript, TanStack Query, Rust,
  Axum, SQLx, PostgreSQL 16, Resend, Docker Compose, and Dokploy.
- `main` is the production branch. Frontend and API deploy as separate Docker
  applications. API startup automatically runs embedded SQLx migrations and
  additional schema fixes, so an ordinary API deploy/start can mutate the
  production schema.

## Hard Rules

- Treat guest identities/contact details, RSVP codes, contributions, email
  campaigns, database migrations, production deploys, and server access as
  private and high-risk.
- The current browser-side admin gate is not server-side authorization, and the
  API's admin routes must be treated as unprotected. Do not claim the admin area
  is secure or add privileged functionality without a deliberate backend auth
  and authorization design.
- Sending invitations/reminders/campaigns, changing contribution status, or
  writing production data requires explicit authorization and scoped live-state
  verification.
- Never run `docker-compose down -v`, delete named volumes, reset the database,
  or re-run seed/import jobs without explicit authorization. Local PostgreSQL
  and upload volumes are stateful.
- Do not include guest data, credentials, RSVP codes, email addresses, database
  URLs, or production exports in commits, logs, screenshots, or durable notes.

## Commands

```bash
docker-compose up --build

cd frontend
npm ci
npm run dev
npm run build

cd ../api
cargo fmt --check
cargo test
cargo run
```

Local Compose exposes the frontend at `http://localhost:3000`, the API at
`http://localhost:8080`, and PostgreSQL on host port `2026`.

## Verification

- Frontend changes: run `npm run build` and verify affected loading, empty,
  error, retry, and success states in a browser.
- Rust/API changes: run `cargo fmt --check` and `cargo test`; exercise affected
  endpoints against local data only unless live access is explicitly requested.
- RSVP/registry changes: verify totals and status transitions through the app or
  API path that recalculates them rather than ad hoc SQL.
- Email changes: use previews or non-delivering tests first; verify recipient
  scope immediately before any authorized send.
- Deployment work: verify commit, environment variables by name only, pending
  embedded migrations/startup schema fixes, health endpoints, database backup,
  and rollback path before changing production.
