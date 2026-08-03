# ADR-0002 — Feature geometry is derived from the country centroid

## Status
Accepted

## Context
The submission view has `enableNullGeometry:false` and no `resource_location` attribute — the location
is the feature's point geometry. Inspecting live catalog records shows:
- `region_country` holds a **country name** (e.g. `"Lebanon"`, `"Bangladesh"`) or the literal value
  `"Global or relevant to several regions"`.
- The geometry is the **country centroid** (Lebanon → `35.89, 33.92`); global/none records use `{x:0,y:0}`.

The original spec proposed seven region **codes** (`GBL_Global`, `AFR_Africa`, …), but **zero** existing
records use them. Shipping region codes would introduce an encoding the catalog has never seen and break
consistency with every existing row and with ExB/Sal.

## Decision
Model location as a **country name** (or the `"Global or relevant to several regions"` value) and derive
the point geometry from a **bundled country → centroid table** (a static derivation of Esri's World
Countries Centroids). The global value and any unmatched country resolve to `{x:0, y:0}`.

## Consequences
- New features match the existing catalog's location encoding exactly.
- No live dependency on the World Countries Centroids service (the table is bundled).
- Country-name matching must be tolerant (aliases); the bundled table starts small and is extended as
  needed. Sub-country precision is out of scope for v1.
