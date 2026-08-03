/**
 * JSON Schema for OpenAI Structured Outputs. Controlled-vocab fields are typed as enums (or
 * arrays of enums) so the model cannot emit an off-list code; free text is nullable. The
 * Function re-validates every code server-side regardless (validate.ts).
 *
 * Note: with `strict: true`, every property must be listed in `required`; use `null` for
 * "not found". Multi-selects are arrays (joined to comma strings only at write time).
 */
import {
  RESOURCE_TYPE, SERVICE_TYPE, DATA_TYPE, YES_NO, MISSION_SECTOR_BROAD,
  MISSION_SECTOR_HUMANITARIAN, DRM_BROAD, RISK_TYPE, PREPAREDNESS_TYPE, RESPONSE_TYPE,
  RECOVERY_TYPE, HZRD_TYPE, SDG, INFO_MGMNT_PHASE, SPTL_ANALYTICS_BROAD, DEV_PRGRM_CYCLE,
  CAPABILITIES,
} from './codes';

const arr = (codes: readonly string[]) => ({ type: 'array', items: { type: 'string', enum: [...codes] } });
const nstr = { type: ['string', 'null'] } as const;

const properties = {
  resource_name: nstr,
  resource_url: nstr,
  short_desc_2000: { type: ['string', 'null'], maxLength: 2000 },
  organization: nstr,
  contact_name: nstr,
  contact_email: nstr,
  publication_yr: { type: ['integer', 'null'] },
  resource_type: { type: ['string', 'null'], enum: [...RESOURCE_TYPE, null] },
  region_country: nstr, // country name or the global value; validated app-side
  public_YN: { type: ['string', 'null'], enum: [...YES_NO, null] },
  service_type: { type: ['string', 'null'], enum: [...SERVICE_TYPE, null] },
  data_type: arr(DATA_TYPE),
  mission_sector_broad_type: arr(MISSION_SECTOR_BROAD),
  mission_sector_humanitarian: arr(MISSION_SECTOR_HUMANITARIAN),
  drm_broad_type: arr(DRM_BROAD),
  risk_type: arr(RISK_TYPE),
  preparedness_type: arr(PREPAREDNESS_TYPE),
  response_type: arr(RESPONSE_TYPE),
  recovery_type: arr(RECOVERY_TYPE),
  hzrd_type: arr(HZRD_TYPE),
  sdg: arr(SDG),
  info_mgmnt_phase: arr(INFO_MGMNT_PHASE),
  sptl_analytics_broad_type: arr(SPTL_ANALYTICS_BROAD),
  dev_prgrm_cycle: arr(DEV_PRGRM_CYCLE),
  capabilities: arr(CAPABILITIES),
} as const;

export const extractionJsonSchema = {
  name: 'resource_draft',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: Object.keys(properties),
    properties,
  },
};
