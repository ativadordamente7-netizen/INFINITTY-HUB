import { supabase } from '../lib/supabase';
import { Comment, Post, PostCategory, Profile, UserRole } from '../types';
import { notificationService } from './notificationService';
import { profileService } from './profileService';

interface PostRow {
  id: string;
  author_id: string;
  category: PostCategory;
  content: string;
  image_url: string | null;
  video_url: string | null;
  link_url: string | null;
  is_pinned: boolean;
  likes: string[] | null;
  saved_by: string[] | null;
  comments_count: number;
  created_at: string;
}

interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR');
}

async function getProfilesMap(): Promise<Map<string, Profile & { role: UserRole }>> {
  const { data } = await supabase.from('profiles').select('*');
  const map = new Map<string, Profile & { role: UserRole }>();
  (data || []).forEach((row: any) => {
    map.set(row.user_id, {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      avatar: row.avatar,
      instagram: row.instagram,
      whatsapp: row.whatsapp,
      city: row.city,
      profession: row.profession,
      bio: row.bio,
      objective: row.objective,
      interests: row.interests || [],
      level: row.level,
      xp: row.xp,
      completedOnboarding: row.completed_onboarding,
      connectionsCount: row.connections_count,
      postsCount: row.posts_count,
      badges: row.badges || [],
      joinedAt: row.joined_at,
      role: row.role,
    });
  });
  return map;
}

export const communityService = {
  async getPosts(): Promise<Post[]> {
    const [{ data: posts, error }, profileMap] = await Promise.all([
      supabase.from('posts').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }),
      getProfilesMap(),
    ]);
    if (error || !posts) return [];

    return (posts as PostRow[]).map((p) => {
      const author = profileMap.get(p.author_id);
      return {
        id: p.id,
        authorId: p.author_id,
        authorName: author?.name || 'Membro Infinity',
        authorAvatar: author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240',
        authorLevel: author?.level || 1,
        authorRole: author?.role || 'member',
        category: p.category,
        content: p.content,
        imageUrl: p.image_url || undefined,
        videoUrl: p.video_url || undefined,
        linkUrl: p.link_url || undefined,
        isPinned: p.is_pinned,
        likes: p.likes || [],
        commentsCount: p.comments_count,
        savedBy: p.saved_by || [],
        createdAt: fmtDate(p.created_at),
      };
    });
  },

  async getComments(postId: string): Promise<Comment[]> {
    const [{ data: comments, error }, profileMap] = await Promise.all([
      supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true }),
      getProfilesMap(),
    ]);
    if (error || !comments) return [];
    return (comments as CommentRow[]).map((c) => {
      const author = profileMap.get(c.author_id);
      return {
        id: c.id,
        postId: c.post_id,
        authorId: c.author_id,
        authorName: author?.name || 'Membro Infinity',
        authorAvatar: author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240',
        authorLevel: author?.level || 1,
        authorRole: author?.role || 'member',
        content: c.content,
        createdAt: fmtDate(c.created_at),
      };
    });
  },

  async createPost(authorId: string, data: { category: PostCategory; content: string; imageUrl?: string; videoUrl?: string; linkUrl?: string }): Promise<void> {
    await supabase.from('posts').insert({
      author_id: authorId,
      category: data.category,
      content: data.content,
      image_url: data.imageUrl || null,
      video_url: data.videoUrl || null,
      link_url: data.linkUrl || null,
    });

    const { data: profile } = await supabase.from('profiles').select('posts_count').eq('user_id', authorId).maybeSingle();
    if (profile) {
      await supabase.from('profiles').update({ posts_count: (profile.posts_count || 0) + 1 }).eq('user_id', authorId);
    }
    await profileService.awardXP(authorId, 30, 'Publicação criada na Comunidade');
  },

  async toggleLike(postId: string, userId: string): Promise<void> {
    const { data: post } = await supabase.from('posts').select('likes, author_id').eq('id', postId).maybeSingle();
    if (!post) return;
    const likes: string[] = post.likes || [];
    const liked = likes.includes(userId);
    const newLikes = liked ? likes.filter((id) => id !== userId) : [...likes, userId];
    await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);
    if (!liked && post.author_id !== userId) {
      await profileService.awardXP(post.author_id, 5, 'Sua publicação recebeu uma curtida');
    }
  },

  async toggleSave(postId: string, userId: string): Promise<void> {
    const { data: post } = await supabase.from('posts').select('saved_by').eq('id', postId).maybeSingle();
    if (!post) return;
    const savedBy: string[] = post.saved_by || [];
    const saved = savedBy.includes(userId);
    const newSaved = saved ? savedBy.filter((id) => id !== userId) : [...savedBy, userId];
    await supabase.from('posts').update({ saved_by: newSaved }).eq('id', postId);
  },

  async togglePin(postId: string): Promise<void> {
    const { data: post } = await supabase.from('posts').select('is_pinned').eq('id', postId).maybeSingle();
    if (!post) return;
    await supabase.from('posts').update({ is_pinned: !post.is_pinned }).eq('id', postId);
  },

  async deletePost(postId: string): Promise<void> {
    await supabase.from('posts').delete().eq('id', postId);
  },

  async addComment(postId: string, authorId: string, content: string): Promise<void> {
    await supabase.from('comments').insert({ post_id: postId, author_id: authorId, content });
    const { data: post } = await supabase.from('posts').select('comments_count, author_id').eq('id', postId).maybeSingle();
    if (post) {
      await supabase.from('posts').update({ comments_count: (post.comments_count || 0) + 1 }).eq('id', postId);
      if (post.author_id !== authorId) {
        const { data: authorProfile } = await supabase.from('profiles').select('name').eq('user_id', authorId).maybeSingle();
        await notificationService.create(
          post.author_id,
          `${authorProfile?.name || 'Um membro'} comentou na sua publicação`,
          content.slice(0, 80) + '...',
          'comment',
          'feed'
        );
      }
    }
    await profileService.awardXP(authorId, 10, 'Comentário feito em uma discussão');
  },
};
