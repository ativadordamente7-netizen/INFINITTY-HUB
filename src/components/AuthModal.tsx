import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const signIn = useAppStore((s) => s.signIn);
  const signUp = useAppStore((s) => s.signUp);
  const resetPassword = useAppStore((s) => s.resetPassword);

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const triggerSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }
    if (!password) {
      setError('Informe sua senha.');
      return;
    }
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Não foi possível entrar. Tente novamente.');
      return;
    }
    triggerSuccess();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Informe seu nome completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }
    if (password.length < 6) {
      setError('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }
    setLoading(true);
    const result = await signUp(email, password, name);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Não foi possível criar sua conta. Tente novamente.');
      return;
    }
    triggerSuccess();
  };

  const handleForgotPassword = async () => {
    setError('');
    if (!email.trim() || !email.includes('@')) {
      setError('Informe o e-mail cadastrado na sua conta.');
      return;
    }
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Não foi possível enviar o link de recuperação.');
      return;
    }
    setSuccessMessage('Enviamos um link de redefinição de senha para o seu e-mail.');
    setTimeout(() => {
      setSuccessMessage('');
      setMode('login');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#EBE6E2] overflow-hidden"
        id="auth-modal-card"
      >

        <div className="p-6 pb-4 text-center border-b border-[#EBE6E2]/80 bg-[#F8F4F0]/60">
          <div className="w-12 h-12 mx-auto rounded-full bg-white border border-[#BC9164]/40 flex items-center justify-center shadow-xs mb-3">
            <span className="text-2xl text-[#835629] font-bold font-serif-luxury">∞</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#312318] tracking-tight">
            {mode === 'login' && 'Acesso à Central'}
            {mode === 'register' && 'Criar Minha Conta'}
            {mode === 'forgot' && 'Recuperar Acesso'}
          </h2>
          <p className="text-xs text-[#59595F] mt-1">
            {mode === 'login' && 'Entre com seu e-mail e senha'}
            {mode === 'register' && 'Crie sua credencial privada no Infinity Million'}
            {mode === 'forgot' && 'Enviaremos um link de redefinição para seu e-mail'}
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {successMessage}
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#59595F] mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8E8984] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EBE6E2] text-xs text-[#312318] placeholder:text-[#8E8984] focus:outline-none focus:border-[#BC9164] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#59595F] mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8E8984] absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EBE6E2] text-xs text-[#312318] placeholder:text-[#8E8984] focus:outline-none focus:border-[#BC9164] transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[#835629] hover:underline font-medium"
                >
                  Esqueci minha senha
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-[#59595F] hover:text-[#312318] font-medium"
                >
                  Criar minha conta
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                id="btn-auth-submit"
                className="w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase text-white bg-gradient-to-r from-[#BC9164] to-[#835629] hover:from-[#9F754B] hover:to-[#6E441D] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'ENTRANDO...' : 'ENTRAR'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#59595F] mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8E8984] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome oficial"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EBE6E2] text-xs text-[#312318] focus:outline-none focus:border-[#BC9164]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#59595F] mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8E8984] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@dominio.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EBE6E2] text-xs text-[#312318] focus:outline-none focus:border-[#BC9164]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#59595F] mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8E8984] absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EBE6E2] text-xs text-[#312318] focus:outline-none focus:border-[#BC9164]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                id="btn-register-submit"
                className="w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase text-white bg-gradient-to-r from-[#BC9164] to-[#835629] hover:from-[#9F754B] hover:to-[#6E441D] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'CRIANDO CONTA...' : 'CRIAR CONTA & INICIAR ONBOARDING'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <p className="text-center text-xs text-[#59595F] pt-2">
                Já possui conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#835629] font-bold hover:underline"
                >
                  Entrar
                </button>
              </p>
            </form>
          )}

          {mode === 'forgot' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#59595F] mb-1.5">
                  Seu E-mail Cadastrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8E8984] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aluno@infinitymillion.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EBE6E2] text-xs text-[#312318] focus:outline-none focus:border-[#BC9164]"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleForgotPassword}
                className="w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase text-white bg-[#312318] hover:bg-[#59595F] transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? 'ENVIANDO...' : 'ENVIAR LINK DE RECUPERAÇÃO'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-[#59595F] hover:text-[#312318] font-medium"
              >
                Voltar para o login
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8E8984] hover:text-[#312318] text-xs font-bold px-2 py-1"
        >
          ✕
        </button>

      </div>
    </div>
  );
};
