import { supabase, SUPPORT_ATTACHMENTS_BUCKET, MAX_ATTACHMENT_SIZE_BYTES, ALLOWED_ATTACHMENT_TYPES } from '../lib/supabase';
import { Profile, SupportMessage, SupportTicket, TicketCategory, TicketStatus, UserRole } from '../types';
import { notificationService } from './notificationService';

interface TicketRow {
  id: string;
  user_id: string;
  user_email: string;
  category: TicketCategory;
  subject: string;
  description: string;
  related_lesson: string | null;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface AttachmentRow {
  id: string;
  ticket_id: string;
  message_id: string | null;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
}

export interface UploadResult {
  success: boolean;
  error?: string;
  path?: string;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR');
}

export const supportService = {
  validateAttachment(file: File): string | null {
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) return 'O arquivo é maior que 10 MB. Escolha um arquivo menor.';
    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) return 'Formato não suportado. Envie PNG, JPG, WEBP ou PDF.';
    return null;
  },

  async uploadAttachment(userId: string, ticketId: string, file: File): Promise<UploadResult> {
    const validationError = this.validateAttachment(file);
    if (validationError) return { success: false, error: validationError };

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${userId}/${ticketId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage.from(SUPPORT_ATTACHMENTS_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) return { success: false, error: 'Não foi possível enviar o arquivo. Tente novamente.' };

    const { error: dbError } = await supabase.from('support_attachments').insert({
      ticket_id: ticketId,
      uploaded_by: userId,
      file_name: file.name,
      file_path: path,
      mime_type: file.type,
      file_size: file.size,
    });

    if (dbError) return { success: false, error: 'Arquivo enviado, mas não foi possível registrá-lo no ticket.' };

    return { success: true, path };
  },

  async getSignedAttachmentUrl(path: string): Promise<string | null> {
    const { data, error } = await supabase.storage.from(SUPPORT_ATTACHMENTS_BUCKET).createSignedUrl(path, 60 * 60);
    if (error || !data) return null;
    return data.signedUrl;
  },

  async getTickets(): Promise<SupportTicket[]> {
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !tickets) return [];

    const ticketRows = tickets as TicketRow[];
    const ticketIds = ticketRows.map((t) => t.id);
    if (ticketIds.length === 0) return [];

    const [{ data: messages }, { data: attachments }, { data: profiles }] = await Promise.all([
      supabase.from('support_messages').select('*').in('ticket_id', ticketIds).order('created_at', { ascending: true }),
      supabase.from('support_attachments').select('*').in('ticket_id', ticketIds),
      supabase.from('profiles').select('user_id, name, avatar, role'),
    ]);

    const profileMap = new Map((profiles || []).map((p: { user_id: string; name: string; avatar: string; role: UserRole }) => [p.user_id, p]));
    const messagesByTicket = new Map<string, MessageRow[]>();
    (messages as MessageRow[] | null)?.forEach((m) => {
      const list = messagesByTicket.get(m.ticket_id) || [];
      list.push(m);
      messagesByTicket.set(m.ticket_id, list);
    });
    const attachmentsByTicket = new Map<string, AttachmentRow[]>();
    (attachments as AttachmentRow[] | null)?.forEach((a) => {
      const list = attachmentsByTicket.get(a.ticket_id) || [];
      list.push(a);
      attachmentsByTicket.set(a.ticket_id, list);
    });

    return ticketRows.map((t) => {
      const ownerProfile = profileMap.get(t.user_id) as { name?: string; avatar?: string } | undefined;
      const msgs = messagesByTicket.get(t.id) || [];
      const atts = attachmentsByTicket.get(t.id) || [];
      const firstAttachment = atts[0];

      const supportMessages: SupportMessage[] = msgs.map((m) => {
        const senderProfile = profileMap.get(m.sender_id) as { name?: string; avatar?: string; role?: UserRole } | undefined;
        return {
          id: m.id,
          ticketId: m.ticket_id,
          senderId: m.sender_id,
          senderName: senderProfile?.name || (senderProfile?.role === 'admin' ? 'Suporte Infinity Million' : 'Membro'),
          senderAvatar: senderProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240',
          senderRole: senderProfile?.role || 'member',
          message: m.message,
          createdAt: fmtDate(m.created_at),
        };
      });

      return {
        id: t.id,
        userId: t.user_id,
        userName: ownerProfile?.name || t.user_email.split('@')[0],
        userEmail: t.user_email,
        userAvatar: ownerProfile?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240',
        category: t.category,
        subject: t.subject,
        description: t.description,
        relatedLesson: t.related_lesson || undefined,
        attachmentName: firstAttachment?.file_name,
        attachmentUrl: firstAttachment?.file_path,
        status: t.status,
        messages: supportMessages,
        createdAt: fmtDate(t.created_at),
        updatedAt: fmtDate(t.updated_at),
      };
    });
  },

  async createTicket(
    userId: string,
    userEmail: string,
    data: { category: TicketCategory; subject: string; description: string; relatedLesson?: string },
    attachmentFile?: File | null
  ): Promise<{ ticket: SupportTicket | null; error?: string }> {
    const { data: inserted, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        user_email: userEmail,
        category: data.category,
        subject: data.subject,
        description: data.description,
        related_lesson: data.relatedLesson || null,
      })
      .select('*')
      .single();

    if (error || !inserted) return { ticket: null, error: 'Não foi possível abrir o chamado. Tente novamente.' };

    const ticketRow = inserted as TicketRow;

    await supabase.from('support_messages').insert({
      ticket_id: ticketRow.id,
      sender_id: userId,
      message: data.description,
    });

    if (attachmentFile) {
      await this.uploadAttachment(userId, ticketRow.id, attachmentFile);
    }

    const { data: admins } = await supabase.from('profiles').select('user_id').eq('role', 'admin');
    for (const admin of admins || []) {
      await notificationService.create(
        admin.user_id,
        `Novo Chamado de Suporte: ${data.subject}`,
        `Aberto por ${userEmail} (${data.category})`,
        'support',
        'support'
      );
    }

    void supabase.functions.invoke('notify-ticket', { body: { event: 'new_ticket', ticketId: ticketRow.id } });

    const tickets = await this.getTickets();
    return { ticket: tickets.find((t) => t.id === ticketRow.id) || null };
  },

  async addMessage(ticketId: string, senderId: string, senderRole: UserRole, message: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.from('support_messages').insert({ ticket_id: ticketId, sender_id: senderId, message });
    if (error) return { success: false, error: 'Não foi possível enviar sua resposta.' };

    if (senderRole === 'admin' || senderRole === 'moderator') {
      await supabase
        .from('support_tickets')
        .update({ status: 'EM ATENDIMENTO', updated_at: new Date().toISOString() })
        .eq('id', ticketId)
        .eq('status', 'ABERTO');

      const { data: ticket } = await supabase.from('support_tickets').select('user_id, subject').eq('id', ticketId).maybeSingle();
      if (ticket) {
        await notificationService.create(
          ticket.user_id,
          'Resposta no seu Ticket de Suporte',
          `A equipe Infinity respondeu ao chamado: "${ticket.subject}"`,
          'support',
          'support'
        );
      }

      void supabase.functions.invoke('notify-ticket', { body: { event: 'admin_reply', ticketId } });
    } else {
      await supabase.from('support_tickets').update({ updated_at: new Date().toISOString() }).eq('id', ticketId);
    }

    return { success: true };
  },

  async updateStatus(ticketId: string, status: TicketStatus): Promise<{ success: boolean; error?: string }> {
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ticketId)
      .select('user_id, subject')
      .maybeSingle();

    if (error || !ticket) return { success: false, error: 'Não foi possível atualizar o status do chamado.' };

    await notificationService.create(
      ticket.user_id,
      `Status do Suporte: ${status}`,
      `O chamado "${ticket.subject}" teve o status alterado para ${status}.`,
      'support',
      'support'
    );

    return { success: true };
  },
};

export type { Profile as SupportProfile };
