'use client';

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronRight, ChevronLeft, ZoomIn, ZoomOut, Maximize, Download, Printer } from 'lucide-react';

// react-pdf needs its worker script served from somewhere reachable by the
// browser. Using the jsdelivr CDN build matching the installed pdfjs-dist
// version avoids bundling a worker file ourselves. If you'd rather keep
// everything first-party, copy node_modules/pdfjs-dist/build/pdf.worker.min.mjs
// into /public and point this at that local path instead.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PdfViewer({
  fileUrl,
  allowDownload = true,
  allowPrint = true,
  fileName = 'document.pdf',
}: {
  fileUrl: string;
  allowDownload?: boolean;
  allowPrint?: boolean;
  fileName?: string;
}) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.1);
  const [fullscreen, setFullscreen] = useState(false);

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  }, []);

  return (
    <div className={fullscreen ? 'fixed inset-0 z-50 flex flex-col bg-navy-900/95 p-4' : 'rounded-2xl border border-sky-100 bg-white p-3'}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sky-50 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="rounded-lg p-1.5 hover:bg-sky-100 disabled:opacity-40"
            aria-label="الصفحة السابقة"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <span className="min-w-[90px] text-center text-sm font-semibold text-navy-700">
            صفحة {pageNumber} من {numPages || '...'}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="rounded-lg p-1.5 hover:bg-sky-100 disabled:opacity-40"
            aria-label="الصفحة التالية"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={() => setScale((s) => Math.max(0.5, s - 0.15))} className="rounded-lg p-1.5 hover:bg-sky-100" aria-label="تصغير">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button onClick={() => setScale((s) => Math.min(2.5, s + 0.15))} className="rounded-lg p-1.5 hover:bg-sky-100" aria-label="تكبير">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={() => setFullscreen((f) => !f)} className="rounded-lg p-1.5 hover:bg-sky-100" aria-label="ملء الشاشة">
            <Maximize className="h-4 w-4" />
          </button>
          {allowPrint && (
            <button onClick={() => window.open(fileUrl, '_blank')} className="rounded-lg p-1.5 hover:bg-sky-100" aria-label="طباعة">
              <Printer className="h-4 w-4" />
            </button>
          )}
          {allowDownload && (
            <a href={fileUrl} download={fileName} className="rounded-lg p-1.5 hover:bg-sky-100" aria-label="تحميل">
              <Download className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      <div className="flex justify-center overflow-auto">
        <Document file={fileUrl} onLoadSuccess={onLoadSuccess} loading={<PdfLoading />} error={<PdfError />}>
          <Page pageNumber={pageNumber} scale={scale} renderAnnotationLayer renderTextLayer />
        </Document>
      </div>
    </div>
  );
}

function PdfLoading() {
  return <div className="flex h-64 items-center justify-center text-navy-500">جارٍ تحميل الملف...</div>;
}
function PdfError() {
  return <div className="flex h-64 items-center justify-center text-rose-500">تعذّر تحميل ملف PDF.</div>;
}
