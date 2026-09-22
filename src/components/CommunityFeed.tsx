import React, { useEffect, useState } from 'react';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Pin,
  Image as ImageIcon,
  Link as LinkIcon,
  Send,
  Trash2,
  Filter,
} from 'lucide-react';
import { Comment, PostCategory, Profile, UserRole } from '../types';
import { useAppStore } from '../store/useAppStore';
import { communityService } from '../services/communityService';

interface CommunityFeedProps {
  currentProfile: Profile;
  userRole: UserRole;
  onOpenProfile: (userId: string) => void;
}

const CATEGORIES: Array<'TODOS' | PostCategory> = [
  'TODOS',
  'ESTRATÉGIAS',
  'RESULTADOS',
  'DÚVIDAS',
  'NETWORKING',
  'MENTALIDADE',
  'NEGÓCIOS',
  'AVISOS',
  'GERAL',
];

const PostComments: React.FC<{ postId: string }> = ({ postId }) => {
  const addComment = useAppStore((s) => s.addComment);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    communityService.getComments(postId).then((data) => {
      if (active) {
        setComments(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [postId]);

  const handleSend = async () => {
    if (!commentText.trim() || sending) return;
    setSending(true);
    await addComment(postId, commentText.trim());
    const updated = await communityService.getComments(postId);
    setComments(updated);
    setCommentText('');
    setSending(false);
  };

  return (
    <div className="mt-4 pt-4 border-t border-[#EBE6E2] space-y-3 bg-[#FAF6F2]/60 p-4 rounded-xl">
      <div className="space-y-3">
        {loading ? (
          <p className="text-xs text-[#8E8984] text-center py-2">Carregando comentários...</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-[#8E8984] text-center py-2">
            Seja o primeiro a comentar nesta publicação.
          </p>
        ) : (
          comments.map((comm) => (
            <div key={comm.id} className="flex gap-2.5 text-xs">
              <img
                src={comm.authorAvatar}
                alt={comm.authorName}
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 bg-white p-2.5 rounded-xl border border-[#EBE6E2]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#312318]">{comm.authorName}</span>
                  <span className="text-[10px] text-[#8E8984]">{comm.createdAt}</span>
                </div>
                <p className="text-[#59595F] mt-1 leading-relaxed">{comm.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Escreva uma resposta construtiva..."
          className="flex-1 px-3.5 py-2 rounded-xl border border-[#EBE6E2] bg-white text-xs text-[#312318] focus:outline-none focus:border-[#BC9164]"
        />
        <button
          onClick={handleSend}
          disabled={!commentText.trim() || sending}
          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#312318] hover:bg-[#59595F] disabled:opacity-40 transition-colors"
        >
          {sending ? '...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
};

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  currentProfile,
  userRole,
  onOpenProfile,
}) => {
  const posts = useAppStore((s) => s.posts);
  const createPost = useAppStore((s) => s.createPost);
  const toggleLikePost = useAppStore((s) => s.toggleLikePost);
  const toggleSavePost = useAppStore((s) => s.toggleSavePost);
  const togglePinPost = useAppStore((s) => s.togglePinPost);
  const deletePost = useAppStore((s) => s.deletePost);

  const [selectedCategory, setSelectedCategory] = useState<'TODOS' | PostCategory>('TODOS');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<PostCategory>('GERAL');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showMediaInputs, setShowMediaInputs] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const filteredPosts = posts.filter((post) => {
    if (selectedCategory === 'TODOS') return true;
    return post.category === selectedCategory;
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || publishing) return;

    setPublishing(true);
    await createPost({
      category: newPostCategory,
      content: newPostContent.trim(),
      imageUrl: imageUrl.trim() || undefined,
      linkUrl: linkUrl.trim() || undefined,
    });
    setPublishing(false);

    setNewPostContent('');
    setImageUrl('');
    setLinkUrl('');
    setShowMediaInputs(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <div className="bg-white p-6 rounded-2xl border border-[#EBE6E2] shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#312318] tracking-tight uppercase">
              Comunidade
            </h1>
            <p className="text-xs sm:text-sm text-[#59595F] mt-0.5">
              O que você está construindo hoje?
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#FAF6F2] border border-[#BC9164]/30 text-[#835629] font-bold tracking-wider uppercase">
            Membros Ativos
          </span>
        </div>

        <form onSubmit={handleCreatePost} className="mt-5 space-y-3">
          <div className="flex gap-3">
            <img
              src={currentProfile.avatar}
              alt={currentProfile.name}
              className="w-10 h-10 rounded-full object-cover border border-[#BC9164]/40 shrink-0"
            />
            <div className="flex-1">
              <textarea
                rows={3}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Compartilhe uma ideia, conquista, aprendizado ou dúvida com a comunidade..."
                className="w-full p-3.5 rounded-xl border border-[#EBE6E2] text-xs sm:text-sm text-[#312318] placeholder:text-[#8E8984] focus:outline-none focus:border-[#BC9164] transition-colors resize-none"
              />
            </div>
          </div>

          {showMediaInputs && (
            <div className="p-3 rounded-xl bg-[#FAF6F2] border border-[#EBE6E2] space-y-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#59595F] mb-1">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.png"
                  className="w-full px-3 py-1.5 rounded-lg border border-[#EBE6E2] bg-white text-xs focus:outline-none focus:border-[#BC9164]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#59595F] mb-1">
                  Link Externo
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://link-do-recurso.com"
                  className="w-full px-3 py-1.5 rounded-lg border border-[#EBE6E2] bg-white text-xs focus:outline-none focus:border-[#BC9164]"
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <select
                value={newPostCategory}
                onChange={(e) => setNewPostCategory(e.target.value as PostCategory)}
                className="px-3 py-1.5 rounded-lg border border-[#EBE6E2] bg-white text-xs font-semibold text-[#59595F] focus:outline-none focus:border-[#BC9164]"
              >
                {CATEGORIES.filter((c) => c !== 'TODOS').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowMediaInputs(!showMediaInputs)}
                className="p-2 rounded-lg text-[#59595F] hover:text-[#312318] hover:bg-[#FAF6F2] border border-[#EBE6E2] transition-colors"
                title="Adicionar imagem ou link"
              >
                <ImageIcon className="w-4 h-4 text-[#BC9164]" />
              </button>
            </div>

            <button
              type="submit"
              id="btn-publish-post"
              disabled={!newPostContent.trim() || publishing}
              className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#BC9164] to-[#835629] hover:from-[#9F754B] hover:to-[#6E441D] disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{publishing ? 'PUBLICANDO...' : 'PUBLICAR'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <Filter className="w-4 h-4 text-[#8E8984] shrink-0 mr-1" />
        {CATEGORIES.map((cat) => (
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

      <div className="space-y-4">
        {filteredPosts.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#EBE6E2] p-10 text-center text-xs text-[#8E8984]">
            Nenhuma publicação por aqui ainda. Seja o primeiro a compartilhar algo!
          </div>
        )}
        {filteredPosts.map((post) => {
          const isLiked = post.likes.includes(currentProfile.userId);
          const isSaved = post.savedBy?.includes(currentProfile.userId) || false;
          const canModerate = userRole === 'admin' || userRole === 'moderator' || post.authorId === currentProfile.userId;

          return (
            <div
              key={post.id}
              className={`p-6 rounded-2xl bg-white border transition-all ${
                post.isPinned
                  ? 'border-[#BC9164] shadow-md shadow-[#BC9164]/5 bg-gradient-to-b from-[#FFFDFB] to-white'
                  : 'border-[#EBE6E2] shadow-xs'
              }`}
            >
              {post.isPinned && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#835629] uppercase tracking-wider mb-3 pb-2 border-b border-[#EBE6E2]">
                  <Pin className="w-3.5 h-3.5 fill-[#835629]" />
                  <span>Publicação Fixada pela Administração</span>
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div
                  onClick={() => onOpenProfile(post.authorId)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover border border-[#BC9164]/30 group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-[#312318] group-hover:text-[#835629] transition-colors">
                        {post.authorName}
                      </span>
                      {post.authorRole === 'admin' ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-[#BC9164]/20 text-[#835629] border border-[#BC9164]/40">
                          Admin
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-[#FAF6F2] text-[#8E8984] border border-[#EBE6E2]">
                          Nível 0{post.authorLevel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#8E8984]">
                      <span>{post.createdAt}</span>
                      <span>•</span>
                      <span className="text-[#835629] font-medium">{post.category}</span>
                    </div>
                  </div>
                </div>

                {canModerate && (
                  <div className="flex items-center gap-1">
                    {userRole === 'admin' && (
                      <button
                        onClick={() => togglePinPost(post.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          post.isPinned
                            ? 'bg-[#BC9164]/15 border-[#BC9164] text-[#835629]'
                            : 'border-[#EBE6E2] text-[#8E8984] hover:text-[#312318]'
                        }`}
                        title={post.isPinned ? 'Desafixar publicação' : 'Fixar no topo'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('Tem certeza de que deseja remover esta publicação?')) {
                          deletePost(post.id);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-[#EBE6E2] text-[#8E8984] hover:text-red-600 transition-colors"
                      title="Excluir publicação"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs sm:text-sm text-[#312318] leading-relaxed whitespace-pre-line">
                {post.content}
              </div>

              {post.imageUrl && (
                <div className="mt-4 rounded-xl overflow-hidden border border-[#EBE6E2] max-h-96">
                  <img
                    src={post.imageUrl}
                    alt="Anexo da publicação"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {post.linkUrl && (
                <a
                  href={post.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 p-3 rounded-xl bg-[#FAF6F2] border border-[#EBE6E2] flex items-center gap-2 text-xs text-[#835629] font-semibold hover:underline"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span className="truncate">{post.linkUrl}</span>
                </a>
              )}

              <div className="mt-5 pt-3 border-t border-[#EBE6E2] flex items-center justify-between text-xs text-[#59595F]">
                <div className="flex items-center gap-4 sm:gap-6">
                  <button
                    onClick={() => toggleLikePost(post.id)}
                    className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                      isLiked ? 'text-red-500 font-bold' : 'hover:text-[#312318]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                    <span>{post.likes.length} curtidas</span>
                  </button>

                  <button
                    onClick={() =>
                      setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                    }
                    className="flex items-center gap-1.5 font-medium hover:text-[#312318] transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#8E8984]" />
                    <span>{post.commentsCount} comentários</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleSavePost(post.id)}
                    className={`flex items-center gap-1 hover:text-[#312318] transition-colors cursor-pointer ${
                      isSaved ? 'text-[#BC9164] font-bold' : ''
                    }`}
                    title={isSaved ? 'Salvo' : 'Salvar publicação'}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#BC9164]' : ''}`} />
                    <span className="hidden sm:inline">{isSaved ? 'Salvo' : 'Salvar'}</span>
                  </button>
                </div>
              </div>

              {activeCommentPostId === post.id && <PostComments postId={post.id} />}

            </div>
          );
        })}
      </div>

    </div>
  );
};
