import { PdfBuilder } from "@/lib/pdf";
import type { CertificationConfig } from "@/types/certification";
import type { CheatSheet } from "@/types";

/**
 * Export a cheat sheet to a nicely structured PDF. Definition and architecture
 * render as paragraphs; the string[] arrays become bulleted lists under
 * subheadings; comparison tables are rendered via the PdfBuilder table helper.
 */
export function exportCheatSheetPdf(
  cert: CertificationConfig,
  sheet: CheatSheet,
): void {
  const pdf = new PdfBuilder(sheet.topic, `${cert.name} (${cert.code})`);

  pdf.heading("Definition");
  pdf.paragraph(sheet.definition);

  if (sheet.architecture.trim().length > 0) {
    pdf.heading("Architecture");
    pdf.paragraph(sheet.architecture);
  }

  const bulletBlock = (title: string, items: string[]) => {
    if (items.length === 0) return;
    pdf.subheading(title);
    pdf.bullets(items);
  };

  bulletBlock("Use Cases", sheet.useCases);
  bulletBlock("Best Practices", sheet.bestPractices);
  bulletBlock("Common Mistakes", sheet.commonMistakes);
  bulletBlock("Exam Tips", sheet.examTips);
  bulletBlock("Interview Tips", sheet.interviewTips);

  if (sheet.comparisonTables.length > 0) {
    pdf.line();
    pdf.heading("Comparisons");
    for (const table of sheet.comparisonTables) {
      pdf.subheading(table.title);
      pdf.table(table.headers, table.rows);
    }
  }

  if (sheet.sections.length > 0) {
    pdf.line();
    for (const section of sheet.sections) {
      pdf.subheading(section.heading);
      pdf.paragraph(section.body);
    }
  }

  const slug = sheet.topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  pdf.save(`cheatsheet-${slug || sheet.id}`);
}
