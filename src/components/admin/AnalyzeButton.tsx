'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Loader2 } from 'lucide-react';

export function AnalyzeButton({ mediaFileId }: { mediaFileId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaFileId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'تعذّر تحليل المستند.');
      } else {
        router.push('/admin/ai');
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
        className="flex items-center gap-1.5 rounded-lg bg-peach-100 px-2.5 py-1.5 text-xs font-bold text-amber-700 hover:bg-peach-100/70 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bot className="h-3.5 w-3.5" />}
        تحليل المستند بالذكاء الاصطناعي
      </button>
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}
