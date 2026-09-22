export type UserRole = 'member' | 'moderator' | 'admin';

export type UserStatus = 'active' | 'blocked';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  instagram: string;
  whatsapp: string;
  city: string;
  profession: string;
  bio: string;
  objective: string;
  interests: string[];
  level: number;
  xp: number;
  completedOnboarding: boolean;
  connectionsCount: number;
  postsCount: number;
  badges: string[];
  joinedAt: string;
}

export type PostCategory =
  | 'ESTRATÉGIAS'
  | 'RESULTADOS'
  | 'DÚVIDAS'
  | 'NETWORKING'
  | 'MENTALIDADE'
  | 'NEGÓCIOS'
  | 'AVISOS'
  | 'GERAL';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorLevel: number;
  authorRole: UserRole;
  category: PostCategory;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  isPinned?: boolean;
  likes: string[]; // userIds
  commentsCount: number;
  savedBy: string[]; // userIds
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorLevel: number;
  authorRole: UserRole;
  content: string;
  createdAt: string;
}

export type StrategyCategory =
  | 'TRÁFEGO'
  | 'VENDAS'
  | 'COPY'
  | 'LANÇAMENTOS'
  | 'INTELIGÊNCIA ARTIFICIAL'
  | 'AUTOMAÇÃO'
  | 'POSICIONAMENTO'
  | 'NEGÓCIOS'
  | 'MENTALIDADE'
  | 'FERRAMENTAS';

export interface StrategyFile {
  name: string;
  size: string;
  type: string;
  url: string;
}

export interface Strategy {
  id: string;
  title: string;
  description: string;
  category: StrategyCategory;
  content: string;
  imageUrl: string;
  videoUrl?: string;
  links?: { title: string; url: string }[];
  files?: StrategyFile[];
  author: string;
  authorRole: string;
  readTime: string;
  isFeatured?: boolean;
  createdAt: string;
}

export type TicketCategory =
  | 'DÚVIDA SOBRE UMA AULA'
  | 'PROBLEMA TÉCNICO'
  | 'DÚVIDA ESTRATÉGICA'
  | 'OUTRO ASSUNTO';

export type TicketStatus = 'ABERTO' | 'EM ATENDIMENTO' | 'RESOLVIDO';

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  category: TicketCategory;
  subject: string;
  description: string;
  relatedLesson?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status: TicketStatus;
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'comment'
  | 'like'
  | 'connection'
  | 'support'
  | 'strategy'
  | 'announcement'
  | 'badge';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  linkTo?: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'Comum' | 'Raro' | 'Lendário' | 'Exclusivo';
}

export interface LevelInfo {
  level: number;
  name: string;
  minXp: number;
  maxXp: number;
  badgeTitle: string;
  perks: string[];
}

export interface ConnectionRecord {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'connected';
  createdAt: string;
}

export type ActiveTab =
  | 'landing'
  | 'auth'
  | 'onboarding'
  | 'home'
  | 'feed'
  | 'strategies'
  | 'support'
  | 'network'
  | 'achievements'
  | 'profile'
  | 'admin'
  | 'database';
