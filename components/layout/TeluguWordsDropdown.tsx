'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckSquare, Square, X, Volume2, Check, Sparkles, ListMusic, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { type Word } from '@/components/saved/WordCard';

interface RawWord {
  _id: string; word: string; meaning?: string; image?: string; audioUrl?: string;
  translations?: Record<string, string>;
  examples?: { past?: string; present?: string; future?: string };
}

interface Playlist { id: string; title: string; }

export default function TeluguWordsDropdown() {
  const router = useRouter();
  const [open, setOpen]                     = useState(false);
  const [words, setWords]                   = useState<Word[]>([]);
  const [loading, setLoading]               = useState(false);
  const [selected, setSelected]             = useState<Set<string>>(new Set());
  const [detailWord, setDetailWord]         = useState<Word | null>(null);
  const [speaking, setSpeaking]             = useState<string | null>(null);

  // Playlist modal
  const [playlistModal, setPlaylistModal]   = useState(false);
  const [playlists, setPlaylists]           = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [playlistMsg, setPlaylistMsg]       = useState('');

  // Story modal
  const [storyModal, setStoryModal]         = useState(false);
  const [genre, setGenre]                   = useState('');
  const [generatingStory, setGeneratingStory] = useState(false);
  const [storyMsg, setStoryMsg]             = useState('');

  const ref = useRef<HTMLDivElement>(null);

  const GENRES = [
    { id: 'adventure', label: 'Adventure', emoji: '🏔️' },
    { id: 'romance',   label: 'Romance',   emoji: '💕' },
    { id: 'mystery',   label: 'Mystery',   emoji: '🔍' },
    { id: 'fantasy',   label: 'Fantasy',   emoji: '🧙' },
    { id: 'sci-fi',    label: 'Sci-Fi',    emoji: '🚀' },
    { id: 'comedy',    label: 'Comedy',    emoji: '😂' },
    { id: 'drama',     label: 'Drama',     emoji: '🎭' },
    { id: 'daily life',label: 'Daily Life',emoji: '☀️' },
  ];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open || words.length > 0) return;
    setLoading(true);
    api.get('/words').then(r => {
      const filtered = (r.data as RawWord[])
        .filter(w => w.translations?.['telugu'] || w.translations?.['Telugu'])
        .map(w => ({
          id: w._id, badge: 'COMMON', word: w.word,
          translation: w.meaning || '',
          pronunciation: w.audioUrl || '',
          image: w.image || '',
          examples: w.examples || {},
          translations: w.translations || {},
        }));
      setWords(filtered);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [open]);

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected(prev => prev.size === words.length ? new Set() : new Set(words.map(w => w.id)));
  }, [words]);

  const speak = useCallback((text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.85;
    setSpeaking(id);
    u.onend = () => setSpeaking(null);
    window.speechSynthesis.speak(u);
  }, []);

  const teluguOf = (w: Word) => w.translations?.['telugu'] || w.translations?.['Telugu'] || '—';

  // Open playlist modal — fetch playlists
  const openPlaylistModal = useCallback(() => {
    setPlaylistMsg('');
    setNewPlaylistName('');
    setPlaylistModal(true);
    setOpen(false);
    api.get('/playlists').then(r => {
      setPlaylists(r.data.map((p: Record<string, unknown>) => ({ id: p._id, title: p.name })));
    }).catch(() => {});
  }, []);

  const addToPlaylist = useCallback(async (playlistId: string) => {
    setPlaylistLoading(true);
    setPlaylistMsg('');
    try {
      await Promise.all([...selected].map(wordId =>
        api.put(`/playlists/${playlistId}/add-item`, { type: 'word', refId: wordId })
      ));
      setPlaylistMsg('✅ Words added to playlist!');
      setTimeout(() => { setPlaylistModal(false); setPlaylistMsg(''); }, 1200);
    } catch {
      setPlaylistMsg('❌ Failed to add words.');
    } finally {
      setPlaylistLoading(false);
    }
  }, [selected]);

  const createAndAdd = useCallback(async () => {
    if (!newPlaylistName.trim()) return;
    setPlaylistLoading(true);
    setPlaylistMsg('');
    try {
      const { data } = await api.post('/playlists', { name: newPlaylistName.trim() });
      await addToPlaylist(data._id);
    } catch {
      setPlaylistMsg('❌ Failed to create playlist.');
      setPlaylistLoading(false);
    }
  }, [newPlaylistName, addToPlaylist]);

  // Generate story
  const openStoryModal = useCallback(() => {
    setStoryMsg('');
    setGenre('');
    setStoryModal(true);
    setOpen(false);
  }, []);

  const generateStory = useCallback(async () => {
    if (!genre) { setStoryMsg('Please pick a genre.'); return; }
    setGeneratingStory(true);
    setStoryMsg('');
    try {
      const selectedWordNames = words.filter(w => selected.has(w.id)).map(w => w.word);
      await api.post('/stories/generate', { words: selectedWordNames, genre });
      setStoryMsg('✅ Story generated!');
      setTimeout(() => { setStoryModal(false); router.push('/stories'); }, 1000);
    } catch {
      setStoryMsg('❌ Generation failed. Try again.');
    } finally {
      setGeneratingStory(false);
    }
  }, [genre, words, selected, router]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
          open
            ? 'bg-[var(--primary)] text-[var(--primary-fg)] border-[var(--primary)]'
            : 'bg-[var(--card2)] text-[var(--text2)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
        }`}
      >
        <span>🇮🇳</span>
        All Words
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        {selected.size > 0 && (
          <span className="ml-1 bg-white/30 text-[var(--primary-fg)] rounded-full px-1.5 py-0.5 text-[9px] font-extrabold">
            {selected.size}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full mt-2 right-0 w-80 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-md)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <div>
                <p className="text-xs font-extrabold text-[var(--text)]">Telugu Words</p>
                <p className="text-[10px] text-[var(--muted)]">{words.length} words with Telugu meaning</p>
              </div>
              <button onClick={() => setOpen(false)} className="w-6 h-6 rounded-lg bg-[var(--card2)] flex items-center justify-center hover:bg-[var(--border)] transition-colors">
                <X className="w-3.5 h-3.5 text-[var(--text2)]" />
              </button>
            </div>

            {/* Select all + action buttons */}
            {words.length > 0 && (
              <div className="px-4 py-2 bg-[var(--card2)] border-b border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <button onClick={toggleAll} className="flex items-center gap-2 text-xs font-semibold text-[var(--text2)] hover:text-[var(--primary)] transition-colors">
                    {selected.size === words.length
                      ? <CheckSquare className="w-4 h-4 text-[var(--primary)]" />
                      : <Square className="w-4 h-4" />
                    }
                    {selected.size === words.length ? 'Deselect All' : 'Select All'}
                  </button>
                  {selected.size > 0 && (
                    <span className="text-[10px] font-bold text-[var(--primary)]">{selected.size} selected</span>
                  )}
                </div>

                {/* Action buttons — show when words selected */}
                <AnimatePresence>
                  {selected.size > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-2 overflow-hidden"
                    >
                      <button
                        onClick={openStoryModal}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[var(--primary)] text-white rounded-xl text-[10px] font-bold hover:opacity-90 transition-all"
                      >
                        <Sparkles className="w-3 h-3" /> Generate Story
                      </button>
                      <button
                        onClick={openPlaylistModal}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[var(--blue-soft)] text-[var(--blue)] rounded-xl text-[10px] font-bold hover:opacity-90 transition-all"
                      >
                        <ListMusic className="w-3 h-3" /> Add to Playlist
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Word list */}
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center text-xs text-[var(--muted)]">Loading…</div>
              ) : words.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--muted)]">No words with Telugu meaning found</div>
              ) : (
                words.map(w => {
                  const isSelected = selected.has(w.id);
                  return (
                    <div key={w.id} className={`flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border)] last:border-0 transition-colors ${isSelected ? 'bg-[var(--primary-soft)]' : 'hover:bg-[var(--card2)]'}`}>
                      <button onClick={() => toggleSelect(w.id)} className="shrink-0">
                        {isSelected
                          ? <CheckSquare className="w-4 h-4 text-[var(--primary)]" />
                          : <Square className="w-4 h-4 text-[var(--muted)]" />
                        }
                      </button>
                      <button className="flex-1 min-w-0 text-left" onClick={() => { setDetailWord(w); setOpen(false); }}>
                        <p className="text-sm font-bold text-[var(--text)] truncate">{w.word}</p>
                        <p className="text-[11px] text-[var(--primary)] truncate telugu">{teluguOf(w)}</p>
                      </button>
                      <button onClick={() => speak(w.word, w.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${speaking === w.id ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card2)] text-[var(--muted)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]'}`}>
                        {speaking === w.id ? <Check className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Playlist Modal ── */}
      <AnimatePresence>
        {playlistModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPlaylistModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }} transition={{ duration: 0.22 }}
              className="relative bg-[var(--card)] rounded-3xl shadow-2xl w-full max-w-sm z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--border)]">
                <div>
                  <h2 className="text-sm font-extrabold text-[var(--text)]">Add to Playlist</h2>
                  <p className="text-[10px] text-[var(--muted)]">{selected.size} word{selected.size > 1 ? 's' : ''} selected</p>
                </div>
                <button onClick={() => setPlaylistModal(false)} className="w-7 h-7 rounded-xl bg-[var(--card2)] flex items-center justify-center hover:bg-[var(--border)] transition-colors">
                  <X className="w-3.5 h-3.5 text-[var(--text2)]" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Create new playlist */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Create New Playlist</p>
                  <div className="flex gap-2">
                    <input
                      value={newPlaylistName}
                      onChange={e => setNewPlaylistName(e.target.value)}
                      placeholder="Playlist name…"
                      className="flex-1 px-3 py-2 text-sm bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-all"
                    />
                    <button
                      onClick={createAndAdd}
                      disabled={!newPlaylistName.trim() || playlistLoading}
                      className="px-3 py-2 bg-[var(--primary)] text-white rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create
                    </button>
                  </div>
                </div>

                {/* Existing playlists */}
                {playlists.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Or Add to Existing</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {playlists.map(pl => (
                        <button key={pl.id} onClick={() => addToPlaylist(pl.id)} disabled={playlistLoading}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] transition-all text-left disabled:opacity-60">
                          <ListMusic className="w-4 h-4 text-[var(--primary)] shrink-0" />
                          <span className="text-sm font-semibold text-[var(--text)]">{pl.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {playlistMsg && (
                  <p className="text-xs text-center font-semibold text-[var(--primary)]">{playlistMsg}</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Generate Story Modal ── */}
      <AnimatePresence>
        {storyModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setStoryModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }} transition={{ duration: 0.22 }}
              className="relative bg-[var(--card)] rounded-3xl shadow-2xl w-full max-w-sm z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--border)]">
                <div>
                  <h2 className="text-sm font-extrabold text-[var(--text)]">Generate Story</h2>
                  <p className="text-[10px] text-[var(--muted)]">Using {selected.size} selected word{selected.size > 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setStoryModal(false)} className="w-7 h-7 rounded-xl bg-[var(--card2)] flex items-center justify-center hover:bg-[var(--border)] transition-colors">
                  <X className="w-3.5 h-3.5 text-[var(--text2)]" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Selected words preview */}
                <div className="flex flex-wrap gap-1.5">
                  {words.filter(w => selected.has(w.id)).map(w => (
                    <span key={w.id} className="px-2.5 py-1 bg-[var(--primary-soft)] text-[var(--primary)] text-[10px] font-bold rounded-full">{w.word}</span>
                  ))}
                </div>

                {/* Genre picker */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Choose Genre</p>
                  <div className="grid grid-cols-4 gap-2">
                    {GENRES.map(g => (
                      <button key={g.id} onClick={() => setGenre(g.id)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all active:scale-95 ${
                          genre === g.id
                            ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
                            : 'border-[var(--border)] bg-[var(--card2)] hover:border-[var(--primary)]/50'
                        }`}>
                        <span className="text-lg">{g.emoji}</span>
                        <span className={`text-[9px] font-bold leading-tight text-center ${genre === g.id ? 'text-[var(--primary)]' : 'text-[var(--text2)]'}`}>{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {storyMsg && (
                  <p className="text-xs text-center font-semibold text-[var(--primary)]">{storyMsg}</p>
                )}

                <button
                  onClick={generateStory}
                  disabled={generatingStory || !genre}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--primary)] text-white rounded-2xl text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  {generatingStory ? 'Generating…' : 'Generate Story'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Word Detail Modal ── */}
      <AnimatePresence>
        {detailWord && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailWord(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }} transition={{ duration: 0.25 }}
              className="relative bg-[var(--card)] rounded-3xl shadow-2xl w-full max-w-md z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="relative h-44 bg-[var(--card2)] shrink-0">
                {detailWord.image
                  ? <img src={detailWord.image} alt={detailWord.word} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-5xl">📖</div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <button onClick={() => setDetailWord(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-all">
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-3 left-3">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--primary)] text-white">{detailWord.badge}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-extrabold text-[var(--text)]">{detailWord.word}</h2>
                  <button onClick={() => speak(detailWord.word, detailWord.id)}
                    className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center hover:opacity-90 transition-all shrink-0">
                    <Volume2 className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">Meaning</p>
                  <p className="text-sm text-[var(--text2)] leading-relaxed">{detailWord.translation || '—'}</p>
                </div>

                <div className="bg-[var(--primary-soft)] rounded-2xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] mb-1">Telugu</p>
                  <p className="text-lg font-bold text-[var(--text)] telugu">{teluguOf(detailWord)}</p>
                </div>

                {detailWord.translations && Object.keys(detailWord.translations).length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">All Translations</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(detailWord.translations).map(([lang, val]) => (
                        <div key={lang} className="bg-[var(--card2)] rounded-xl p-2.5">
                          <p className="text-[9px] font-bold uppercase text-[var(--primary)] mb-0.5">{lang}</p>
                          <p className="text-sm font-semibold text-[var(--text)] telugu">{val as string}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(detailWord.examples?.past || detailWord.examples?.present || detailWord.examples?.future) && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Example Sentences</p>
                    <div className="space-y-2">
                      {(['past', 'present', 'future'] as const).map(tense => {
                        const val = detailWord.examples?.[tense];
                        if (!val) return null;
                        return (
                          <div key={tense} className="bg-[var(--card2)] rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--primary)]">{tense}</p>
                              <button onClick={() => speak(val, `${detailWord.id}-${tense}`)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${speaking === `${detailWord.id}-${tense}` ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border)] text-[var(--muted)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]'}`}>
                                <Volume2 className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-sm text-[var(--text)] leading-relaxed">{val}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
