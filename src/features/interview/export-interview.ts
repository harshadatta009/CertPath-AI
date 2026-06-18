import { PdfBuilder } from "@/lib/pdf";
import type {
  CertificationConfig,
  InterviewCategory,
  InterviewQuestion,
} from "@/types";

const CATEGORY_LABELS: Record<InterviewCategory, string> = {
  technical: "Technical",
  "system-design": "System Design",
  behavioral: "Behavioral",
  scenario: "Scenario",
};

const CATEGORY_ORDER: InterviewCategory[] = [
  "technical",
  "system-design",
  "behavioral",
  "scenario",
];

/** Export interview prep questions to a PDF, grouped by category. */
export function exportInterviewPdf(
  cert: CertificationConfig,
  questions: InterviewQuestion[],
) {
  const pdf = new PdfBuilder(
    `${cert.name} — Interview Preparation`,
    `${cert.code} · ${questions.length} question${
      questions.length === 1 ? "" : "s"
    }`,
  );

  for (const category of CATEGORY_ORDER) {
    const group = questions.filter((q) => q.category === category);
    if (group.length === 0) continue;

    pdf.heading(`${CATEGORY_LABELS[category]} (${group.length})`);

    group.forEach((q, index) => {
      pdf.subheading(`Q${index + 1}. ${q.question}  [${q.level}]`);
      pdf.paragraph(q.answer);
      if (q.followUps.length > 0) {
        pdf.paragraph("Follow-up questions:");
        pdf.bullets(q.followUps);
      }
      pdf.line();
    });
  }

  const slug = `${cert.code}-interview-prep`
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase();
  pdf.save(slug);
}
