import { create } from 'zustand';
import {
  NotificationItem,
  Post,
  PostCategory,
  Profile,
  Strategy,
  SupportTicket,
  TicketCategory,
  TicketStatus,
  User,
  UserRole,
} from '../types';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { communityService } from '../services/communityService';
import { strategyService } from '../services/strategyService';
import { supportService } from '../services/supportService';
import { networkService } from '../services/networkService';
import { notificationService } from '../services/notificationService';

interface AppState {
  initialized: boolean;
  authLoading: boolean;
  authError: string | null;
  currentUser: User | null;
  currentProfile: Profile | null;

  users: User[];
  profiles: Profile[];
  posts: Post[];
  strategies: Strategy[];
  tickets: SupportTicket[];
  notifications: NotificationItem[];
  connectionsMap: Record<string, string[]>;

  ticketsLoading: boolean;

  init: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshCommunityData: () => Promise<void>;
  refreshTickets: () => Promise<void>;
  refreshNotifications: () => Promise<void>;

  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;

  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  completeOnboarding: (patch: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;

  createPost: (data: { category: PostCategory; content: string; imageUrl?: string; videoUrl?: string; linkUrl?: string }) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleSavePost: (postId: string) => Promise<void>;
  togglePinPost: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;

  createStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt'>) => Promise<void>;
  deleteStrategy: (id: string) => Promise<void>;

  createTicket: (
    data: { category: TicketCategory; subject: string; description: string; relatedLesson?: string },
    attachmentFile?: File | null
  ) => Promise<{ success: boolean; error?: string; ticketId?: string }>;
  addTicketMessage: (ticketId: string, message: string) => Promise<{ success: boolean; error?: string }>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<{ success: boolean; error?: string }>;

  toggleConnection: (targetUserId: string) => Promise<void>;

  markAllNotificationsRead: () => Promise<void>;

  toggleUserStatus: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
}

let authUnsubscribe: (() => void) | null = null;

export const useAppStore = create<AppState>((set, get) => ({
  initialized: false,
  authLoading: true,
  authError: null,
  currentUser: null,
  currentProfile: null,

  users: [],
  profiles: [],
  posts: [],
  strategies: [],
  tickets: [],
  notifications: [],
  connectionsMap: {},
  ticketsLoading: false,

  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });

    await get().refreshSession();
    set({ authLoading: false });

    if (!authUnsubscribe) {
      authUnsubscribe = authService.onAuthStateChange(async () => {
        await get().refreshSession();
      });
    }
  },

  refreshSession: async () => {
    const result = await profileService.getCurrentUserAndProfile();
    if (!result) {
      set({ currentUser: null, currentProfile: null });
      return;
    }
    set({ currentUser: result.user, currentProfile: result.profile });

    await Promise.all([get().refreshCommunityData(), get().refreshNotifications(), get().refreshTickets()]);
  },

  refreshCommunityData: async () => {
    const [{ users, profiles }, posts, strategies, connectionsMap] = await Promise.all([
      profileService.getAllUsersWithProfiles(),
      communityService.getPosts(),
      strategyService.getStrategies(),
      networkService.getConnectionsMap(),
    ]);
    set({ users, profiles, posts, strategies, connectionsMap });
  },

  refreshTickets: async () => {
    set({ ticketsLoading: true });
    const tickets = await supportService.getTickets();
    set({ tickets, ticketsLoading: false });
  },

  refreshNotifications: async () => {
    const user = get().currentUser;
    if (!user) return;
    const notifications = await notificationService.getForUser(user.id);
    set({ notifications });
  },

  signIn: async (email, password) => {
    set({ authError: null });
    const result = await authService.signIn(email, password);
    if (!result.success) {
      set({ authError: result.error || null });
      return { success: false, error: result.error };
    }
    await get().refreshSession();
    return { success: true };
  },

  signUp: async (email, password, name) => {
    set({ authError: null });
    const result = await authService.signUp(email, password, name);
    if (!result.success) {
      set({ authError: result.error || null });
      return { success: false, error: result.error };
    }
    await get().refreshSession();
    return { success: true };
  },

