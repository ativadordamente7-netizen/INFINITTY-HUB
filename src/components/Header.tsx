import React, { useState } from 'react';
import { Bell, ShieldCheck, ChevronDown, UserCircle, LogOut } from 'lucide-react';
import { User, Profile, NotificationItem, ActiveTab } from '../types';
import { useAppStore } from '../store/useAppStore';

interface HeaderProps {
  currentUser: User;
  currentProfile: Profile;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentProfile,
  setActiveTab,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = useAppStore((s) => s.notifications);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (item: NotificationItem) => {
    if (item.linkTo) {
      setActiveTab(item.linkTo as ActiveTab);
    }
    setShowNotifications(false);
  };

  const markAllRead = () => {
    markAllNotificationsRead();
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F4F0]/90 backdrop-blur-md border-b border-[#EBE6E2]">
      <div className="w-full px-4 sm:px-6 lg:px-10 h-16 lg:h-20 flex items-center justify-between">

        <div className="hidden lg:block">
          <h1 className="text-xl font-light tracking-tight text-[#312318]">
            Bem-vindo, <span className="font-bold">{currentProfile.name.split(' ')[0]}</span>
          </h1>
          <p className="text-[11px] uppercase tracking-[0.1em] text-[#835629]">
            Sua próxima evolução começa aqui.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('home')}
          className="lg:hidden flex items-center space-x-2.5 cursor-pointer group"
          id="btn-header-brand"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#BC9164] to-[#835629] p-[1px] flex items-center justify-center shadow-xs">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <span className="text-[#835629] text-base font-bold font-serif-luxury leading-none">∞</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-[0.16em] text-xs sm:text-sm text-[#312318] flex items-center gap-1.5">
              INFINITY MILLION
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#EBE6E2] text-[#835629] font-medium tracking-normal">
                HUB
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              id="btn-user-menu-toggle"
              className="flex items-center gap-2 py-1 px-2 sm:px-2.5 rounded-full bg-white border border-[#EBE6E2] hover:border-[#BC9164]/60 transition-all text-xs text-[#312318] shadow-xs"
            >
              <img
                src={currentProfile.avatar}
                alt={currentProfile.name}
                className="w-6 h-6 rounded-full object-cover border border-[#BC9164]/30"
              />
              <div className="text-left hidden sm:block">
                <span className="font-semibold block leading-tight text-[11px] truncate max-w-[90px]">
                  {currentProfile.name.split(' ')[0]}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#BC9164] font-bold">
                  {currentUser.role === 'admin' ? 'Admin' : `Nível 0${currentProfile.level}`}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#59595F]" />
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#EBE6E2] py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                id="user-account-dropdown"
              >
                <div className="px-3.5 py-2.5 border-b border-[#EBE6E2] bg-[#F8F4F0]/60">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentProfile.avatar}
                      alt={currentProfile.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#BC9164]"
                    />
                    <div className="overflow-hidden">
                      <p className="font-semibold text-xs text-[#312318] truncate">{currentProfile.name}</p>
                      <p className="text-[10px] text-[#59595F] truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-[#BC9164]/15 text-[#835629] border border-[#BC9164]/30">
                          {currentUser.role}
                        </span>
                        <span className="text-[10px] text-[#835629] font-medium">
                          {currentProfile.xp} XP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-3.5 py-1.5 text-xs text-[#312318] hover:bg-[#F8F4F0] flex items-center gap-2"
                  >
                    <UserCircle className="w-4 h-4 text-[#BC9164]" />
                    <span>Meu Perfil Completo</span>
                  </button>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-3.5 py-1.5 text-xs text-[#835629] font-medium hover:bg-[#F8F4F0] flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#BC9164]" />
                      <span>Painel da Administração</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-3.5 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair da Central</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              id="btn-notifications-toggle"
              className="p-2 rounded-full hover:bg-[#EBE6E2] text-[#59595F] hover:text-[#312318] transition-colors relative"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5 text-[#59595F]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#BC9164] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#EBE6E2] z-50 overflow-hidden"
                id="notifications-popover"
              >
                <div className="px-4 py-3 border-b border-[#EBE6E2] flex items-center justify-between bg-[#F8F4F0]/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#312318]">
                      Notificações
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[#BC9164]/20 text-[#835629] text-[10px] font-bold">
                        {unreadCount} novas
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-[#835629] hover:underline font-medium"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#EBE6E2]/70">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#8E8984]">
                      Nenhuma notificação no momento.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-3.5 hover:bg-[#F8F4F0] cursor-pointer transition-colors ${
                          !item.read ? 'bg-[#FAF6F2]' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-xs text-[#312318]">{item.title}</p>
                          <span className="text-[10px] text-[#8E8984] whitespace-nowrap">
                            {item.createdAt}
                          </span>
                        </div>
                        <p className="text-xs text-[#59595F] mt-1 leading-relaxed">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
