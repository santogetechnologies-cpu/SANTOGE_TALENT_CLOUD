import { supabase } from '../lib/supabase';

export interface AuditLogItem {
  id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata: any;
  createdAt: string;
}

export const auditService = {
  /**
   * Record privileged platform audit event
   */
  async logAction(
    action: string,
    entityType: string,
    entityId?: string,
    metadata: any = {}
  ): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      const actorId = session.session?.user?.id || null;

      const { error } = await (supabase.from('audit_logs') as any).insert({
        actor_user_id: actorId,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        metadata,
      });

      return !error;
    } catch (err) {
      console.error('logAction error:', err);
      return false;
    }
  },

  /**
   * Fetch audit logs for administrators
   */
  async getAuditLogs(limit: number = 50): Promise<AuditLogItem[]> {
    try {
      const { data, error } = await (supabase
        .from('audit_logs') as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        actorUserId: row.actor_user_id || 'system',
        action: row.action,
        entityType: row.entity_type,
        entityId: row.entity_id || undefined,
        metadata: row.metadata,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.error('getAuditLogs error:', err);
      return [];
    }
  },
};
