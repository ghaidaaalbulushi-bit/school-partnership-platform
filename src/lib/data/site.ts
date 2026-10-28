import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { NavItem, SiteSettings, ThemeSettings } from '@/types/database';

/** site_settings is a singleton (id=1); the insert in migration 0001
 * guarantees the row exists, so this never returns null in a correctly
 * migrated project. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
  if (error || !data) {
    throw new Error(
      `تعذّر تحميل إعدادات الموقع من Supabase. تأكدي من تشغيل الـ migrations وربط متغيرات البيئة. (${error?.message ?? 'no data'})`
    );
  }
  return data as SiteSettings;
}

export async function getThemeSettings(): Promise<ThemeSettings> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from('theme_settings').select('*').eq('id', 1).single();
  if (error || !data) {
    throw new Error(`تعذّر تحميل إعدادات التصميم. (${error?.message ?? 'no data'})`);
  }
  return data as ThemeSettings;
}

export async function getNavItems(): Promise<NavItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('nav_items')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true });
  if (error) return [];
  return (data as NavItem[]) ?? [];
}
