import React from 'react';
import { 
  Users, 
  BookOpen, 
  HelpCircle, 
  Network, 
  Award, 
  User as UserIcon, 
  ArrowRight, 
  Pin, 
  TrendingUp, 
  ExternalLink,
  PlusCircle
} from 'lucide-react';
import { Profile, ActiveTab } from '../types';
import { useAppStore } from '../store/useAppStore';
import { INITIAL_LEVELS } from '../data/initialData';

interface HomeDashboardProps {
  currentProfile: Profile;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCreatePost: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentProfile,
  setActiveTab,
  onOpenCreatePost,
}) => {
  const currentLevelInfo = INITIAL_LEVELS.find((l) => l.level === currentProfile.level) || INITIAL_LEVELS[1];
  const nextLevelInfo = INITIAL_LEVELS.find((l) => l.level === currentProfile.level + 1);
  
  const minXp = currentLevelInfo.minXp;
  const maxXp = nextLevelInfo ? nextLevelInfo.minXp : currentLevelInfo.maxXp;
  const progressPercent = Math.min(
    100,
    Math.max(5, Math.round(((currentProfile.xp - minXp) / (maxXp - minXp)) * 100))
  );

  const posts = useAppStore((s) => s.posts);
  const strategies = useAppStore((s) => s.strategies);
  const connectionsMap = useAppStore((s) => s.connectionsMap);
  const pinnedPost = posts.find((p) => p.isPinned) || posts[0];
  const connections = connectionsMap[currentProfile.userId] || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HERO SECTION / XP PROGRESS & PRIVATE COMMUNITY (Geometric Balance Theme) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Atual Card (Span 2) */}
        <div className="lg:col-span-2 p-7 sm:p-8 rounded-2xl border border-[#EBE6E2] bg-white flex flex-col justify-between shadow-[0_10px_30px_rgba(49,35,24,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 border border-[#BC9164] rounded-full opacity-10 pointer-events-none -mr-16 -mt-16" />
          
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#835629]">
                  Status Atual
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold italic text-[#312318] tracking-tight mt-0.5">
                  NÍVEL 0{currentProfile.level} — {currentLevelInfo.name.toUpperCase()}
                </h2>
              </div>
              <span className="text-xs font-mono tracking-tight text-[#59595F]">
                {currentProfile.xp} / {maxXp} XP
              </span>
            </div>

            {/* Geometric Progress Bar */}
            <div className="w-full h-2 rounded-full overflow-hidden bg-[#F8F4F0] p-0 border border-[#EBE6E2]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #BC9164, #835629)'
                }}
              />
            </div>
          </div>

          <div className="flex space-x-8 sm:space-x-12 mt-6 pt-5 border-t border-[#EBE6E2]/70">
            <div>
              <p className="text-lg font-bold text-[#312318]">{currentProfile.badges.length}</p>
              <p className="text-[10px] uppercase text-[#59595F] tracking-widest opacity-60">Conquistas</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#312318]">{connections.length}</p>
              <p className="text-[10px] uppercase text-[#59595F] tracking-widest opacity-60">Networking</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#312318]">{strategies.length}</p>
              <p className="text-[10px] uppercase text-[#59595F] tracking-widest opacity-60">Estratégias Lidas</p>
            </div>
          </div>
        </div>

        {/* Private Community Card (Dark Espresso) */}
        <div className="p-8 rounded-2xl border border-[#312318] bg-[#312318] flex flex-col items-center justify-center text-center space-y-4 shadow-[0_10px_30px_rgba(49,35,24,0.08)] relative overflow-hidden">
          <div className="absolute inset-0 border border-[#BC9164] rounded-2xl opacity-10 pointer-events-none" />
          <div className="w-16 h-16 rounded-full flex items-center justify-center border border-[#BC9164] p-1">
            <span className="text-2xl text-[#BC9164] font-serif-luxury leading-none">∞</span>
          </div>
          <h3 className="text-white text-sm font-bold uppercase tracking-widest">
            Comunidade Privada
          </h3>
          <p className="text-xs text-[#BFB6B0] max-w-xs leading-relaxed">
            Conecte-se com os 1% dos players do mercado digital.
          </p>
          <button
            onClick={() => setActiveTab('feed')}
            id="btn-access-feed-hero"
            className="px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all bg-[#BC9164] text-[#312318] hover:bg-[#d4a87a] cursor-pointer shadow-xs"
          >
            Acessar Feed
          </button>
        </div>

      </div>

      {/* MIDDLE SECTION: FEED PREVIEW & QUICK ACCESS (Geometric Balance Theme) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Feed Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#59595F]">
              Atividade Recente
            </h3>
            <button
              onClick={() => setActiveTab('feed')}
              className="text-[10px] font-bold text-[#BC9164] hover:text-[#835629] transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Tudo</span>
              <span>→</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl border border-[#EBE6E2] bg-white shadow-[0_10px_30px_rgba(49,35,24,0.04)]">
            {posts.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={posts[0].authorAvatar}
                      alt={posts[0].authorName}
                      className="w-8 h-8 rounded-full object-cover border border-[#EBE6E2]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#312318] flex items-center gap-2">
                        {posts[0].authorName}
                        <span className="text-[8px] px-2 py-0.5 rounded-full border border-[#BC9164] text-[#BC9164] font-bold tracking-wider uppercase">
                          {posts[0].category}
                        </span>
                      </p>
                      <p className="text-[9px] text-[#8E8984]">
                        Postado há pouco • {posts[0].createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#BC9164]" />
                </div>

                <p className="text-xs text-[#312318] leading-relaxed line-clamp-2 mb-4 font-normal">
                  {posts[0].content}
                </p>

                <div className="flex items-center space-x-4 pt-3 border-t border-[#EBE6E2]/60 text-[10px] text-[#8E8984]">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-[#59595F]">{posts[0].likes.length}</span> curtidas
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-[#59595F]">{posts[0].commentsCount}</span> comentários
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#8E8984]">Nenhuma atividade no momento.</p>
            )}
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="space-y-3">
          <div className="px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#59595F]">
              Acesso Rápido
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <div
              onClick={() => setActiveTab('strategies')}
              className="p-3.5 rounded-xl border border-[#EBE6E2] bg-[#FDFBFA] hover:border-[#BC9164] flex items-center justify-between group cursor-pointer transition-all shadow-xs"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-[#EBE6E2] flex items-center justify-center text-[#BC9164] font-bold text-xs">
                  ST
                </div>
                <span className="text-xs font-bold uppercase tracking-tight text-[#312318]">
                  Estratégias
                </span>
              </div>
              <span className="text-xs text-[#8E8984] group-hover:text-[#BC9164] group-hover:translate-x-0.5 transition-all">
                →
              </span>
            </div>

            <div
              onClick={() => setActiveTab('support')}
              className="p-3.5 rounded-xl border border-[#EBE6E2] bg-[#FDFBFA] hover:border-[#BC9164] flex items-center justify-between group cursor-pointer transition-all shadow-xs"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-[#EBE6E2] flex items-center justify-center text-[#BC9164] font-bold text-xs">
                  SP
                </div>
                <span className="text-xs font-bold uppercase tracking-tight text-[#312318]">
                  Suporte Central
                </span>
              </div>
              <span className="text-xs text-[#8E8984] group-hover:text-[#BC9164] group-hover:translate-x-0.5 transition-all">
                →
              </span>
            </div>

            <div
              onClick={() => setActiveTab('achievements')}
              className="p-3.5 rounded-xl border border-[#EBE6E2] bg-[#FDFBFA] hover:border-[#BC9164] flex items-center justify-between group cursor-pointer transition-all shadow-xs"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-[#EBE6E2] flex items-center justify-center text-[#BC9164] font-bold text-xs">
                  RN
                </div>
                <span className="text-xs font-bold uppercase tracking-tight text-[#312318]">
                  Ranking & Badges
                </span>
              </div>
              <span className="text-xs text-[#8E8984] group-hover:text-[#BC9164] group-hover:translate-x-0.5 transition-all">
                →
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 6 Core Cards (Geometric Balance Layout) */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xs font-bold text-[#59595F] uppercase tracking-widest">
            Navegação da Central
          </h2>
          <span className="text-[11px] text-[#8E8984] uppercase tracking-wider">Ambientes Privados</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. COMUNIDADE */}
          <div
            onClick={() => setActiveTab('feed')}
            id="card-nav-community"
            className="p-5 rounded-2xl border border-[#EBE6E2] bg-white cursor-pointer group flex flex-col justify-between shadow-[0_10px_30px_rgba(49,35,24,0.04)] hover:border-[#BC9164] transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF6F2] border border-[#BC9164]/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5 text-[#835629]" />
              </div>
              <h3 className="font-bold text-sm tracking-wider uppercase text-[#312318] group-hover:text-[#835629] transition-colors">
                COMUNIDADE
              </h3>
              <p className="text-xs text-[#59595F] mt-1">
                Veja o que está acontecendo.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-[#EBE6E2]/70 flex items-center justify-between text-[11px] text-[#835629] font-semibold">
              <span>{posts.length} discussões ativas</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. ESTRATÉGIAS */}
          <div
            onClick={() => setActiveTab('strategies')}
            id="card-nav-strategies"
            className="p-5 rounded-2xl border border-[#EBE6E2] bg-white cursor-pointer group flex flex-col justify-between shadow-[0_10px_30px_rgba(49,35,24,0.04)] hover:border-[#BC9164] transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF6F2] border border-[#BC9164]/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-[#835629]" />
              </div>
              <h3 className="font-bold text-sm tracking-wider uppercase text-[#312318] group-hover:text-[#835629] transition-colors">
                ESTRATÉGIAS
              </h3>
              <p className="text-xs text-[#59595F] mt-1">
                Conteúdos exclusivos do Infinity Million.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-[#EBE6E2]/70 flex items-center justify-between text-[11px] text-[#835629] font-semibold">
              <span>{strategies.length} frameworks disponíveis</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. SUPORTE */}
          <div
            onClick={() => setActiveTab('support')}
            id="card-nav-support"
            className="p-5 rounded-2xl border border-[#EBE6E2] bg-white cursor-pointer group flex flex-col justify-between shadow-[0_10px_30px_rgba(49,35,24,0.04)] hover:border-[#BC9164] transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF6F2] border border-[#BC9164]/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5 text-[#835629]" />
              </div>
              <h3 className="font-bold text-sm tracking-wider uppercase text-[#312318] group-hover:text-[#835629] transition-colors">
                SUPORTE
              </h3>
              <p className="text-xs text-[#59595F] mt-1">
                Precisa de ajuda? Estamos aqui.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-[#EBE6E2]/70 flex items-center justify-between text-[11px] text-[#835629] font-semibold">
              <span>Chamados técnicos & Kiwify</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. MINHA REDE */}
          <div
            onClick={() => setActiveTab('network')}
            id="card-nav-network"
            className="p-5 rounded-2xl border border-[#EBE6E2] bg-white cursor-pointer group flex flex-col justify-between shadow-[0_10px_30px_rgba(49,35,24,0.04)] hover:border-[#BC9164] transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF6F2] border border-[#BC9164]/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Network className="w-5 h-5 text-[#835629]" />
              </div>
              <h3 className="font-bold text-sm tracking-wider uppercase text-[#312318] group-hover:text-[#835629] transition-colors">
                MINHA REDE
              </h3>
              <p className="text-xs text-[#59595F] mt-1">
                Conecte-se com outros membros.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-[#EBE6E2]/70 flex items-center justify-between text-[11px] text-[#835629] font-semibold">
              <span>{connections.length} conexões ativas</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 5. CONQUISTAS */}
          <div
            onClick={() => setActiveTab('achievements')}
            id="card-nav-achievements"
            className="p-5 rounded-2xl border border-[#EBE6E2] bg-white cursor-pointer group flex flex-col justify-between shadow-[0_10px_30px_rgba(49,35,24,0.04)] hover:border-[#BC9164] transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF6F2] border border-[#BC9164]/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5 text-[#835629]" />
              </div>
              <h3 className="font-bold text-sm tracking-wider uppercase text-[#312318] group-hover:text-[#835629] transition-colors">
                CONQUISTAS
              </h3>
              <p className="text-xs text-[#59595F] mt-1">
                Veja sua evolução.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-[#EBE6E2]/70 flex items-center justify-between text-[11px] text-[#835629] font-semibold">
              <span>{currentProfile.badges.length} insígnias</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 6. MEU PERFIL */}
          <div
            onClick={() => setActiveTab('profile')}
            id="card-nav-profile"
            className="p-5 rounded-2xl border border-[#EBE6E2] bg-white cursor-pointer group flex flex-col justify-between shadow-[0_10px_30px_rgba(49,35,24,0.04)] hover:border-[#BC9164] transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FAF6F2] border border-[#BC9164]/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <UserIcon className="w-5 h-5 text-[#835629]" />
              </div>
              <h3 className="font-bold text-sm tracking-wider uppercase text-[#312318] group-hover:text-[#835629] transition-colors">
                MEU PERFIL
              </h3>
              <p className="text-xs text-[#59595F] mt-1">
                Construa sua identidade na comunidade.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-[#EBE6E2]/70 flex items-center justify-between text-[11px] text-[#835629] font-semibold">
              <span>Editar bio e objetivos</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

      {/* Pinned Official Notice from Admin */}
      {pinnedPost && (
        <div className="p-6 rounded-2xl bg-white border border-[#BC9164]/40 shadow-[0_10px_30px_rgba(49,35,24,0.04)] relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1.5 rounded-lg bg-[#FAF6F2] border border-[#BC9164]/30 text-[#835629]">
              <Pin className="w-3.5 h-3.5 fill-[#835629]" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#835629]">
              Aviso Fixado pela Administração
            </span>
            <span className="text-[10px] text-[#8E8984] ml-auto">{pinnedPost.createdAt}</span>
          </div>

          <h3 className="text-sm font-bold text-[#312318] mb-2">{pinnedPost.authorName}</h3>
          <p className="text-xs text-[#59595F] leading-relaxed whitespace-pre-line line-clamp-3">
            {pinnedPost.content}
          </p>

          <button
            onClick={() => setActiveTab('feed')}
            className="mt-4 text-xs font-bold text-[#835629] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <span>Ver publicação completa na Comunidade</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Ecosystem Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/70 border border-[#EBE6E2] text-center shadow-xs">
        <div>
          <span className="text-xl sm:text-2xl font-extrabold text-[#312318]">5</span>
          <p className="text-[11px] text-[#59595F] uppercase font-bold tracking-wider mt-0.5">Níveis de Maestria</p>
        </div>
        <div>
          <span className="text-xl sm:text-2xl font-extrabold text-[#312318]">100%</span>
          <p className="text-[11px] text-[#59595F] uppercase font-bold tracking-wider mt-0.5">Membros Verificados</p>
        </div>
        <div>
          <span className="text-xl sm:text-2xl font-extrabold text-[#312318]">{strategies.length}</span>
          <p className="text-[11px] text-[#59595F] uppercase font-bold tracking-wider mt-0.5">Playbooks Ativos</p>
        </div>
        <div>
          <span className="text-xl sm:text-2xl font-extrabold text-[#835629]">∞</span>
          <p className="text-[11px] text-[#59595F] uppercase font-bold tracking-wider mt-0.5">Networking Sem Limites</p>
        </div>
      </div>

    </div>
  );
};
