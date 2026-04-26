'use client';
import { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, BookMarked, Trash2, Sparkles, ListMusic, CheckSquare, Square, LayoutGrid, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import WordCard, { type Word } from '@/components/saved/WordCard';
import MasteredBanner from '@/components/saved/MasteredBanner';
import ProTipCard from '@/components/saved/ProTipCard';
import AddWordModal from '@/components/saved/AddWordModal';
import WordDetailModal from '@/components/saved/WordDetailModal';
import ConfirmModal from '@/components/shared/ConfirmModal';
import api from '@/lib/api';

const SavedWords = memo(function SavedWords() {
  const router = useRouter();
  const [words, setWords]             = useState<Word[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [modalOpen, setModalOpen]     = useState(false);
  const [detailWord, setDetailWord]   = useState<Word | null>(null);
  const [selectMode, setSelectMode]   = useState(false);
  const [viewMode, setViewMode]       = useState<'grid' | 'list'>('grid');
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [playlists, setPlaylists]     = useState<{ id: string; title: string }[]>([]);
  const [playlistModal, setPlaylistModal] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(false);
  const [generatingStory, setGeneratingStory] = useState(false);

  useEffect(() => {
    api.get('/words').then(r => {
      setWords(r.data.map((w: Record<string, unknown>) => ({
        id: w._id, badge: 'COMMON', word: w.word,
        translation: w.meaning || '', pronunciation: (w.audioUrl as string) || '',
        image: (w.image as string) || '',
        examples: w.examples || {},
        translations: w.translations || {},
      })));
    }).finally(() => setLoading(false));
    api.get('/playlists').then(r => {
      setPlaylists(r.data.map((p: Record<string, string>) => ({ id: p._id, title: p.name })));
    });
  }, []);

  const filtered = useMemo(() =>
    words.filter(w =>
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.translation.toLowerCase().includes(search.toLowerCase())
    ), [words, search]);

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(w => w.id)));
    }
  }, [selected, filtered]);

  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelected(new Set());
  }, []);

  const handleDelete = useCallback((id: string) => {
    setWords(prev => prev.filter(w => w.id !== id));
    setDetailWord(null);
  }, []);

  const handleUpdate = useCallback((updated: Word) => {
    setWords(prev => prev.map(w => w.id === updated.id ? updated : w));
    setDetailWord(updated);
  }, []);

  const handleBulkDelete = useCallback(async () => {
    setBulkDeleting(true);
    try {
      await Promise.all([...selected].map(id => api.delete(`/words/${id}`)));
      setWords(prev => prev.filter(w => !selected.has(w.id)));
      setSelected(new Set());
      setConfirmBulkDelete(false);
      setSelectMode(false);
    } finally {
      setBulkDeleting(false);
    }
  }, [selected]);

  const handleGenerateStory = useCallback(async () => {
    const selectedWords = words.filter(w => selected.has(w.id)).map(w => w.word);
    if (!selectedWords.length) return;
    setGeneratingStory(true);
    try {
      await api.post('/stories/generate', { words: selectedWords });
      exitSelectMode();
      router.push('/stories');
    } finally {
      setGeneratingStory(false);
    }
  }, [selected, words, router, exitSelectMode]);

  const handleAddToPlaylist = useCallback(async (playlistId: string) => {
    setAddingToPlaylist(true);
    try {
      await Promise.all(
        [...selected].map(wordId =>
          api.put(`/playlists/${playlistId}/add-item`, { type: 'word', refId: wordId })
        )
      );
      setPlaylistModal(false);
      exitSelectMode();
    } finally {
      setAddingToPlaylist(false);
    }
  }, [selected, exitSelectMode]);

  const handleAdd = useCallback((newWord: Word) => {
    setWords(prev => [newWord, ...prev]);
  }, []);

  return (
    <AppLayout>
      <div className="min-h-screen bg-[var(--bg)]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">

          {/* Header */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-5 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] mb-1">Vocabulary Vault</p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text)] mb-1 sm:mb-2">Saved Words</h1>
                <p className="text-xs sm:text-sm text-[var(--text2)] max-w-sm">
                  Review your curated collection of terms and phrases.
                </p>
              </motion.div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
                  <BookMarked className="w-4 h-4 text-[var(--primary)]" />
                  <span className="text-sm font-bold text-[var(--text)]">{words.length}</span>
                  <span className="text-xs text-[var(--muted)]">words saved</span>
                </div>
              </div>
            </div>

            {/* Search + actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[160px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                  type="text" placeholder="Search words..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-all"
                />
              </div>
              {!selectMode ? (
                <>
                  <button onClick={() => setSelectMode(true)}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl text-sm font-semibold text-[var(--text2)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all shrink-0">
                    <CheckSquare className="w-4 h-4" /> Select
                  </button>
                  {/* View toggle */}
                  <div className="flex items-center bg-[var(--card)] border border-[var(--border)] rounded-2xl p-1 shrink-0">
                    <button onClick={() => setViewMode('grid')}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                        viewMode === 'grid' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text2)] hover:text-[var(--text)]'
                      }`}>
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('list')}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                        viewMode === 'list' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text2)] hover:text-[var(--text)]'
                      }`}>
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-fg)] rounded-2xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all shrink-0">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Word</span>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={toggleSelectAll} className="flex items-center gap-1.5 px-3 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl text-xs font-semibold text-[var(--text2)] hover:border-[var(--primary)] transition-all shrink-0">
                    {selected.size === filtered.length ? <CheckSquare className="w-4 h-4 text-[var(--primary)]" /> : <Square className="w-4 h-4" />}
                    {selected.size === filtered.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button onClick={exitSelectMode} className="px-3 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl text-xs font-semibold text-[var(--text2)] hover:border-[var(--primary)] transition-all shrink-0">
                    Cancel
                  </button>
                </>
              )}
            </div>

            {/* Selection action bar */}
            <AnimatePresence>
              {selectMode && selected.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 flex-wrap p-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl"
                >
                  <span className="text-xs font-bold text-[var(--primary)] mr-1">{selected.size} selected</span>
                  <button
                    onClick={handleGenerateStory}
                    disabled={generatingStory}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-60 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {generatingStory ? 'Generating…' : 'Generate Story'}
                  </button>
                  <button
                    onClick={() => setPlaylistModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[var(--blue-soft)] text-[var(--blue)] rounded-xl text-xs font-bold hover:opacity-90 transition-all"
                  >
                    <ListMusic className="w-3.5 h-3.5" />
                    Add to Playlist
                  </button>
                  <button
                    onClick={() => setConfirmBulkDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            <div className="lg:col-span-2 space-y-4 sm:space-y-5">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <div className="text-center py-16 text-[var(--muted)] text-sm">Loading words…</div>
                ) : filtered.length > 0 ? (
                  viewMode === 'grid' ? (
                    <motion.div key="grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      <AnimatePresence>
                        {filtered.map((word, i) => (
                          <div key={word.id} className="relative">
                            {selectMode && (
                              <button onClick={() => toggleSelect(word.id)}
                                className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full flex items-center justify-center transition-all">
                                {selected.has(word.id)
                                  ? <CheckSquare className="w-5 h-5 text-[var(--primary)] drop-shadow" />
                                  : <Square className="w-5 h-5 text-white drop-shadow" />}
                              </button>
                            )}
                            <WordCard word={word} index={i} onDelete={handleDelete} onUpdate={handleUpdate}
                              dimmed={selectMode && !selected.has(word.id)}
                              onClick={() => selectMode ? toggleSelect(word.id) : setDetailWord(word)} />
                          </div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    /* List view */
                    <motion.div key="list" className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
                      {filtered.map((word, i) => {
                        const teluguMeaning = word.translations?.['telugu'] || word.translations?.['hindi'] ||
                          (word.translations ? Object.values(word.translations)[0] : '') || '';
                        const isSelected = selected.has(word.id);
                        return (
                          <motion.div key={word.id}
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className={`flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--card2)] transition-colors cursor-pointer ${
                              selectMode && isSelected ? 'bg-[var(--primary-soft)]' : ''
                            }`}
                            onClick={() => selectMode ? toggleSelect(word.id) : setDetailWord(word)}
                          >
                            {/* Checkbox */}
                            {selectMode && (
                              <div className="shrink-0">
                                {isSelected
                                  ? <CheckSquare className="w-5 h-5 text-[var(--primary)]" />
                                  : <Square className="w-5 h-5 text-[var(--muted)]" />}
                              </div>
                            )}
                            {/* Image */}
                            <div className="w-10 h-10 rounded-xl bg-[var(--card2)] shrink-0 overflow-hidden">
                              {word.image
                                ? <img src={word.image} alt={word.word} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-lg">📖</div>
                              }
                            </div>
                            {/* Word info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-extrabold text-[var(--text)]">{word.word}</span>
                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">{word.badge}</span>
                              </div>
                              <p className="text-xs text-[var(--text2)] truncate">{word.translation}</p>
                              {teluguMeaning && (
                                <p className="text-xs text-[var(--primary)] font-medium truncate">{teluguMeaning}</p>
                              )}
                            </div>
                            {/* Arrow */}
                            <span className="text-[var(--muted)] text-xs shrink-0">›</span>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--card2)] flex items-center justify-center mb-4">
                      <BookMarked className="w-6 h-6 text-[var(--muted)]" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text2)] mb-1">No words found</p>
                    <p className="text-xs text-[var(--muted)]">{search ? 'Try a different search term' : 'Add your first word to get started'}</p>
                    {!search && (
                      <button onClick={() => setModalOpen(true)} className="mt-4 flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-fg)] rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all">
                        <Plus className="w-3.5 h-3.5" /> Add First Word
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <MasteredBanner />
            </div>
            <div className="space-y-4 sm:space-y-5">
              <ProTipCard />
            </div>
          </div>
        </div>
      </div>

      <AddWordModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />

      <WordDetailModal
        word={detailWord}
        onClose={() => setDetailWord(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Bulk delete confirm */}
      <ConfirmModal
        open={confirmBulkDelete}
        title={`Delete ${selected.size} word${selected.size > 1 ? 's' : ''}?`}
        message="These words will be permanently removed from your vocabulary vault."
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
        loading={bulkDeleting}
      />

      {/* Add to playlist modal */}
      <AnimatePresence>
        {playlistModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setPlaylistModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }} transition={{ duration: 0.22 }}
              className="relative bg-[var(--card)] rounded-3xl shadow-2xl p-6 w-full max-w-sm mx-4 z-10"
            >
              <h2 className="text-lg font-extrabold text-[var(--text)] mb-1">Add to Playlist</h2>
              <p className="text-xs text-[var(--muted)] mb-4">{selected.size} word{selected.size > 1 ? 's' : ''} will be added</p>
              {playlists.length === 0 ? (
                <p className="text-sm text-[var(--muted)] text-center py-4">No playlists yet. Create one first.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {playlists.map(pl => (
                    <button
                      key={pl.id}
                      onClick={() => handleAddToPlaylist(pl.id)}
                      disabled={addingToPlaylist}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] transition-all text-left disabled:opacity-60"
                    >
                      <ListMusic className="w-4 h-4 text-[var(--primary)] shrink-0" />
                      <span className="text-sm font-semibold text-[var(--text)]">{pl.title}</span>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => setPlaylistModal(false)} className="mt-4 w-full py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text2)] hover:bg-[var(--card2)] transition-colors">
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
});

export default SavedWords;
