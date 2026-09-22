import { supabase } from '../lib/supabase';

export interface AuthResult {
  success: boolean;
  error?: string;
  userId?: string;
}

function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (lower.includes('user already registered') || lower.includes('already registered'))
    return 'Já existe uma conta com este e-mail. Tente entrar em vez de cadastrar.';
  if (lower.includes('password should be at least')) return 'A senha precisa ter no mínimo 6 caracteres.';
  if (lower.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar (verifique sua caixa de entrada).';
  return 'Não foi possível concluir a operação. Tente novamente.';
}

export const authService = {
  async signUp(email: string, password: string, name?: string): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { name: name?.trim() || cleanEmail.split('@')[0] } },
    });
    if (error) return { success: false, error: translateAuthError(error.message) };
    if (!data.user) return { success: false, error: 'Não foi possível criar sua conta. Tente novamente.' };
    return { success: true, userId: data.user.id };
  },

  async signIn(email: string, password: string): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) return { success: false, error: translateAuthError(error.message) };
    return { success: true, userId: data.user?.id };
  },

  async resetPassword(email: string): Promise<AuthResult> {
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
    if (error) return { success: false, error: translateAuthError(error.message) };
    return { success: true };
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthStateChange(callback: (userId: string | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user?.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  },
};
