# ADR-0003 — Writes are client-side with the signed-in user's token

## Status
Accepted

## Context
Editing must be gated to ArcGIS org users, and the org enforces SSO through its portal. The alternative
would be storing a service credential on the backend and routing writes through a Function.

## Decision
The browser authenticates via **ArcGIS OAuth 2.0** (`OAuthInfo` + `IdentityManager`) and performs the
write (`applyEdits` + `addAttachment`) **client-side using the signed-in user's token**. The serverless
backend (`/api/extract`, `/api/screenshot`) holds **no ArcGIS credentials** and never touches the layer.

## Consequences
- No shared service credential to store, rotate, or leak; every edit is attributable to a real org user
  through editor tracking.
- The layer must have **Create** enabled for org users and be shared to the contributor group; public
  access stays view-only. (Verified: layer capabilities are `Create,Editing`.)
- The redirect URI (the app's own URL) must be registered on the OAuth app item.
- Ownership-based access control is not required; gating is purely "must be signed in".
