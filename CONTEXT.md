# CONTEXT — GIS for Good Resource Submission

Glossary of the domain language for this project. Vocabulary only — no implementation detail.
When code or issues name a concept, use the term as defined here.

## Core entities

- **Resource** — an external web page (story, tool, training, or operational service) that a
  contributor wants listed in the GIS for Good library. Identified by its **resource URL**.
- **Contributor** — a signed-in ArcGIS org user permitted to submit resources. Gating editing to
  contributors is the only access requirement (no ownership-based access control).
- **Catalog** — the collection of published resources, backed by one hosted feature layer.

## The two views (same underlying layer)

- **Submission view** — the `…_form` feature layer view. The **write target**; what Survey123 and
  this app create features in. Requires a geometry; not anonymously queryable.
- **Catalog view** — the non-`_form` feature layer view. The **public read surface** consumed by the
  Experience Builder app and the "Ask Sal" chat shell. Anonymously queryable.

## Field-model vocabulary

- **Broad type** — a top-level multi-select that names which themed groups apply to a resource
  (e.g. `mission_sector_broad_type`, `drm_broad_type`). Selecting a broad-type code reveals its **subset**.
- **Subset** — the detailed multi-select scoped by a broad type (e.g. the humanitarian subset lives in
  `mission_sector_humanitarian`; the DRM "response" subset lives in `response_type`).
- **Relevance gate** — a per-group field (`*_rlvnce`) valued `none` / `all` / `select_own` that records
  whether a resource is cross-cutting (`none`), applies to a whole group (`all`), or targets a chosen
  subset (`select_own`). Derived from whether the subset has any selections.
- **Controlled vocabulary** — a fixed list of **codes** a field accepts. Some are enforced by the layer
  as coded-value domains; many multi-selects are plain text and must be validated by the app.
- **Region / Country** — `region_country` holds a **country name** or the literal value
  `"Global or relevant to several regions"`. The feature's **geometry** is the country centroid (or the
  origin point `{0,0}` for the global/unmatched case).
- **Thumbnail** — the resource's preview image, stored as a feature **attachment** (authoritative;
  read by ExB and Sal). A `thumbnailURL` attribute also exists and is set best-effort.
- **Draft** — the field values proposed by the extraction step before the contributor reviews them.
  Everything a draft proposes is editable; nothing is written until the contributor confirms.

## Status & visibility

- **Status** — lifecycle of a catalog entry (`pending`, `active`, `archived`, `toEdit`, `deprecated`).
  New submissions are created `active`.
- **Hub visibility flags** — the `*Hub_visibility` fields controlling which downstream hubs surface a
  resource. Default `no` on submission.
