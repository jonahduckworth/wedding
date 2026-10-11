# Archive frontend checks

The public pages are static. The private archive is loaded only by `/admin/*`,
authenticates through the same-origin server, and renders records as inert text.
There are no record mutation controls or client-side account credentials.

Run from the repository root:

```sh
npm --prefix frontend ci
npm --prefix frontend run build
npm --prefix frontend run typecheck
npm --prefix frontend run test:archive:dom
```

The DOM suite executes the production JavaScript with local resource loading and
synthetic API responses. It checks route isolation, server-auth flows, all eight
collections, pagination, JSON details, error/retry/empty states, clearing records,
and non-refreshing session validation. It does not validate layout or CSP. JSDOM
cannot parse Tailwind's modern CSS, so styles are deliberately omitted in this
behavior-only suite.

For visual and browser checks, install the archive server's dependencies too
(the suite imports its CSP), install Playwright's Chromium if needed, and run:

```sh
npm --prefix archive ci
cd frontend
npx playwright install chromium
npm run test:archive
```

An existing browser can be selected with `CHROMIUM_EXECUTABLE`. Optional local
screenshots are enabled with `ARCHIVE_SCREENSHOTS=/absolute/output/directory`.
The browser suite starts a temporary local static server, intercepts every API
request using synthetic fixtures, and blocks external resources. It never starts
the legacy API, contacts production, or uses real credentials or guest records.

A browser runtime that prohibits Chromium's local sockets cannot run the browser
suite; passing DOM tests must not be represented as a visual/browser pass.
