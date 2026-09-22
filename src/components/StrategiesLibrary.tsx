import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  User, 
  ArrowRight, 
  FileText, 
  Download, 
  ExternalLink, 
  Plus, 
  X,
  Sparkles,
  Filter
} from 'lucide-react';
import { Strategy, StrategyCategory, UserRole } from '../types';
import { useAppStore } from '../store/useAppStore';

interface StrategiesLibraryProps {
  userRole: UserRole;
}

const STRATEGY_CATEGORIES: Array<'TODAS' | StrategyCategory> = [
  'TODAS',
  'TRÁFEGO',
  'VENDAS',
  'COPY',
  'LANÇAMENTOS',
  'INTELIGÊNCIA ARTIFICIAL',
  'AUTOMAÇÃO',
  'POSICIONAMENTO',
  'NEGÓCIOS',
  'MENTALIDADE',
  'FERRAMENTAS',
];

export const StrategiesLibrary: React.FC<StrategiesLibraryProps> = ({ userRole }) => {
  const [selectedCategory, setSelectedCategory] = useState<'TODAS' | StrategyCategory>('TODAS');
  const [activeStrategy, setActiveStrategy] = useState<Strategy | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Strategy Form state (for admin)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<StrategyCategory>('TRÁFEGO');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [readTime, setReadTime] = useState('10 min');

  const strategies = useAppStore((s) => s.strategies);
  const createStrategy = useAppStore((s) => s.createStrategy);

  const filteredStrategies = strategies.filter((s) => {
    if (selectedCategory === 'TODAS') return true;
    return s.category === selectedCategory;
  });

  const handleCreateStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    await createStrategy({
      title: title.trim(),
      description: description.trim(),
      category,
      content: content.trim() || 'Conteúdo estratégico exclusivo do Infinity Million.',
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
      readTime,
      author: 'Equipe Infinity Million',
      authorRole: 'Head de Estratégias',
      isFeatured: false,
    });

    setTitle('');
    setDescription('');
    setContent('');
    setImageUrl('');
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EBE6E2] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6F2] border border-[#BC9164]/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#BC9164]" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#835629]">
              Biblioteca Proprietária • Infinity Million
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#312318] tracking-tight uppercase">
            Estratégias Exclusivas
          </h1>
          <p className="text-xs sm:text-sm text-[#59595F] mt-1 max-w-xl">
            Acervo confidencial de blueprints, funis, scripts de conversão e frameworks práticos validados no campo de batalha digital.
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            id="btn-new-strategy"
            className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#BC9164] to-[#835629] hover:from-[#9F754B] hover:to-[#6E441D] shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Estratégia</span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <Filter className="w-4 h-4 text-[#8E8984] shrink-0 mr-1" />
        {STRATEGY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#312318] text-white shadow-xs'
                : 'bg-white text-[#59595F] hover:bg-[#FAF6F2] border border-[#EBE6E2]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStrategies.map((strategy) => (
          <div
            key={strategy.id}
            onClick={() => setActiveStrategy(strategy)}
            className="card-luxury rounded-2xl overflow-hidden cursor-pointer group flex flex-col justify-between bg-white"
          >
            <div>
              {/* Cover Image */}
              <div className="relative h-44 overflow-hidden bg-[#FAF6F2]">
                <img
                  src={strategy.imageUrl}
                  alt={strategy.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-[#835629] border border-[#BC9164]/30 shadow-xs">
                    {strategy.category}
                  </span>
                </div>
                {strategy.isFeatured && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-md bg-[#835629] text-white text-[9px] font-bold uppercase tracking-wider">
                      Destaque
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-center gap-2 text-[11px] text-[#8E8984] mb-2">
                  <Clock className="w-3.5 h-3.5 text-[#BC9164]" />
                  <span>{strategy.readTime}</span>
                  <span>•</span>
                  <span>{strategy.createdAt}</span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-[#312318] group-hover:text-[#835629] transition-colors leading-snug">
                  {strategy.title}
                </h3>

                <p className="text-xs text-[#59595F] mt-2 line-clamp-2 leading-relaxed">
                  {strategy.description}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 pt-3 border-t border-[#EBE6E2]/70 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[#59595F]">
                <User className="w-3.5 h-3.5 text-[#BC9164]" />
                <span className="text-[11px] font-medium truncate max-w-[120px]">{strategy.author}</span>
              </div>

              <span className="font-bold text-[#835629] group-hover:translate-x-1 transition-transform flex items-center gap-1 text-[11px]">
                Acessar <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal */}
      {activeStrategy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#EBE6E2] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            id="strategy-reader-modal"
          >
            {/* Modal Top Bar */}
            <div className="p-5 border-b border-[#EBE6E2] flex items-center justify-between bg-[#F8F4F0]/80">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAF6F2] border border-[#BC9164]/30 text-[#835629]">
                  {activeStrategy.category}
                </span>
                <span className="text-xs text-[#8E8984]">{activeStrategy.readTime}</span>
              </div>
              <button
                onClick={() => setActiveStrategy(null)}
                className="p-1.5 rounded-full hover:bg-[#EBE6E2] text-[#59595F] hover:text-[#312318] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Cover Banner */}
              <div className="relative h-56 rounded-xl overflow-hidden border border-[#EBE6E2]">
                <img
                  src={activeStrategy.imageUrl}
                  alt={activeStrategy.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#312318] leading-tight">
                  {activeStrategy.title}
                </h1>
                <p className="text-xs sm:text-sm text-[#59595F] mt-2 font-medium">
                  {activeStrategy.description}
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs text-[#8E8984]">
                  <span>Autor: <strong className="text-[#312318]">{activeStrategy.author}</strong></span>
                  <span>•</span>
                  <span>Publicado em: {activeStrategy.createdAt}</span>
                </div>
              </div>

              {/* Rich Markdown Content */}
              <div className="p-5 rounded-xl bg-[#FAF6F2]/70 border border-[#EBE6E2] text-xs sm:text-sm text-[#312318] leading-relaxed whitespace-pre-line space-y-3">
                {activeStrategy.content}
              </div>

              {/* Downloadable Files */}
              {activeStrategy.files && activeStrategy.files.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#59595F] mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#BC9164]" />
                    Arquivos & Modelos para Download
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeStrategy.files.map((file, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-[#EBE6E2] bg-white flex items-center justify-between hover:border-[#BC9164]/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-4 h-4 text-[#835629] shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-semibold text-[#312318] truncate">{file.name}</p>
                            <span className="text-[10px] text-[#8E8984]">{file.size}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => alert(`Download simulado com sucesso: ${file.name}`)}
                          className="p-1.5 rounded-lg bg-[#FAF6F2] hover:bg-[#EBE6E2] text-[#835629] transition-colors"
                          title="Baixar arquivo"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {activeStrategy.links && activeStrategy.links.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#59595F] mb-2">
                    Links & Planilhas Complementares
                  </h4>
                  <div className="space-y-2">
                    {activeStrategy.links.map((lnk, idx) => (
                      <a
                        key={idx}
                        href={lnk.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl border border-[#EBE6E2] bg-white flex items-center justify-between text-xs text-[#835629] font-semibold hover:bg-[#FAF6F2] transition-colors"
                      >
                        <span>{lnk.title}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom */}
            <div className="p-4 border-t border-[#EBE6E2] flex justify-end bg-[#F8F4F0]/60">
              <button
                onClick={() => setActiveStrategy(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#312318] hover:bg-[#59595F] transition-colors cursor-pointer"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Create Strategy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#EBE6E2] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE6E2] mb-4">
              <h2 className="text-base font-bold text-[#312318] uppercase tracking-wider">
                Nova Estratégia (Painel Admin)
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-[#8E8984] hover:text-[#312318]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStrategy} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#59595F] mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Escala de Mídia com Criativos Cinematográficos"
                  className="w-full px-3 py-2 rounded-xl border border-[#EBE6E2] text-xs focus:outline-none focus:border-[#BC9164]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#59595F] mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as StrategyCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EBE6E2] text-xs focus:outline-none focus:border-[#BC9164]"
                  >
                    {STRATEGY_CATEGORIES.filter((c) => c !== 'TODAS').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#59595F] mb-1">Tempo de Leitura</label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="Ex: 15 min"
                    className="w-full px-3 py-2 rounded-xl border border-[#EBE6E2] text-xs focus:outline-none focus:border-[#BC9164]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#59595F] mb-1">Descrição Curta</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Resumo do impacto e metodologia..."
                  className="w-full px-3 py-2 rounded-xl border border-[#EBE6E2] text-xs focus:outline-none focus:border-[#BC9164]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#59595F] mb-1">URL da Imagem de Capa</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-[#EBE6E2] text-xs focus:outline-none focus:border-[#BC9164]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#59595F] mb-1">Conteúdo Estratégico (Texto / Markdown)</label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva os tópicos, frameworks e passos operacionais..."
                  className="w-full px-3 py-2 rounded-xl border border-[#EBE6E2] text-xs focus:outline-none focus:border-[#BC9164] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs border border-[#EBE6E2] text-[#59595F]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#835629] hover:bg-[#6E441D]"
                >
                  Publicar Estratégia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
