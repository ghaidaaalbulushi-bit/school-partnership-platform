import Link from 'next/link';
import * as Icons from 'lucide-react';
import { getPublishedIndicators } from '@/lib/data/indicators';

export default async function PresentationHomePage() {
  const indicators = await getPublishedIndicators();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-10 text-center text-3xl font-extrabold">اختاري مؤشرًا لبدء العرض</h1>
      <div className="grid gap-6 sm:grid-cols-3">
        {indicators.map((indicator) => {
          const Icon = (Icons as any)[indicator.icon ?? 'Users'] ?? Icons.Users;
          return (
            <Link
              key={indicator.id}
              href={`/presentation/${indicator.id}`}
              className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-8 text-center transition hover:bg-white/10"
            >
              <Icon className="h-10 w-10 text-sky-300" />
              <span className="font-bold">{indicator.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
