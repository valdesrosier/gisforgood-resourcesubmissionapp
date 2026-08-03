import React from 'react';
import type { ResourceDraft } from '@shared/draft';
import {
  RESOURCE_TYPE, SERVICE_TYPE, DATA_TYPE, YES_NO, MISSION_SECTOR_BROAD,
  MISSION_SECTOR_HUMANITARIAN, DRM_BROAD, RISK_TYPE, PREPAREDNESS_TYPE, RESPONSE_TYPE,
  RECOVERY_TYPE, HZRD_TYPE, SDG, INFO_MGMNT_PHASE, SPTL_ANALYTICS_BROAD, DEV_PRGRM_CYCLE,
  CAPABILITIES, REGION_GLOBAL,
} from '@shared/codes';
import { showsRegionCountry, showsDataType, showsMissionSubset, showsDrmSubset } from '@shared/conditionals';
import { TextField, YearField, SelectField, MultiSelectField } from './fields';

/**
 * Pre-filled, fully editable review form. Every extracted value is editable; nothing is written
 * until the contributor confirms. Conditional groups follow shared/conditionals so the form and
 * the write path agree on what is relevant. Uses onChange/onClick only — no <form> tag.
 *
 * Representative fields are wired here; remaining single-taxonomy multi-selects (preparedness_type,
 * response_type, recovery_type) follow the identical MultiSelectField + conditional pattern.
 */
export function ReviewForm(props: {
  draft: ResourceDraft;
  onChange: (patch: Partial<ResourceDraft>) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const { draft: d, onChange, onSubmit, submitting } = props;
  const set = <K extends keyof ResourceDraft>(k: K, v: ResourceDraft[K]) => onChange({ [k]: v } as Partial<ResourceDraft>);

  return (
    <div>
      <h2>Review &amp; edit</h2>

      <TextField label="Resource name" value={d.resource_name} onChange={(v) => set('resource_name', v)} required />
      <TextField label="Resource URL" value={d.resource_url} onChange={(v) => set('resource_url', v)} required />
      <TextField label="Short description (the challenge addressed, not the tools)" value={d.short_desc_2000}
        onChange={(v) => set('short_desc_2000', v)} maxLength={2000} multiline required />
      <TextField label="Organization" value={d.organization} onChange={(v) => set('organization', v)} required />
      <TextField label="Contact name" value={d.contact_name} onChange={(v) => set('contact_name', v)} />
      <TextField label="Contact email" value={d.contact_email} onChange={(v) => set('contact_email', v)} />
      <YearField label="Year of publication" value={d.publication_yr} onChange={(v) => set('publication_yr', v)} />

      <SelectField label="Resource type" value={d.resource_type} options={RESOURCE_TYPE}
        onChange={(v) => set('resource_type', v as any)} required />
      <SelectField label="Can this resource be shared publicly?" value={d.public_YN} options={YES_NO}
        onChange={(v) => set('public_YN', v as any)} />

      {showsRegionCountry(d) && (
        <TextField label={`Region / country of relevance (a country name, or "${REGION_GLOBAL}")`}
          value={d.region_country} onChange={(v) => set('region_country', v)} />
      )}

      {/* op_service extras */}
      {d.resource_type === 'op_service' && (
        <SelectField label="Type of operational service" value={d.service_type} options={SERVICE_TYPE}
          onChange={(v) => set('service_type', v as any)} />
      )}
      {showsDataType(d) && (
        <MultiSelectField label="Data / information categories" value={d.data_type} options={DATA_TYPE}
          onChange={(v) => set('data_type', v)} />
      )}

      {/* Mission / sector */}
      <MultiSelectField label="Mission / sectors of work" value={d.mission_sector_broad_type} options={MISSION_SECTOR_BROAD}
        onChange={(v) => set('mission_sector_broad_type', v)} />
      {showsMissionSubset(d, 'humanitarian') && (
        <MultiSelectField label="Humanitarian & disaster-management sectors" value={d.mission_sector_humanitarian}
          options={MISSION_SECTOR_HUMANITARIAN} onChange={(v) => set('mission_sector_humanitarian', v)} />
      )}

      {/* DRM */}
      <MultiSelectField label="DRM workflows" value={d.drm_broad_type} options={DRM_BROAD}
        onChange={(v) => set('drm_broad_type', v)} />
      {showsDrmSubset(d, 'risk_mitigation') && (
        <MultiSelectField label="Risk mitigation" value={d.risk_type} options={RISK_TYPE} onChange={(v) => set('risk_type', v)} />
      )}
      {showsDrmSubset(d, 'preparedness') && (
        <MultiSelectField label="Preparedness, AA, EW" value={d.preparedness_type} options={PREPAREDNESS_TYPE} onChange={(v) => set('preparedness_type', v)} />
      )}
      {showsDrmSubset(d, 'response') && (
        <MultiSelectField label="Response" value={d.response_type} options={RESPONSE_TYPE} onChange={(v) => set('response_type', v)} />
      )}
      {showsDrmSubset(d, 'recovery') && (
        <MultiSelectField label="Recovery & resilience building" value={d.recovery_type} options={RECOVERY_TYPE} onChange={(v) => set('recovery_type', v)} />
      )}

      <MultiSelectField label="Hazard types" value={d.hzrd_type} options={HZRD_TYPE} onChange={(v) => set('hzrd_type', v)} />
      <MultiSelectField label="SDGs" value={d.sdg} options={SDG} onChange={(v) => set('sdg', v)} />
      <MultiSelectField label="Information management phase" value={d.info_mgmnt_phase} options={INFO_MGMNT_PHASE} onChange={(v) => set('info_mgmnt_phase', v)} />
      <MultiSelectField label="Spatial analytics workflows" value={d.sptl_analytics_broad_type} options={SPTL_ANALYTICS_BROAD} onChange={(v) => set('sptl_analytics_broad_type', v)} />
      <MultiSelectField label="Development program cycle" value={d.dev_prgrm_cycle} options={DEV_PRGRM_CYCLE} onChange={(v) => set('dev_prgrm_cycle', v)} />
      <MultiSelectField label="ArcGIS capabilities" value={d.capabilities} options={CAPABILITIES} onChange={(v) => set('capabilities', v)} />

      <button type="button" onClick={onSubmit} disabled={submitting} style={{ marginTop: 16, padding: '10px 18px' }}>
        {submitting ? 'Submitting…' : 'Submit to catalog'}
      </button>
    </div>
  );
}
