# 🚀 Guia de Configuração do Supabase — Infinity Million Hub

Este guia é para quem nunca configurou o Supabase. Siga na ordem.

---

## 1. Criar o Projeto no Supabase

1. Acesse https://supabase.com e crie uma conta gratuita.
2. Clique em **"New project"**.
3. Dê um nome (ex: `infinity-million-hub`), crie uma senha forte para o banco e escolha a região `South America (São Paulo)`.
4. Aguarde 1–2 minutos até o projeto ficar pronto.

## 2. Rodar o Script SQL (tabelas + segurança)

1. No menu lateral, clique em **SQL Editor** → **New query**.
2. Abra o arquivo `supabase/schema.sql` deste projeto, copie **todo** o conteúdo e cole no editor.
3. Clique em **Run** (ou `Ctrl+Enter`).
4. Deve aparecer "Success. No rows returned".

Isso cria: `profiles`, `posts`, `comments`, `connections`, `strategies`, `support_tickets`,
`support_messages`, `support_attachments`, `notifications`, todas as regras de
segurança (Row Level Security) e o bucket privado `support-attachments` no Storage.

**Importante sobre segurança:** as regras garantem, dentro do próprio banco, que:
- um membro comum só enxerga os próprios tickets e anexos;
- só quem tem `role = 'admin'` no profile enxerga todos os tickets;
- ninguém consegue promover a si mesmo a admin mandando um payload manipulado — só outro admin (ou o script de bootstrap) pode mudar `role`/`status`.

## 3. Ativar Auth por E-mail e Senha

1. Menu lateral → **Authentication** → **Providers**.
2. Confirme que **Email** está habilitado (vem ligado por padrão).
3. Em **Authentication** → **URL Configuration**, coloque a URL do seu site (Render) em "Site URL" — isso é usado nos e-mails de redefinição de senha.

## 4. Conferir o Bucket de Anexos

O script SQL já cria o bucket `support-attachments` (privado). Para conferir:
1. Menu lateral → **Storage**.
2. Deve existir um bucket chamado `support-attachments` sem o ícone de "público".

## 5. Pegar as Chaves de API

1. Menu lateral → ⚙️ **Project Settings** → **API**.
2. Copie:
   - **Project URL**
   - **anon / public key**
   - **service_role key** (nunca coloque essa no frontend!)

## 6. Variáveis de Ambiente

Crie um arquivo `.env` (baseado no `.env.example`) com:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_EMAIL=ativadordamente7@gmail.com
ADMIN_INITIAL_PASSWORD=123456
```

No **Render** (ou onde for publicar), configure `VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY` como variáveis de ambiente do serviço — são as únicas
que o site publicado precisa, porque ele é um site estático (build do Vite).
`SUPABASE_SERVICE_ROLE_KEY` e `ADMIN_INITIAL_PASSWORD` só existem no seu `.env`
local, para rodar o script de criação do admin — nunca vão para o Render.

## 7. Configurar o E-mail Transacional (Resend + Edge Function)

O envio de e-mail roda em uma Edge Function do Supabase (servidor), nunca no navegador.

1. Instale a CLI do Supabase (uma vez só): `npm install -g supabase`
2. Faça login: `supabase login`
3. Vincule o projeto: `supabase link --project-ref SEU_PROJECT_REF` (o ref aparece na URL do projeto)
4. Publique a função:
   ```bash
   supabase functions deploy notify-ticket
   ```
5. Crie uma conta grátis em https://resend.com, gere uma API Key.
6. Configure os segredos da função (isso fica só no Supabase, nunca no seu código):
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxx ADMIN_NOTIFICATION_EMAIL=ativadordamente7@gmail.com SITE_URL=https://seu-site.onrender.com
   ```

Pronto — a partir daqui, sempre que alguém abrir um ticket, você recebe um e-mail;
quando você responder, o aluno recebe um e-mail.

## 8. Criar o Administrador Principal

Com o `.env` preenchido (passo 6), rode uma vez:

```bash
npm install
node scripts/create-admin.mjs
```

Isso cria a conta `ativadordamente7@gmail.com` com senha `123456` e `role = admin`
diretamente no banco — sem depender de nada no frontend. Veja mais detalhes em
`ADMIN_SETUP.md`.

## 9. Rodar Localmente

```bash
npm install
npm run dev
```

## 10. Publicar (Render)

1. Crie um **Static Site** no Render apontando para este repositório.
2. Build Command: `npm run build`
3. Publish Directory: `dist`
4. Em **Environment**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
5. Deploy.
