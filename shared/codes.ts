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

/**
 * Human-readable display labels (column C of the survey `choices` sheet). Codes remain the stored
 * value everywhere; these are used only for what the contributor sees. Labels are scoped per field
 * because the same code can carry different labels in different lists (e.g. `data_management`).
 * Any code without an explicit label falls back to `humanize()`.
 */
export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  inspiration: 'Inspirational story or case study',
  solution: 'Technical solution or tool',
  learning: 'Knowledge transfer or training material',
  op_service: 'Operational services',
};

export const YES_NO_LABELS: Record<string, string> = { yes: 'Yes', no: 'No' };

export const RELEVANCE_LABELS: Record<string, string> = {
  none: 'This resource is cross-cutting and not specifically relevant to any of the below',
  all: 'This resource is specifically built for all of the below',
  select_own: 'This resource is specifically relevant to the following subset',
};

export const MISSION_SECTOR_BROAD_LABELS: Record<string, string> = {
  environment: 'Environment',
  health: 'Health',
  humanitarian: 'Humanitarian and Disaster Management',
  int_dev: 'International Development',
  society: 'Society',
};

export const MISSION_SECTOR_HUMANITARIAN_LABELS: Record<string, string> = {
  camp_management: 'Camp management',
  cash_voucher: 'Cash and voucher assistance',
  child_protection: 'Child protection',
  disaster_management: 'Coordination and Disaster Management',
  emergency_telecom: 'Emergency telecommunications',
  family_tracing: 'Family tracing and reunification',
  logistics: 'Logistics',
  mine_action: 'Mine action',
  peace: 'Peace and stabilisation',
  protection: 'Protection',
  search_rescue: 'Search and Rescue',
  shelter: 'Shelter',
  wash: 'WASH',
};

export const DRM_BROAD_LABELS: Record<string, string> = {
  risk_mitigation: 'Risk mitigation',
  preparedness: 'Preparedness, AA, EW',
  response: 'Response',
  recovery: 'Recovery and resilience building',
};

export const RISK_TYPE_LABELS: Record<string, string> = {
  assess_hazards: 'Assess hazards',
  assess_exposure: 'Assess exposure and vulnerability',
  predict_impact: 'Predict impact',
  identify_mitigation: 'Identify mitigation measures',
  risk_education: 'Conduct risk education',
  monitor_hazards: 'Monitor hazards',
};

export const PREPAREDNESS_TYPE_LABELS: Record<string, string> = {
  forecast_hazard_events: 'Forecast hazardous events',
  design_response: 'Design a response plan',
  emergency_prep: 'Conduct emergency preparedness training',
  warning: 'Early Warning',
  mobilise_resources: 'Mobilise and preposition resources',
  alert: 'Alert',
};

export const RESPONSE_TYPE_LABELS: Record<string, string> = {
  register_responders: 'Register and coordinate responders',
  assess_damage: 'Assess damage and impact',
  assess_needs: 'Assess needs and priorities',
  register_people: 'Register people in need',
  assign_resources: 'Assign and dispatch resources',
  monitor_resources: 'Monitor resource distribution',
  situational_awareness: 'Maintain situational awareness',
};

export const RECOVERY_TYPE_LABELS: Record<string, string> = {
  debris: 'Remove debris',
  reconstruction: 'Prioritise and plan reconstruction',
  monitor_progress: 'Monitor progress',
  build_resilience: 'Build resilience and coping capacity',
};

export const HZRD_TYPE_LABELS: Record<string, string> = {
  cold_wave: 'CW - Cold Wave',
  complex_emgncy: 'CE - Complex Emergency/Conflict',
  drought: 'DR - Drought',
  earthquake: 'EQ - Earthquake',
  epidemic: 'EP - Epidemic',
  extratropical_cyclone: 'EC - Extratropical Cyclone',
  famine_famine: 'FA - Famine',
  fire: 'FR - Fire',
  flash_flood: 'FF - Flash Flood',
  flood: 'FL - Flood',
  heat_wave: 'HT - Heat Wave',
  insect_infestation: 'IN - Insect Infestation',
  land_slide: 'LS - Land Slide',
  mud_slide: 'MS - Mud Slide',
  other: 'OT - Other',
  sever_local_storm: 'ST - Severe Local Storm',
  snow_avalanche: 'AV - Snow Avalanche',
  storm_surge: 'SS - Storm Surge',
  tech_disaster: 'AC - Tech. Disaster',
  tornadoes: 'TO - Tornadoes',
  tropical_cyclone: 'TC - Tropical Cyclone',
  tsunami: 'TS - Tsunami',
  violent_wind: 'VW - Violent Wind',
  volcano: 'VO - Volcano',
  wild_fire: 'WF - Wild fire',
};

