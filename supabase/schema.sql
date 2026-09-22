-- ============================================================
-- INFINITY MILLION HUB — SUPABASE / POSTGRESQL PRODUCTION DDL
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase.
-- ============================================================

create extension if not exists "uuid-ossp";

do $$ begin
  create type user_role_enum as enum ('member', 'moderator', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_status_enum as enum ('active', 'blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type post_category_enum as enum ('ESTRATÉGIAS', 'RESULTADOS', 'DÚVIDAS', 'NETWORKING', 'MENTALIDADE', 'NEGÓCIOS', 'AVISOS', 'GERAL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type strategy_category_enum as enum ('TRÁFEGO', 'VENDAS', 'COPY', 'LANÇAMENTOS', 'INTELIGÊNCIA ARTIFICIAL', 'AUTOMAÇÃO', 'POSICIONAMENTO', 'NEGÓCIOS', 'MENTALIDADE', 'FERRAMENTAS');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_status_enum as enum ('ABERTO', 'EM ATENDIMENTO', 'RESOLVIDO');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_category_enum as enum ('DÚVIDA SOBRE UMA AULA', 'PROBLEMA TÉCNICO', 'DÚVIDA ESTRATÉGICA', 'OUTRO ASSUNTO');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  email varchar(255) not null default '',
  name varchar(255) not null default 'Membro Infinity',
  avatar text,
  instagram varchar(100) default '',
  whatsapp varchar(50) default '',
  city varchar(150) default 'Brasil',
  profession varchar(150) default 'Membro da Comunidade',
  bio text default '',
  objective text default '',
  interests text[] default '{}',
  role user_role_enum not null default 'member',
  status user_status_enum not null default 'active',
  level int not null default 1 check (level between 1 and 5),
  xp int not null default 0,
  completed_onboarding boolean not null default false,
  connections_count int not null default 0,
  posts_count int not null default 0,
  badges text[] default '{}',
  joined_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid references auth.users(id) on delete cascade not null,
  category post_category_enum not null default 'GERAL',
  content text not null,
  image_url text,
  video_url text,
  link_url text,
  is_pinned boolean default false,
  likes uuid[] default '{}',
  saved_by uuid[] default '{}',
  comments_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists public.connections (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references auth.users(id) on delete cascade not null,
  receiver_id uuid references auth.users(id) on delete cascade not null,
  status varchar(50) default 'connected',
  created_at timestamptz default now(),
  unique (sender_id, receiver_id)
);

create table if not exists public.strategies (
  id uuid primary key default uuid_generate_v4(),
  title varchar(255) not null,
  description text not null,
  category strategy_category_enum not null,
  content text not null,
  image_url text not null,
  video_url text,
  links jsonb default '[]',
  files jsonb default '[]',
  author varchar(150) not null,
  author_role varchar(150) not null,
  read_time varchar(50) default '10 min',
  is_featured boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  user_email varchar(255) not null,
  category ticket_category_enum not null,
  subject varchar(255) not null,
  description text not null,
  related_lesson varchar(255),
  status ticket_status_enum not null default 'ABERTO',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.support_messages (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references public.support_tickets(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists public.support_attachments (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references public.support_tickets(id) on delete cascade not null,
  message_id uuid references public.support_messages(id) on delete set null,
  uploaded_by uuid references auth.users(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  mime_type text,
  file_size int,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title varchar(255) not null,
  message text not null,
  type varchar(50) not null,
  read boolean default false,
  link_to varchar(100),
  created_at timestamptz default now()
);

-- FUNÇÕES AUXILIARES
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, email, name, avatar, completed_onboarding)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
    false
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Só bloqueia quando é a PRÓPRIA pessoa (logada no app, via chave anon/authenticated)
-- tentando mudar o próprio role/status sem já ser admin. Isso impede a auto-promoção
-- pelo site, mas não atrapalha edições feitas pelo painel do Supabase (Table
-- Editor/SQL Editor) nem pela service_role key — nesses casos auth.uid() vem nulo,
-- porque não é uma requisição autenticada de usuário final.
create or replace function public.protect_privileged_profile_fields()
returns trigger as $$
begin
  if (new.role is distinct from old.role or new.status is distinct from old.status) then
    if auth.uid() = old.user_id and not public.is_admin() then
      new.role := old.role;
      new.status := old.status;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists protect_profile_fields on public.profiles;
create trigger protect_profile_fields
  before update on public.profiles
  for each row execute function public.protect_privileged_profile_fields();

-- ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.connections enable row level security;
alter table public.strategies enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.support_attachments enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid() = user_id or public.is_admin());

drop policy if exists "posts_select_authenticated" on public.posts;
create policy "posts_select_authenticated" on public.posts
  for select using (auth.role() = 'authenticated');

drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own" on public.posts
  for insert with check (auth.uid() = author_id);

drop policy if exists "posts_update_own_or_admin" on public.posts;
create policy "posts_update_own_or_admin" on public.posts
  for update using (auth.uid() = author_id or public.is_admin());

drop policy if exists "posts_delete_own_or_admin" on public.posts;
create policy "posts_delete_own_or_admin" on public.posts
  for delete using (auth.uid() = author_id or public.is_admin());

drop policy if exists "comments_select_authenticated" on public.comments;
create policy "comments_select_authenticated" on public.comments
  for select using (auth.role() = 'authenticated');

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments
  for insert with check (auth.uid() = author_id);

drop policy if exists "comments_delete_own_or_admin" on public.comments;
create policy "comments_delete_own_or_admin" on public.comments
  for delete using (auth.uid() = author_id or public.is_admin());

drop policy if exists "connections_select_authenticated" on public.connections;
create policy "connections_select_authenticated" on public.connections
  for select using (auth.role() = 'authenticated');

drop policy if exists "connections_manage_own" on public.connections;
create policy "connections_manage_own" on public.connections
  for all using (auth.uid() = sender_id) with check (auth.uid() = sender_id);

drop policy if exists "strategies_select_authenticated" on public.strategies;
create policy "strategies_select_authenticated" on public.strategies
  for select using (auth.role() = 'authenticated');

drop policy if exists "strategies_write_admin" on public.strategies;
create policy "strategies_write_admin" on public.strategies
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "tickets_select_own_or_admin" on public.support_tickets;
create policy "tickets_select_own_or_admin" on public.support_tickets
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "tickets_insert_own" on public.support_tickets;
create policy "tickets_insert_own" on public.support_tickets
  for insert with check (auth.uid() = user_id);

drop policy if exists "tickets_update_own_or_admin" on public.support_tickets;
create policy "tickets_update_own_or_admin" on public.support_tickets
  for update using (auth.uid() = user_id or public.is_admin());

drop policy if exists "messages_select_own_ticket_or_admin" on public.support_messages;
create policy "messages_select_own_ticket_or_admin" on public.support_messages
  for select using (
    public.is_admin() or
    exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid())
  );

drop policy if exists "messages_insert_own_ticket_or_admin" on public.support_messages;
create policy "messages_insert_own_ticket_or_admin" on public.support_messages
  for insert with check (
    auth.uid() = sender_id and (
      public.is_admin() or
      exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid())
    )
  );

drop policy if exists "attachments_select_own_ticket_or_admin" on public.support_attachments;
create policy "attachments_select_own_ticket_or_admin" on public.support_attachments
  for select using (
    public.is_admin() or
    exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid())
  );

drop policy if exists "attachments_insert_own_ticket_or_admin" on public.support_attachments;
create policy "attachments_insert_own_ticket_or_admin" on public.support_attachments
  for insert with check (
    auth.uid() = uploaded_by and (
      public.is_admin() or
      exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid())
    )
  );

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id);

