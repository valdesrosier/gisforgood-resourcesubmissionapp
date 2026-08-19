import { createHmac } from 'crypto';

/**
 * Thin, swappable screenshot provider interface. ScreenshotOne is the only implementation now.
 * Returns raw image bytes + content type so the client can feed addAttachment directly.
 */
export interface ScreenshotResult {
  bytes: Buffer;
  contentType: string;
}

export interface ScreenshotProvider {
  capture(targetUrl: string): Promise<ScreenshotResult>;
}

const ENDPOINT = 'https://api.screenshotone.com/take';
const RESPONSE_BYTE_LIMIT = 10 * 1024 * 1024;

/**
 * Parameter names verified against https://screenshotone.com/docs/options (2026-08).
 * Viewport capture (NOT full_page), 1200x630 thumbnail, png, ad/cookie/chat blocking, cache on.
 * Signed requests are GET-only: HMAC-SHA256 of the query string, appended as `signature`.
 */
export class ScreenshotOneProvider implements ScreenshotProvider {
  constructor(
    private accessKey: string,
    private signingSecret?: string,
  ) {}

  async capture(targetUrl: string): Promise<ScreenshotResult> {
    const params = new URLSearchParams({
      access_key: this.accessKey,
      url: targetUrl,
      format: 'png',
      viewport_width: '1200',
      viewport_height: '630',
      full_page: 'false',
      block_ads: 'true',
      block_cookie_banners: 'true',
      block_chats: 'true',
      cache: 'true',
      wait_until: 'networkidle2',
      timeout: '60',
    });

    let query = params.toString();
    if (this.signingSecret) {
      const signature = createHmac('sha256', this.signingSecret).update(query).digest('hex');
      query += `&signature=${signature}`;
    }

    const res = await fetch(`${ENDPOINT}?${query}`, { signal: AbortSignal.timeout(65_000) });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`ScreenshotOne ${res.status}: ${detail.slice(0, 300)}`);
    }
    const declaredSize = Number.parseInt(res.headers.get('content-length') || '', 10);
    if (Number.isFinite(declaredSize) && declaredSize > RESPONSE_BYTE_LIMIT) {
      throw new Error('ScreenshotOne response is too large');
    }
    if (!res.body) throw new Error('ScreenshotOne returned an empty response');
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of res.body) {
      const bytes = Buffer.from(chunk);
      size += bytes.length;
      if (size > RESPONSE_BYTE_LIMIT) throw new Error('ScreenshotOne response is too large');
      chunks.push(bytes);
    }
    const contentType = res.headers.get('content-type') ?? 'image/png';
    const bytes = Buffer.concat(chunks);
    return { bytes, contentType };
  }
}
