import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import { buildFeature } from '@shared/buildFeature';
import type { ResourceDraft } from '@shared/draft';

const LAYER_URL = import.meta.env.VITE_LAYER_URL as string;

export interface SubmitResult {
  objectId: number;
  attachmentId?: number;
  screenshotAttached: boolean;
}

function base64ToBlob(b64: string, contentType: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: contentType });
}

/**
 * Client-side write with the signed-in user's token (ADR-0003):
 *   1. applyEdits addFeatures  -> new objectId
 *   2. addAttachment (PNG)     -> thumbnail (authoritative; read by ExB + Sal)  [D6]
 *   3. best-effort patch thumbnailURL = attachment URL
 * A screenshot/attachment failure never fails the submission.
 */
export async function submitResource(
  draft: ResourceDraft,
  thumbnail: { blob: Blob; filename: string } | null,
): Promise<SubmitResult> {
  const layer = new FeatureLayer({ url: LAYER_URL });
  const { attributes, geometry } = buildFeature(draft);

  const graphic = new Graphic({
    attributes,
    geometry: new Point({ x: geometry.x, y: geometry.y, spatialReference: { wkid: 4326 } }),
  });

  const edits = await layer.applyEdits({ addFeatures: [graphic] });
  const addResult = edits.addFeatureResults?.[0];
  if (!addResult || addResult.error) {
    throw new Error(`applyEdits failed: ${addResult?.error?.message ?? 'unknown'}`);
  }
  const objectId = addResult.objectId as number;

  if (!thumbnail) return { objectId, screenshotAttached: false };

  try {
    const form = new FormData();
    form.append('attachment', thumbnail.blob, thumbnail.filename);
    const target = new Graphic({ attributes: { [layer.objectIdField]: objectId } });
    const attach = await layer.addAttachment(target, form);
    const attachmentId = (attach as any)?.objectId as number | undefined;

    // Best-effort: point thumbnailURL at the attachment REST URL (D6).
    if (attachmentId != null) {
      const attachmentUrl = `${LAYER_URL}/${objectId}/attachments/${attachmentId}`;
      const patch = new Graphic({ attributes: { [layer.objectIdField]: objectId, thumbnailURL: attachmentUrl } });
      await layer.applyEdits({ updateFeatures: [patch] }).catch(() => undefined);
    }
    return { objectId, attachmentId, screenshotAttached: true };
  } catch {
    // Attachment failures never fail the submission.
    return { objectId, screenshotAttached: false };
  }
}
