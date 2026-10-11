# Wedding archive: staged implementation, not deployed

Base source: `jonahduckworth/wedding` at
`50053f168ee4e8988669f6404dbdce154f2a5c7b`.
This is an isolated, reviewable archive runtime for `https://wedding.jdbuilds.ca`.
The old Rust backend, schema history and original source remain in git history.
Do not run the old backend, root Compose, migrations, seed/import jobs, or the
old deployment recipes as part of this archive.

## Boundary

- One same-origin app serves the existing public wedding pages and `/admin`.
- Public RSVP and registry pages are closed static notices. Public pages do
  not call any archive or old API.
- All old `/api/*` and `/uploads/*` paths return 410, for every HTTP method.
- Only local-auth login/logout mutate ephemeral authentication state.
- Business records are SELECT-only and every read runs in a read-only
  transaction. No automatic schema changes or data fixups exist here.
- All eight existing history collections are included without `removed`,
  status or date filtering. Stored RSVP/invite `unique_code` is omitted from
  responses, retained untouched in the database backup. No historical records
  are deleted by this code. Already hard-deleted source rows can only be
  recovered from an earlier backup, if one exists.
- Upload bytes belong in a separate private read-only mount. They are never
  copied into the public build; authenticated downloads use
  `/api/archive/uploads/registry/<filename>`.
- No email client, third-party OAuth, payment, contribution, invite, reminder,
  tracking-pixel, editing, import or upload-write capability is included.

## Deliberate authentication choices needing deployment approval

Two local server-configured identities, with fixed `jonah` and `sam` slots.
Their approved login addresses and password hashes live in a private mounted
JSON file, never in source or a browser bundle. There is no registration,
password reset email or third identity. An operator validates the two approved
addresses during secure setup; this draft intentionally contains no real
addresses or credentials.

Each config entry has `id`, `email`, and `passwordHash`. Hash format is
`scrypt$131072$8$1$<32 hex salt characters>$<128 hex hash characters>`.
Passwords must have at least 15 characters and at most 512 UTF-8 bytes at setup.
The standard Node crypto scrypt implementation uses N=2^17, r=8, p=1, random
16-byte salts and timing-safe comparison. Only one password derivation runs at
a time, bounding KDF memory near 128 MiB. No live password was generated.

Opaque 256-bit server-side sessions use Secure, HttpOnly, SameSite=Strict,
`__Host-` cookies. Raw tokens never enter localStorage. Server memory stores
only a hash of the cookie token. Sessions expire after 30 minutes without
record activity or eight hours absolutely; session polling does not extend
idle lifetime. A new login replaces the prior session for that person. Logout
requires a same-origin JSON POST plus the session CSRF token and invalidates
the server session immediately. Restarting the sole runtime revokes all
sessions. Password/config changes require restart. There is no persistent
session table and no auth writes to business data.

Login is limited to five attempts per normalized identity, 20 per peer network
address and 60 globally per 15 minutes; successful attempts count too. Unknown
identities perform the same KDF. Forwarded IP headers are deliberately ignored.
Behind one reverse proxy, the per-peer bucket is shared by both people. Approve
this conservative two-person policy or explicitly review a proxy-aware design
before changing it. Restarts clear limits; configure an independent proxy
limit before public exposure. Single replica only until shared session and
rate-limit state is deliberately designed. MFA is not implemented.

Auth and database secret files must be absolute, small regular files with no
other-user access and no group-write permission. Supply them with a secret
mount, read-only, readable by the container's unprivileged node user. Never put
secrets in Docker build arguments, images, logs, git, this artifact or chat.

## Runtime choice

The staged service uses Node.js 24, its built-in HTTP server, and node-postgres
`pg` 8.16.3. The separate service is a deliberate boundary around the legacy
Rust startup and write-capable handlers, and is testable in this cloud
environment. It adds a runtime to maintain. Password derivation uses standard
Node crypto primitives; session lifecycle and throttling are application code,
not an independently audited authentication framework. Review that choice
before deployment.

## Build and local verification

