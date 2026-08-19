import { supabase } from '../lib/supabase';

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export const notificationService = {
  /**
   * Fetch live notifications for current user from database
   */
  async getNotifications(userId?: string): Promise<AppNotification[]> {
    try {
      let query = (supabase.from('notifications') as any).select('*');
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(30);

      if (error) {
        console.error('getNotifications error:', error);
        return [];
      }

      if (!data) return [];

      return data.map((row: any) => this.mapDbNotificationToDomain(row));
    } catch (err) {
      console.error('getNotifications exception:', err);
      return [];
    }
  },

  async markAsRead(id: string): Promise<boolean> {
    try {
      const { error } = await (supabase
        .from('notifications') as any)
        .update({ read: true })
        .eq('id', id);

      return !error;
    } catch (err) {
      console.error('markAsRead error:', err);
      return false;
    }
  },

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await (supabase
        .from('notifications') as any)
        .update({ read: true })
        .eq('user_id', userId);

      return !error;
    } catch (err) {
      console.error('markAllAsRead error:', err);
      return false;
    }
  },

  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
  }): Promise<AppNotification | null> {
    try {
      const { data: created, error } = await (supabase
        .from('notifications') as any)
        .insert({
          user_id: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          link: data.link || null,
          read: false,
        })
        .select()
        .single();

      if (error || !created) return null;
      return this.mapDbNotificationToDomain(created);
    } catch (err) {
      console.error('createNotification error:', err);
      return null;
    }
  },

  /**
   * Mapper
   */
  mapDbNotificationToDomain(row: any): AppNotification {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type || 'info',
      title: row.title,
      message: row.message,
      read: row.read ?? false,
      link: row.link || undefined,
      createdAt: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    };
  },
};
