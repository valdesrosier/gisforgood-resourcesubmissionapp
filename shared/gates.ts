import { RELEVANCE, type Relevance } from './codes';

/**
 * Derive a relevance gate (`*_rlvnce`) from whether its subset has any selections.
 * D2: `select_own` when the subset is populated, else `none`. We never emit `all`.
 * (`hum_sector_rlvnce` is intentionally left null — it is unused in live data.)
 */
export function deriveGate(subset: readonly string[] | null | undefined): Relevance {
  return subset && subset.length > 0 ? 'select_own' : 'none';
}

export const RELEVANCE_CODES = RELEVANCE;
