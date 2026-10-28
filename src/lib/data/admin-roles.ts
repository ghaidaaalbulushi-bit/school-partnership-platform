import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { AdminRole } from '@/types/database';

export async function getVisibleAdminRoles(): Promise<AdminRole[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('admin_roles')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true });
  if (error) return [];
  return (data as AdminRole[]) ?? [];
}
