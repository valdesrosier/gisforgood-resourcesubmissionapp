import type { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { ScreenshotOneProvider } from './screenshotProvider';

/**
 * POST { url } -> { image: base64, contentType } so the client can feed addAttachment.
 * A screenshot failure returns 200 with { image: null, error } — the review form falls back to a
 * manual upload; a screenshot problem must NEVER block submission.
 */
const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest): Promise<void> => {
  const url: string | undefined = req.body?.url;
  if (!url || !/^https?:\/\//i.test(url)) {
    context.res = { status: 400, jsonBody: { error: 'A valid http(s) url is required.' } };
    return;
  }

  const accessKey = process.env.SCREENSHOTONE_ACCESS_KEY;
  if (!accessKey) {
    context.res = { status: 200, jsonBody: { image: null, error: 'Screenshot provider not configured.' } };
    return;
  }

  const provider = new ScreenshotOneProvider(accessKey, process.env.SCREENSHOTONE_SIGNING_SECRET || undefined);
  try {
    const { bytes, contentType } = await provider.capture(url);
    context.res = { status: 200, jsonBody: { image: bytes.toString('base64'), contentType } };
  } catch (err: any) {
    context.log.warn('screenshot: capture failed (non-fatal)', err?.message ?? err);
    context.res = { status: 200, jsonBody: { image: null, error: 'Screenshot capture failed.' } };
  }
};

export default httpTrigger;