```
cd frontend
npm ci --ignore-scripts
npm run build
npm run typecheck
npm run test:archive:dom
# npm run test:archive also requires a working Chromium browser.
cd ../archive
npm ci --ignore-scripts
npm run check
npm test
```

Backend verification: 12 synthetic tests passed. Frontend verification: build,
strict TypeScript checks and seven production-bundle DOM suites passed. The
independent review also ran 28 ad hoc synthetic HTTP checks; those ad hoc probes
are not part of the checked-in test suite. Final dependency audits reported zero
known vulnerabilities at verification time. These are point-in-time results.

The tests use only invented `.test` users and in-memory synthetic records. They
exercise old-route denial, authorization, wrong/third-user logins, session
expiry/replacement/logout, CSRF, pagination, rate limits, private file paths,
no public database reads and read-only SQL contracts. They do not replace
integration tests against a restored PostgreSQL 15 snapshot.

Chromium could not launch in this cloud runtime because local socket creation
was denied (EPERM). The Playwright suite is supplied but has not passed here.
DOM tests do not verify visual layout or browser-enforced CSP, HTTPS cookies or
proxy routing.

No Rust logic is used by the new runtime. The only legacy backend change removes
credential-bearing connection logging. Rust toolchain verification is still
required if that preserved backend is ever built again.

`archive/Dockerfile` is a draft root-context build, with an unprivileged runtime
containing only archive code and the public build. Docker itself has not been
run here. Pin reviewed base-image digests before production. Run with a
read-only root filesystem, dropped Linux capabilities, no-new-privileges,
bounded memory/CPU, private uploads mounted read-only and a private database
network. Do not use the root legacy Compose file or expose database port 5432.

## Required before any cutover

1. Obtain explicit backup/export, provisioning, credential and deployment
   approvals; this staging task grants none of those live actions.
2. Confirm the actual PostgreSQL source version and extensions. Repository
   docs say 16; the target plan says 15. PostgreSQL physical data directories
   cannot be downgraded. Test a logical export/restore on the approved target
   version before declaring compatibility. Do not blindly use `pg_restore`
   with a mismatched major version.
3. Back up database, upload volume and source revision with encrypted private
   storage, checksums, retention and a successful restore drill. Compare row
   counts for all tables, including removed guests, plus relationships, money
   totals, nulls, messages, timestamps, file counts and upload checksums.
4. Check server disk/free RAM/CPU, database size, upload size, image size and
   restore headroom. KDF plus runtime requires deliberate capacity budgeting.
5. Provision a dedicated restored database and SELECT-only, non-owner runtime
   role. `ops/read-only-role.sql` is a review-only template, not an automatic
   migration. Do not give runtime the database owner's credentials. Verify
   actual INSERT/UPDATE/DELETE/DDL/sequence/custom-function denial in a local
   restored test database and successful reads for all eight collections.
6. Approve the two local-login identities and auth choices above, then have the
   user enter credentials through a secure handoff. TLS validation is default
   for PostgreSQL. Private-network plaintext is possible only with the explicit
   `ARCHIVE_DB_TRANSPORT=private-network-plaintext-reviewed` setting after that
   separate network/security decision. Never disable certificate verification.
7. Review CSP, proxy routing, upstream host preservation, independent login
   rate controls, request limits, sensitive-path access logs, TLS certificates,
   backups and no-cache behavior. The app has no CORS allow headers. Keep its
   internal port inaccessible directly from the public internet.
8. Complete an independent final code review, full browser tests, PostgreSQL 15
   integration/privilege tests, container build and dependency/security review.
9. Only then approve a separate archive deployment and DNS cutover under the
   user's existing panel. Disable legacy frontend/API auto-deploys, route old
   APIs away from public access, and retain a verified rollback plan. Nothing
   in this artifact changes DNS, domain renewal, production, or GitHub.
10. Ensure the old domain will not renew only after backups and the new archive
    are verified. Expiring the domain means old links and mail addresses stop
    working; no permanent redirect can be promised after it expires.

## Sources informing security choices

- https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback
- https://node-postgres.com/features/ssl

The source snapshot is a checkpoint, not a production database backup or an
assertion that live infrastructure is ready.
