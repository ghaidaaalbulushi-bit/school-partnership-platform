'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { SchoolLogo } from '@/components/SchoolLogo';
import type { NavItem, SiteSettings } from '@/types/database';
import { cn } from '@/lib/utils';

export function Header({
  navItems,
  settings,
}: {
  navItems: NavItem[];
  settings: Pick<SiteSettings, 'school_name' | 'platform_name' | 'logo_storage_path'>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <SchoolLogo src={settings.logo_storage_path} size={48} className="shrink-0 rounded-xl" />
          <div className="hidden text-start sm:block">
            <p className="text-sm font-bold text-navy-800">{settings.school_name}</p>
            <p className="text-xs text-navy-600/80">{settings.platform_name}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              target={item.opens_new_tab ? '_blank' : undefined}
              className="rounded-full px-4 py-2 text-sm font-semibold text-navy-700 transition hover:bg-sky-50 hover:text-sky-600"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="ms-2 flex items-center gap-1.5 rounded-full bg-navy-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-navy-800"
          >
            <LayoutDashboard className="h-4 w-4" />
            دخول الإدارة
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full p-2 text-navy-700 hover:bg-sky-50 md:hidden"
          aria-label="القائمة"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={cn(
          'overflow-hidden border-t border-sky-100 bg-white transition-[max-height] duration-300 md:hidden',
          open ? 'max-h-96' : 'max-h-0 border-t-0'
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-navy-700 hover:bg-sky-50"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-1.5 rounded-xl bg-navy-700 px-4 py-3 text-sm font-bold text-white"
          >
            <LayoutDashboard className="h-4 w-4" />
            دخول الإدارة
          </Link>
        </nav>
      </div>
    </header>
  );
}