export const SDG_LABELS: Record<string, string> = {
  sdg_1: 'Goal 1. End poverty in all its forms everywhere',
  sdg_2: 'Goal 2. End hunger, achieve food security and improved nutrition and promote sustainable agriculture',
  sdg_3: 'Goal 3. Ensure healthy lives and promote well-being for all at all ages',
  sdg_4: 'Goal 4. Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all',
  sdg_5: 'Goal 5. Achieve gender equality and empower all women and girls',
  sdg_6: 'Goal 6. Ensure availability and sustainable management of water and sanitation for all',
  sdg_7: 'Goal 7. Ensure access to affordable, reliable, sustainable and modern energy for all',
  sdg_8: 'Goal 8. Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all',
  sdg_9: 'Goal 9. Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation',
  sdg_10: 'Goal 10. Reduce inequality within and among countries',
  sdg_11: 'Goal 11. Make cities and human settlements inclusive, safe, resilient and sustainable',
  sdg_12: 'Goal 12. Ensure sustainable consumption and production patterns',
  sdg_13: 'Goal 13. Take urgent action to combat climate change and its impacts',
  sdg_14: 'Goal 14. Conserve and sustainably use the oceans, seas and marine resources for sustainable development',
  sdg_15: 'Goal 15. Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss',
  sdg_16: 'Goal 16. Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels',
  sdg_17: 'Goal 17. Strengthen the means of implementation and revitalize the Global Partnership for Sustainable Development',
};

export const INFO_MGMNT_PHASE_LABELS: Record<string, string> = {
  data_collection: 'Data collection',
  data_management: 'Data management and processing',
  data_analysis: 'Data analysis',
  mapping_and_visualization: 'Mapping and visualisation',
  reporting: 'Reporting',
  collaboration_engagement: 'Collaboration and engagement',
};

export const SPTL_ANALYTICS_BROAD_LABELS: Record<string, string> = {
  understanding_where: 'Understanding where',
  measuring: 'Measuring size, shape, distribution',
  relatedness: 'Determining how places are related',
  best_locations_paths: 'Finding the best locations and paths',
  detecting_patterns: 'Detecting and quantifying patterns',
  making_predictions: 'Making predictions',
};

export const DEV_PRGRM_CYCLE_LABELS: Record<string, string> = {
  understand_situation: 'Understand the situation',
  define_gaps: 'Define gaps and needs',
  design_program: 'Design program',
  monitor_implementation: 'Monitor implementation',
  evaluate_impact: 'Evaluate program impact',
};

export const CAPABILITIES_LABELS: Record<string, string> = {
  mapping: 'Mapping',
  storytelling: 'Storytelling',
  community_engagement: 'Community Engagement',
  analytics_ai: 'Analytics and AI',
  data_management: 'Data Management',
  field_operations: 'Field Operations',
  imagery_drones: 'Imagery, Remote Sensing, and Drones',
  '3d_gis': '3D GIS',
  indoor_gis: 'Indoor GIS',
  real_time: 'Real Time',
};

// SERVICE_TYPE and DATA_TYPE are not in the survey `choices` sheet; they fall back to humanize().

/** Fallback display label: drop underscores and sentence-case a raw code. */
export function humanize(code: string): string {
  const s = code.replace(/_/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Look up a scoped label for a code, falling back to humanize(). */
export function labelFor(code: string, labels?: Record<string, string>): string {
  return labels?.[code] ?? humanize(code);
}

export type ResourceType = (typeof RESOURCE_TYPE)[number];
export type Relevance = (typeof RELEVANCE)[number];
