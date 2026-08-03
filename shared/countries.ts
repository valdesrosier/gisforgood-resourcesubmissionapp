import { REGION_GLOBAL } from './codes';

/**
 * Country -> centroid (lon/lat, WGS84) lookup for feature geometry (ADR-0002).
 * This is a STARTER table derived from Esri World Countries Centroids. Extend as needed;
 * unmatched names and the global value fall back to {0,0}.
 *
 * TODO: replace with a complete bundled table (all countries) generated from the World
 * Countries Centroids service before production use.
 */
export interface Point { x: number; y: number }

const CENTROIDS: Record<string, Point> = {
  lebanon: { x: 35.8892, y: 33.9232 },
  tanzania: { x: 34.8139, y: -6.2918 },
  india: { x: 79.6047, y: 23.2367 },
  'palestinian territory': { x: 35.2565, y: 31.9482 },
  bangladesh: { x: 90.2489, y: 23.8931 },
  // … extend with the full country set …
};

function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Resolve a country name (or the global value) to a point. Unknown/global -> {0,0}. */
export function centroidFor(regionCountry: string | null | undefined): Point {
  if (!regionCountry || normalize(regionCountry) === normalize(REGION_GLOBAL)) {
    return { x: 0, y: 0 };
  }
  return CENTROIDS[normalize(regionCountry)] ?? { x: 0, y: 0 };
}

export function isKnownCountry(name: string): boolean {
  return normalize(name) in CENTROIDS;
}
