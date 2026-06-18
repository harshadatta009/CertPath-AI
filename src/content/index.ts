import type { ContentPack } from "./types";
import { awsSaaC03Pack } from "./aws-saa-c03";

/**
 * Registry of community-reviewed content packs. To contribute content for a new
 * certification, add a pack file and register it here (see docs/CONTENT.md).
 */
export const CONTENT_PACKS: ContentPack[] = [awsSaaC03Pack];

const byCert = new Map(CONTENT_PACKS.map((p) => [p.certificationId, p]));

export function getContentPack(certificationId: string): ContentPack | undefined {
  return byCert.get(certificationId);
}

export type { ContentPack } from "./types";
