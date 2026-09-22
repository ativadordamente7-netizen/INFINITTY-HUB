import React, { useEffect, useState } from 'react';
import {
  Home,
  Users,
  BookOpen,
  HelpCircle,
  User,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

import { ActiveTab } from './types';
import { useAppStore } from './store/useAppStore';

import { BackgroundCanvas } from './components/BackgroundCanvas';
import { Header } from './components/Header';
import { LandingCinema } from './components/LandingCinema';
import { FreeAccessGateway } from './components/FreeAccessGateway';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { HomeDashboard } from './components/HomeDashboard';
import { CommunityFeed } from './components/CommunityFeed';
import { StrategiesLibrary } from './components/StrategiesLibrary';
import { SupportCenter } from './components/SupportCenter';
import { NetworkDirectory } from './components/NetworkDirectory';
import { AchievementsView } from './components/AchievementsView';
import { UserProfileView } from './components/UserProfileView';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const initialized = useAppStore((s) => s.initialized);
  const authLoading = useAppStore((s) => s.authLoading);
  const currentUser = useAppStore((s) => s.currentUser);
  const currentProfile = useAppStore((s) => s.currentProfile);
  const init = useAppStore((s) => s.init);
  const signOut = useAppStore((s) => s.signOut);

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [viewingProfileUserId, setViewingProfileUserId] = useState<string | null>(null);
  const [showPresentationView, setShowPresentationView] = useState(false);
  const [copiedLinkHeader, setCopiedLinkHeader] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  useEffect(() => {
    init();
  }, [init]);

  const handleCopyShareLink = () => {
    try {
      const url = window.location.origin || window.location.href;
      navigator.clipboard.writeText(url);
    } finally {
      setCopiedLinkHeader(true);
      setTimeout(() => setCopiedLinkHeader(false), 2000);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await signOut();
    setActiveTab('home');
    setViewingProfileUserId(null);
  };

  const handleOpenProfile = (userId: string) => {
    setViewingProfileUserId(userId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCompletedOnboarding = currentProfile?.completedOnboarding ?? true;

  if (authLoading || !initialized) {
    return (
      <div className="min-h-screen bg-[#F8F4F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#BC9164] border-t-transparent animate-spin" />
          <span className="text-xs uppercase tracking-widest text-[#835629] font-bold">Carregando Central...</span>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    if (!currentUser || !currentProfile) return null;

    if (viewingProfileUserId) {
      return (
        <div className="space-y-4">
          <button
            onClick={() => setViewingProfileUserId(null)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#EBE6E2] bg-white text-xs font-semibold text-[#59595F] hover:text-[#312318] hover:bg-[#FAF6F2] transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-[#BC9164]" />
            <span>Voltar</span>
          </button>
          <UserProfileView
            viewingUserId={viewingProfileUserId}
            currentUserId={currentUser.id}
            userRole={currentUser.role}
            onClose={() => setViewingProfileUserId(null)}
            onOpenAnotherProfile={handleOpenProfile}
          />
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeDashboard
            currentProfile={currentProfile}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCreatePost={() => {
              setActiveTab('feed');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      case 'feed':
        return (
          <CommunityFeed
            currentProfile={currentProfile}
            userRole={currentUser.role}
            onOpenProfile={handleOpenProfile}
          />
        );
      case 'strategies':
        return <StrategiesLibrary userRole={currentUser.role} />;
      case 'support':
        return <SupportCenter currentProfile={currentProfile} userRole={currentUser.role} />;
      case 'network':
        return <NetworkDirectory currentProfile={currentProfile} onOpenProfile={handleOpenProfile} />;
      case 'achievements':
        return <AchievementsView currentProfile={currentProfile} />;
      case 'profile':
        return (
          <UserProfileView
            viewingUserId={currentUser.id}
            currentUserId={currentUser.id}
            userRole={currentUser.role}
            onOpenAnotherProfile={handleOpenProfile}
          />
        );
      case 'admin':
        return (
          <AdminPanel
            onOpenProfile={handleOpenProfile}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen font-sans antialiased relative selection:bg-[#D4AF6A]/30 selection:text-[#0B0906] ${
        !currentUser ? 'bg-[#0B0906] text-[#F5EFE4]' : 'bg-[#F8F4F0] text-[#312318]'
      }`}
    >
      <BackgroundCanvas />

      {!currentUser ? (
        <div className="relative z-10">
          <header className="sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-[#D4AF6A]/15 bg-[#0B0906]/85 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F0D8A0] via-[#D4AF6A] to-[#8A6A2E] flex items-center justify-center shadow-[0_0_18px_rgba(212,175,106,0.35)]">
                <span className="text-sm font-black text-[#0B0906] font-serif-luxury">∞</span>
              </div>
              <div>
                <span className="font-extrabold text-xs tracking-[0.2em] uppercase text-[#F5EFE4] block">
                  INFINITY MILLION
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#D4AF6A] font-bold block">
                  CENTRAL DE ACESSO • COMUNIDADE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleCopyShareLink}
                id="btn-header-share-link"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#C9C2B4] hover:text-[#F5EFE4] bg-white/5 hover:bg-white/10 border border-[#D4AF6A]/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Copiar link para convidar outra pessoa para a central"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#D4AF6A]" />
                <span className="hidden sm:inline">
                  {copiedLinkHeader ? 'Link Copiado!' : 'Copiar Link da Central'}
                </span>
                <span className="sm:hidden">{copiedLinkHeader ? 'Copiado!' : 'Link'}</span>
              </button>

              <button
                onClick={() => setShowPresentationView((prev) => !prev)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#D4AF6A] hover:bg-white/5 transition-colors cursor-pointer"
              >
                {showPresentationView ? 'Acesso Direto (1ª Etapa)' : 'Apresentação'}
              </button>

              <button
                onClick={() => handleOpenAuth('login')}
                className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#0B0906] bg-gradient-to-r from-[#F0D8A0] via-[#D4AF6A] to-[#B8924A] hover:brightness-110 shadow-[0_0_18px_rgba(212,175,106,0.3)] transition-all cursor-pointer"
              >
                Entrar
              </button>
            </div>
          </header>

          {showPresentationView ? (
            <LandingCinema
              onEnter={() => setShowPresentationView(false)}
              onExplore={() => setShowPresentationView(false)}
              onOpenAuth={handleOpenAuth}
            />
          ) : (
            <FreeAccessGateway onExploreCinema={() => setShowPresentationView(true)} />
          )}
        </div>
      ) : (
        <div className="relative z-10 flex min-h-screen">
          {!isCompletedOnboarding && <OnboardingModal userId={currentUser.id} />}

          <aside
            id="sidebar-geometric"
            className="hidden lg:flex w-[260px] flex-col border-r border-[#D7D0CB] bg-[#EBE6E2] flex-shrink-0 sticky top-0 h-screen overflow-y-auto z-30"
          >
            <div className="p-8">
              <div
                onClick={() => {
                  setViewingProfileUserId(null);
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center space-x-3 mb-10 cursor-pointer group"
                id="sidebar-brand"
              >
                <span className="text-3xl text-[#BC9164] group-hover:scale-110 transition-transform">∞</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-[0.2em] text-[#835629]">INFINITY MILLION</span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#59595F]">HUB CENTRAL</span>
                </div>
              </div>

              <nav className="space-y-6">
                {[
                  { id: 'home', label: 'Início' },
                  { id: 'feed', label: 'Comunidade' },
                  { id: 'strategies', label: 'Estratégias' },
                  { id: 'support', label: 'Suporte' },
                  { id: 'network', label: 'Minha Rede' },
                  { id: 'achievements', label: 'Conquistas' },
                  ...(currentUser.role === 'admin' ? [{ id: 'admin', label: 'Painel Admin' }] : []),
                ].map((item) => {
                  const isActive = activeTab === item.id && !viewingProfileUserId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setViewingProfileUserId(null);
                        setActiveTab(item.id as ActiveTab);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`flex items-center space-x-4 cursor-pointer group transition-all ${
                        isActive ? 'text-[#BC9164]' : 'text-[#59595F] hover:translate-x-1 hover:text-[#312318]'
                      }`}
                    >
                      <div
                        className={`w-1 h-4 rounded-full transition-opacity ${
                          isActive ? 'bg-[#BC9164] opacity-100' : 'opacity-0'
                        }`}
                      />
                      <span className={`text-sm uppercase tracking-wider ${isActive ? 'font-semibold' : 'font-medium'}`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </nav>
            </div>

            <div className="mt-auto p-8 border-t border-[#D7D0CB]">
              <div
                onClick={() => {
                  setViewingProfileUserId(null);
                  setActiveTab('profile');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center space-x-3 cursor-pointer group"
                id="sidebar-user-profile"
              >
                <div className="w-10 h-10 rounded-full border-2 border-[#BC9164] p-0.5 group-hover:scale-105 transition-transform flex-shrink-0">
                  <img
                    src={currentProfile.avatar}
                    alt={currentProfile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-[#312318] truncate group-hover:text-[#835629] transition-colors">
                    {currentProfile.name}
                  </p>
                  <p className="text-[10px] text-[#59595F]">Ver Perfil</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
            <Header
              currentUser={currentUser}
              currentProfile={currentProfile}
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setViewingProfileUserId(null);
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onLogout={handleLogout}
            />

            <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 pb-24 lg:pb-8 space-y-6">
              {renderCurrentView()}
            </main>

            <footer
              id="footer-status-bar"
              className="h-12 border-t px-6 lg:px-10 flex items-center justify-between text-[9px] uppercase tracking-widest text-[#59595F] opacity-75 border-[#EBE6E2] bg-[#F8F4F0]"
            >
              <div className="flex space-x-6">
                <span>ID: #IM{currentUser.id.slice(0, 6).toUpperCase()}</span>
                <span>Membro Ativo</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Banco de Dados Online — Supabase</span>
              </div>
            </footer>

            <nav
              className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F8F4F0]/95 backdrop-blur-md border-t border-[#EBE6E2] px-3 py-2 flex items-center justify-around shadow-lg"
              id="mobile-bottom-navigation"
            >
              <button
                onClick={() => {
                  setViewingProfileUserId(null);
                  setActiveTab('home');
                }}
                className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
                  activeTab === 'home' && !viewingProfileUserId ? 'text-[#835629] font-bold' : 'text-[#8E8984]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="text-[9px] uppercase font-bold tracking-wider">Home</span>
              </button>

              <button
                onClick={() => {
                  setViewingProfileUserId(null);
                  setActiveTab('feed');
                }}
                className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
                  activeTab === 'feed' && !viewingProfileUserId ? 'text-[#835629] font-bold' : 'text-[#8E8984]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-[9px] uppercase font-bold tracking-wider">Feed</span>
              </button>

              <button
                onClick={() => {
                  setViewingProfileUserId(null);
                  setActiveTab('strategies');
                }}
                className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
                  activeTab === 'strategies' && !viewingProfileUserId ? 'text-[#835629] font-bold' : 'text-[#8E8984]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-[9px] uppercase font-bold tracking-wider">Estratégias</span>
              </button>

              <button
                onClick={() => {
                  setViewingProfileUserId(null);
                  setActiveTab('support');
                }}
                className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
                  activeTab === 'support' && !viewingProfileUserId ? 'text-[#835629] font-bold' : 'text-[#8E8984]'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-[9px] uppercase font-bold tracking-wider">Suporte</span>
              </button>

              <button
                onClick={() => {
                  setViewingProfileUserId(null);
                  setActiveTab('profile');
                }}
                className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
                  activeTab === 'profile' && !viewingProfileUserId ? 'text-[#835629] font-bold' : 'text-[#8E8984]'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-[9px] uppercase font-bold tracking-wider">Perfil</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => setAuthModalOpen(false)}
        />
      )}
    </div>
  );
}
