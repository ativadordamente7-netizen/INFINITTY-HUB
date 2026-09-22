import { supabase } from '../lib/supabase';
import { profileService } from './profileService';
import { notificationService } from './notificationService';

export const networkService = {
  async getConnectionsMap(): Promise<Record<string, string[]>> {
    const { data, error } = await supabase.from('connections').select('sender_id, receiver_id');
    if (error || !data) return {};
    const map: Record<string, string[]> = {};
    for (const row of data) {
      map[row.sender_id] = [...(map[row.sender_id] || []), row.receiver_id];
      map[row.receiver_id] = [...(map[row.receiver_id] || []), row.sender_id];
    }
    return map;
  },

  async toggleConnection(currentUserId: string, targetUserId: string, currentlyConnected: boolean): Promise<void> {
    if (currentlyConnected) {
      await supabase
        .from('connections')
        .delete()
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${currentUserId})`
        );
      return;
    }

    await supabase.from('connections').insert({ sender_id: currentUserId, receiver_id: targetUserId, status: 'connected' });
    await profileService.awardXP(currentUserId, 20, 'Nova conexão profissional realizada');

    const { data: profile } = await supabase.from('profiles').select('name').eq('user_id', currentUserId).maybeSingle();
    await notificationService.create(
      targetUserId,
      'Nova Conexão!',
      `${profile?.name || 'Um membro'} conectou-se ao seu perfil no Infinity Million.`,
      'connection',
      'network'
    );
  },
};