drop policy if exists "notifications_insert_authenticated" on public.notifications;
create policy "notifications_insert_authenticated" on public.notifications
  for insert with check (auth.role() = 'authenticated');

-- STORAGE — bucket privado para anexos de suporte
insert into storage.buckets (id, name, public)
values ('support-attachments', 'support-attachments', false)
on conflict (id) do nothing;

drop policy if exists "support_attachments_read" on storage.objects;
create policy "support_attachments_read" on storage.objects
  for select using (
    bucket_id = 'support-attachments' and (
      public.is_admin() or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "support_attachments_write" on storage.objects;
create policy "support_attachments_write" on storage.objects
  for insert with check (
    bucket_id = 'support-attachments' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "support_attachments_delete" on storage.objects;
create policy "support_attachments_delete" on storage.objects
  for delete using (
    bucket_id = 'support-attachments' and (
      public.is_admin() or auth.uid()::text = (storage.foldername(name))[1]
    )
  );

-- ============================================================
-- 15. STORAGE — bucket público para fotos de perfil (avatares)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Qualquer pessoa pode VER os avatares (é assim que a foto aparece pra
-- todo mundo no feed, no perfil, etc). Só o dono pode enviar/trocar/apagar
-- a própria foto — convenção de caminho: {user_id}/{arquivo}
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_write_own" on storage.objects;
create policy "avatars_write_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects
  for delete using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
