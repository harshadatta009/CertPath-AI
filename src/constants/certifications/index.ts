import type { CertificationConfig } from "@/types";
import { awsSaaC03 } from "./aws-saa";
import {
  azureAz104,
  gcpAce,
  cka,
  ckad,
  terraformAssociate,
  rhcsa,
  comptiaSecurityPlus,
} from "./placeholders";

/**
 * Central certification registry.
 *
 * To add a certification: create its config file, import it here, and add it to
 * the array below. The entire app (picker, roadmap engine, analytics, content
 * engines) reads from this registry — nothing else needs to change.
 */
export const CERTIFICATIONS: CertificationConfig[] = [
  awsSaaC03,
  azureAz104,
  gcpAce,
  cka,
  ckad,
  terraformAssociate,
  rhcsa,
  comptiaSecurityPlus,
];

const byId = new Map(CERTIFICATIONS.map((c) => [c.id, c]));

export function getCertification(id: string): CertificationConfig | undefined {
  return byId.get(id);
}

export function getCertificationOrThrow(id: string): CertificationConfig {
  const cert = byId.get(id);
  if (!cert) throw new Error(`Unknown certification: ${id}`);
  return cert;
}

export function getAvailableCertifications(): CertificationConfig[] {
  return CERTIFICATIONS.filter((c) => c.available);
}

export const DEFAULT_CERTIFICATION_ID = awsSaaC03.id;
