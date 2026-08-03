# GIS for Good — Resource Submission App

Internal staff paste a resource URL; the app auto-drafts the catalog form fields from the page,
the user reviews/edits, then submits **directly to the ArcGIS hosted feature layer** that backs the
existing Survey123 form. This replaces the data-entry UX only — the schema is unchanged.

- **Front end:** React 18 + Vite + TypeScript. ArcGIS OAuth 2.0 sign-in gate (`@arcgis/core`,
  `OAuthInfo` + `IdentityManager`). No map. Writes are **client-side** with the signed-in user's token.
- **Backend:** Azure Functions (`/api/extract`, `/api/screenshot`) — no ArcGIS credentials.
- **Hosting:** Azure Static Web Apps (static front end + managed Functions, same-origin `/api/*`).

## Layer facts (verified against the live service)

- **Write target (submission view):**
  `…/service_d9e8f948b8464845a273e610041bcd4e_form/FeatureServer/0` — `Create,Editing`, geometry
  required (`enableNullGeometry:false`), **no anonymous Query**.
- **Public catalog view (read surface for ExB + the "Ask Sal" chat shell):**
  `…/service_d9e8f948b8464845a273e610041bcd4e/FeatureServer/0` (no `_form`) — anonymous query allowed.
- Multi-selects are stored as **comma-joined codes, no spaces** (e.g. `sdg_1,sdg_11`).
- Thumbnails are consumed as **feature attachments** by both ExB and Sal.

See `CONTEXT.md` (glossary) and `docs/adr/` (decisions).

## Structure

```
shared/     canonical domain model (codes, encoders, gates, conditionals, countries, validation)
frontend/   React SPA (auth gate + review form + client-side submit)
api/        Azure Functions: extract (OpenAI) + screenshot (ScreenshotOne)
docs/adr/   architecture decision records
```

## Local dev

```bash
# frontend
cd frontend && npm install && npm run dev
# api (in another terminal), requires Azure Functions Core Tools v4
cd api && npm install && npm start
# or run both together with the SWA CLI:
npx @azure/static-web-apps-cli start frontend/dist --api-location api
```

## Configuration

Front end (`frontend/.env` — see `.env.example`), all **non-secret** (ship in the browser):
`VITE_ARCGIS_CLIENT_ID`, `VITE_PORTAL_URL`, `VITE_LAYER_URL` (the `_form` view `/0`).

Backend (`api/local.settings.json` — see the example), **secret, server-side only**:
`OPENAI_API_KEY`, `OPENAI_MODEL`, `SCREENSHOTONE_ACCESS_KEY`, `SCREENSHOTONE_SIGNING_SECRET` (optional),
`CONTACT_FALLBACK_NAME`/`CONTACT_FALLBACK_EMAIL` (optional; blank by default).

## Setup reminders

- Register the deployed app URL as the **OAuth redirect URI** on the OAuth app item.
- Ensure the `_form` layer has **Create** for org users and is shared to the contributor group; keep
  public access **view-only**.
