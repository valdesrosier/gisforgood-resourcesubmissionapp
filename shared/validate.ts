/**
 * Server-side re-validation of controlled-vocab codes before any write (defence in depth,
 * even though the LLM uses strict enums). Drops any code not in the allowed list and reports
 * what was dropped so the caller can log/surface it.
 */
export interface ValidationResult<T> {
  value: T;
  dropped: string[];
}

export function keepAllowed(
  codes: readonly string[] | null | undefined,
  allowed: readonly string[],
): ValidationResult<string[]> {
  const set = new Set(allowed);
  const value: string[] = [];
  const dropped: string[] = [];
  for (const c of codes ?? []) {
    if (set.has(c)) value.push(c);
    else dropped.push(c);
  }
  return { value, dropped };
}

export function isAllowedSingle(
  code: string | null | undefined,
  allowed: readonly string[],
): boolean {
  return code != null && allowed.includes(code);
}
