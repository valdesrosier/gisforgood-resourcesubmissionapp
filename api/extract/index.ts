import type { AzureFunction, Context, HttpRequest } from '@azure/functions';
import OpenAI, { AzureOpenAI } from 'openai';
import { extractionJsonSchema } from '../../shared/extractionSchema';
import { emptyDraft, type ResourceDraft } from '../../shared/draft';
import { keepAllowed, isAllowedSingle } from '../../shared/validate';
import {
  RESOURCE_TYPE, SERVICE_TYPE, DATA_TYPE, YES_NO, MISSION_SECTOR_BROAD,
  MISSION_SECTOR_HUMANITARIAN, DRM_BROAD, RISK_TYPE, PREPAREDNESS_TYPE, RESPONSE_TYPE,
  RECOVERY_TYPE, HZRD_TYPE, SDG, INFO_MGMNT_PHASE, SPTL_ANALYTICS_BROAD, DEV_PRGRM_CYCLE,
  CAPABILITIES,
} from '../../shared/codes';

/** Strip HTML to readable-ish text and cap length for the model. */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20000);
}

const MULTI_FIELDS: Array<[keyof ResourceDraft, readonly string[]]> = [
  ['data_type', DATA_TYPE], ['mission_sector_broad_type', MISSION_SECTOR_BROAD],
  ['mission_sector_humanitarian', MISSION_SECTOR_HUMANITARIAN], ['drm_broad_type', DRM_BROAD],
  ['risk_type', RISK_TYPE], ['preparedness_type', PREPAREDNESS_TYPE], ['response_type', RESPONSE_TYPE],
  ['recovery_type', RECOVERY_TYPE], ['hzrd_type', HZRD_TYPE], ['sdg', SDG],
  ['info_mgmnt_phase', INFO_MGMNT_PHASE], ['sptl_analytics_broad_type', SPTL_ANALYTICS_BROAD],
  ['dev_prgrm_cycle', DEV_PRGRM_CYCLE], ['capabilities', CAPABILITIES],
];

/** Re-validate every controlled-vocab code server-side, regardless of strict mode. */
function sanitize(raw: any, context: Context): ResourceDraft {
  const d = { ...emptyDraft(), ...raw } as ResourceDraft;
  if (!isAllowedSingle(d.resource_type, RESOURCE_TYPE)) d.resource_type = null;
  if (!isAllowedSingle(d.service_type, SERVICE_TYPE)) d.service_type = null;
  if (!isAllowedSingle(d.public_YN, YES_NO)) d.public_YN = null;
  for (const [field, allowed] of MULTI_FIELDS) {
    const { value, dropped } = keepAllowed(d[field] as string[] | null, allowed);
    (d as any)[field] = value.length ? value : null;
    if (dropped.length) context.log.warn(`extract: dropped off-list codes for ${String(field)}: ${dropped.join(',')}`);
  }
  return d;
}

const SYSTEM_PROMPT = `You extract catalog metadata for the "GIS for Good" resource library from a web page's text.
Return one JSON object matching the schema. Rules:
- Use only the exact codes provided by the schema enums for controlled fields; never invent codes.
- Anything you cannot determine from the page must be null (or an empty array for multi-selects).
- short_desc_2000: describe the CHALLENGE the resource addresses, not the tools it uses. Max 2000 chars.
- region_country: the single most relevant country name, or "Global or relevant to several regions" if global/multi/unknown.
- publication_yr: a 4-digit year integer if clearly stated, else null.`;

const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest): Promise<void> => {
  const url: string | undefined = req.body?.url;
  if (!url || !/^https?:\/\//i.test(url)) {
    context.res = { status: 400, body: { error: 'A valid http(s) url is required.' } };
    return;
  }

  let text: string;
  try {
    const page = await fetch(url, { headers: { 'User-Agent': 'GIS4Good-ResourceBot/0.1' } });
    if (!page.ok) throw new Error(`fetch ${page.status}`);
    text = htmlToText(await page.text());
  } catch (err) {
    context.log.error('extract: page fetch failed', err);
    context.res = { status: 502, body: { error: 'Could not fetch the page.' } };
    return;
  }

  try {
    // Use Azure OpenAI when an Azure endpoint is configured; otherwise the OpenAI platform.
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const model = process.env.OPENAI_MODEL || process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';
    const client = azureEndpoint
      ? new AzureOpenAI({
          endpoint: azureEndpoint,
          apiKey: process.env.OPENAI_API_KEY,
          apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-10-21',
          deployment: process.env.AZURE_OPENAI_DEPLOYMENT || model,
        })
      : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `URL: ${url}\n\nPAGE TEXT:\n${text}` },
      ],
      response_format: { type: 'json_schema', json_schema: extractionJsonSchema as any },
    });
    const parsed = JSON.parse(completion.choices[0]?.message?.content ?? '{}');
    const draft = sanitize(parsed, context);

    draft.resource_url = draft.resource_url || url;
    draft.contact_name = draft.contact_name || process.env.CONTACT_FALLBACK_NAME || null;
    draft.contact_email = draft.contact_email || process.env.CONTACT_FALLBACK_EMAIL || null;

    context.res = { status: 200, body: { draft } };
  } catch (err) {
    context.log.error('extract: OpenAI call failed', err);
    context.res = { status: 502, body: { error: 'Extraction failed.' } };
  }
};

export default httpTrigger;
