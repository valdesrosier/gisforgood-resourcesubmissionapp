/**
 * Canonical controlled vocabularies for the GIS for Good catalog.
 * Codes are verbatim from the live feature layer + Survey123 form.
 * Multi-select fields are stored as comma-joined codes (no spaces) — see encode.ts.
 */

export const RESOURCE_TYPE = ['inspiration', 'solution', 'learning', 'op_service'] as const;

// op_service-only fields
export const SERVICE_TYPE = ['data_source', 'application'] as const;
export const DATA_TYPE = [
  'addresses', 'buildings_settlements', 'climate_weather', 'elevation_depth',
  'functional_areas', 'geographical_names', 'geology_soils', 'lc_lu', 'land_parcels',
  'imagery', 'physical_infrastructure', 'population_movement', 'transport_networks',
  'socio_economic', 'water',
] as const;

export const YES_NO = ['yes', 'no'] as const;
export const RELEVANCE = ['none', 'all', 'select_own'] as const;
export const STATUS = ['pending', 'active', 'archived', 'toEdit', 'deprecated'] as const;

// Mission / sector
export const MISSION_SECTOR_BROAD = ['environment', 'health', 'humanitarian', 'int_dev', 'society'] as const;
export const MISSION_SECTOR_HUMANITARIAN = [
  'camp_management', 'cash_voucher', 'child_protection', 'disaster_management',
  'emergency_telecom', 'family_tracing', 'logistics', 'mine_action', 'peace',
  'protection', 'search_rescue', 'shelter', 'wash',
] as const;
// TODO: the environment / health / int_dev / society subset code lists were not supplied.
// Until provided, those broad sectors are recorded in mission_sector_broad_type only and their
// per-sector subset fields are left blank.

// DRM
export const DRM_BROAD = ['risk_mitigation', 'preparedness', 'response', 'recovery'] as const;
export const RISK_TYPE = ['assess_hazards', 'assess_exposure', 'predict_impact', 'identify_mitigation', 'risk_education', 'monitor_hazards'] as const;
export const PREPAREDNESS_TYPE = ['forecast_hazard_events', 'design_response', 'emergency_prep', 'warning', 'mobilise_resources', 'alert'] as const;
export const RESPONSE_TYPE = ['register_responders', 'assess_damage', 'assess_needs', 'register_people', 'assign_resources', 'monitor_resources', 'situational_awareness'] as const;
export const RECOVERY_TYPE = ['debris', 'reconstruction', 'monitor_progress', 'build_resilience'] as const;

// Hazards
export const HZRD_TYPE = [
  'cold_wave', 'complex_emgncy', 'drought', 'earthquake', 'epidemic', 'extratropical_cyclone',
  'famine_famine', 'fire', 'flash_flood', 'flood', 'heat_wave', 'insect_infestation',
  'land_slide', 'mud_slide', 'other', 'sever_local_storm', 'snow_avalanche', 'storm_surge',
  'tech_disaster', 'tornadoes', 'tropical_cyclone', 'tsunami', 'violent_wind', 'volcano', 'wild_fire',
] as const;

// SDGs 1..17
export const SDG = Array.from({ length: 17 }, (_, i) => `sdg_${i + 1}`) as readonly string[];

export const INFO_MGMNT_PHASE = ['data_collection', 'data_management', 'data_analysis', 'mapping_and_visualization', 'reporting', 'collaboration_engagement'] as const;
export const SPTL_ANALYTICS_BROAD = ['understanding_where', 'measuring', 'relatedness', 'best_locations_paths', 'detecting_patterns', 'making_predictions'] as const;
export const DEV_PRGRM_CYCLE = ['understand_situation', 'define_gaps', 'design_program', 'monitor_implementation', 'evaluate_impact'] as const;
export const CAPABILITIES = ['mapping', 'storytelling', 'community_engagement', 'analytics_ai', 'data_management', 'field_operations', 'imagery_drones', '3d_gis', 'indoor_gis', 'real_time'] as const;

// Special region value used when a resource is global / multi-region / unknown.
export const REGION_GLOBAL = 'Global or relevant to several regions';

export type ResourceType = (typeof RESOURCE_TYPE)[number];
export type Relevance = (typeof RELEVANCE)[number];
