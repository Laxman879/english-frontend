'use client';
import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Play, Pause, SkipForward, SkipBack, X, Camera, Pencil, Trash2, Check, Volume2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import CreatePlaylistModal from '@/components/playlists/CreatePlaylistModal';
import ImageUploader from '@/components/shared/ImageUploader';
import ConfirmModal from '@/components/shared/ConfirmModal';
import api from '@/lib/api';

interface PlaylistWord {
  _id: string;
  word: string;
  meaning: string;
  translations: Record<string, string>;
}

interface Playlist {
  id: string;
  title: string;
  wordCount: number;
  image: string;
  editingImg?: boolean;
  editingTitle?: boolean;
  titleInput?: string;
}

const PlaylistsPage = memo(function PlaylistsPage() {
  const [playlists, setPlaylists]       = useState<Playlist[]>([]);
  const [loading, setLoading]           = useState(true);
  const [playingId, setPlayingId]       = useState<string | null>(null);
  const [playingWords, setPlayingWords] = useState<PlaylistWord[]>([]);
  const [playingIdx, setPlayingIdx]     = useState(0);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [search, setSearch]             = useState('');
  const [modalOpen, setModalOpen]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Playlist | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const playingWordsRef                 = useRef<PlaylistWord[]>([]);

  useEffect(() => {
    api.get('/playlists')
      .then(r => setPlaylists(r.data.map((p: Record<string, unknown>) => ({
        id: p._id,
        title: p.name,
        wordCount: Array.isArray(p.items) ? (p.items as unknown[]).length : 0,
        image: (p.image as string) || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80',
      }))))
      .finally(() => setLoading(false));
  }, []);

  // Get Telugu translation from word
  const getTranslation = (w: PlaylistWord) => {
    if (!w.translations) return w.meaning;
    return w.translations['telugu'] || w.translations['hindi'] ||
      Object.values(w.translations)[0] || w.meaning;
  };

  const speakWord = useCallback((words: PlaylistWord[], idx: number) => {
    if (!('speechSynthesis' in window) || idx >= words.length) {
      setPlayingId(null); setPlayingWords([]); setPlayingIdx(0);
      playingWordsRef.current = [];
      return;
    }
    window.speechSynthesis.cancel();
    const w = words[idx];
    const translation = getTranslation(w);

    // Speak English word first
    const uEn = new SpeechSynthesisUtterance(w.word);
    uEn.lang = 'en-US'; uEn.rate = 0.85;

    // Then speak Telugu/native translation
    const uTe = new SpeechSynthesisUtterance(translation);
    uTe.lang = 'te-IN'; uTe.rate = 0.85;
    uTe.onend = () => {
      const next = idx + 1;
      setPlayingIdx(next);
      speakWord(playingWordsRef.current, next);
    };

    window.speechSynthesis.speak(uEn);
    window.speechSynthesis.speak(uTe);
  }, []);

  const handlePlay = useCallback(async (id: string) => {
    if (playingId === id) {
      window.speechSynthesis.cancel();
      setPlayingId(null); setPlayingWords([]); setPlayingIdx(0);
      playingWordsRef.current = [];
      return;
    }
    window.speechSynthesis.cancel();
    try {
      const { data } = await api.get(`/playlists/${id}`);
      const words: PlaylistWord[] = data.words || [];
      if (!words.length) { alert('No words in this playlist yet. Add words from the Saved Words page.'); return; }
      playingWordsRef.current = words;
      setPlayingId(id); setPlayingWords(words); setPlayingIdx(0);
      speakWord(words, 0);
    } catch {
      alert('Failed to load playlist words.');
    }
  }, [playingId, speakWord]);

  const handleSkipNext = useCallback(() => {
    const next = playingIdx + 1;
    if (next < playingWords.length) {
      window.speechSynthesis.cancel();
      setPlayingIdx(next);
      speakWord(playingWords, next);
    }
  }, [playingIdx, playingWords, speakWord]);

  const handleSkipBack = useCallback(() => {
    const prev = Math.max(0, playingIdx - 1);
    window.speechSynthesis.cancel();
    setPlayingIdx(prev);
    speakWord(playingWords, prev);
  }, [playingIdx, playingWords, speakWord]);

  const handleCreate = async (name: string) => {
    const { data } = await api.post('/playlists', { name });
    setPlaylists(prev => [{ id: data._id, title: data.name, wordCount: 0, image: data.image }, ...prev]);
  };

  const startEditImg  = useCallback((id: string) => setPlaylists(prev => prev.map(p => p.id === id ? { ...p, editingImg: true } : p)), []);
  const cancelEditImg = useCallback((id: string) => setPlaylists(prev => prev.map(p => p.id === id ? { ...p, editingImg: false } : p)), []);
  const saveImage     = useCallback(async (id: string, url: string) => {
    await api.put(`/playlists/${id}`, { image: url });
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, image: url, editingImg: false } : p));
  }, []);

  const startEditTitle = useCallback((id: string, title: string) =>
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, editingTitle: true, titleInput: title } : p)), []);

  const saveTitle = useCallback(async (id: string, title: string) => {
    if (!title.trim()) return;
    await api.put(`/playlists/${id}`, { name: title.trim() });
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, title: title.trim(), editingTitle: false } : p));
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/playlists/${deleteTarget.id}`);
      setPlaylists(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally { setDeleting(false); }
  }, [deleteTarget]);

  const filtered = playlists.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
  const currentWord = playingWords[playingIdx];

  return (
    <AppLayout>
      <div className="min-h-screen bg-[var(--bg)]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-5 sm:mb-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] mb-1">Your Audio Library</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text)] leading-tight">
                Mastering through<br />
                <span className="text-[var(--primary)] font-extrabold italic">Momentum.</span>
              </h1>
            </motion.div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 mt-1">
              <button onClick={() => setSearchOpen(v => !v)}
                className="w-9 h-9 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--card2)] transition-all">
                {searchOpen ? <X className="w-4 h-4 text-[var(--text2)]" /> : <Search className="w-4 h-4 text-[var(--text2)]" />}
              </button>
              <button onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-[var(--primary)] text-[var(--primary-fg)] rounded-xl text-xs font-bold hover:opacity-90 transition-all">
                <Plus className="w-4 h-4" /> New Playlist
              </button>
            </div>
          </div>

          {/* Search */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-4 sm:mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input autoFocus type="text" placeholder="Search playlists..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-all" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Now Playing bar */}
          <AnimatePresence>
            {playingId && currentWord && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="mb-5 bg-[var(--primary)] rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-0.5">Now Playing · {playingIdx + 1} of {playingWords.length}</p>
                  <p className="text-base font-extrabold text-white truncate">{currentWord.word}</p>
                  <p className="text-xs text-white/70 truncate">{getTranslation(currentWord)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={handleSkipBack}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
                    <SkipBack className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button onClick={() => handlePlay(playingId)}
                    className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:opacity-90 transition-all">
                    <Pause className="w-4 h-4 text-[var(--primary)] fill-[var(--primary)]" />
                  </button>
                  <button onClick={handleSkipNext}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
                    <SkipForward className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Playlist grid */}
          {loading ? (
            <div className="text-center py-20 text-[var(--muted)] text-sm">Loading playlists…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-3xl">🎵</div>
              <p className="text-sm font-semibold text-[var(--text2)]">
                {playlists.length === 0 ? 'No playlists yet' : `No playlists matching "${search}"`}
              </p>
              {playlists.length === 0 && (
                <button onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Create First Playlist
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map((p, i) => {
                const isPlaying = playingId === p.id;
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.06 }}
                    className={`rounded-2xl overflow-hidden group flex flex-col bg-[var(--card)] border transition-all ${isPlaying ? 'border-[var(--primary)] shadow-lg' : 'border-[var(--border)] hover:border-[var(--primary)]'}`}>

                    <div className="relative h-44 sm:h-48">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Camera btn */}
                      <button onClick={() => startEditImg(p.id)}
                        className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 z-10">
                        <Camera className="w-3.5 h-3.5 text-white" />
                      </button>

                      {/* Playing indicator */}
                      {isPlaying && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[var(--primary)] rounded-full px-2.5 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span className="text-[9px] font-bold text-white uppercase">Playing</span>
                        </div>
                      )}

                      {/* Bottom info */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                        {p.editingTitle ? (
                          <div className="flex items-center gap-1.5 mb-1" onClick={e => e.stopPropagation()}>
                            <input autoFocus value={p.titleInput || ''}
                              onChange={e => setPlaylists(prev => prev.map(pl => pl.id === p.id ? { ...pl, titleInput: e.target.value } : pl))}
                              className="flex-1 px-2 py-1 text-xs bg-white/20 backdrop-blur-sm border border-white/40 rounded-lg text-white focus:outline-none" />
                            <button onClick={() => saveTitle(p.id, p.titleInput || '')}
                              className="w-6 h-6 rounded-md bg-[var(--primary)] flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </button>
                            <button onClick={() => setPlaylists(prev => prev.map(pl => pl.id === p.id ? { ...pl, editingTitle: false } : pl))}
                              className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ) : (
                          <h4 className="text-sm font-extrabold text-white truncate mb-0.5">{p.title}</h4>
                        )}
                        <p className="text-[10px] text-white/60">{p.wordCount} {p.wordCount === 1 ? 'word' : 'words'}</p>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--card)]">
                      <button onClick={() => startEditTitle(p.id, p.title)}
                        className="w-8 h-8 rounded-xl bg-[var(--card2)] flex items-center justify-center hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] transition-all text-[var(--text2)]">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(p)}
                        className="w-8 h-8 rounded-xl bg-[var(--card2)] flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all text-[var(--text2)]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handlePlay(p.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                          isPlaying
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--primary-soft)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white'
                        }`}>
                        {isPlaying ? <><Pause className="w-3.5 h-3.5" /> Stop</> : <><Play className="w-3.5 h-3.5 fill-current" /> Play Words</>}
                      </button>
                    </div>

                    {p.editingImg && (
                      <ImageUploader onSave={(url) => saveImage(p.id, url)} onCancel={() => cancelEditImg(p.id)} />
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreatePlaylistModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreate} />
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this playlist?"
        message={`"${deleteTarget?.title}" will be permanently deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </AppLayout>
  );
});

export default PlaylistsPage;
