'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';

export function GenerateReportButton({ initiativeId }: { initiativeId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initiativeId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'تعذّر إنشاء التقرير.');
      } else {
        router.push(`/admin/reports/${json.reportId}`);
      }
    } catch {
      setError('تعذّر الاتصال بخدمة الذكاء الاصطناعي.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-full bg-gold-100 px-4 py-2 text-sm font-bold text-amber-700 hover:bg-gold-100/70 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        إنشاء تقرير ذكي من بيانات هذه المبادرة
      </button>
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}
