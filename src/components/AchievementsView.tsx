import React from 'react';
import { 
  Award, 
  Sparkles, 
  Flame, 
  Layers, 
  Target, 
  Crown, 
  Check, 
  Lock, 
  Zap, 
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { Profile } from '../types';
import { INITIAL_LEVELS, INITIAL_BADGES } from '../data/initialData';

interface AchievementsViewProps {
  currentProfile: Profile;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ currentProfile }) => {
  const currentLevelInfo = INITIAL_LEVELS.find((l) => l.level === currentProfile.level) || INITIAL_LEVELS[1];
  const nextLevelInfo = INITIAL_LEVELS.find((l) => l.level === currentProfile.level + 1);

  const minXp = currentLevelInfo.minXp;
  const maxXp = nextLevelInfo ? nextLevelInfo.minXp : currentLevelInfo.maxXp;
  const progressPercent = Math.min(
    100,
    Math.max(5, Math.round(((currentProfile.xp - minXp) / (maxXp - minXp)) * 100))
  );

  const getBadgeIcon = (code: string) => {
    switch (code) {
      case 'PRIMEIRO_PASSO':
        return <Sparkles className="w-5 h-5 text-[#835629]" />;
      case 'PRESENTE':
        return <Flame className="w-5 h-5 text-[#835629]" />;
      case 'CONSTRUTOR':
        return <Layers className="w-5 h-5 text-[#835629]" />;
      case 'ESTRATEGISTA':
        return <Target className="w-5 h-5 text-[#835629]" />;
      case 'INFINITY':
        return <Crown className="w-5 h-5 text-[#835629]" />;
      default:
        return <Award className="w-5 h-5 text-[#835629]" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EBE6E2] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6F2] border border-[#BC9164]/30 mb-2">
            <Award className="w-3.5 h-3.5 text-[#BC9164]" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#835629]">
              Gamificação & Maestria
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#312318] tracking-tight uppercase">
            Evolução de Níveis & Badges
          </h1>
          <p className="text-xs sm:text-sm text-[#59595F] mt-1 max-w-xl">
            Cada interação, contribuição e estratégia compartilhada acelera sua autoridade no ecossistema Infinity Million.
          </p>
        </div>

        {/* Big XP Pill */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF6F2] to-white border border-[#BC9164]/40 text-center min-w-[160px] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#8E8984] tracking-wider block">
            Pontuação Total
          </span>
          <span className="text-3xl font-black text-[#312318]">{currentProfile.xp}</span>
          <span className="text-xs font-bold text-[#835629] block">XP Conquistados</span>
        </div>
      </div>

      {/* Current Rank Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#EBE6E2] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FAF6F2] to-[#EBE6E2] border border-[#BC9164]/50 flex items-center justify-center shadow-xs">
              <span className="text-2xl text-[#835629] font-bold font-serif-luxury">
                0{currentProfile.level}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#BC9164]">
                Nível Atual
              </span>
              <h2 className="text-xl font-black text-[#312318] tracking-tight">
                {currentLevelInfo.name}
              </h2>
              <p className="text-xs text-[#59595F]">
                {nextLevelInfo ? `Próximo marco: ${nextLevelInfo.name}` : 'Nível Máximo Atingido'}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-[#59595F] font-medium block">Distância para Próximo Nível</span>
            <span className="text-base font-bold text-[#312318]">
              {currentProfile.xp} / {maxXp} XP
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3.5 rounded-full bg-[#FAF6F2] border border-[#EBE6E2] p-[2px] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#BC9164] via-[#9F754B] to-[#835629] transition-all duration-700 shadow-xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 5 Levels Ladder */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#312318] mb-4">
          Hierarquia de Níveis do Ecossistema
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {INITIAL_LEVELS.map((lvl) => {
            const isUnlocked = currentProfile.level >= lvl.level;
            const isCurrent = currentProfile.level === lvl.level;

            return (
              <div
                key={lvl.level}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-white border-[#BC9164] shadow-md shadow-[#BC9164]/10 ring-1 ring-[#BC9164]/30'
                    : isUnlocked
                    ? 'bg-white border-[#EBE6E2]'
                    : 'bg-[#FAF6F2]/60 border-[#EBE6E2] opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-[#835629]">
                      0{lvl.level}
                    </span>
                    {isUnlocked ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-[#8E8984]" />
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-[#312318] uppercase tracking-wide">
                    {lvl.name}
                  </h4>
                  <span className="text-[10px] text-[#8E8984] block mt-0.5">
                    {lvl.minXp} XP mínimo
                  </span>

                  <ul className="mt-3 space-y-1">
                    {lvl.perks.map((perk, i) => (
                      <li key={i} className="text-[10px] text-[#59595F] leading-tight flex items-start gap-1">
                        <span className="text-[#BC9164] font-bold">•</span>
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-2 border-t border-[#EBE6E2]/70 text-[10px] font-bold text-center">
                  {isCurrent ? (
                    <span className="text-[#835629] uppercase">Nível Atual</span>
                  ) : isUnlocked ? (
                    <span className="text-emerald-600">Desbloqueado</span>
                  ) : (
                    <span className="text-[#8E8984]">Bloqueado</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Collection */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#312318] mb-4">
          Insígnias Metálicas & Badges de Honra
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INITIAL_BADGES.map((badge) => {
            const hasBadge = currentProfile.badges.includes(badge.code);

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl border transition-all ${
                  hasBadge
                    ? 'bg-white border-[#BC9164]/50 shadow-xs'
                    : 'bg-[#FAF6F2]/50 border-[#EBE6E2] opacity-60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      hasBadge
                        ? 'bg-gradient-to-br from-[#FAF6F2] to-[#EBE6E2] border-[#BC9164]/40 shadow-xs'
                        : 'bg-[#EBE6E2]/60 border-[#D7D0CB] text-[#8E8984]'
                    }`}
                  >
                    {getBadgeIcon(badge.code)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#312318] tracking-wide">
                        {badge.title}
                      </h4>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-[#FAF6F2] text-[#835629] border border-[#EBE6E2]">
                        {badge.rarity}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#59595F] mt-1 leading-relaxed">
                      {badge.description}
                    </p>

                    <div className="mt-2.5 text-[10px] font-bold">
                      {hasBadge ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Conquistado
                        </span>
                      ) : (
                        <span className="text-[#8E8984] flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Bloqueado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How to Earn XP Guide */}
      <div className="p-6 rounded-2xl bg-[#FAF6F2]/80 border border-[#EBE6E2]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#835629] mb-3 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-[#BC9164]" />
          Como Acumular XP no Infinity Million Hub
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-[#EBE6E2]">
            <span className="text-[#835629] font-black block text-base">+50 XP</span>
            <span className="font-semibold text-[#312318]">Completar Perfil</span>
            <p className="text-[10px] text-[#59595F] mt-0.5">Finalizar onboarding oficial</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#EBE6E2]">
            <span className="text-[#835629] font-black block text-base">+30 XP</span>
            <span className="font-semibold text-[#312318]">Nova Publicação</span>
            <p className="text-[10px] text-[#59595F] mt-0.5">Compartilhar ideia no feed</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#EBE6E2]">
            <span className="text-[#835629] font-black block text-base">+20 XP</span>
            <span className="font-semibold text-[#312318]">Conexão Realizada</span>
            <p className="text-[10px] text-[#59595F] mt-0.5">Expandir sua rede de membros</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#EBE6E2]">
            <span className="text-[#835629] font-black block text-base">+10 XP</span>
            <span className="font-semibold text-[#312318]">Comentário</span>
            <p className="text-[10px] text-[#59595F] mt-0.5">Gerar valor em discussões</p>
          </div>
        </div>
      </div>

    </div>
  );
};
