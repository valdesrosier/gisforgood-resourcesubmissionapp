import type { ResourceDraft } from '@shared/draft';
import {
  RESOURCE_TYPE, SERVICE_TYPE, DATA_TYPE, YES_NO, MISSION_SECTOR_BROAD,
  MISSION_SECTOR_HUMANITARIAN, DRM_BROAD, RISK_TYPE, PREPAREDNESS_TYPE, RESPONSE_TYPE,
  RECOVERY_TYPE, HZRD_TYPE, SDG, INFO_MGMNT_PHASE, SPTL_ANALYTICS_BROAD, DEV_PRGRM_CYCLE,
  CAPABILITIES, REGION_GLOBAL,
  RESOURCE_TYPE_LABELS, YES_NO_LABELS, MISSION_SECTOR_BROAD_LABELS,
  MISSION_SECTOR_HUMANITARIAN_LABELS, DRM_BROAD_LABELS, RISK_TYPE_LABELS, PREPAREDNESS_TYPE_LABELS,
  RESPONSE_TYPE_LABELS, RECOVERY_TYPE_LABELS, HZRD_TYPE_LABELS, SDG_LABELS, INFO_MGMNT_PHASE_LABELS,
  SPTL_ANALYTICS_BROAD_LABELS, DEV_PRGRM_CYCLE_LABELS, CAPABILITIES_LABELS,
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
      <p className="sub">Every field below is editable. Nothing is published until you submit.</p>

      <section className="form-section">
        <h3 className="section-title">Basics</h3>
        <TextField label="Resource name" value={d.resource_name} onChange={(v) => set('resource_name', v)} required />
        <TextField label="Resource URL" value={d.resource_url} onChange={(v) => set('resource_url', v)} required />
        <TextField label="Short description (the challenge addressed, not the tools)" value={d.short_desc_2000}
          onChange={(v) => set('short_desc_2000', v)} maxLength={2000} multiline required />
        <TextField label="Organization" value={d.organization} onChange={(v) => set('organization', v)} required />
        <TextField label="Contact name" value={d.contact_name} onChange={(v) => set('contact_name', v)} />
        <TextField label="Contact email" value={d.contact_email} onChange={(v) => set('contact_email', v)} />
        <YearField label="Year of publication" value={d.publication_yr} onChange={(v) => set('publication_yr', v)} />
      </section>

      <section className="form-section">
        <h3 className="section-title">Type &amp; audience</h3>
        <SelectField label="Resource type" value={d.resource_type} options={RESOURCE_TYPE}
          onChange={(v) => set('resource_type', v as any)} required labels={RESOURCE_TYPE_LABELS} />
        <SelectField label="Can this resource be shared publicly?" value={d.public_YN} options={YES_NO}
          onChange={(v) => set('public_YN', v as any)} labels={YES_NO_LABELS} />

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
      </section>

      <section className="form-section">
        <h3 className="section-title">Mission &amp; disaster management</h3>
        <MultiSelectField label="Mission / sectors of work" value={d.mission_sector_broad_type} options={MISSION_SECTOR_BROAD}
          onChange={(v) => set('mission_sector_broad_type', v)} labels={MISSION_SECTOR_BROAD_LABELS} />
        {showsMissionSubset(d, 'humanitarian') && (
          <MultiSelectField label="Humanitarian & disaster-management sectors" value={d.mission_sector_humanitarian}
            options={MISSION_SECTOR_HUMANITARIAN} onChange={(v) => set('mission_sector_humanitarian', v)} labels={MISSION_SECTOR_HUMANITARIAN_LABELS} />
        )}

        {/* DRM */}
        <MultiSelectField label="DRM workflows" value={d.drm_broad_type} options={DRM_BROAD}
          onChange={(v) => set('drm_broad_type', v)} labels={DRM_BROAD_LABELS} />
        {showsDrmSubset(d, 'risk_mitigation') && (
          <MultiSelectField label="Risk mitigation" value={d.risk_type} options={RISK_TYPE} onChange={(v) => set('risk_type', v)} labels={RISK_TYPE_LABELS} />
        )}
        {showsDrmSubset(d, 'preparedness') && (
          <MultiSelectField label="Preparedness, AA, EW" value={d.preparedness_type} options={PREPAREDNESS_TYPE} onChange={(v) => set('preparedness_type', v)} labels={PREPAREDNESS_TYPE_LABELS} />
        )}
        {showsDrmSubset(d, 'response') && (
          <MultiSelectField label="Response" value={d.response_type} options={RESPONSE_TYPE} onChange={(v) => set('response_type', v)} labels={RESPONSE_TYPE_LABELS} />
        )}
        {showsDrmSubset(d, 'recovery') && (
          <MultiSelectField label="Recovery & resilience building" value={d.recovery_type} options={RECOVERY_TYPE} onChange={(v) => set('recovery_type', v)} labels={RECOVERY_TYPE_LABELS} />
        )}
        <MultiSelectField label="Hazard types" value={d.hzrd_type} options={HZRD_TYPE} onChange={(v) => set('hzrd_type', v)} labels={HZRD_TYPE_LABELS} />
      </section>

      <section className="form-section">
        <h3 className="section-title">Frameworks &amp; capabilities</h3>
        <MultiSelectField label="SDGs" value={d.sdg} options={SDG} onChange={(v) => set('sdg', v)} labels={SDG_LABELS} />
        <MultiSelectField label="Information management phase" value={d.info_mgmnt_phase} options={INFO_MGMNT_PHASE} onChange={(v) => set('info_mgmnt_phase', v)} labels={INFO_MGMNT_PHASE_LABELS} />
        <MultiSelectField label="Spatial analytics workflows" value={d.sptl_analytics_broad_type} options={SPTL_ANALYTICS_BROAD} onChange={(v) => set('sptl_analytics_broad_type', v)} labels={SPTL_ANALYTICS_BROAD_LABELS} />
        <MultiSelectField label="Development program cycle" value={d.dev_prgrm_cycle} options={DEV_PRGRM_CYCLE} onChange={(v) => set('dev_prgrm_cycle', v)} labels={DEV_PRGRM_CYCLE_LABELS} />
        <MultiSelectField label="ArcGIS capabilities" value={d.capabilities} options={CAPABILITIES} onChange={(v) => set('capabilities', v)} labels={CAPABILITIES_LABELS} />
      </section>

      <div className="actions">
        <button type="button" className="btn btn--primary btn--lg" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit to catalog →'}
        </button>
      </div>
    </div>
  );
}
