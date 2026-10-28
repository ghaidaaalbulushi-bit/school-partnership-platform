'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import type { ReportRow } from '@/types/database';

const FIELD_LABELS: { key: keyof ReportRow; label: string }[] = [
  { key: 'introduction', label: 'مقدمة' },
  { key: 'initiative_description', label: 'وصف المبادرة' },
  { key: 'goals', label: 'الأهداف' },
  { key: 'target_group', label: 'الفئة المستهدفة' },
  { key: 'participating_parties', label: 'الجهات المشاركة' },
  { key: 'execution_mechanism', label: 'آلية التنفيذ' },
  { key: 'results_achievements', label: 'النتائج والإنجازات' },
  { key: 'impact_measurement', label: 'قياس الأثر' },
  { key: 'recommendations', label: 'التوصيات' },
];

export function ReportExportButtons({ report }: { report: ReportRow }) {
  const [loading, setLoading] = useState<'pdf' | 'docx' | null>(null);

  async function exportPdf() {
    setLoading('pdf');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      // jsPDF has no built-in Arabic shaping/RTL support without a custom
      // font + bidi pass, which is beyond a client-only quick export. For a
      // print-ready Arabic PDF, prefer "طباعة الصفحة" in the browser (the
      // report page is laid out RTL already) or extend this with an
      // Arabic-capable font + amiri/cairo TTF embedded as base64.
      doc.setFont('helvetica');
      doc.setFontSize(14);
      doc.text(report.title, 10, 15);
      let y = 25;
      for (const { key, label } of FIELD_LABELS) {
        const value = report[key];
        if (!value) continue;
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(`${label}: ${String(value)}`, 190);
        doc.text(lines, 10, y);
        y += lines.length * 6 + 4;
        if (y > 280) {
          doc.addPage();
          y = 15;
        }
      }
      doc.save(`${report.title}.pdf`);
    } finally {
      setLoading(null);
    }
  }

  async function exportDocx() {
    setLoading('docx');
    try {
      const { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType } = await import('docx');
      const children = [
        new Paragraph({ text: report.title, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.RIGHT, bidirectional: true }),
      ];
      for (const { key, label } of FIELD_LABELS) {
        const value = report[key];
        if (!value) continue;
        children.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: label, bold: true })],
          }),
          new Paragraph({ text: String(value), alignment: AlignmentType.RIGHT, bidirectional: true })
        );
      }
      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportPdf}
        disabled={loading !== null}
        className="flex items-center gap-1.5 rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 hover:bg-sky-100 disabled:opacity-60"
      >
        {loading === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        تصدير PDF
      </button>
      <button
        onClick={exportDocx}
        disabled={loading !== null}
        className="flex items-center gap-1.5 rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 hover:bg-sky-100 disabled:opacity-60"
      >
        {loading === 'docx' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        تصدير Word
      </button>
    </div>
  );
}
