/**
 * Survey123 stores select_multiple fields as comma-joined codes with NO spaces
 * (verified against live catalog records, e.g. "sdg_3,sdg_16").
 * This delimiter is the single source of truth for encode/decode.
 */
export const MULTI_DELIMITER = ',';

/** Join selected codes into the stored string. Empty -> null (leave the field unset). */
export function encodeMulti(codes: readonly string[] | null | undefined): string | null {
  if (!codes || codes.length === 0) return null;
  return codes.join(MULTI_DELIMITER);
}

/** Split a stored multi-select string back into codes. */
export function decodeMulti(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(MULTI_DELIMITER).map((c) => c.trim()).filter(Boolean);
}
