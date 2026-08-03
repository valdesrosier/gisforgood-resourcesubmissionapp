import type { ResourceType } from './codes';

/**
 * ResourceDraft is the editable, in-memory shape the extraction step proposes and the review
 * form edits. It uses arrays for multi-selects (serialized to comma strings only at write time)
 * and a country name for location (geometry is derived at write time — see buildFeature.ts).
 */
export interface ResourceDraft {
  // Required text
  resource_name: string | null;
  resource_url: string | null;
  short_desc_2000: string | null; // <= 2000 chars; the challenge addressed, not the tools
  organization: string | null;
  contact_name: string | null;
  contact_email: string | null;

  publication_yr: number | null; // 4-digit year; converted to epoch ms on write

  resource_type: ResourceType | null;
  region_country: string | null; // country name or REGION_GLOBAL
  public_YN: 'yes' | 'no' | null;

  // op_service only
  service_type: 'data_source' | 'application' | null;
  data_type: string[] | null;

  // Mission / sector
  mission_sector_broad_type: string[] | null;
  mission_sector_humanitarian: string[] | null;

  // DRM
  drm_broad_type: string[] | null;
  risk_type: string[] | null;
  preparedness_type: string[] | null;
  response_type: string[] | null;
  recovery_type: string[] | null;

  // Hazards / SDGs / phases / analytics / program cycle / capabilities
  hzrd_type: string[] | null;
  sdg: string[] | null;
  info_mgmnt_phase: string[] | null;
  sptl_analytics_broad_type: string[] | null;
  dev_prgrm_cycle: string[] | null;
  capabilities: string[] | null;
}

export function emptyDraft(): ResourceDraft {
  return {
    resource_name: null, resource_url: null, short_desc_2000: null, organization: null,
    contact_name: null, contact_email: null, publication_yr: null, resource_type: null,
    region_country: null, public_YN: null, service_type: null, data_type: null,
    mission_sector_broad_type: null, mission_sector_humanitarian: null,
    drm_broad_type: null, risk_type: null, preparedness_type: null, response_type: null,
    recovery_type: null, hzrd_type: null, sdg: null, info_mgmnt_phase: null,
    sptl_analytics_broad_type: null, dev_prgrm_cycle: null, capabilities: null,
  };
}
