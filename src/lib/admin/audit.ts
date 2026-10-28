import type { SupabaseClient, User } from '@supabase/supabase-js';

type AuditAction = 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'login' | 'logout';

/** Writes one row to audit_logs. Call this from every mutating Server
 * Action, after the mutation succeeds. Never let a logging failure block
 * the actual mutation — audit logging is best-effort observability, not a
 * transaction guard. */
export async function logAudit(
  supabase: SupabaseClient,
  user: User | null,
  params: {
    action: AuditAction;
    entityType: string;
    entityId?: string | null;
    beforeData?: unknown;
    afterData?: unknown;
  }
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      actor_id: user?.id ?? null,
      actor_email: user?.email ?? null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      before_data: params.beforeData ?? null,
      after_data: params.afterData ?? null,
    });
  } catch (err) {
    console.error('audit log write failed (non-fatal):', err);
  }
}

/** Snapshots a record into content_revisions before an update/delete, so
 * the admin can restore a previous version later. */
export async function snapshotRevision(
  supabase: SupabaseClient,
  user: User | null,
  entityType: string,
  entityId: string,
  snapshot: unknown
): Promise<void> {
  try {
    await supabase.from('content_revisions').insert({
      entity_type: entityType,
      entity_id: entityId,
      snapshot,
      created_by: user?.id ?? null,
    });
  } catch (err) {
    console.error('revision snapshot failed (non-fatal):', err);
  }
}
