import { supabase } from '../lib/supabase';
import { NotificationItem, NotificationType } from '../types';

interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link_to: string | null;
  created_at: string;
}

function rowToNotification(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: row.read,
    linkTo: row.link_to || undefined,
    createdAt: new Date(row.created_at).toLocaleString('pt-BR'),
  };
}

export const notificationService = {
  async getForUser(userId: string): Promise<NotificationItem[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error || !data) return [];
    return (data as NotificationRow[]).map(rowToNotification);
  },

  async create(userId: string, title: string, message: string, type: NotificationType, linkTo?: string): Promise<void> {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      link_to: linkTo || null,
      read: false,
    });
  },

  async markAllRead(userId: string): Promise<void> {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
  },

  async markRead(id: string): Promise<void> {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  },
};
