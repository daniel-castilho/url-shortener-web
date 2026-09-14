import type { UpdateLinkRequest, UtmParams } from "./api";

export type EditableLinkFields = {
  title: string;
  tags: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  expiresAt: string;
};

export function buildPatch(fields: EditableLinkFields): UpdateLinkRequest {
  const patch: UpdateLinkRequest = {};
  if (fields.title) patch.title = fields.title;
  if (fields.tags) {
    const tags = fields.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tags.length > 0) patch.tags = tags;
  }
  const utm: UtmParams = {};
  if (fields.utmSource) utm.source = fields.utmSource;
  if (fields.utmMedium) utm.medium = fields.utmMedium;
  if (fields.utmCampaign) utm.campaign = fields.utmCampaign;
  if (fields.utmTerm) utm.term = fields.utmTerm;
  if (fields.utmContent) utm.content = fields.utmContent;
  if (Object.keys(utm).length > 0) patch.utm = utm;
  if (fields.expiresAt) patch.expiresAt = fields.expiresAt;
  return patch;
}
