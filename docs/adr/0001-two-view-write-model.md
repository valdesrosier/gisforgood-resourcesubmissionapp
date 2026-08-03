# ADR-0001 — Write to the submission view, read stays on the catalog view

## Status
Accepted

## Context
The hosted feature layer is exposed through (at least) two views over one source:
- `…_form/FeatureServer/0` — the Survey123 **submission view**: `Create,Editing`, geometry required
  (`enableNullGeometry:false`), anonymous query disabled.
- `…/FeatureServer/0` (no `_form`) — the **public catalog view**: anonymous query enabled; consumed by
  the Experience Builder app and the "Ask Sal" chat shell (which reads feature **attachments** for
  thumbnails).

Both views sit over the same underlying data, so a feature created via the submission view (and its
attachment) appears in the catalog view.

## Decision
This app **writes only to the `_form` submission view** (via client-side `applyEdits` + `addAttachment`).
It never writes to the catalog view. When schema introspection or reference data is needed, it **reads
from the catalog view**, which allows anonymous query.

## Consequences
- New submissions are structurally identical to Survey123 submissions, so downstream ExB/Sal consumers
  keep working unchanged.
- Schema/encoding verification can be done anonymously against the catalog view without a token.
- The two URLs are configuration; if Esri re-provisions the views, both must be updated.
