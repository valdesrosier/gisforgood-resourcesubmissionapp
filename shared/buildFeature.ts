import { encodeMulti } from './encode';
import { deriveGate } from './gates';
import { centroidFor, type Point } from './countries';
import type { ResourceDraft } from './draft';

/** Convert a 4-digit year to epoch milliseconds at UTC midnight, Jan 1 (publication_yr is a Date field). */
export function yearToEpochMs(year: number | null | undefined): number | null {
  if (!year || !Number.isFinite(year)) return null;
  return Date.UTC(year, 0, 1, 0, 0, 0, 0);
}

export interface FeatureForWrite {
  attributes: Record<string, unknown>;
  geometry: Point & { spatialReference: { wkid: 4326 } };
}

/**
 * Assemble the applyEdits payload from a reviewed draft:
 * - multi-selects -> comma-joined strings (null when empty)
 * - relevance gates derived from subset population (D2)
 * - system fields set (status=active, *Hub_visibility=no, short_desc left null)
 * - geometry = country centroid (ADR-0002)
 */
export function buildFeature(d: ResourceDraft): FeatureForWrite {
  const attributes: Record<string, unknown> = {
    resource_name: d.resource_name,
    resource_url: d.resource_url,
    short_desc_2000: d.short_desc_2000,
    organization: d.organization,
    contact_name: d.contact_name,
    contact_email: d.contact_email,
    publication_yr: yearToEpochMs(d.publication_yr),
    resource_type: d.resource_type,
    region_country: d.region_country,
    public_YN: d.public_YN,

    // op_service
    service_type: d.resource_type === 'op_service' ? d.service_type : null,
    data_type:
      d.resource_type === 'op_service' && d.service_type === 'data_source'
        ? encodeMulti(d.data_type)
        : null,

    // Mission / sector
    mission_sector_broad_type: encodeMulti(d.mission_sector_broad_type),
    mission_sector_rlvnce: deriveGate(d.mission_sector_broad_type),
    mission_sector_humanitarian: encodeMulti(d.mission_sector_humanitarian),
    // hum_sector_rlvnce + mission_sector_hum_input intentionally left null (unused legacy)

    // DRM
    drm_broad_type: encodeMulti(d.drm_broad_type),
    drm_rlvnce: deriveGate(d.drm_broad_type),
    risk_type: encodeMulti(d.risk_type),
    preparedness_type: encodeMulti(d.preparedness_type),
    response_type: encodeMulti(d.response_type),
    recovery_type: encodeMulti(d.recovery_type),

    // Hazards
    hzrd_type: encodeMulti(d.hzrd_type),
    hzrd_rlvnce: deriveGate(d.hzrd_type),

    // SDGs
    sdg: encodeMulti(d.sdg),
    sdg_rlvnce: deriveGate(d.sdg),

    // Phases / analytics / program cycle / capabilities
    info_mgmnt_phase: encodeMulti(d.info_mgmnt_phase),
    sptl_analytics_broad_type: encodeMulti(d.sptl_analytics_broad_type),
    sptl_analytics_rlvnce: deriveGate(d.sptl_analytics_broad_type),
    dev_prgrm_cycle: encodeMulti(d.dev_prgrm_cycle),
    dev_prgrm_rlvnce: deriveGate(d.dev_prgrm_cycle),
    capabilities: encodeMulti(d.capabilities),

    // System fields
    status: 'active',
    npoHub_visibility: 'no',
    humHub_visibility: 'no',
    susdevHub_visibility: 'no',
    salamaHub_visibility: 'no',
    drpHub_visibility: 'no',
  };

  const c = centroidFor(d.region_country);
  return {
    attributes,
    geometry: { x: c.x, y: c.y, spatialReference: { wkid: 4326 } },
  };
}
