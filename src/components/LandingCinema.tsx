import React from 'react';
import { ArrowRight, Compass, ShieldCheck, Award, Users, BookOpen } from 'lucide-react';

interface LandingCinemaProps {
  onEnter?: () => void;
  onExplore?: () => void;
  onOpenDatabase?: () => void;
  onOpenAuth?: (tab: 'login' | 'register') => void;
}

export const LandingCinema: React.FC<LandingCinemaProps> = ({
  onEnter,
  onExplore,
  onOpenDatabase,
  onOpenAuth,
}) => {
  const handleEnter = () => {
    if (onEnter) onEnter();
    else if (onOpenAuth) onOpenAuth('login');
  };

  const handleExplore = () => {
    if (onExplore) onExplore();
    else if (onOpenAuth) onOpenAuth('register');
  };

  const handleOpenDb = () => {
    if (onOpenDatabase) onOpenDatabase();
  };
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Decorative subtle golden geometric rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] rounded-full border border-[#BC9164]/10 pointer-events-none -z-10 animate-spin-orbital" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[920px] rounded-full border border-[#BC9164]/5 pointer-events-none -z-10 animate-reverse-spin-orbital" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#BC9164]/5 blur-3xl rounded-full pointer-events-none -z-10 animate-pulse-glow" />

      {/* Top Pre-badge */}
      <div className="max-w-4xl mx-auto text-center pt-6 sm:pt-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#BC9164]/30 shadow-xs mb-8">
          <span className="w-2 h-2 rounded-full bg-[#BC9164] animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wider text-[#835629] uppercase">
            Acesso Exclusivo • Alunos Kiwify
          </span>
        </div>

        {/* Central Logo Symbol */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#FFFFFF] to-[#EBE6E2] border border-[#BC9164]/40 flex items-center justify-center shadow-lg shadow-[#835629]/5">
            <span className="text-3xl sm:text-4xl text-[#835629] font-bold font-serif-luxury">
              ∞
            </span>
          </div>
        </div>

        {/* Brand Name */}
        <p className="text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-[#835629] mb-4">
          INFINITY MILLION
        </p>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#312318] tracking-tight leading-[1.15] mb-6">
          VOCÊ CHEGOU À CENTRAL.
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl font-medium text-[#59595F] max-w-2xl mx-auto mb-6">
          Um espaço reservado para quem decidiu construir algo diferente.
        </p>

        {/* Description Text */}
        <p className="text-sm sm:text-base text-[#59595F]/90 max-w-xl mx-auto leading-relaxed mb-10">
          Conecte-se, compartilhe, aprenda, tire dúvidas e acompanhe sua evolução dentro do Infinity Million.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={handleEnter}
            id="btn-landing-enter"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm tracking-wider uppercase text-white bg-gradient-to-r from-[#BC9164] to-[#835629] hover:from-[#9F754B] hover:to-[#6E441D] shadow-md shadow-[#835629]/20 transition-all flex items-center justify-center gap-2 group cursor-pointer hover:scale-[1.02]"
          >
            <span>ENTRAR NA CENTRAL</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleExplore}
            id="btn-landing-explore"
            className="w-full sm:w-auto px-7 py-4 rounded-xl font-bold text-sm tracking-wider uppercase text-[#312318] bg-white/80 hover:bg-white border border-[#EBE6E2] hover:border-[#BC9164]/40 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#BC9164]" />
            <span>CONHECER O HUB</span>
          </button>
        </div>
      </div>

      {/* 4 Pillars of Excellence Preview */}
      <div className="max-w-5xl mx-auto w-full mt-16 pt-8 border-t border-[#EBE6E2]/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="p-4 rounded-xl bg-white/60 border border-[#EBE6E2] text-left">
            <div className="w-8 h-8 rounded-lg bg-[#FAF6F2] border border-[#BC9164]/30 flex items-center justify-center mb-3">
              <Users className="w-4 h-4 text-[#835629]" />
            </div>
            <h2 className="font-bold text-xs sm:text-sm text-[#312318]">Comunidade Privada</h2>
            <p className="text-[11px] text-[#59595F] mt-1 leading-normal">
              Feed limpo de mentes que constroem operações de 6 a 7 dígitos.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/60 border border-[#EBE6E2] text-left">
            <div className="w-8 h-8 rounded-lg bg-[#FAF6F2] border border-[#BC9164]/30 flex items-center justify-center mb-3">
              <BookOpen className="w-4 h-4 text-[#835629]" />
            </div>
            <h2 className="font-bold text-xs sm:text-sm text-[#312318]">Estratégias Avançadas</h2>
            <p className="text-[11px] text-[#59595F] mt-1 leading-normal">
              Acervo de blueprints proprietários de tráfego, copy e IA.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/60 border border-[#EBE6E2] text-left">
            <div className="w-8 h-8 rounded-lg bg-[#FAF6F2] border border-[#BC9164]/30 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4 text-[#835629]" />
            </div>
            <h2 className="font-bold text-xs sm:text-sm text-[#312318]">Suporte Cirúrgico</h2>
            <p className="text-[11px] text-[#59595F] mt-1 leading-normal">
              Abertura direta de chamados técnicos e dúvidas sobre as aulas Kiwify.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/60 border border-[#EBE6E2] text-left">
            <div className="w-8 h-8 rounded-lg bg-[#FAF6F2] border border-[#BC9164]/30 flex items-center justify-center mb-3">
              <Award className="w-4 h-4 text-[#835629]" />
            </div>
            <h2 className="font-bold text-xs sm:text-sm text-[#312318]">Gamificação & XP</h2>
            <p className="text-[11px] text-[#59595F] mt-1 leading-normal">
              5 níveis de evolução com insígnias metálicas exclusivas.
            </p>
          </div>

        </div>

        {/* Footer Note */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8E8984] gap-2">
          <span>∞ INFINITY MILLION HUB • CENTRAL DE SUPORTE • COMUNIDADE • NETWORKING</span>
          <button
            onClick={handleOpenDb}
            className="text-[11px] text-[#835629] hover:underline font-medium cursor-pointer"
          >
            Ver Arquitetura de Banco & Integração Kiwify
          </button>
        </div>
      </div>

    </div>
  );
};
