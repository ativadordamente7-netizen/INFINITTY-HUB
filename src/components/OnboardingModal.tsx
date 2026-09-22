import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, Camera, Instagram, Phone, MapPin, Briefcase, Target, Upload, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface OnboardingModalProps {
  userId: string;
}

const INTERESTS_OPTIONS = [
  'Tráfego',
  'Vendas',
  'Copy',
  'Marketing',
  'IA',
  'Negócios',
  'Lançamentos',
  'Automação',
  'Mentalidade',
  'Empreendedorismo',
];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ userId }) => {
  const currentProfile = useAppStore((s) => s.currentProfile);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [isSaving, setIsSaving] = useState(false);
  void userId;

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(currentProfile?.name || '');
  const [avatar, setAvatar] = useState(currentProfile?.avatar || AVATAR_PRESETS[0]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const uploadAvatar = useAppStore((s) => s.uploadAvatar);
  const [instagram, setInstagram] = useState(currentProfile?.instagram || '@');
  const [whatsapp, setWhatsapp] = useState(currentProfile?.whatsapp || '');
  const [city, setCity] = useState(currentProfile?.city || '');
  const [profession, setProfession] = useState(currentProfile?.profession || '');
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [objective, setObjective] = useState(currentProfile?.objective || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    currentProfile?.interests?.length ? currentProfile.interests : ['Negócios', 'Vendas']
  );

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError('');
    setUploadingAvatar(true);
    const result = await uploadAvatar(file);
    setUploadingAvatar(false);
    if (!result.success || !result.url) {
      setAvatarError(result.error || 'Não foi possível enviar a foto. Tente novamente.');
      e.target.value = '';
      return;
    }
    setAvatar(result.url);
    e.target.value = '';
  };

  const handleFinish = async () => {
    setIsSaving(true);
    await completeOnboarding({
      name: name.trim() || 'Membro Infinity',
      avatar,
      instagram: instagram.trim(),
      whatsapp: whatsapp.trim(),
      city: city.trim() || 'Brasil',
      profession: profession.trim() || 'Empreendedor Digital',
      bio: bio.trim() || 'Construindo novos projetos no ecossistema Infinity Million.',
      objective: objective.trim() || 'Escalar resultados e fazer parcerias de alto valor.',
      interests: selectedInterests,
      badges: ['PRIMEIRO_PASSO'],
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#EBE6E2] overflow-hidden max-h-[92vh] flex flex-col"
        id="onboarding-modal-card"
      >
        
        {/* Top Banner */}
        <div className="p-6 bg-gradient-to-r from-[#FAF6F2] via-white to-[#FAF6F2] border-b border-[#EBE6E2] text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBE6E2]/70 border border-[#BC9164]/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#BC9164]" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#835629]">
              Primeiro Acesso • Onboarding Oficial
            </span>
          </div>

          <h1 className="text-2xl font-black text-[#312318] tracking-tight">
            VAMOS CONHECER VOCÊ.
          </h1>
          <p className="text-xs text-[#59595F] mt-1 max-w-md mx-auto">
            Sua identidade dentro do Infinity Million definirá seu networking e as oportunidades que surgirão para você.
          </p>
        </div>

        {/* Form Body with scroll */}
        <div className="p-6 overflow-y-auto space-y-6">
          {step === 1 ? (
            <>
              {/* Photo selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#59595F] mb-2 flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 text-[#BC9164]" />
                  Foto de Perfil
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={avatar}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#BC9164] shadow-sm"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-[#59595F] mb-2">Envie sua própria foto ou selecione uma da galeria:</p>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#BC9164]/40 bg-[#FAF6F2] text-[#835629] text-xs font-semibold cursor-pointer hover:bg-[#EBE6E2] transition-colors mb-2">
                      {uploadingAvatar ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{uploadingAvatar ? 'Enviando...' : 'Enviar foto do dispositivo'}</span>
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp"
                        onChange={handleAvatarFileChange}
                        disabled={uploadingAvatar}
                        className="hidden"
                      />
                    </label>
                    {avatarError && <p className="text-[11px] text-red-600 mb-2">{avatarError}</p>}
                    <div className="flex gap-2">
                      {AVATAR_PRESETS.slice(0, 5).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Preset"
                          onClick={() => setAvatar(img)}
                          className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition-transform hover:scale-105 ${
                            avatar === img ? 'border-[#BC9164] ring-2 ring-[#BC9164]/30' : 'border-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Name and Profession */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#59595F] mb-1.5">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Matheus Silveira"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE6E2] text-xs text-[#312318] focus:outline-none focus:border-[#BC9164]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#59595F] mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#BC9164]" />
                    Profissão / Niche *
                  </label>
                  <input
                    type="text"
                    required
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="Ex: Gestor de Tráfego & Coprodutor"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE6E2] text-xs text-[#312318] focus:outline-none focus:border-[#BC9164]"
                  />
                </div>
              </div>

              {/* Instagram and WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#59595F] mb-1.5 flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-[#BC9164]" />
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@seu.perfil"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE6E2] text-xs text-[#312318] focus:outline-none focus:border-[#BC9164]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#59595F] mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#BC9164]" />
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE6E2] text-xs text-[#312318] focus:outline-none focus:border-[#BC9164]"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#59595F] mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#BC9164]" />
                  Cidade / Estado
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE6E2] text-xs text-[#312318] focus:outline-none focus:border-[#BC9164]"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#59595F] mb-1.5">
                  Bio (Apresentação Rápida)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre sua trajetória, projetos e o que você domina..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE6E2] text-xs text-[#312318] focus:outline-none focus:border-[#BC9164] resize-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase text-white bg-[#312318] hover:bg-[#59595F] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>CONTINUAR (OBJETIVOS & INTERESSES)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {/* Objective */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#59595F] mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#BC9164]" />
                  Objetivo dentro do Infinity Million
                </label>
                <textarea
                  rows={3}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Ex: Quero estruturar minha equipe de tráfego, validar uma oferta perpétua na Kiwify e ultrapassar os múltiplos 6 dígitos mensais em 2025."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE6E2] text-xs text-[#312318] focus:outline-none focus:border-[#BC9164] resize-none"
                />
              </div>

              {/* Interests multi-select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#59595F] mb-2">
                  Selecione seus Principais Interesses
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS_OPTIONS.map((item) => {
                    const isSelected = selectedInterests.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleInterest(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#BC9164] text-white shadow-xs font-semibold'
                            : 'bg-[#FAF6F2] hover:bg-[#EBE6E2] text-[#59595F] border border-[#EBE6E2]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Final Success Box */}
              <div className="p-4 rounded-xl bg-[#FAF6F2] border border-[#BC9164]/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-[#BC9164]/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#835629]" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#312318]">SEU PERFIL ESTÁ PRONTO.</h3>
                  <p className="text-[11px] text-[#59595F] mt-0.5">
                    Você desbloqueará o Badge "PRIMEIRO PASSO" e receberá +50 XP imediatamente.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl border border-[#EBE6E2] text-xs text-[#59595F] hover:text-[#312318] font-medium cursor-pointer"
                >
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={handleFinish}
                  id="btn-onboarding-finish"
                  disabled={isSaving}
                  className="flex-1 py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase text-white bg-gradient-to-r from-[#BC9164] to-[#835629] hover:from-[#9F754B] hover:to-[#6E441D] shadow-md shadow-[#835629]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <span>{isSaving ? 'SALVANDO...' : 'ENTRAR NO HUB →'}</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
