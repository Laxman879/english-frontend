'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle, ChevronDown, CheckSquare, Square, Search } from 'lucide-react';
import api from '@/lib/api';

const GENRES = [
  { id: 'adventure',   label: 'Adventure',   emoji: '🏔️' },
  { id: 'romance',     label: 'Romance',      emoji: '💕' },
  { id: 'mystery',     label: 'Mystery',      emoji: '🔍' },
  { id: 'fantasy',     label: 'Fantasy',      emoji: '🧙' },
  { id: 'sci-fi',      label: 'Sci-Fi',       emoji: '🚀' },
  { id: 'horror',      label: 'Horror',       emoji: '👻' },
  { id: 'comedy',      label: 'Comedy',       emoji: '😂' },
  { id: 'drama',       label: 'Drama',        emoji: '🎭' },
  { id: 'thriller',    label: 'Thriller',     emoji: '😰' },
  { id: 'nature',      label: 'Nature',       emoji: '🌿' },
  { id: 'friendship',  label: 'Friendship',   emoji: '🤝' },
  { id: 'daily life',  label: 'Daily Life',   emoji: '☀️' },
];

interface Word { id: string; word: string; }
interface Story { _id: string; storyText: string; image?: string; }

interface Props {
  open: boolean;
  onClose: () => void;
  onGenerated: (story: Story) => void;
}

