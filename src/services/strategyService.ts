import { supabase } from '../lib/supabase';
import { Strategy } from '../types';
import { notificationService } from './notificationService';

interface StrategyRow {
  id: string;
  title: string;
  description: string;
  category: Strategy['category'];
  content: string;
  image_url: string;
  video_url: string | null;
  links: { title: string; url: string }[] | null;
  files: Strategy['files'];
  author: string;
  author_role: string;
  read_time: string;
  is_featured: boolean;
  created_at: string;
}

function rowToStrategy(row: StrategyRow): Strategy {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    content: row.content,
    imageUrl: row.image_url,
    videoUrl: row.video_url || undefined,
    links: row.links || undefined,
    files: row.files || undefined,
    author: row.author,
    authorRole: row.author_role,
    readTime: row.read_time,
    isFeatured: row.is_featured,
    createdAt: new Date(row.created_at).toLocaleDateString('pt-BR'),
  };
}

export const strategyService = {
  async getStrategies(): Promise<Strategy[]> {
    const { data, error } = await supabase.from('strategies').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as StrategyRow[]).map(rowToStrategy);
  },

  async createStrategy(strategy: Omit<Strategy, 'id' | 'createdAt'>): Promise<void> {
    await supabase.from('strategies').insert({
      title: strategy.title,
      description: strategy.description,
      category: strategy.category,
      content: strategy.content,
      image_url: strategy.imageUrl,
      video_url: strategy.videoUrl || null,
      links: strategy.links || [],
      files: strategy.files || [],
      author: strategy.author,
      author_role: strategy.authorRole,
      read_time: strategy.readTime,
      is_featured: strategy.isFeatured || false,
    });

    const { data: members } = await supabase.from('profiles').select('user_id');
    for (const member of members || []) {
      await notificationService.create(member.user_id, 'Nova Estratégia Liberada na Central', strategy.title, 'strategy', 'strategies');
    }
  },

  async deleteStrategy(id: string): Promise<void> {
    await supabase.from('strategies').delete().eq('id', id);
  },
};
