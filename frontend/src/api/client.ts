import type { ResourceDraft } from '@shared/draft';

/** Call /api/extract to auto-draft fields from a resource URL. */
export async function extractDraft(url: string): Promise<ResourceDraft> {
  const res = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(`extract failed: ${res.status}`);
  const { draft } = await res.json();
  return draft as ResourceDraft;
}

export interface ScreenshotResponse {
  image: string | null; // base64 PNG, or null on failure
  contentType?: string;
  error?: string;
}

/** Call /api/screenshot to capture a thumbnail. Never throws for a capture failure. */
export async function captureScreenshot(url: string): Promise<ScreenshotResponse> {
  try {
    const res = await fetch('/api/screenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return { image: null, error: `screenshot ${res.status}` };
    return (await res.json()) as ScreenshotResponse;
  } catch (err: any) {
    return { image: null, error: err?.message ?? 'screenshot failed' };
  }
}
