import React, { useState, useRef } from 'react';
import { 
  User, 
  MapPin, 
  Instagram, 
  Phone, 
  Briefcase, 
  Target, 
  Award, 
  Network, 
  FileText, 
  Edit3, 
  Check, 
  UserPlus, 
  Bookmark,
  Share2,
  Camera,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Profile, UserRole, Post } from '../types';
import { useAppStore } from '../store/useAppStore';
import { INITIAL_BADGES } from '../data/initialData';

interface UserProfileViewProps {
  viewingUserId: string;
  currentUserId: string;
  userRole: UserRole;
  onClose?: () => void;
  onOpenAnotherProfile: (userId: string) => void;
  onProfileUpdated?: () => void;
}

const AVATAR_PRESETS = [
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&auto=format&fit=crop&q=80',
    label: 'Executivo Classic'
  },
  {
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=320&auto=format&fit=crop&q=80',
    label: 'Liderança Feminina'
  },
  {
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&auto=format&fit=crop&q=80',
    label: 'Empreendedor Criativo'
  },
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&auto=format&fit=crop&q=80',
    label: 'Creator Digital'
  },
  {
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=320&auto=format&fit=crop&q=80',
    label: 'Executivo Tech'
  },
  {
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=320&auto=format&fit=crop&q=80',
    label: 'Minimalista 3D'
  },
  {
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=320&auto=format&fit=crop&q=80',
    label: 'Estrategista Digital'
  },
  {
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=320&auto=format&fit=crop&q=80',
    label: 'Business Master'
  },
  {
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&auto=format&fit=crop&q=80',
    label: 'Nomad Creator'
  },
  {
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=320&auto=format&fit=crop&q=80',
    label: 'Infinity Gold'
  }
];

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  viewingUserId,
  currentUserId,
  userRole,
  onClose,
  onOpenAnotherProfile,
  onProfileUpdated,
}) => {
  const isOwnProfile = viewingUserId === currentUserId;
  const allProfiles = useAppStore((s) => s.profiles);
  const allPosts = useAppStore((s) => s.posts);
  const connectionsMap = useAppStore((s) => s.connectionsMap);
  const updateProfileStore = useAppStore((s) => s.updateProfile);
  const toggleConnectionStore = useAppStore((s) => s.toggleConnection);
  const profile = allProfiles.find((p) => p.userId === viewingUserId);
  const connections = connectionsMap[viewingUserId] || [];
  const isConnected = (connectionsMap[currentUserId] || []).includes(viewingUserId);

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'POSTS' | 'SAVED'>('POSTS');

  // Avatar Picker & Upload Modal State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoTab, setPhotoTab] = useState<'UPLOAD' | 'GALLERY' | 'URL'>('UPLOAD');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(profile?.avatar || AVATAR_PRESETS[0].url);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoSuccessToast, setPhotoSuccessToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadAvatarStore = useAppStore((s) => s.uploadAvatar);

  // Edit fields
  const [name, setName] = useState(profile?.name || '');
  const [profession, setProfession] = useState(profile?.profession || '');
  const [city, setCity] = useState(profile?.city || '');
  const [instagram, setInstagram] = useState(profile?.instagram || '');
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [objective, setObjective] = useState(profile?.objective || '');

  if (!profile) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-[#EBE6E2]">
        <p className="text-xs text-[#8E8984]">Perfil não encontrado.</p>
      </div>
    );
  }

  const posts = allPosts.filter((p) => p.authorId === profile.userId);
  const savedPosts = allPosts.filter((p) => p.savedBy?.includes(profile.userId));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileStore({
      name,
      profession,
      city,
      instagram,
      whatsapp,
      bio,
      objective,
    });
    setIsEditing(false);
    if (onProfileUpdated) {
      onProfileUpdated();
    }
  };

  const handleToggleConnect = () => {
    toggleConnectionStore(profile.userId);
  };

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploadError(null);
    setIsUploadingPhoto(true);
    const result = await uploadAvatarStore(file);
    setIsUploadingPhoto(false);

    if (!result.success || !result.url) {
      setUploadError(result.error || 'Não foi possível enviar a foto. Tente novamente.');
      return;
    }
    setSelectedPhoto(result.url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleOpenPhotoModal = () => {
    setSelectedPhoto(profile.avatar);
    setPhotoUrlInput('');
    setUploadError(null);
    setIsPhotoModalOpen(true);
  };

  const handleSavePhoto = () => {
    let finalPhoto = selectedPhoto;
    if (photoTab === 'URL' && photoUrlInput.trim()) {
      finalPhoto = photoUrlInput.trim();
    }

    updateProfileStore({
      avatar: finalPhoto,
    });

    setIsPhotoModalOpen(false);
    setPhotoSuccessToast('Foto de perfil atualizada com sucesso!');
    setTimeout(() => setPhotoSuccessToast(null), 3000);
    if (onProfileUpdated) {
      onProfileUpdated();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Success Toast Banner */}
      {photoSuccessToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{photoSuccessToast}</span>
        </div>
      )}
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-[#EBE6E2] overflow-hidden shadow-xs">
        {/* Cover / Backdrop */}
        <div className="h-32 bg-gradient-to-r from-[#FAF6F2] via-[#EBE6E2] to-[#FAF6F2] relative border-b border-[#EBE6E2]">
          <div className="absolute right-4 top-4">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/80 border border-[#BC9164]/30 text-[#835629] font-extrabold uppercase tracking-wider">
              {profile.joinedAt ? `Membro desde ${profile.joinedAt}` : 'Membro Oficial'}
            </span>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              {/* Avatar with Camera Overlay */}
              <div className="relative group/avatar shrink-0">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md shadow-[#312318]/10 bg-[#FAF6F2]"
                />
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={handleOpenPhotoModal}
                    id="btn-avatar-camera-overlay"
                    className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-[#312318] text-white hover:bg-[#BC9164] border-2 border-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center group"
                    title="Fazer upload de imagem ou escolher foto"
                  >
                    <Camera className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#312318]">
                    {profile.name}
                  </h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF6F2] border border-[#BC9164]/30 text-[#835629] font-bold uppercase">
                    Nível 0{profile.level}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#59595F] font-semibold mt-0.5">
                  {profile.profession}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <>
                  {/* Dedicated Upload / Choose Photo Button */}
                  <button
                    type="button"
                    onClick={handleOpenPhotoModal}
                    id="btn-profile-change-photo"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#312318] bg-[#FAF6F2] hover:bg-[#EBE6E2] border border-[#BC9164]/40 hover:border-[#BC9164] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#BC9164]" />
                    <span>Alterar Foto</span>
                  </button>

                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    id="btn-profile-edit-toggle"
                    className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#312318] bg-white hover:bg-[#FAF6F2] border border-[#EBE6E2] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#BC9164]" />
                    <span>{isEditing ? 'Cancelar Edição' : 'Editar Perfil'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleToggleConnect}
                  className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    isConnected
                      ? 'bg-[#FAF6F2] text-[#835629] border border-[#BC9164]/40 hover:bg-[#F3EFEA]'
                      : 'text-white bg-[#312318] hover:bg-[#59595F] shadow-xs'
                  }`}
                >
                  {isConnected ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#835629]" />
                      <span>Conectado</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Conectar</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="mt-4 p-4 rounded-xl bg-[#FAF6F2] border border-[#EBE6E2] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#EBE6E2]">
                <h3 className="text-xs font-bold uppercase text-[#312318]">Editar Dados Pessoais</h3>
                <span className="text-[10px] text-[#8E8984]">Atualize suas informações no ecossistema</span>
              </div>

              {/* Quick photo change banner inside edit form */}
              <div className="p-3.5 rounded-xl bg-white border border-[#EBE6E2] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#D7D0CB]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#312318] block">Foto de Perfil</span>
                    <span className="text-[11px] text-[#8E8984]">Faça upload de um arquivo ou escolha uma foto oficial</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenPhotoModal}
                  id="btn-edit-form-photo-upload"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#835629] bg-[#FAF6F2] hover:bg-[#EBE6E2] border border-[#BC9164]/40 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Camera className="w-3.5 h-3.5 text-[#BC9164]" />
                  <span>Upload / Escolher Foto</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#59595F] mb-1">Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#EBE6E2] bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#59595F] mb-1">Profissão / Nicho</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#EBE6E2] bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#59595F] mb-1">Instagram</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#EBE6E2] bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#59595F] mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#EBE6E2] bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#59595F] mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#EBE6E2] bg-white text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#59595F] mb-1">Objetivo</label>
                <textarea
                  rows={2}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#EBE6E2] bg-white text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg text-xs border border-[#EBE6E2]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase text-white bg-[#835629]"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Contact Meta & Location */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#59595F] py-2 border-y border-[#EBE6E2]/70 my-3">
                {profile.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#BC9164]" />
                    {profile.city}
                  </span>
                )}
                {profile.instagram && (
                  <a
                    href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#835629] hover:underline"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    {profile.instagram}
                  </a>
                )}
                {profile.whatsapp && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    {profile.whatsapp}
                  </span>
                )}
                <span className="flex items-center gap-1 ml-auto text-[#835629] font-bold">
                  {profile.xp} XP Acumulados
                </span>
              </div>

              {/* Bio & Objective */}
              <div className="space-y-3 text-xs sm:text-sm text-[#312318] mt-4">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8E8984]">
                    Apresentação (Bio)
                  </h4>
                  <p className="mt-1 leading-relaxed text-[#59595F]">{profile.bio}</p>
                </div>

                {profile.objective && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8E8984] flex items-center gap-1">
                      <Target className="w-3 h-3 text-[#BC9164]" />
                      Objetivo no Infinity Million
                    </h4>
                    <p className="mt-1 leading-relaxed text-[#59595F]">{profile.objective}</p>
                  </div>
                )}

                {/* Interests Badges */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8E8984] mb-1.5">
                    Áreas de Domínio & Interesses
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((item) => (
                      <span
                        key={item}
                        className="text-[10px] px-2.5 py-0.5 rounded-lg bg-[#FAF6F2] text-[#835629] border border-[#BC9164]/30 font-semibold"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Badges Earned Strip */}
      <div className="p-5 rounded-2xl bg-white border border-[#EBE6E2] shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#312318] mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#BC9164]" />
          Insígnias Desbloqueadas ({profile.badges.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {profile.badges.map((bCode) => {
            const b = INITIAL_BADGES.find((badge) => badge.code === bCode);
            return (
              <div
                key={bCode}
                className="px-3 py-1.5 rounded-xl bg-[#FAF6F2] border border-[#BC9164]/40 flex items-center gap-2"
              >
                <Award className="w-3.5 h-3.5 text-[#835629]" />
                <span className="text-xs font-bold text-[#312318]">{b?.title || bCode}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs: Posts / Saved */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#EBE6E2] pb-2">
          <button
            onClick={() => setActiveTab('POSTS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
              activeTab === 'POSTS'
                ? 'bg-[#312318] text-white'
                : 'text-[#59595F] hover:bg-[#FAF6F2]'
            }`}
          >
            Publicações ({posts.length})
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('SAVED')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                activeTab === 'SAVED'
                  ? 'bg-[#312318] text-white'
                  : 'text-[#59595F] hover:bg-[#FAF6F2]'
              }`}
            >
              Salvas ({savedPosts.length})
            </button>
          )}
        </div>

        {/* List of items */}
        <div className="space-y-3">
          {(activeTab === 'POSTS' ? posts : savedPosts).map((post) => (
            <div key={post.id} className="p-4 rounded-xl bg-white border border-[#EBE6E2] shadow-xs">
              <div className="flex items-center justify-between text-[11px] text-[#8E8984] mb-1.5">
                <span className="text-[#835629] font-bold">{post.category}</span>
                <span>{post.createdAt}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#312318] leading-relaxed whitespace-pre-line">
                {post.content}
              </p>
              <div className="flex items-center gap-4 text-xs text-[#59595F] mt-3 pt-2 border-t border-[#EBE6E2]/60">
                <span>{post.likes.length} curtidas</span>
                <span>{post.commentsCount} comentários</span>
              </div>
            </div>
          ))}

          {(activeTab === 'POSTS' ? posts : savedPosts).length === 0 && (
            <div className="py-8 text-center text-xs text-[#8E8984] bg-white rounded-xl border border-[#EBE6E2]">
              Nenhuma publicação encontrada nesta aba.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Upload / Escolher Foto */}
      {isPhotoModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          id="modal-avatar-picker-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPhotoModalOpen(false);
          }}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#D7D0CB] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            id="modal-avatar-picker-content"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#EBE6E2] bg-gradient-to-r from-[#FAF6F2] to-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#312318] flex items-center justify-center text-white">
                  <Camera className="w-4 h-4 text-[#BC9164]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#312318] uppercase tracking-wider">
                    Alterar Foto do Perfil
                  </h3>
                  <p className="text-[11px] text-[#8E8984]">
                    Envie uma foto do seu dispositivo ou escolha um avatar oficial
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8E8984] hover:text-[#312318] hover:bg-[#EBE6E2] transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center border-b border-[#EBE6E2] bg-[#FAF6F2]/60 px-5 pt-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPhotoTab('UPLOAD');
                  setUploadError(null);
                }}
                className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  photoTab === 'UPLOAD'
                    ? 'border-[#BC9164] text-[#835629]'
                    : 'border-transparent text-[#8E8984] hover:text-[#312318]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload de Arquivo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhotoTab('GALLERY');
                  setUploadError(null);
                }}
                className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  photoTab === 'GALLERY'
                    ? 'border-[#BC9164] text-[#835629]'
                    : 'border-transparent text-[#8E8984] hover:text-[#312318]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Galeria Oficial</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhotoTab('URL');
                  setUploadError(null);
                }}
                className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  photoTab === 'URL'
                    ? 'border-[#BC9164] text-[#835629]'
                    : 'border-transparent text-[#8E8984] hover:text-[#312318]'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Link da Imagem</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* TAB 1: UPLOAD */}
              {photoTab === 'UPLOAD' && (
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                    className="hidden"
                    id="input-file-avatar-upload"
                  />

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
                    className={`p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                      isDraggingFile
                        ? 'border-[#BC9164] bg-[#FAF6F2]'
                        : 'border-[#D7D0CB] hover:border-[#BC9164] bg-[#FAF6F2]/40 hover:bg-[#FAF6F2]'
                    } ${isUploadingPhoto ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#EBE6E2] shadow-xs flex items-center justify-center text-[#BC9164]">
                      <Upload className="w-6 h-6" />
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#312318]">
                        {isUploadingPhoto
                          ? 'Enviando sua foto...'
                          : 'Clique para escolher do dispositivo ou arraste a imagem aqui'}
                      </p>
                      <p className="text-[11px] text-[#8E8984] mt-0.5">
                        Compatível com PNG, JPG ou WEBP (máximo de 5MB)
                      </p>
                    </div>

                    <span className="px-3.5 py-1.5 rounded-xl bg-white border border-[#BC9164]/40 text-xs font-bold text-[#835629] shadow-xs hover:bg-[#FAF6F2] transition-colors">
                      {isUploadingPhoto ? 'Aguarde...' : 'Selecionar Arquivo'}
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: GALLERY */}
              {photoTab === 'GALLERY' && (
                <div className="space-y-2">
                  <p className="text-[11px] text-[#8E8984]">
                    Selecione um dos avatares de alta definição criados para o ecossistema:
                  </p>
                  
                  <div className="grid grid-cols-5 gap-2.5 sm:gap-3 max-h-56 overflow-y-auto p-1">
                    {AVATAR_PRESETS.map((preset, idx) => {
                      const isSelected = selectedPhoto === preset.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedPhoto(preset.url);
                            setUploadError(null);
                          }}
                          className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group ${
                            isSelected
                              ? 'border-[#BC9164] ring-2 ring-[#BC9164]/40 scale-95 shadow-md'
                              : 'border-[#EBE6E2] hover:border-[#BC9164]/60 hover:scale-105'
                          }`}
                          title={preset.label}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#312318]/25 flex items-center justify-center">
                              <div className="w-5 h-5 rounded-full bg-[#BC9164] text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3 h-3" />
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: URL */}
              {photoTab === 'URL' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#59595F]">
                    URL Direta da Imagem
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      placeholder="https://exemplo.com/minha-foto.jpg"
                      className="flex-1 px-3 py-2 rounded-xl border border-[#D7D0CB] text-xs text-[#312318] focus:outline-none focus:border-[#BC9164]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!photoUrlInput.trim().startsWith('http')) {
                          setUploadError('Informe uma URL de imagem válida (começando com http:// ou https://)');
                          return;
                        }
                        setSelectedPhoto(photoUrlInput.trim());
                        setUploadError(null);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#FAF6F2] hover:bg-[#EBE6E2] border border-[#BC9164]/30 text-xs font-bold text-[#835629] transition-colors cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                  <span className="text-[10px] text-[#8E8984] block">
                    Cole o link direto de uma foto no Unsplash, Instagram, LinkedIn ou outro site.
                  </span>
                </div>
              )}

              {/* Live Preview Container */}
              <div className="p-3.5 rounded-xl bg-[#FAF6F2] border border-[#EBE6E2] flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={selectedPhoto}
                    alt="Prévia"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md bg-white"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#312318] border border-white flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-[#BC9164]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#835629] block">
                    Pré-visualização da Foto
                  </span>
                  <p className="text-xs font-bold text-[#312318] truncate">
                    {profile.name}
                  </p>
                  <p className="text-[10px] text-[#8E8984]">
                    Assim que salvar, sua foto será atualizada em todo o ecossistema.
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-[#EBE6E2] bg-white flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#59595F] hover:bg-[#FAF6F2] border border-[#EBE6E2] transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSavePhoto}
                id="btn-save-chosen-photo"
                className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#BC9164] to-[#835629] hover:from-[#A87F53] hover:to-[#6E441D] shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Foto de Perfil</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
