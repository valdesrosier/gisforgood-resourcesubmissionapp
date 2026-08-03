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

    const res = await fetch(`${ENDPOINT}?${query}`);
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`ScreenshotOne ${res.status}: ${detail.slice(0, 300)}`);
    }
    const contentType = res.headers.get('content-type') ?? 'image/png';
    const bytes = Buffer.from(await res.arrayBuffer());
    return { bytes, contentType };
  }
}
