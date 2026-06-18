import { format, parseISO } from "date-fns";
import { PdfBuilder } from "@/lib/pdf";
import type { Roadmap } from "@/types";

/** Export a full roadmap to a downloadable PDF. */
export function exportRoadmapPdf(roadmap: Roadmap) {
  const pdf = new PdfBuilder(roadmap.title, roadmap.summary);
  const sortedDays = roadmap.days.slice().sort((a, b) => a.dayNumber - b.dayNumber);

  let currentWeek = -1;
  for (const day of sortedDays) {
    if (day.weekNumber !== currentWeek) {
      currentWeek = day.weekNumber;
      pdf.heading(`Week ${day.weekNumber}`);
    }
    pdf.subheading(
      `Day ${day.dayNumber} — ${day.title} (${format(parseISO(day.date), "MMM d")}, ${day.estimatedHours}h)`,
    );
    if (day.topics.length) pdf.paragraph(`Topics: ${day.topics.join(", ")}`);
    if (day.objectives.length) pdf.bullets(day.objectives);
    if (day.labs.length) pdf.paragraph(`Labs: ${day.labs.map((l) => l.title).join("; ")}`);
    if (day.examTips.length) pdf.paragraph(`Exam tips: ${day.examTips.join(" ")}`);
  }

  pdf.save(`${roadmap.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`);
}
