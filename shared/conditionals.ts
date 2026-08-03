/**
 * Conditional visibility rules for the review form. A field/group is shown only when its
 * predicate over the current draft is true. Keep this declarative so the form and the
 * write path agree on what is relevant.
 */
import type { ResourceDraft } from './draft';

export const isInspirationOrOpService = (d: ResourceDraft) =>
  d.resource_type === 'inspiration' || d.resource_type === 'op_service';

export const isOpService = (d: ResourceDraft) => d.resource_type === 'op_service';

/** op_service `data_type` is only relevant when the service is a data source. */
export const showsDataType = (d: ResourceDraft) => isOpService(d) && d.service_type === 'data_source';

/** A broad-type subset is shown when its parent code is selected in the broad-type field. */
export const showsMissionSubset = (d: ResourceDraft, sector: string) =>
  (d.mission_sector_broad_type ?? []).includes(sector);

export const showsDrmSubset = (d: ResourceDraft, workflow: string) =>
  (d.drm_broad_type ?? []).includes(workflow);

/** region_country is only relevant for inspiration / op_service resources. */
export const showsRegionCountry = isInspirationOrOpService;
