import React, { useState } from 'react';
import { 
  Network, 
  Search, 
  UserPlus, 
  Check, 
  MapPin, 
  Instagram, 
  Briefcase, 
  Award, 
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { Profile } from '../types';
import { useAppStore } from '../store/useAppStore';

interface NetworkDirectoryProps {
  currentProfile: Profile;
  onOpenProfile: (userId: string) => void;
}

export const NetworkDirectory: React.FC<NetworkDirectoryProps> = ({
  currentProfile,
  onOpenProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'CONNECTIONS' | 'SIMILAR' | 'NEW'>('ALL');
  const allProfiles = useAppStore((s) => s.profiles);
  const connectionsMap = useAppStore((s) => s.connectionsMap);
  const toggleConnection = useAppStore((s) => s.toggleConnection);
  const connections = connectionsMap[currentProfile.userId] || [];

  const handleToggleConnect = (targetUserId: string) => {
    toggleConnection(targetUserId);
  };

  const filteredProfiles = allProfiles.filter((p) => {
    if (p.userId === currentProfile.userId) return false;

    // Search query match
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.interests.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === 'CONNECTIONS') {
      return connections.includes(p.userId);
    }
    if (filterTab === 'SIMILAR') {
      return p.interests.some((i) => currentProfile.interests.includes(i));
    }
    if (filterTab === 'NEW') {
      return p.level <= 2;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EBE6E2] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6F2] border border-[#BC9164]/30 mb-2">
            <Network className="w-3.5 h-3.5 text-[#BC9164]" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#835629]">
              Ecossistema Privado • Minha Rede
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#312318] tracking-tight uppercase">
            Networking de Alta Performance
          </h1>
          <p className="text-xs sm:text-sm text-[#59595F] mt-1 max-w-xl">
            Conecte-se com coprodutores, especialistas em tráfego, copywriters e gestores que compartilham a mesma visão de negócio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-xl bg-[#FAF6F2] border border-[#EBE6E2] text-center min-w-[110px]">
            <span className="text-xl font-extrabold text-[#312318]">{connections.length}</span>
            <p className="text-[10px] uppercase font-bold text-[#8E8984]">Minhas Conexões</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8E8984] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, nicho, habilidade ou cidade..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EBE6E2] bg-white text-xs text-[#312318] focus:outline-none focus:border-[#BC9164]"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(
            [
              { key: 'ALL', label: 'Todos os Membros' },
              { key: 'CONNECTIONS', label: `Conexões (${connections.length})` },
              { key: 'SIMILAR', label: 'Interesses Semelhantes' },
              { key: 'NEW', label: 'Novos Membros' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterTab === tab.key
                  ? 'bg-[#312318] text-white shadow-xs'
                  : 'bg-white text-[#59595F] hover:bg-[#FAF6F2] border border-[#EBE6E2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProfiles.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-[#EBE6E2]">
            <p className="text-xs text-[#8E8984]">Nenhum membro encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          filteredProfiles.map((profile) => {
            const isConnected = connections.includes(profile.userId);

            return (
              <div
                key={profile.id}
                className="card-luxury p-5 rounded-2xl bg-white flex flex-col justify-between"
              >
                <div>
                  {/* Top Avatar & Level */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      onClick={() => onOpenProfile(profile.userId)}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#BC9164]/40 cursor-pointer hover:scale-105 transition-transform"
                    />
                    <div className="text-right">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF6F2] border border-[#BC9164]/30 text-[#835629] font-extrabold uppercase">
                        Nível 0{profile.level}
                      </span>
                      <span className="block text-[10px] text-[#8E8984] mt-0.5 font-medium">
                        {profile.xp} XP
                      </span>
                    </div>
                  </div>

                  {/* Name and Profession */}
                  <h3
                    onClick={() => onOpenProfile(profile.userId)}
                    className="font-bold text-sm text-[#312318] hover:text-[#835629] cursor-pointer transition-colors leading-tight"
                  >
                    {profile.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#59595F] font-medium mt-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#BC9164] shrink-0" />
                    <span className="truncate">{profile.profession}</span>
                  </div>

                  {profile.city && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8E8984] mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#8E8984] shrink-0" />
                      <span className="truncate">{profile.city}</span>
                    </div>
                  )}

                  {/* Bio */}
                  <p className="text-xs text-[#59595F] mt-2.5 line-clamp-2 leading-relaxed">
                    {profile.bio}
                  </p>

                  {/* Interests tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {profile.interests.slice(0, 3).map((item) => (
                      <span
                        key={item}
                        className="text-[9px] px-2 py-0.5 rounded bg-[#FAF6F2] text-[#835629] border border-[#EBE6E2] font-semibold"
                      >
                        {item}
                      </span>
                    ))}
                    {profile.interests.length > 3 && (
                      <span className="text-[9px] px-1 text-[#8E8984]">
                        +{profile.interests.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 mt-4 border-t border-[#EBE6E2] flex items-center gap-2">
                  <button
                    onClick={() => handleToggleConnect(profile.userId)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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

                  <button
                    onClick={() => onOpenProfile(profile.userId)}
                    className="p-2 rounded-xl border border-[#EBE6E2] hover:bg-[#FAF6F2] text-[#59595F] transition-colors"
                    title="Ver perfil completo"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
