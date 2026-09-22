import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  Plus,
  Send,
  Paperclip,
  PhoneCall,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { TicketCategory, TicketStatus, Profile, UserRole } from '../types';
import { useAppStore } from '../store/useAppStore';
import { supportService } from '../services/supportService';

interface SupportCenterProps {
  currentProfile: Profile;
  userRole: UserRole;
}

const TICKET_CATEGORIES: TicketCategory[] = [
  'DÚVIDA SOBRE UMA AULA',
  'PROBLEMA TÉCNICO',
  'DÚVIDA ESTRATÉGICA',
  'OUTRO ASSUNTO',
];

export const SupportCenter: React.FC<SupportCenterProps> = ({ userRole }) => {
  const tickets = useAppStore((s) => s.tickets);
  const ticketsLoading = useAppStore((s) => s.ticketsLoading);
  const createTicket = useAppStore((s) => s.createTicket);
  const addTicketMessage = useAppStore((s) => s.addTicketMessage);
  const updateTicketStatus = useAppStore((s) => s.updateTicketStatus);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  const [category, setCategory] = useState<TicketCategory>('DÚVIDA SOBRE UMA AULA');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [relatedLesson, setRelatedLesson] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState('');

  const [formError, setFormError] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [signedAttachmentUrl, setSignedAttachmentUrl] = useState<string | null>(null);

  const [ticketFilter, setTicketFilter] = useState<'ALL' | 'ABERTO' | 'EM ATENDIMENTO' | 'RESOLVIDO'>('ALL');

  const filteredTickets = tickets.filter((t) => (ticketFilter === 'ALL' ? true : t.status === ticketFilter));
  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || (isCreatingTicket ? undefined : filteredTickets[0]);

  useEffect(() => {
    setSignedAttachmentUrl(null);
    if (activeTicket?.attachmentUrl) {
      supportService.getSignedAttachmentUrl(activeTicket.attachmentUrl).then(setSignedAttachmentUrl);
    }
  }, [activeTicket?.id, activeTicket?.attachmentUrl]);

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAttachmentError('');
    if (file) {
      const validationError = supportService.validateAttachment(file);
      if (validationError) {
        setAttachmentError(validationError);
        setAttachmentFile(null);
        e.target.value = '';
        return;
      }
    }
    setAttachmentFile(file);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!subject.trim() || !description.trim()) {
      setFormError('Assunto e descrição são obrigatórios.');
      return;
    }

    setSubmittingTicket(true);
    const result = await createTicket(
      {
        category,
        subject: subject.trim(),
        description: description.trim(),
        relatedLesson: relatedLesson.trim() || undefined,
      },
      attachmentFile
    );
    setSubmittingTicket(false);

    if (!result.success) {
      setFormError(result.error || 'Não foi possível abrir o chamado. Tente novamente.');
      return;
    }

    setSubject('');
    setDescription('');
    setRelatedLesson('');
    setAttachmentFile(null);
    setIsCreatingTicket(false);
    setSelectedTicketId(result.ticketId || null);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicket || sendingReply) return;

    setSendingReply(true);
    const result = await addTicketMessage(activeTicket.id, replyMessage.trim());
    setSendingReply(false);

    if (!result.success) {
      setFormError(result.error || 'Não foi possível enviar sua resposta.');
      return;
    }
    setReplyMessage('');
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!activeTicket) return;
    await updateTicketStatus(activeTicket.id, status);
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'ABERTO':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            Aberto
          </span>
        );
      case 'EM ATENDIMENTO':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            Em Atendimento
          </span>
        );
      case 'RESOLVIDO':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            Resolvido
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EBE6E2] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#835629]">
            Infinity Million Hub • Central de Atendimento
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#312318] tracking-tight uppercase mt-1">
            COMO PODEMOS AJUDAR?
          </h1>
          <p className="text-xs sm:text-sm text-[#59595F] mt-1 max-w-xl">
            Abra chamados para dúvidas pedagógicas, parametrização de campanhas ou suporte técnico do ecossistema.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setIsCreatingTicket(true);
              setSelectedTicketId(null);
              setFormError('');
            }}
            id="btn-new-ticket"
            className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#BC9164] to-[#835629] hover:from-[#9F754B] hover:to-[#6E441D] shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Ticket</span>
          </button>

          <a
            href="https://chat.whatsapp.com/Isb0NOn4p4p7N626xjEU4k"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#312318] bg-[#FAF6F2] hover:bg-[#EBE6E2] border border-[#EBE6E2] transition-colors flex items-center gap-2"
            title="Canal alternativo de contingência"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>Falar pelo WhatsApp</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EBE6E2] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EBE6E2]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#312318]">
              {userRole === 'admin' ? 'Todos os Chamados (Admin)' : 'Seus Chamados'} ({tickets.length})
            </h2>
            <div className="flex gap-1">
              {(['ALL', 'ABERTO', 'EM ATENDIMENTO', 'RESOLVIDO'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTicketFilter(filter)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${
                    ticketFilter === filter
                      ? 'bg-[#312318] text-white'
                      : 'bg-[#FAF6F2] text-[#8E8984] hover:text-[#312318]'
                  }`}
                >
                  {filter === 'ALL' ? 'Todos' : filter.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {ticketsLoading ? (
              <div className="py-12 text-center text-xs text-[#8E8984]">Carregando chamados...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8E8984]">
                Nenhum chamado encontrado nesta categoria.
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = activeTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTicketId(t.id);
                      setIsCreatingTicket(false);
                      setFormError('');
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#BC9164] bg-[#FAF6F2] shadow-xs'
                        : 'border-[#EBE6E2] hover:bg-[#FAF6F2]/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold text-[#8E8984] uppercase">
                        {t.category}
                      </span>
                      {getStatusBadge(t.status)}
                    </div>

                    <h4 className="text-xs font-bold text-[#312318] line-clamp-1 leading-snug">
                      {t.subject}
                    </h4>

                    {userRole === 'admin' && (
                      <p className="text-[11px] text-[#835629] font-medium mt-0.5">
                        Aluno: {t.userName} • {t.userEmail}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-[#8E8984] mt-2 pt-2 border-t border-[#EBE6E2]/60">
                      <span>{t.createdAt}</span>
                      <span>{t.messages.length} mensagens</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          {isCreatingTicket ? (
            <div className="bg-white rounded-2xl border border-[#EBE6E2] p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#EBE6E2] mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#312318]">
                  Abrir Novo Chamado
                </h3>
                <button
                  onClick={() => setIsCreatingTicket(false)}
                  className="text-xs text-[#8E8984] hover:text-[#312318]"
                >
                  Cancelar
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#59595F] mb-1.5">
                    Categoria do Assunto
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {TICKET_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                          category === cat
                            ? 'border-[#BC9164] bg-[#FAF6F2] text-[#835629]'
                            : 'border-[#EBE6E2] hover:bg-[#FAF6F2]/60 text-[#59595F]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#59595F] mb-1">
                    Assunto do Chamado *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Dúvida sobre conversão de UTMs na Kiwify"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE6E2] text-xs focus:outline-none focus:border-[#BC9164]"
                  />
                </div>

                {category === 'DÚVIDA SOBRE UMA AULA' && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#59595F] mb-1">
                      Módulo & Aula Relacionada
                    </label>
                    <input
                      type="text"
                      value={relatedLesson}
                      onChange={(e) => setRelatedLesson(e.target.value)}
                      placeholder="Ex: Módulo 03 - Aula 07: Rastreamento Cirúrgico"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE6E2] text-xs focus:outline-none focus:border-[#BC9164]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-[#59595F] mb-1">
                    Descrição Detalhada *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explique o que aconteceu, o que você tentou executar e o comportamento esperado..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE6E2] text-xs focus:outline-none focus:border-[#BC9164] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#59595F] mb-1 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#BC9164]" />
                    Adicionar Print / Imagem (opcional)
                  </label>
                  {!attachmentFile ? (
                    <label className="flex items-center justify-center gap-2 w-full px-3.5 py-4 rounded-xl border-2 border-dashed border-[#EBE6E2] text-xs text-[#8E8984] hover:border-[#BC9164]/50 hover:text-[#835629] cursor-pointer transition-colors">
                      <ImageIcon className="w-4 h-4" />
                      <span>Clique para escolher PNG, JPG, WEBP ou PDF (máx. 10 MB)</span>
                      <input type="file" accept=".png,.jpg,.jpeg,.webp,.pdf" onChange={handleAttachmentChange} className="hidden" />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#BC9164]/40 bg-[#FAF6F2] text-xs">
                      <span className="text-[#312318] font-medium truncate">{attachmentFile.name}</span>
                      <button type="button" onClick={() => setAttachmentFile(null)} className="text-[#8E8984] hover:text-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {attachmentError && <p className="text-[11px] text-red-600 mt-1">{attachmentError}</p>}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingTicket(false)}
                    className="px-4 py-2.5 rounded-xl text-xs border border-[#EBE6E2] text-[#59595F]"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTicket}
                    id="btn-submit-ticket"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#BC9164] to-[#835629] hover:from-[#9F754B] hover:to-[#6E441D] cursor-pointer disabled:opacity-60"
                  >
                    {submittingTicket ? 'ABRINDO CHAMADO...' : 'Enviar Chamado'}
                  </button>
                </div>
              </form>
            </div>
          ) : activeTicket ? (
            <div className="bg-white rounded-2xl border border-[#EBE6E2] overflow-hidden shadow-xs flex flex-col h-full min-h-[520px]">

              <div className="p-5 border-b border-[#EBE6E2] bg-[#FAF6F2]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#835629] uppercase tracking-wider">
                      Ticket #{activeTicket.id.slice(0, 8)}
                    </span>
                    <span>•</span>
                    {getStatusBadge(activeTicket.status)}
                  </div>
                  <h3 className="text-base font-bold text-[#312318] leading-tight">
                    {activeTicket.subject}
                  </h3>
                  {activeTicket.relatedLesson && (
                    <p className="text-[11px] text-[#59595F] mt-0.5">
                      Aula: <span className="font-semibold">{activeTicket.relatedLesson}</span>
                    </p>
                  )}
                  {userRole === 'admin' && (
                    <p className="text-[11px] text-[#835629] mt-0.5">
                      Aluno: <span className="font-semibold">{activeTicket.userName}</span> ({activeTicket.userEmail})
                    </p>
                  )}
                </div>

                {userRole === 'admin' && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-[#8E8984] uppercase mr-1">Status:</span>
                    <select
                      value={activeTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                      className="px-2.5 py-1 rounded-lg border border-[#EBE6E2] text-xs font-semibold bg-white"
                    >
                      <option value="ABERTO">Aberto</option>
                      <option value="EM ATENDIMENTO">Em Atendimento</option>
                      <option value="RESOLVIDO">Resolvido</option>
                    </select>
                  </div>
                )}
              </div>

              {activeTicket.attachmentUrl && (
                <div className="px-5 pt-4">
                  <p className="text-[10px] font-bold uppercase text-[#8E8984] mb-1.5">Anexo enviado</p>
                  {signedAttachmentUrl ? (
                    <a
                      href={signedAttachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#EBE6E2] bg-[#FAF6F2] text-xs text-[#835629] font-semibold hover:border-[#BC9164]"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      {activeTicket.attachmentName || 'Ver anexo'}
                    </a>
                  ) : (
                    <span className="text-[11px] text-[#8E8984]">Carregando link do anexo...</span>
                  )}
                </div>
              )}

              {formError && (
                <div className="mx-5 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <div className="p-5 overflow-y-auto flex-1 space-y-4 max-h-[380px]">
                {activeTicket.messages.map((msg) => {
                  const isAdmin = msg.senderRole === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 text-xs ${isAdmin ? 'bg-[#FAF6F2] p-4 rounded-xl border border-[#BC9164]/30' : ''}`}
                    >
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#BC9164]/30"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#312318]">
                              {isAdmin ? 'Suporte Infinity Million' : msg.senderName}
                            </span>
                            {isAdmin && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-[#835629] text-white">
                                Suporte Oficial
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#8E8984]">{msg.createdAt}</span>
                        </div>
                        <p className="text-[#312318] leading-relaxed whitespace-pre-line">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendReply} className="p-4 border-t border-[#EBE6E2] bg-[#F8F4F0]/60 flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={
                    userRole === 'admin'
                      ? 'Responder oficialmente como Suporte Infinity...'
                      : 'Adicione uma resposta ou esclarecimento...'
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#EBE6E2] bg-white text-xs focus:outline-none focus:border-[#BC9164]"
                />
                <button
                  type="submit"
                  disabled={!replyMessage.trim() || sendingReply}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#BC9164] to-[#835629] hover:from-[#9F754B] hover:to-[#6E441D] disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{sendingReply ? 'ENVIANDO...' : 'Enviar'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#EBE6E2] p-12 text-center shadow-xs">
              <HelpCircle className="w-10 h-10 text-[#8E8984] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#312318]">Nenhum chamado selecionado</h3>
              <p className="text-xs text-[#59595F] mt-1">
                Selecione um chamado ao lado ou clique em "Novo Ticket" para solicitar auxílio.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
