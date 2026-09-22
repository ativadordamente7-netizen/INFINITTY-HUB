import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Users,
  BookOpen,
  HelpCircle,
  Award,
  Share2,
  Sparkles,
  Rocket,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface FreeAccessGatewayProps {
  onExploreCinema?: () => void;
}

const FEATURES = [
  {
    icon: Users,
    title: 'COMUNIDADE',
    description: 'Conecte-se com outros membros, compartilhe resultados e aprenda junto.',
  },
  {
    icon: BookOpen,
    title: 'CENTRAL DE ESTRATÉGIAS',
    description: 'Playbooks e conteúdos exclusivos liberados direto pela administração.',
  },
  {
    icon: HelpCircle,
    title: 'SUPORTE DEDICADO',
    description: 'Abra chamados dentro da plataforma e receba resposta da equipe.',
  },
  {
    icon: Share2,
    title: 'MINHA REDE',
    description: 'Encontre e se conecte com outros membros do ecossistema.',
  },
  {
    icon: Award,
    title: 'NÍVEIS & CONQUISTAS',
    description: 'Ganhe XP participando da comunidade e desbloqueie badges.',
  },
];

export const FreeAccessGateway: React.FC<FreeAccessGatewayProps> = ({ onExploreCinema }) => {
  const signIn = useAppStore((s) => s.signIn);
  const signUp = useAppStore((s) => s.signUp);
  const resetPassword = useAppStore((s) => s.resetPassword);

  const [formMode, setFormMode] = useState<'login' | 'register' | 'forgot'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setStatusMessage({ text: 'Por favor, insira um e-mail válido.', type: 'error' });
      return;
    }

    if (formMode === 'forgot') {
      setIsLoading(true);
      const result = await resetPassword(email);
      setIsLoading(false);
      if (!result.success) {
        setStatusMessage({ text: result.error || 'Não foi possível enviar o link.', type: 'error' });
        return;
      }
      setStatusMessage({ text: 'Enviamos um link de redefinição de senha para o seu e-mail.', type: 'success' });
      return;
    }

    if (formMode === 'register' && password.length < 6) {
      setStatusMessage({ text: 'Sua senha precisa ter no mínimo 6 caracteres.', type: 'error' });
      return;
    }
    if (formMode === 'login' && !password) {
      setStatusMessage({ text: 'Digite sua senha para entrar.', type: 'error' });
      return;
    }

    setIsLoading(true);
    const result = formMode === 'register' ? await signUp(email, password, name) : await signIn(email, password);
    setIsLoading(false);

    if (!result.success) {
      setStatusMessage({ text: result.error || 'Não foi possível concluir. Tente novamente.', type: 'error' });
      return;
    }

    setStatusMessage({
      text: formMode === 'register' ? 'Conta criada com sucesso! Liberando seu acesso ao sistema...' : 'Acesso liberado! Entrando no sistema...',
      type: 'success',
    });
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] relative z-10 px-4 sm:px-8 py-10 lg:py-16">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_440px_1fr] gap-8 lg:gap-10 items-center">

        {/* Left: Hero copy — hidden on mobile, shown on desktop */}
        <div className="hidden lg:block">
          <span className="inline-block px-3 py-1 rounded-full border border-[#D4AF6A]/40 bg-white/5 text-[#D4AF6A] text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
            Bem-vindo ao Sistema
          </span>
          <h1 className="text-4xl xl:text-5xl font-black leading-[1.08] tracking-tight text-[#F5EFE4]">
            O FUTURO NÃO
            <br />
            ACONTECE.
            <br />
            <span className="bg-gradient-to-r from-[#F0D8A0] via-[#D4AF6A] to-[#8A6A2E] bg-clip-text text-transparent">
              VOCÊ CRIA.
            </span>
          </h1>
          <p className="mt-5 text-sm text-[#C9C2B4] max-w-sm leading-relaxed">
            Entre na comunidade Infinity Million: networking de verdade, estratégias exclusivas e
            suporte dedicado para quem está construindo algo grande.
          </p>

          <div className="mt-10 inline-flex items-start gap-3 p-4 rounded-2xl border border-[#D4AF6A]/25 bg-white/5 backdrop-blur-sm max-w-xs">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F0D8A0] to-[#8A6A2E] flex items-center justify-center shrink-0">
              <Rocket className="w-4 h-4 text-[#0B0906]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#F5EFE4] uppercase tracking-wide">Jornada Ilimitada</p>
              <p className="text-[11px] text-[#C9C2B4] mt-0.5">Explore. Conecte. Evolua. Escale.</p>
            </div>
          </div>
        </div>

        {/* Center: Auth card */}
        <div
          id="free-access-card"
          className="w-full max-w-md mx-auto bg-[#151109]/90 backdrop-blur-xl rounded-[28px] border border-[#D4AF6A]/25 shadow-[0_0_60px_rgba(212,175,106,0.08)] overflow-hidden"
        >
          <div className="p-7 pb-5 text-center border-b border-[#D4AF6A]/15">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-[#D4AF6A]/30 text-[#D4AF6A] text-[10px] font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3 h-3" />
              <span>{formMode === 'forgot' ? 'Recuperar Acesso' : 'Acesse seu Sistema'}</span>
            </div>

            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#F0D8A0] via-[#D4AF6A] to-[#8A6A2E] flex items-center justify-center shadow-[0_0_24px_rgba(212,175,106,0.35)]">
              <span className="text-2xl font-black text-[#0B0906] font-serif-luxury">∞</span>
            </div>

            <h2 className="text-xl font-black text-[#F5EFE4] tracking-tight">
              INFINITY <span className="text-[#D4AF6A]">MILLION</span>
            </h2>

            {formMode !== 'forgot' && (
              <div className="mt-4 inline-flex rounded-xl border border-[#D4AF6A]/20 bg-black/30 p-1">
                <button
                  type="button"
                  onClick={() => setFormMode('register')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    formMode === 'register' ? 'bg-[#D4AF6A] text-[#0B0906]' : 'text-[#C9C2B4]'
                  }`}
                >
                  Criar Conta
                </button>
                <button
                  type="button"
                  onClick={() => setFormMode('login')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    formMode === 'login' ? 'bg-[#D4AF6A] text-[#0B0906]' : 'text-[#C9C2B4]'
                  }`}
                >
                  Já Tenho Conta
                </button>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-7 space-y-4">
            {statusMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {formMode === 'register' && (
                <div className="relative">
                  <User className="w-4 h-4 text-[#8A8478] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome ou apelido"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-black/30 text-sm text-[#F5EFE4] placeholder:text-[#8A8478] focus:outline-none focus:border-[#D4AF6A]/60 focus:ring-2 focus:ring-[#D4AF6A]/20 transition-all"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="w-4 h-4 text-[#8A8478] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-black/30 text-sm text-[#F5EFE4] placeholder:text-[#8A8478] focus:outline-none focus:border-[#D4AF6A]/60 focus:ring-2 focus:ring-[#D4AF6A]/20 transition-all"
                />
              </div>

              {formMode !== 'forgot' && (
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A8478] absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-white/10 bg-black/30 text-sm text-[#F5EFE4] placeholder:text-[#8A8478] focus:outline-none focus:border-[#D4AF6A]/60 focus:ring-2 focus:ring-[#D4AF6A]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#8A8478] hover:text-[#D4AF6A]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {formMode === 'login' && (
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-1.5 text-[#C9C2B4] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/20 bg-black/30 accent-[#D4AF6A]"
                    />
                    <span>Lembrar-me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormMode('forgot')}
                    className="text-[#D4AF6A] hover:underline font-medium"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                id="btn-free-access-submit"
                className="w-full py-3.5 rounded-xl font-extrabold text-xs tracking-wider uppercase text-[#0B0906] bg-gradient-to-r from-[#F0D8A0] via-[#D4AF6A] to-[#B8924A] hover:brightness-110 shadow-[0_0_24px_rgba(212,175,106,0.3)] hover:shadow-[0_0_32px_rgba(212,175,106,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <span>
                  {isLoading
                    ? 'Aguarde...'
                    : formMode === 'forgot'
                    ? 'Enviar Link de Recuperação'
                    : formMode === 'register'
                    ? 'Acessar Sistema'
                    : 'Acessar Sistema'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {formMode === 'forgot' ? (
              <button
                type="button"
                onClick={() => setFormMode('login')}
                className="w-full text-center text-xs text-[#C9C2B4] hover:text-[#F5EFE4] font-medium"
              >
                Voltar para o login
              </button>
            ) : (
              <>
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] uppercase tracking-widest text-[#8A8478]">Ou continue com</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled
                    title="Em breve"
                    className="relative py-2.5 rounded-xl border border-white/10 bg-black/20 text-[#8A8478] text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <span>Google</span>
                    <span className="absolute -top-2 -right-2 text-[8px] px-1.5 py-0.2 rounded-full bg-white/10 border border-white/15 text-[#C9C2B4]">
                      em breve
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled
                    title="Em breve"
                    className="relative py-2.5 rounded-xl border border-white/10 bg-black/20 text-[#8A8478] text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <span>Apple</span>
                    <span className="absolute -top-2 -right-2 text-[8px] px-1.5 py-0.2 rounded-full bg-white/10 border border-white/15 text-[#C9C2B4]">
                      em breve
                    </span>
                  </button>
                </div>

                <p className="text-center text-xs text-[#C9C2B4] pt-1">
                  {formMode === 'register' ? (
                    <>
                      Já tem uma conta?{' '}
                      <button type="button" onClick={() => setFormMode('login')} className="text-[#D4AF6A] font-bold hover:underline">
                        Entrar
                      </button>
                    </>
                  ) : (
                    <>
                      Ainda não tem uma conta?{' '}
                      <button type="button" onClick={() => setFormMode('register')} className="text-[#D4AF6A] font-bold hover:underline">
                        Criar conta
                      </button>
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right: Feature list — hidden on mobile, shown on desktop */}
        <div className="hidden lg:block">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF6A] mb-5">O que te espera</p>
          <div className="space-y-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-start gap-3 p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-[#D4AF6A]/30 hover:bg-white/[0.05] transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-[#D4AF6A]/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#D4AF6A]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#F5EFE4] tracking-wide">{feature.title}</p>
                    <p className="text-[11px] text-[#8A8478] mt-0.5 leading-snug">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile-only: condensed hero + feature strip below the card */}
        <div className="lg:hidden order-3 space-y-6 -mt-2">
          <div className="text-center">
            <h1 className="text-2xl font-black leading-tight text-[#F5EFE4]">
              O FUTURO NÃO ACONTECE.{' '}
              <span className="bg-gradient-to-r from-[#F0D8A0] via-[#D4AF6A] to-[#8A6A2E] bg-clip-text text-transparent">
                VOCÊ CRIA.
              </span>
            </h1>
            <p className="mt-2 text-xs text-[#C9C2B4] max-w-xs mx-auto">
              Networking, estratégias exclusivas e suporte dedicado, tudo em um só lugar.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="p-3 rounded-xl border border-white/10 bg-white/[0.03]">
                  <Icon className="w-4 h-4 text-[#D4AF6A] mb-1.5" />
                  <p className="text-[10px] font-bold text-[#F5EFE4] tracking-wide leading-tight">{feature.title}</p>
                </div>
              );
            })}
          </div>

          {onExploreCinema && (
            <button
              type="button"
              onClick={onExploreCinema}
              className="w-full text-center text-xs text-[#D4AF6A] hover:underline font-semibold"
            >
              Ver apresentação visual completa do ecossistema
            </button>
          )}
        </div>

      </div>

      <footer className="mt-12 lg:mt-16 text-center text-[10px] text-[#6B665C] space-y-1">
        <p className="font-semibold text-[#8A8478]">∞ INFINITY MILLION • COMUNIDADE & NETWORKING DIGITAL</p>
      </footer>
    </div>
  );
};
