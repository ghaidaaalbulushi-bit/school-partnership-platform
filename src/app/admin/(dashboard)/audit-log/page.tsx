import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { formatArabicDate } from '@/lib/utils';
import type { AuditLog } from '@/types/database';

const ACTION_LABELS: Record<string, string> = {
  create: 'إنشاء',
  update: 'تعديل',
  delete: 'حذف',
  publish: 'نشر',
  unpublish: 'إلغاء نشر',
  login: 'تسجيل دخول',
  logout: 'تسجيل خروج',
};

const ENTITY_LABELS: Record<string, string> = {
  indicators: 'مؤشر',
  sections: 'قسم',
  section_blocks: 'محتوى قسم',
  initiatives: 'مبادرة',
  initiative_media: 'ملفات مبادرة',
  initiative_links: 'روابط مبادرة',
  links: 'رابط',
  evidence: 'شاهد',
  media_files: 'ملف',
  admin_roles: 'منصب إداري',
  nav_items: 'عنصر قائمة',
  site_settings: 'إعدادات الموقع',
  theme_settings: 'إعدادات التصميم',
  reports: 'تقرير',
  auth: 'الدخول/الخروج',
};

export default async function AdminAuditLogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? '1', 10) || 1);
  const pageSize = 40;

  const supabase = await createServerSupabaseClient();
  const { data, count } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((pageNum - 1) * pageSize, pageNum * pageSize - 1);

  const logs = (data as AuditLog[]) ?? [];

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 text-2xl font-extrabold text-navy-800">سجل التعديلات</h1>
      <p className="mb-6 text-sm text-navy-500">
        سجل تلقائي لكل عملية إنشاء/تعديل/حذف/نشر من لوحة الإدارة ({count ?? 0} عملية).
      </p>

      <div className="space-y-2">
        {logs.length === 0 ? (
          <p className="text-navy-500">لا توجد عمليات مسجّلة بعد.</p>
        ) : (
          logs.map((log) => (
            <Card key={log.id} className="flex items-center justify-between gap-3 !p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy-700">
                  <span className="font-extrabold">{ACTION_LABELS[log.action] ?? log.action}</span>
                  {' — '}
                  {ENTITY_LABELS[log.entity_type] ?? log.entity_type}
                </p>
                <p className="text-xs text-navy-500">{log.actor_email ?? 'غير معروف'} · {formatArabicDate(log.created_at)}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
