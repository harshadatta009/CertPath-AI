import { PdfBuilder } from "@/lib/pdf";
import type { CertificationConfig } from "@/types/certification";
import type { RevisionPlan } from "@/types";

/** Format a minute count as "3h 20m" / "45m". */
function formatMinutes(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Export a revision plan to a structured PDF: a summary paragraph, each revision
 * item as a subheading with its key points as bullets, and the exam-day
 * checklist rendered as a bulleted list.
 */
export function exportRevisionPdf(
  cert: CertificationConfig,
  plan: RevisionPlan,
): void {
  const domainName = (domainId: string): string =>
    cert.domains.find((d) => d.id === domainId)?.name ?? domainId;

  const pdf = new PdfBuilder(plan.title, `${cert.name} (${cert.code})`);

  pdf.paragraph(plan.summary);

  if (plan.items.length > 0) {
    pdf.line();
    pdf.heading("Revision Plan");
    for (const item of plan.items) {
      pdf.subheading(
        `${item.topic} — ${domainName(item.domainId)} (${formatMinutes(item.estimatedMinutes)})`,
      );
      if (item.keyPoints.length > 0) {
        pdf.bullets(item.keyPoints);
      }
    }
  }

  if (plan.examDayChecklist.length > 0) {
    pdf.line();
    pdf.heading("Exam-Day Checklist");
    pdf.bullets(plan.examDayChecklist);
  }

  pdf.save(`revision-${plan.window}-${cert.code.toLowerCase()}`);
}
