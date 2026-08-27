# GIS for Good — Resource Submission App

Internal staff paste a resource URL; the app auto-drafts the catalog form fields from the page,
the user reviews/edits, then submits **directly to the ArcGIS hosted feature layer** that backs the
existing Survey123 form. This replaces the data-entry UX only — the schema is unchanged.

- **Front end:** React 18 + Vite + TypeScript. ArcGIS OAuth 2.0 sign-in gate (`@arcgis/core`,
  `OAuthInfo` + `IdentityManager`). No map. Writes are **client-side** with the signed-in user's token.
- **Backend:** Node 20 service (`/api/extract`, `/api/screenshot`) — no ArcGIS credentials.
- **Hosting:** GC Apps service App, with same-origin SPA and `/api/*` routes.

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
api/        HTTP server and handlers: extract (OpenAI) + screenshot (ScreenshotOne)
docs/adr/   architecture decision records
```

## Local dev

```bash
# frontend
cd frontend && npm install && npm run dev
# production-shaped service (after building frontend and api)
HOST=127.0.0.1 PORT=3000 node api/dist/api/server.js
```

## Configuration

Browser configuration is declared in `gcapps.json` and managed in the GC Apps Dashboard:
`ARCGIS_CLIENT_ID`, `ARCGIS_PORTAL_URL`, and `ARCGIS_LAYER_URL` (the `_form` view `/0`). These
values are non-secret and are served to the browser by `/_config.js` with `Cache-Control: no-store`.

Backend values declared by `gcapps.json`, entered in the GC Apps Dashboard:
`OPENAI_API_KEY`, `OPENAI_MODEL`, `SCREENSHOTONE_ACCESS_KEY`, `SCREENSHOTONE_SIGNING_SECRET` (optional),
`CONTACT_FALLBACK_NAME`/`CONTACT_FALLBACK_EMAIL` (optional; blank by default).

The `/extract` function targets the **OpenAI platform** by default. For a native **Azure OpenAI**
resource, set `AZURE_OPENAI_ENDPOINT` (for example, `https://<resource>.openai.azure.com`),
`AZURE_OPENAI_DEPLOYMENT`, and `AZURE_OPENAI_API_VERSION` (defaults to `2024-10-21`). For an
OpenAI-compatible gateway, set `AZURE_OPENAI_ENDPOINT` to its API base URL or full chat-completions URL
(for example, `https://<gateway>/openai/v1` or `https://<gateway>/openai/v1/chat/completions`); requests
use the `api-key` header and `OPENAI_MODEL`. In either mode, `OPENAI_API_KEY` carries the provider key.

The GitHub workflow builds the complete Artifact and deploys it with `apfister/gc-apps-deploy@v1`.
After the first Deployment, enter browser/backend settings and write-only secrets in the GC Apps Dashboard.

## Setup reminders

- Register the deployed app URL as the **OAuth redirect URI** on the OAuth app item.
- Ensure the `_form` layer has **Create** for org users and is shared to the contributor group; keep
  public access **view-only**.
