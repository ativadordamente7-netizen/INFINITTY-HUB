// Supabase Edge Function — supabase/functions/notify-ticket/index.ts
//
// O QUE ISSO FAZ:
// Sempre que um ticket de suporte é criado, ou que o admin responde um ticket,
// o frontend chama esta função (supabase.functions.invoke('notify-ticket', ...)).
// Ela roda no servidor do Supabase — nunca no navegador — então é o único lugar
// seguro para usar a SUPABASE_SERVICE_ROLE_KEY e a RESEND_API_KEY.
//
// COMO IMPLANTAR (veja o passo a passo completo em SUPABASE_SETUP.md):
//   supabase functions deploy notify-ticket
//   supabase secrets set RESEND_API_KEY=... ADMIN_NOTIFICATION_EMAIL=ativadordamente7@gmail.com
//
// Se RESEND_API_KEY não estiver configurada, a função só registra um log e não
// falha — assim o app continua funcionando mesmo antes de você configurar o e-mail.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const ADMIN_NOTIFICATION_EMAIL = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'ativadordamente7@gmail.com';
const SITE_URL = Deno.env.get('SITE_URL') || '';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function emailShell(title: string, bodyHtml: string, ctaLabel: string, ctaUrl: string) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FAF6F2; border-radius: 12px; border: 1px solid #EBE6E2;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #312318; font-size: 22px; margin: 0;">∞ Infinity Million Hub</h1>
      <p style="color: #835629; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-top: 4px;">${title}</p>
    </div>
    <div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #EBE6E2; font-size: 14px; color: #312318; line-height: 1.6;">
      ${bodyHtml}
    </div>
    ${
      ctaUrl
        ? `<div style="text-align: center; margin-top: 20px;">
             <a href="${ctaUrl}" style="display:inline-block; padding: 12px 24px; border-radius: 10px; background: linear-gradient(90deg,#BC9164,#835629); color: white; text-decoration:none; font-weight:bold; font-size:12px; text-transform:uppercase; letter-spacing:1px;">${ctaLabel}</a>
           </div>`
        : ''
    }
  </div>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log(`[notify-ticket] RESEND_API_KEY não configurada — pulando envio para ${to}: ${subject}`);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Infinity Million <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    console.error('[notify-ticket] Falha ao enviar e-mail via Resend:', await res.text());
  }
}

Deno.serve(async (req) => {
  try {
    const { event, ticketId } = await req.json();

    const { data: ticket, error } = await admin
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .maybeSingle();

    if (error || !ticket) {
      return new Response(JSON.stringify({ ok: false, error: 'Ticket não encontrado' }), { status: 404 });
    }

    const ticketUrl = SITE_URL ? `${SITE_URL}/?ticket=${ticket.id}` : '';

    if (event === 'new_ticket') {
      const html = emailShell(
        'Novo Chamado de Suporte',
        `<p><strong>Aluno:</strong> ${ticket.user_email}</p>
         <p><strong>Categoria:</strong> ${ticket.category}</p>
         <p><strong>Assunto:</strong> ${ticket.subject}</p>
         <div style="background:#F8F4F0; padding:12px; border-radius:6px; margin-top:12px;">${ticket.description.replace(/\n/g, '<br/>')}</div>`,
        'VER TICKET NO PAINEL',
        ticketUrl
      );
      await sendEmail(ADMIN_NOTIFICATION_EMAIL, `[SUPORTE] ${ticket.subject}`, html);
    }

    if (event === 'admin_reply') {
      const html = emailShell(
        'Seu chamado recebeu uma resposta',
        `<p>Olá! O suporte oficial da Infinity Million respondeu ao seu chamado:</p>
         <p><strong>${ticket.subject}</strong></p>
         <p>Entre na plataforma para ver a resposta completa.</p>`,
        'VER RESPOSTA',
        ticketUrl
      );
      await sendEmail(ticket.user_email, 'Seu chamado recebeu uma resposta — Infinity Million', html);
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[notify-ticket] Erro inesperado:', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
});
