# 🛡️ Guia do Administrador — Infinity Million Hub

## 1. Dados do Administrador Principal

- **E-mail:** `ativadordamente7@gmail.com`
- **Senha inicial:** `123456` (definida por você em `ADMIN_INITIAL_PASSWORD`, troque quando quiser)
- **Papel:** `admin`
- **Status:** `active`

## 2. Como a conta é criada (com segurança de verdade)

Nada disso depende de confiar em código rodando no navegador da pessoa:

1. **Cadastro público sempre cria `role = 'member'`.** Não existe caminho no app
   onde alguém digita ou envia `{ role: "admin" }` e vira administrador.
2. **O administrador é criado por um script separado**, `scripts/create-admin.mjs`,
   que roda no seu computador (nunca no navegador) usando a `SUPABASE_SERVICE_ROLE_KEY` —
   a chave "mestre" do banco, que nunca aparece no código do site.
3. **O banco de dados (não o frontend) protege a promoção a admin.** Um trigger em
   `supabase/schema.sql` (`protect_privileged_profile_fields`) recusa qualquer
   tentativa de mudar `role` ou `status` de um profile a menos que quem está
   fazendo a alteração já seja admin. Mesmo que alguém manipule o app pelo
   console do navegador, o banco rejeita a mudança.
4. **Row Level Security (RLS)** garante, dentro do PostgreSQL, que só quem tem
   `role = 'admin'` consegue ler todos os tickets, todos os anexos e a lista
   completa de membros. Um membro comum só enxerga os próprios dados.

## 3. Como criar/ativar o administrador (primeira vez)

```bash
npm install
node scripts/create-admin.mjs
```

Isso confere se a conta já existe; se não existir, cria; se existir mas não for
admin, promove. Pode rodar de novo a qualquer momento sem duplicar nada.

## 4. Como entrar no Painel Admin

1. Abra o app publicado (ou `npm run dev` localmente).
2. Clique em **Entrar**.
3. E-mail: `ativadordamente7@gmail.com` / Senha: a que você definiu.
4. No menu lateral vai aparecer **Painel Admin**, com:
   - Métricas gerais (membros, posts, tickets abertos, estratégias)
   - Gestão de membros (bloquear/reativar, mudar papel)
   - Moderação do feed (fixar/remover posts)
   - Fila de tickets de suporte

## 5. Fluxo de um chamado, do início ao fim

1. O membro abre **Suporte → Novo Ticket**, preenche categoria, assunto,
   descrição, opcionalmente anexa um print (armazenado no Supabase Storage,
   bucket privado `support-attachments`) e envia.
2. O ticket é salvo em `support_tickets`/`support_messages` no Postgres —
   você vê ele no Painel Admin na hora, de qualquer dispositivo.
3. Você recebe um e-mail (via Edge Function + Resend) avisando do novo chamado.
4. Você abre o ticket, vê o anexo, digita a resposta e envia.
5. O status muda automaticamente para `EM ATENDIMENTO` (se estava `ABERTO`).
6. O aluno recebe uma notificação dentro da plataforma e um e-mail avisando
   que o chamado foi respondido.
7. Você pode marcar como `RESOLVIDO` quando o caso for encerrado.

## 6. Boas práticas

- Troque a senha `123456` assim que fizer o primeiro login (Supabase Auth
  tem opção de "esqueci minha senha" no app, ou você troca direto no painel
  do Supabase em Authentication → Users).
- Não compartilhe a `SUPABASE_SERVICE_ROLE_KEY` com ninguém — ela nunca deve
  ir para o Render, para o GitHub público, nem para o frontend.
