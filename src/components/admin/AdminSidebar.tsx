'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  Eye,
  UserRound,
  LayoutList,
  FolderTree,
  Sparkles,
  Image as ImageIcon,
  FileText,
  Bot,
  BarChart3,
  Palette,
  Settings,
  History,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SchoolLogo } from '@/components/SchoolLogo';

const NAV = [
  { href: '/admin', label: 'نظرة عامة', icon: LayoutDashboard, exact: true },
  { href: '/admin/site-settings', label: 'بيانات المدرسة والصفحة الرئيسية', icon: Home },
  { href: '/admin/administration', label: 'الإدارة المدرسية', icon: UserRound },
  { href: '/admin/nav', label: 'عناصر القائمة والتذييل', icon: LayoutList },
  { href: '/admin/indicators', label: 'المؤشرات والمعايير', icon: FolderTree },
  { href: '/admin/initiatives', label: 'المبادرات والفعاليات', icon: Sparkles },
  { href: '/admin/media', label: 'الصور والفيديوهات والملفات', icon: ImageIcon },
  { href: '/admin/reports', label: 'التقارير', icon: FileText },
  { href: '/admin/ai', label: 'المساعد الذكي', icon: Bot },
  { href: '/admin/stats', label: 'الإحصائيات', icon: BarChart3 },
  { href: '/admin/design', label: 'إعدادات التصميم', icon: Palette },
  { href: '/admin/settings', label: 'إعدادات الموقع', icon: Settings },
  { href: '/admin/audit-log', label: 'سجل التعديلات', icon: History },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-l border-sky-100 bg-white md:flex">
      <div className="flex items-center gap-3 border-b border-sky-100 p-5">
        <SchoolLogo size={40} className="rounded-lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-navy-800">لوحة الإدارة</p>
          <p className="truncate text-xs text-navy-500">منصة الشراكة المدرسية</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition',
                active ? 'bg-sky-500 text-white shadow-soft' : 'text-navy-700 hover:bg-sky-50'
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sky-100 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-navy-500 hover:bg-sky-50"
        >
          <ExternalLink className="h-4 w-4" />
          عرض الموقع العام
        </Link>
        <Link
          href="/presentation"
          target="_blank"
          className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-navy-500 hover:bg-sky-50"
        >
          <Eye className="h-4 w-4" />
          وضع العرض أمام اللجنة
        </Link>
      </div>
    </aside>
  );
}
