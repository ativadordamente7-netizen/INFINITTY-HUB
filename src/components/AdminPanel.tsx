import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  FileText,
  HelpCircle,
  TrendingUp,
  Trash2,
  Pin,
  Lock,
  Unlock,
  Search,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { UserRole, TicketStatus, ActiveTab } from '../types';

interface AdminPanelProps {
  onOpenProfile: (userId: string) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onOpenProfile, onNavigateTab }) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'USERS' | 'POSTS' | 'TICKETS' | 'METRICS'>('METRICS');
  const [searchUser, setSearchUser] = useState('');

  const users = useAppStore((s) => s.users);
  const profiles = useAppStore((s) => s.profiles);
  const posts = useAppStore((s) => s.posts);
  const tickets = useAppStore((s) => s.tickets);
  const strategies = useAppStore((s) => s.strategies);
  const toggleUserStatus = useAppStore((s) => s.toggleUserStatus);
  const updateUserRole = useAppStore((s) => s.updateUserRole);
  const togglePinPost = useAppStore((s) => s.togglePinPost);
  const deletePost = useAppStore((s) => s.deletePost);
  const updateTicketStatus = useAppStore((s) => s.updateTicketStatus);

  const openTickets = tickets.filter((t) => t.status === 'ABERTO').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'EM ATENDIMENTO').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#BC9164]/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6F2] border border-[#BC9164]/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#835629]" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#835629]">
              Painel de Comando • Administração Geral
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#312318] tracking-tight uppercase">
            Gestão & Moderação Infinity
          </h1>
          <p className="text-xs sm:text-sm text-[#59595F] mt-1">
            Controle de governança, membros ativos, moderação de publicações e atendimento aos membros.
          </p>
        </div>

        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Banco de Dados Supabase Online
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[#EBE6E2] pb-2 overflow-x-auto">
        {(
          [
            { key: 'METRICS', label: 'Visão Geral & Métricas', icon: TrendingUp },
            { key: 'USERS', label: `Alunos & Membros (${users.length})`, icon: Users },
            { key: 'POSTS', label: `Moderação de Feed (${posts.length})`, icon: FileText },
            { key: 'TICKETS', label: `Central de Suporte (${openTickets} abertos)`, icon: HelpCircle },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveAdminTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#312318] text-white shadow-xs'
                  : 'bg-white text-[#59595F] hover:bg-[#FAF6F2] border border-[#EBE6E2]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeAdminTab === 'METRICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#EBE6E2] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8E8984]">Total de Membros</span>
              <p className="text-3xl font-black text-[#312318] mt-1">{users.length}</p>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Cadastro real via Supabase Auth</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EBE6E2] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8E8984]">Publicações no Feed</span>
              <p className="text-3xl font-black text-[#312318] mt-1">{posts.length}</p>
              <span className="text-[10px] text-[#835629] font-semibold mt-1 block">Alta retenção diária</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EBE6E2] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8E8984]">Chamados Abertos</span>
              <p className="text-3xl font-black text-amber-600 mt-1">{openTickets}</p>
              <span className="text-[10px] text-[#59595F] mt-1 block">{inProgressTickets} em andamento</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EBE6E2] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8E8984]">Playbooks de Estratégia</span>
              <p className="text-3xl font-black text-[#835629] mt-1">{strategies.length}</p>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Conteúdo exclusivo</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EBE6E2] shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#312318] mb-4">
              Atalhos de Ação Rápida
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onNavigateTab('strategies')}
                className="p-4 rounded-xl border border-[#EBE6E2] hover:border-[#BC9164] text-left transition-colors cursor-pointer bg-[#FAF6F2]/40"
              >
                <BookOpen className="w-5 h-5 text-[#835629] mb-2" />
                <h4 className="text-xs font-bold text-[#312318]">Gerenciar Estratégias</h4>
                <p className="text-[11px] text-[#59595F] mt-0.5">Criar novos playbooks e anexar arquivos.</p>
              </button>

              <button
                onClick={() => setActiveAdminTab('TICKETS')}
                className="p-4 rounded-xl border border-[#EBE6E2] hover:border-[#BC9164] text-left transition-colors cursor-pointer bg-[#FAF6F2]/40"
              >
                <HelpCircle className="w-5 h-5 text-[#835629] mb-2" />
                <h4 className="text-xs font-bold text-[#312318]">Fila de Atendimento</h4>
                <p className="text-[11px] text-[#59595F] mt-0.5">Responder aos chamados de dúvidas de aulas.</p>
              </button>

              <button
                onClick={() => setActiveAdminTab('USERS')}
                className="p-4 rounded-xl border border-[#EBE6E2] hover:border-[#BC9164] text-left transition-colors cursor-pointer bg-[#FAF6F2]/40"
              >
                <Users className="w-5 h-5 text-[#835629] mb-2" />
                <h4 className="text-xs font-bold text-[#312318]">Auditar Acessos</h4>
                <p className="text-[11px] text-[#59595F] mt-0.5">Promover moderadores ou bloquear acessos indevidos.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === 'USERS' && (
        <div className="bg-white rounded-2xl border border-[#EBE6E2] p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EBE6E2]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#312318]">
              Gerenciamento de Membros & Permissões
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#8E8984] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#EBE6E2] text-xs focus:outline-none focus:border-[#BC9164]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EBE6E2] text-[#8E8984] uppercase text-[10px]">
                  <th className="py-2.5 px-3">Membro</th>
                  <th className="py-2.5 px-3">Cadastro</th>
                  <th className="py-2.5 px-3">Nível / XP</th>
                  <th className="py-2.5 px-3">Papel</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE6E2]">
                {users
                  .filter((u) => {
                    const prof = profiles.find((p) => p.userId === u.id);
                    const userName = prof?.name || 'Membro';
                    return (
                      userName.toLowerCase().includes(searchUser.toLowerCase()) ||
                      u.email.toLowerCase().includes(searchUser.toLowerCase())
                    );
                  })
                  .map((u) => {
                    const prof = profiles.find((p) => p.userId === u.id);
                    const userName = prof?.name || 'Membro Infinity';
                    const userAvatar = prof?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240';
                    return (
                      <tr key={u.id} className="hover:bg-[#FAF6F2]/60 transition-colors">
                        <td className="py-3 px-3">
                          <button
                            onClick={() => onOpenProfile(u.id)}
                            className="flex items-center gap-2.5 text-left cursor-pointer"
                          >
                            <img
                              src={userAvatar}
                              alt={userName}
                              className="w-8 h-8 rounded-full object-cover border border-[#EBE6E2]"
                            />
                            <div>
                              <p className="font-bold text-[#312318] hover:text-[#835629]">{userName}</p>
                              <p className="text-[10px] text-[#8E8984]">{u.email}</p>
                            </div>
                          </button>
                        </td>

                        <td className="py-3 px-3 text-[10px] text-[#8E8984]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '-'}
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-semibold text-[#312318]">Nível 0{prof?.level || 1}</span>
                          <span className="text-[10px] text-[#8E8984] block">{prof?.xp || 0} XP</span>
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                            className="px-2 py-1 rounded border border-[#EBE6E2] bg-white text-[11px] font-semibold text-[#312318]"
                          >
                            <option value="member">Aluno</option>
                            <option value="moderator">Moderador</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {u.status === 'active' ? 'Ativo' : 'Suspenso'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              u.status === 'active'
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.status === 'active' ? 'Suspender acesso' : 'Reativar aluno'}
                          >
                            {u.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeAdminTab === 'POSTS' && (
        <div className="bg-white rounded-2xl border border-[#EBE6E2] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBE6E2]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#312318]">
              Moderação de Conteúdo da Comunidade
            </h3>
            <span className="text-xs text-[#8E8984]">{posts.length} postagens no ecossistema</span>
          </div>

          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-xl border border-[#EBE6E2] bg-[#FAF6F2]/30 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-[#312318]">{post.authorName}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-white text-[#835629] border border-[#EBE6E2] font-semibold">
                      {post.category}
                    </span>
                    {post.isPinned && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#BC9164] text-white font-bold uppercase">
                        Fixado
                      </span>
                    )}
                    <span className="text-[10px] text-[#8E8984] ml-auto">{post.createdAt}</span>
                  </div>

                  <p className="text-xs text-[#59595F] line-clamp-2 leading-relaxed">{post.content}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => togglePinPost(post.id)}
                    className={`p-2 rounded-lg border text-xs transition-colors ${
                      post.isPinned
                        ? 'bg-[#BC9164]/15 border-[#BC9164] text-[#835629]'
                        : 'border-[#EBE6E2] text-[#8E8984] hover:text-[#312318]'
                    }`}
                    title={post.isPinned ? 'Desafixar publicação' : 'Fixar no topo'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Excluir esta publicação da comunidade?')) {
                        deletePost(post.id);
                      }
                    }}
                    className="p-2 rounded-lg border border-[#EBE6E2] text-red-600 hover:bg-red-50 transition-colors"
                    title="Remover publicação"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAdminTab === 'TICKETS' && (
        <div className="bg-white rounded-2xl border border-[#EBE6E2] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBE6E2]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#312318]">
              Fila Central de Suporte & Chamados
            </h3>
            <button
              onClick={() => onNavigateTab('support')}
              className="text-xs font-bold text-[#835629] hover:underline flex items-center gap-1"
            >
              <span>Abrir Central Completa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 rounded-xl border border-[#EBE6E2] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#835629] uppercase">{ticket.category}</span>
                    <span className="text-[10px] text-[#8E8984]">
                      • {ticket.userName} ({ticket.userEmail})
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#312318]">{ticket.subject}</h4>
                  {ticket.relatedLesson && (
                    <p className="text-[11px] text-[#59595F]">Aula: {ticket.relatedLesson}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={ticket.status}
                    onChange={(e) => updateTicketStatus(ticket.id, e.target.value as TicketStatus)}
                    className="px-2.5 py-1.5 rounded-lg border border-[#EBE6E2] text-xs font-semibold bg-[#FAF6F2]"
                  >
                    <option value="ABERTO">Aberto</option>
                    <option value="EM ATENDIMENTO">Em Atendimento</option>
                    <option value="RESOLVIDO">Resolvido</option>
                  </select>

                  <button
                    onClick={() => onNavigateTab('support')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-[#312318] text-white hover:bg-[#59595F] transition-colors"
                  >
                    Responder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
