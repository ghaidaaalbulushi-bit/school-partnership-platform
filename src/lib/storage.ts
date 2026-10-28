import type { SupabaseClient } from '@supabase/supabase-js';
import type { MediaFile } from '@/types/database';
import { createServiceRoleClient } from '@/lib/supabase/server';

/** How long a signed preview URL stays valid. Short-lived on purpose: file
 * protection must not rely on a link simply being "hard to guess" forever. */
const SIGNED_URL_TTL_SECONDS = 60 * 10; // 10 minutes

/**
 * IMPORTANT — why this uses the service-role client:
 *
 * The `media` storage bucket's own RLS policy (see supabase/STORAGE_SETUP.md)
 * only lets *authenticated* requests read objects directly — a deliberate
 * choice so file protection doesn't rely on hiding a download button in the
 * UI. But public visitors legitimately need to view evidence/media that has
 * been marked `status = 'published'` in the database.
 *
 * The actual access decision is therefore made at the *database* row level
 * (the `evidence` / `media_files` queries already run through the normal
 * RLS-respecting client and only return published rows to anonymous
 * visitors — see src/lib/data/indicators.ts). Once a file has passed that
 * check, this function uses the service-role key purely to mint a single,
 * short-lived, scoped signed URL for that one object — it does not expose
 * the service-role key itself, and it does not grant any broader access.
 * This is the standard pattern for "gate by DB row, serve via signed URL"
 * private buckets.
 *
 * Call this ONLY from server code, and only after you've already confirmed
 * (via a published-only query) that the file is meant to be visible.
 */
export async function getSignedFileUrl(
  file: Pick<MediaFile, 'storage_bucket' | 'storage_path'>
): Promise<string | null> {
  const service = createServiceRoleClient();
  const { data, error } = await service.storage
    .from(file.storage_bucket)
    .createSignedUrl(file.storage_path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) return null;
  return data.signedUrl;
}

export async function getSignedFileUrls(
  files: Pick<MediaFile, 'storage_bucket' | 'storage_path'>[]
): Promise<Record<string, string>> {
  const service = createServiceRoleClient();
  const byBucket = new Map<string, string[]>();
  for (const f of files) {
    const list = byBucket.get(f.storage_bucket) ?? [];
    list.push(f.storage_path);
    byBucket.set(f.storage_bucket, list);
  }

  const result: Record<string, string> = {};
  for (const [bucket, paths] of byBucket) {
    const { data, error } = await service.storage.from(bucket).createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
    if (error || !data) continue;
    for (const entry of data) {
      if (entry.signedUrl && entry.path) result[entry.path] = entry.signedUrl;
    }
  }
  return result;
}

/** For admin-side previews where we already know the visitor is the
 * authenticated admin (RLS would allow direct read anyway) — kept distinct
 * from the public helpers above for clarity at call sites. */
export async function getAdminSignedFileUrl(
  supabase: SupabaseClient,
  file: Pick<MediaFile, 'storage_bucket' | 'storage_path'>
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(file.storage_bucket)
    .createSignedUrl(file.storage_path, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return null;
  return data.signedUrl;
}

/** Public, non-expiring URL — only ever use this for the `public-assets`
 * bucket (logo etc.), never for `media`. */
export function getPublicAssetUrl(supabase: SupabaseClient, path: string): string {
  return supabase.storage.from('public-assets').getPublicUrl(path).data.publicUrl;
}
