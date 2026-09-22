// scripts/create-admin.mjs
//
// Cria (ou promove) o administrador principal do Infinity Million Hub.
//
// COMO RODAR (veja o passo a passo completo em ADMIN_SETUP.md):
//   1. Crie um arquivo .env na raiz do projeto com:
//        VITE_SUPABASE_URL=...
//        SUPABASE_SERVICE_ROLE_KEY=...   (a chave secreta, NUNCA a anon key)
//        ADMIN_EMAIL=ativadordamente7@gmail.com
//        ADMIN_INITIAL_PASSWORD=123456
//   2. Rode no terminal, na raiz do projeto:
//        node scripts/create-admin.mjs
//
// Este script SÓ deve ser executado no seu computador ou em um ambiente de
// servidor de confiança — nunca no navegador — porque ele usa a Service
// Role Key, que tem acesso total ao banco.

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'ativadordamente7@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || '123456';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('\n[ERRO] Faltam variáveis de ambiente.');
  console.error('Confira se o seu .env tem VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY preenchidos.\n');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`\n[Bootstrap] Verificando se o administrador ${ADMIN_EMAIL} já existe...`);

  const { data: listData, error: listError } = await admin.auth.admin.listUsers();
  if (listError) {
    console.error('[ERRO] Não foi possível listar usuários:', listError.message);
    process.exit(1);
  }

  let existingUser = listData.users.find((u) => (u.email || '').toLowerCase() === ADMIN_EMAIL);

  if (!existingUser) {
    console.log('[Bootstrap] Administrador não encontrado. Criando conta...');
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: 'Administrador Infinity Million' },
    });
    if (createError) {
      console.error('[ERRO] Não foi possível criar o administrador:', createError.message);
      process.exit(1);
    }
    existingUser = created.user;
    console.log(`[Bootstrap] Conta criada com sucesso (id: ${existingUser.id}).`);
  } else {
    console.log(`[Bootstrap] Administrador já existe (id: ${existingUser.id}).`);
  }

  const { data: profile, error: profileFetchError } = await admin
    .from('profiles')
    .select('id, role, status')
    .eq('user_id', existingUser.id)
    .maybeSingle();

  if (profileFetchError) {
    console.error('[ERRO] Não foi possível consultar o profile:', profileFetchError.message);
    process.exit(1);
  }

  if (!profile) {
    console.log('[Bootstrap] Profile ainda não existe (o trigger do banco deveria ter criado). Criando manualmente...');
    const { error: insertError } = await admin.from('profiles').insert({
      user_id: existingUser.id,
      email: ADMIN_EMAIL,
      name: 'Administrador Infinity Million',
      role: 'admin',
      status: 'active',
      level: 5,
      xp: 5000,
      completed_onboarding: true,
    });
    if (insertError) {
      console.error('[ERRO] Não foi possível criar o profile do administrador:', insertError.message);
      process.exit(1);
    }
  } else if (profile.role !== 'admin' || profile.status !== 'active') {
    console.log('[Bootstrap] Promovendo profile existente para admin/active...');
    const { error: updateError } = await admin
      .from('profiles')
      .update({ role: 'admin', status: 'active' })
      .eq('user_id', existingUser.id);
    if (updateError) {
      console.error('[ERRO] Não foi possível promover o profile:', updateError.message);
      process.exit(1);
    }
  } else {
    console.log('[Bootstrap] Profile já está correto (role=admin, status=active). Nada a fazer.');
  }

  console.log('\n✅ Administrador pronto para uso!');
  console.log(`   E-mail: ${ADMIN_EMAIL}`);
  console.log(`   Senha:  ${ADMIN_PASSWORD} (troque depois de logar, se quiser)\n`);
}

main();
