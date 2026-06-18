import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Client-side PDF generation helpers. A thin fluent wrapper over jsPDF so each
 * feature can export its content without duplicating layout code.
 */
export class PdfBuilder {
  private doc: jsPDF;
  private y = 20;
  private readonly margin = 14;
  private readonly pageWidth: number;
  private readonly pageHeight: number;

  constructor(title: string, subtitle?: string) {
    this.doc = new jsPDF({ unit: "mm", format: "a4" });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(20);
    this.doc.text(title, this.margin, this.y);
    this.y += 8;
    if (subtitle) {
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(11);
      this.doc.setTextColor(120);
      this.doc.text(subtitle, this.margin, this.y);
      this.doc.setTextColor(0);
      this.y += 8;
    }
    this.line();
  }

  private ensureSpace(needed: number) {
    if (this.y + needed > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.y = 20;
    }
  }

  line() {
    this.doc.setDrawColor(220);
    this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
    this.y += 6;
    return this;
  }

  heading(text: string) {
    this.ensureSpace(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(14);
    this.doc.text(text, this.margin, this.y);
    this.y += 7;
    return this;
  }

  subheading(text: string) {
    this.ensureSpace(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.text(text, this.margin, this.y);
    this.y += 6;
    return this;
  }

  paragraph(text: string) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    const lines = this.doc.splitTextToSize(text, this.pageWidth - this.margin * 2);
    for (const l of lines) {
      this.ensureSpace(6);
      this.doc.text(l, this.margin, this.y);
      this.y += 5;
    }
    this.y += 2;
    return this;
  }

  bullets(items: string[]) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    for (const item of items) {
      const lines = this.doc.splitTextToSize(item, this.pageWidth - this.margin * 2 - 4);
      this.ensureSpace(lines.length * 5);
      this.doc.text("•", this.margin, this.y);
      this.doc.text(lines, this.margin + 4, this.y);
      this.y += lines.length * 5 + 1;
    }
    this.y += 2;
    return this;
  }

  table(headers: string[], rows: string[][]) {
    autoTable(this.doc, {
      head: [headers],
      body: rows,
      startY: this.y,
      margin: { left: this.margin, right: this.margin },
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229] },
    });
    // @ts-expect-error lastAutoTable is attached by the plugin
    this.y = (this.doc.lastAutoTable?.finalY ?? this.y) + 8;
    return this;
  }

  save(filename: string) {
    this.doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  }
}
