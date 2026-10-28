import * as Icons from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { AdminRole } from '@/types/database';

export function AdministrationSection({ roles }: { roles: AdminRole[] }) {
  if (roles.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <div className="mb-10 text-center">
        <h2 className="mb-2 text-2xl font-extrabold text-navy-800 md:text-3xl">الإدارة المدرسية</h2>
        <p className="text-navy-700/70">القيادة التربوية لمدرسة أسماء بنت النعمان</p>
      </div>

      <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
        {roles.map((role) => {
          const Icon = (Icons as any)[role.icon ?? 'UserRound'] ?? Icons.UserRound;
          return (
            <Card key={role.id} className="flex items-center gap-4 bg-gradient-to-br from-gold-100/60 to-white text-center sm:flex-col sm:text-center">
              <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy-700 text-white">
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-navy-800">{role.full_name}</p>
                <p className="text-sm font-semibold text-navy-600/80">{role.job_title}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
