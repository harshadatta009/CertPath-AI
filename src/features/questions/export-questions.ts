import { PdfBuilder } from "@/lib/pdf";
import type { CertificationConfig, ExamQuestion } from "@/types";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Export all practice questions (with answers + explanations) to a PDF. */
export function exportQuestionsPdf(cert: CertificationConfig, questions: ExamQuestion[]) {
  const pdf = new PdfBuilder(
    `${cert.name} — Practice Questions`,
    `${cert.code} · ${questions.length} question${questions.length === 1 ? "" : "s"}`,
  );

  questions.forEach((q, index) => {
    pdf.subheading(`Q${index + 1}. ${q.question}`);

    pdf.bullets(
      q.options.map((opt, i) => `${LETTERS[i] ?? "?"}. ${opt.text}`),
    );

    const answerLetters = q.options
      .map((opt, i) => (q.correctOptionIds.includes(opt.id) ? LETTERS[i] ?? "?" : null))
      .filter((l): l is string => l !== null);

    pdf.paragraph(`Answer: ${answerLetters.join(", ") || "—"}`);
    if (q.explanation) pdf.paragraph(`Explanation: ${q.explanation}`);
    pdf.line();
  });

  const slug = `${cert.code}-practice-questions`.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  pdf.save(slug);
}
