import { describe, it, expect } from "vitest";
import {
  CERTIFICATIONS,
  getAvailableCertifications,
} from "@/constants/certifications";

describe("certification registry", () => {
  it("has unique certification ids", () => {
    const ids = CERTIFICATIONS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("exposes more than one available certification", () => {
    // AWS plus the newly added vendors.
    expect(getAvailableCertifications().length).toBeGreaterThanOrEqual(8);
  });

  describe.each(getAvailableCertifications())("$code — $name", (cert) => {
    it("has at least one domain", () => {
      expect(cert.domains.length).toBeGreaterThan(0);
    });

    it("domain weightages sum to ~100", () => {
      const total = cert.domains.reduce((s, d) => s + d.weightage, 0);
      expect(total).toBeGreaterThanOrEqual(97);
      expect(total).toBeLessThanOrEqual(103);
    });

    it("has unique domain ids and every domain has topics", () => {
      const domainIds = cert.domains.map((d) => d.id);
      expect(new Set(domainIds).size).toBe(domainIds.length);
      for (const d of cert.domains) {
        expect(d.topics.length).toBeGreaterThan(0);
        const topicIds = d.topics.map((t) => t.id);
        expect(new Set(topicIds).size).toBe(topicIds.length);
      }
    });

    it("has sane exam metadata", () => {
      expect(cert.exam.passingScore).toBeLessThanOrEqual(cert.exam.maxScore);
      expect(cert.exam.durationMinutes).toBeGreaterThan(0);
      expect(cert.recommendedHours).toBeGreaterThan(0);
      expect(cert.exam.formats.length).toBeGreaterThan(0);
    });
  });
});