export default function GenerateStoryModal({ open, onClose, onGenerated }: Props) {
  const [words, setWords]                   = useState<Word[]>([]);
  const [selectedWords, setSelectedWords]   = useState<Set<string>>(new Set());
  const [selectedGenre, setSelectedGenre]   = useState('');
  const [generating, setGenerating]         = useState(false);
  const [error, setError]                   = useState('');
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const [search, setSearch]                 = useState('');
  const dropdownRef                         = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      api.get('/words').then(r => setWords(r.data.map((w: Record<string, string>) => ({ id: w._id, word: w.word }))));
      setSelectedWords(new Set());
      setSelectedGenre('');
      setError('');
      setSearch('');
      setDropdownOpen(false);
    }
  }, [open]);

  const filtered = words.filter(w => w.word.toLowerCase().includes(search.toLowerCase()));

  const toggleWord = useCallback((id: string) => {
    setSelectedWords(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedWords(prev =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map(w => w.id))
    );
  }, [filtered]);

  const handleGenerate = async () => {
    if (selectedWords.size === 0) { setError('Select at least one word.'); return; }
    if (!selectedGenre) { setError('Pick a genre.'); return; }
    setError('');
    setGenerating(true);
    try {
      const selectedWordNames = words.filter(w => selectedWords.has(w.id)).map(w => w.word);
      const { data } = await api.post('/stories/generate', { words: selectedWordNames, genre: selectedGenre });
      onGenerated(data);
      onClose();
    } catch {
      setError('Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const selectedLabels = words.filter(w => selectedWords.has(w.id)).map(w => w.word);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 16 }}
            transition={{ duration: 0.25 }}
            className="relative bg-[var(--card)] rounded-3xl shadow-2xl w-full max-w-lg z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--border)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-[var(--text)]">Generate Story</h2>
                  <p className="text-[10px] text-[var(--muted)]">Pick a genre and words</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[var(--card2)] flex items-center justify-center hover:bg-[var(--border)] transition-all text-[var(--text2)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Genre picker */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-3">Choose Genre</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {GENRES.map(g => (
                    <button key={g.id} onClick={() => setSelectedGenre(g.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all active:scale-95 ${
                        selectedGenre === g.id
                          ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
                          : 'border-[var(--border)] bg-[var(--card2)] hover:border-[var(--primary)]/50'
                      }`}>
                      <span className="text-xl">{g.emoji}</span>
                      <span className={`text-[10px] font-bold ${selectedGenre === g.id ? 'text-[var(--primary)]' : 'text-[var(--text2)]'}`}>
                        {g.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Word selector dropdown */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Select Words</p>
                  {selectedWords.size > 0 && (
                    <span className="text-[10px] font-bold text-[var(--primary)] bg-[var(--primary-soft)] px-2 py-0.5 rounded-full">
                      {selectedWords.size} selected
                    </span>
                  )}
                </div>

                <div ref={dropdownRef} className="relative">
                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(v => !v)}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border-2 transition-all ${
                      dropdownOpen
                        ? 'border-[var(--primary)] bg-[var(--input-bg)]'
                        : 'border-[var(--border)] bg-[var(--card2)] hover:border-[var(--primary)]/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0 text-left">
                      {selectedWords.size === 0 ? (
                        <span className="text-sm text-[var(--muted)]">Choose words for your story…</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedLabels.slice(0, 4).map(w => (
                            <span key={w} className="px-2 py-0.5 bg-[var(--primary)] text-white text-[10px] font-bold rounded-full">{w}</span>
                          ))}
                          {selectedLabels.length > 4 && (
                            <span className="px-2 py-0.5 bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] text-[10px] font-bold rounded-full">+{selectedLabels.length - 4} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[var(--muted)] shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown panel */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-0 right-0 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-md)] z-50 overflow-hidden"
                      >
                        {/* Search */}
                        <div className="px-3 pt-3 pb-2">
                          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--card2)] rounded-xl border border-[var(--border)]">
                            <Search className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                            <input
                              autoFocus
                              type="text"
                              value={search}
                              onChange={e => setSearch(e.target.value)}
                              placeholder="Search words…"
                              className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none"
                            />
                            {search && (
                              <button onClick={() => setSearch('')} className="text-[var(--muted)] hover:text-[var(--text)]">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Select all */}
                        {filtered.length > 0 && (
                          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--card2)]">
                            <button onClick={toggleAll} className="flex items-center gap-2 text-xs font-semibold text-[var(--text2)] hover:text-[var(--primary)] transition-colors">
                              {selectedWords.size === filtered.length && filtered.length > 0
                                ? <CheckSquare className="w-4 h-4 text-[var(--primary)]" />
                                : <Square className="w-4 h-4" />
                              }
                              {selectedWords.size === filtered.length && filtered.length > 0 ? 'Deselect All' : 'Select All'}
                            </button>
                            <span className="text-[10px] text-[var(--muted)]">{filtered.length} words</span>
                          </div>
                        )}

                        {/* Word list */}
                        <div className="max-h-48 overflow-y-auto">
                          {words.length === 0 ? (
                            <p className="text-xs text-[var(--muted)] text-center py-6">No saved words yet.</p>
                          ) : filtered.length === 0 ? (
                            <p className="text-xs text-[var(--muted)] text-center py-6">No words match your search.</p>
                          ) : (
                            filtered.map(w => {
                              const sel = selectedWords.has(w.id);
                              return (
                                <button
                                  key={w.id}
                                  type="button"
                                  onClick={() => toggleWord(w.id)}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border)] last:border-0 transition-colors text-left ${
                                    sel ? 'bg-[var(--primary-soft)]' : 'hover:bg-[var(--card2)]'
                                  }`}
                                >
                                  {sel
                                    ? <CheckSquare className="w-4 h-4 text-[var(--primary)] shrink-0" />
                                    : <Square className="w-4 h-4 text-[var(--muted)] shrink-0" />
                                  }
                                  <span className={`text-sm font-semibold ${sel ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>
                                    {w.word}
                                  </span>
                                  {sel && <CheckCircle className="w-3.5 h-3.5 text-[var(--primary)] ml-auto shrink-0" />}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--border)] shrink-0 flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text2)] hover:bg-[var(--card2)] transition-all">
                Cancel
              </button>
              <button onClick={handleGenerate} disabled={generating}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-all">
                <Sparkles className="w-4 h-4" />
                {generating ? 'Generating…' : 'Generate'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