  signOut: async () => {
    await authService.signOut();
    set({
      currentUser: null,
      currentProfile: null,
      users: [],
      profiles: [],
      posts: [],
      strategies: [],
      tickets: [],
      notifications: [],
      connectionsMap: {},
    });
  },

  resetPassword: async (email) => {
    return authService.resetPassword(email);
  },

  updateProfile: async (patch) => {
    const user = get().currentUser;
    if (!user) return;
    const updated = await profileService.updateProfile(user.id, patch);
    if (updated) {
      set({ currentProfile: updated });
      await get().refreshCommunityData();
    }
  },

  completeOnboarding: async (patch) => {
    const user = get().currentUser;
    if (!user) return;
    await profileService.updateProfile(user.id, { ...patch, completedOnboarding: true });
    await profileService.awardXP(user.id, 50, 'Boas-vindas: Perfil oficial completo');
    await get().refreshSession();
  },

  uploadAvatar: async (file) => {
    const user = get().currentUser;
    if (!user) return { success: false, error: 'Você precisa estar logado.' };
    return profileService.uploadAvatar(user.id, file);
  },

  createPost: async (data) => {
    const user = get().currentUser;
    if (!user) return;
    await communityService.createPost(user.id, data);
    await get().refreshCommunityData();
    await get().refreshSession();
  },

  toggleLikePost: async (postId) => {
    const user = get().currentUser;
    if (!user) return;
    await communityService.toggleLike(postId, user.id);
    await get().refreshCommunityData();
  },

  toggleSavePost: async (postId) => {
    const user = get().currentUser;
    if (!user) return;
    await communityService.toggleSave(postId, user.id);
    await get().refreshCommunityData();
  },

  togglePinPost: async (postId) => {
    await communityService.togglePin(postId);
    await get().refreshCommunityData();
  },

  deletePost: async (postId) => {
    await communityService.deletePost(postId);
    await get().refreshCommunityData();
  },

  addComment: async (postId, content) => {
    const user = get().currentUser;
    if (!user) return;
    await communityService.addComment(postId, user.id, content);
    await get().refreshCommunityData();
  },

  createStrategy: async (strategy) => {
    await strategyService.createStrategy(strategy);
    await get().refreshCommunityData();
  },

  deleteStrategy: async (id) => {
    await strategyService.deleteStrategy(id);
    await get().refreshCommunityData();
  },

  createTicket: async (data, attachmentFile) => {
    const user = get().currentUser;
    if (!user) return { success: false, error: 'Você precisa estar logado.' };
    const { ticket, error } = await supportService.createTicket(user.id, user.email, data, attachmentFile);
    if (!ticket) return { success: false, error };
    await get().refreshTickets();
    return { success: true, ticketId: ticket.id };
  },

  addTicketMessage: async (ticketId, message) => {
    const user = get().currentUser;
    if (!user) return { success: false, error: 'Você precisa estar logado.' };
    const result = await supportService.addMessage(ticketId, user.id, user.role, message);
    if (result.success) await get().refreshTickets();
    return result;
  },

  updateTicketStatus: async (ticketId, status) => {
    const result = await supportService.updateStatus(ticketId, status);
    if (result.success) await get().refreshTickets();
    return result;
  },

  toggleConnection: async (targetUserId) => {
    const user = get().currentUser;
    if (!user) return;
    const currentList = get().connectionsMap[user.id] || [];
    const currentlyConnected = currentList.includes(targetUserId);
    await networkService.toggleConnection(user.id, targetUserId, currentlyConnected);
    await get().refreshCommunityData();
  },

  markAllNotificationsRead: async () => {
    const user = get().currentUser;
    if (!user) return;
    await notificationService.markAllRead(user.id);
    await get().refreshNotifications();
  },

  toggleUserStatus: async (userId) => {
    const target = get().users.find((u) => u.id === userId);
    if (!target) return;
    await profileService.toggleUserStatus(userId, target.status);
    await get().refreshCommunityData();
  },

  updateUserRole: async (userId, role) => {
    await profileService.updateUserRole(userId, role);
    await get().refreshCommunityData();
    if (get().currentUser?.id === userId) {
      await get().refreshSession();
    }
  },
}));
