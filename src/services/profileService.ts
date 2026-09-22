import { supabase, AVATARS_BUCKET, MAX_AVATAR_SIZE_BYTES, ALLOWED_AVATAR_TYPES } from '../lib/supabase';
import { Profile, User, UserRole, UserStatus } from '../types';
import { INITIAL_LEVELS } from '../data/initialData';
import { notificationService } from './notificationService';

interface ProfileRow {
  id: string;
  user_id: string;
  email: string;
  name: string;
  avatar: string | null;
  instagram: string | null;
  whatsapp: string | null;
  city: string | null;
  profession: string | null;
  bio: string | null;
  objective: string | null;
  interests: string[] | null;
  role: UserRole;
  status: UserStatus;
  level: number;
  xp: number;
  completed_onboarding: boolean;
  connections_count: number;
  posts_count: number;
  badges: string[] | null;
  joined_at: string;
  created_at: string;
}

function rowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    avatar: row.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
    instagram: row.instagram || '',
    whatsapp: row.whatsapp || '',
    city: row.city || 'Brasil',
    profession: row.profession || 'Membro da Comunidade',
    bio: row.bio || '',
    objective: row.objective || '',
    interests: row.interests || [],
    level: row.level,
    xp: row.xp,
    completedOnboarding: row.completed_onboarding,
    connectionsCount: row.connections_count,
    postsCount: row.posts_count,
    badges: row.badges || [],
    joinedAt: new Date(row.joined_at).toLocaleDateString('pt-BR'),
  };
}

function rowToUser(row: ProfileRow): User {
  return {
    id: row.user_id,
    email: row.email,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
  };
}

export const profileService = {
  validateAvatarFile(file: File): string | null {
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      return 'A imagem é maior que 5 MB. Escolha uma foto menor.';
    }
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      return 'Formato não suportado. Envie PNG, JPG ou WEBP.';
    }
    return null;
  },

  /** Faz upload da foto de perfil e devolve a URL pública já pronta pra usar. */
  async uploadAvatar(userId: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    const validationError = this.validateAvatarFile(file);
    if (validationError) return { success: false, error: validationError };

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${userId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage.from(AVATARS_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      return { success: false, error: 'Não foi possível enviar a foto. Tente novamente.' };
    }

    const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
    return { success: true, url: data.publicUrl };
  },

  async getCurrentUserAndProfile(): Promise<{ user: User; profile: Profile } | null> {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      user: rowToUser(data as ProfileRow),
      profile: rowToProfile(data as ProfileRow),
    };
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as ProfileRow[]).map(rowToProfile);
  },

  async getAllUsersWithProfiles(): Promise<{ users: User[]; profiles: Profile[] }> {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error || !data) return { users: [], profiles: [] };
    const rows = data as ProfileRow[];
    return {
      users: rows.map(rowToUser),
      profiles: rows.map(rowToProfile),
    };
  },

  async updateProfile(userId: string, patch: Partial<Profile>): Promise<Profile | null> {
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.avatar !== undefined) dbPatch.avatar = patch.avatar;
    if (patch.instagram !== undefined) dbPatch.instagram = patch.instagram;
    if (patch.whatsapp !== undefined) dbPatch.whatsapp = patch.whatsapp;
    if (patch.city !== undefined) dbPatch.city = patch.city;
    if (patch.profession !== undefined) dbPatch.profession = patch.profession;
    if (patch.bio !== undefined) dbPatch.bio = patch.bio;
    if (patch.objective !== undefined) dbPatch.objective = patch.objective;
    if (patch.interests !== undefined) dbPatch.interests = patch.interests;
    if (patch.completedOnboarding !== undefined) dbPatch.completed_onboarding = patch.completedOnboarding;
    if (patch.badges !== undefined) dbPatch.badges = patch.badges;
    if (patch.postsCount !== undefined) dbPatch.posts_count = patch.postsCount;
    if (patch.connectionsCount !== undefined) dbPatch.connections_count = patch.connectionsCount;
    if (patch.xp !== undefined) dbPatch.xp = patch.xp;
    if (patch.level !== undefined) dbPatch.level = patch.level;

    const { data, error } = await supabase
      .from('profiles')
      .update(dbPatch)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();

    if (error || !data) return null;
    return rowToProfile(data as ProfileRow);
  },

  async awardXP(userId: string, amount: number, reason: string): Promise<{ newXp: number; newLevel: number; leveledUp: boolean } | null> {
    const { data: current, error: fetchError } = await supabase
      .from('profiles')
      .select('xp, level, badges')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError || !current) return null;

    const oldLevel = current.level as number;
    const newXp = (current.xp as number) + amount;

    let calculatedLevel = 1;
    for (const lvl of INITIAL_LEVELS) {
      if (newXp >= lvl.minXp) calculatedLevel = lvl.level;
    }
    const leveledUp = calculatedLevel > oldLevel;

    const badges: string[] = current.badges || [];
    if (newXp >= 600 && !badges.includes('CONSTRUTOR')) badges.push('CONSTRUTOR');
    if (newXp >= 1500 && !badges.includes('ESTRATEGISTA')) badges.push('ESTRATEGISTA');
    if (newXp >= 3500 && !badges.includes('INFINITY')) badges.push('INFINITY');

    await supabase.from('profiles').update({ xp: newXp, level: calculatedLevel, badges }).eq('user_id', userId);

    await notificationService.create(
      userId,
      leveledUp ? `Parabéns! Você alcançou o Nível 0${calculatedLevel}!` : `Você ganhou +${amount} XP!`,
      reason,
      'badge',
      'achievements'
    );

    return { newXp, newLevel: calculatedLevel, leveledUp };
  },

  async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('user_id', userId);
    return !error;
  },

  async toggleUserStatus(userId: string, current: UserStatus): Promise<UserStatus | null> {
    const nextStatus: UserStatus = current === 'active' ? 'blocked' : 'active';
    const { error } = await supabase.from('profiles').update({ status: nextStatus }).eq('user_id', userId);
    if (error) return null;
    return nextStatus;
  },
};
