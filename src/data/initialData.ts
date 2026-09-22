import { Badge, LevelInfo } from '../types';

export const INITIAL_LEVELS: LevelInfo[] = [
  {
    level: 1,
    name: 'INICIANTE',
    minXp: 0,
    maxXp: 200,
    badgeTitle: 'Primeiro Passo',
    perks: ['Acesso à Comunidade', 'Acesso às Estratégias Básicas', 'Central de Suporte'],
  },
  {
    level: 2,
    name: 'EXPLORADOR',
    minXp: 200,
    maxXp: 600,
    badgeTitle: 'Explorador',
    perks: ['Destaque de Perfil', 'Acesso ao Canal de Networking', 'Criação de Conexões Ilimitadas'],
  },
  {
    level: 3,
    name: 'CONSTRUTOR',
    minXp: 600,
    maxXp: 1500,
    badgeTitle: 'Construtor',
    perks: ['Canal Exclusivo de Negócios', 'Feedback Prioritário de Copy', 'Badge Metálico Construtor'],
  },
  {
    level: 4,
    name: 'ESTRATEGISTA',
    minXp: 1500,
    maxXp: 3500,
    badgeTitle: 'Estrategista',
    perks: ['Acesso a Calls Estratégicas Mensais', 'Selo Dourado Estrategista', 'Suporte Prioritário'],
  },
  {
    level: 5,
    name: 'INFINITY',
    minXp: 3500,
    maxXp: 10000,
    badgeTitle: 'Membro Infinity',
    perks: ['Círculo Interno com Fundadores', 'Badge Champagne Gold ∞', 'Acesso Antecipado a Novos Negócios'],
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-1',
    code: 'PRIMEIRO_PASSO',
    title: 'PRIMEIRO PASSO',
    description: 'Completou a integração e o onboarding oficial no Hub.',
    icon: 'Sparkles',
    rarity: 'Comum',
  },
  {
    id: 'badge-2',
    code: 'PRESENTE',
    title: 'PRESENTE',
    description: 'Participou ativamente do feed e interagiu com outros membros.',
    icon: 'Flame',
    rarity: 'Comum',
  },
  {
    id: 'badge-3',
    code: 'CONSTRUTOR',
    title: 'CONSTRUTOR',
    description: 'Atingiu mais de 600 XP gerando valor contínuo na comunidade.',
    icon: 'Layers',
    rarity: 'Raro',
  },
  {
    id: 'badge-4',
    code: 'ESTRATEGISTA',
    title: 'ESTRATEGISTA',
    description: 'Validou projetos de alta performance e compartilhou resultados comprovados.',
    icon: 'Target',
    rarity: 'Lendário',
  },
  {
    id: 'badge-5',
    code: 'INFINITY',
    title: 'INFINITY',
    description: 'Nível máximo do ecossistema. Referência em autoridade e escala.',
    icon: 'Crown',
    rarity: 'Exclusivo',
  },
];

// ============================================================
// NOTA: os antigos arrays de seed (INITIAL_USERS, INITIAL_PROFILES,
// INITIAL_POSTS, INITIAL_STRATEGIES, INITIAL_TICKETS,
// INITIAL_NOTIFICATIONS) foram removidos daqui.
//
// Esses dados de demonstração ficavam salvos no localStorage do
// navegador e nunca foram um "banco de dados real" — cada pessoa via
// dados diferentes. Agora tudo isso vive no Supabase (ver
// supabase/schema.sql) e é o mesmo para todo mundo, em qualquer
// dispositivo. Se precisar de dados de exemplo para desenvolvimento
// local, insira-os diretamente no SQL Editor do Supabase — nunca aqui
// no código do frontend.
// ============================================================
