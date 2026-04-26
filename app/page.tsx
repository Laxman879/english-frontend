'use client';
import { memo, useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import SearchBar from '@/components/home/SearchBar';
import WordOfTheDay from '@/components/home/WordOfTheDay';
import ContextSentences from '@/components/home/ContextSentences';
import MomentumCard from '@/components/home/MomentumCard';
import SynonymsCard from '@/components/home/SynonymsCard';
import { Flame, BookOpen, Star, ChevronRight, BookMarked, ListMusic, Volume2, Clock, ArrowRight, Globe, Lightbulb } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface FeaturedWord {
  _id: string; word: string; meaning: string; image?: string;
  translations?: Record<string, string>;
  examples?: { past?: string; present?: string; future?: string };
  totalSaved?: number;
}
interface Story  { _id: string; storyText: string; image?: string; }
interface WordCard { _id: string; word: string; meaning?: string; image?: string; translations?: Record<string,string>; }
interface Playlist { _id: string; name: string; image?: string; items?: unknown[]; }
interface StreakData { streakCount: number; streakDates: string[]; }

const Home = memo(function Home() {
  const { user } = useAuth();
  const router   = useRouter();

  const [featuredWord, setFeaturedWord] = useState<FeaturedWord | null>(null);
  const [savedWords, setSavedWords]     = useState<WordCard[]>([]);
  const [stories, setStories]           = useState<Story[]>([]);
  const [playlists, setPlaylists]       = useState<Playlist[]>([]);
  const [streakData, setStreakData]     = useState<StreakData>({ streakCount: 0, streakDates: [] });
  const [loadingWord, setLoadingWord]   = useState(true);

  useEffect(() => {
    api.get('/words/featured')
      .then(r => setFeaturedWord({ ...r.data.word, totalSaved: r.data.totalSaved }))
      .catch(() => setFeaturedWord(null))
      .finally(() => setLoadingWord(false));
    api.get('/words').then(r => setSavedWords(r.data.slice(0, 6))).catch(() => {});
    api.get('/stories').then(r => setStories(r.data.slice(0, 4))).catch(() => {});
    api.get('/playlists').then(r => setPlaylists(r.data.slice(0, 4))).catch(() => {});
    api.get('/auth/streak-history').then(r => setStreakData(r.data)).catch(() => {});
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const dateStr = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    []
  );

  const firstName = user?.name?.split(' ')[0] || 'Learner';

  const quickStats = [
    { icon: Flame,    label: 'Day Streak',  value: String(streakData.streakCount), sub: streakData.streakCount > 0 ? 'Keep it up!' : 'Start today', color: 'text-[var(--fire)]',    bg: 'bg-[var(--fire-soft)]',    onClick: () => router.push('/streak') },
    { icon: BookOpen, label: 'Words Saved', value: String(savedWords.length),      sub: savedWords.length > 0 ? `${savedWords.length} total` : 'Add words', color: 'text-[var(--blue)]', bg: 'bg-[var(--blue-soft)]', onClick: () => router.push('/saved') },
    { icon: Star,     label: 'Word of Day', value: featuredWord?.word ? featuredWord.word.slice(0, 6) + (featuredWord.word.length > 6 ? '…' : '') : '—', sub: featuredWord ? "Today's pick" : 'No word yet', color: 'text-[var(--primary)]', bg: 'bg-[var(--primary-soft)]', onClick: () => {} },
  ];

  const sentences = featuredWord?.examples
    ? [
        featuredWord.examples.past    ? { label: 'Past',    text: featuredWord.examples.past.replace(new RegExp(featuredWord.word, 'gi'), '{word}'),    word: featuredWord.word.toLowerCase() } : null,
        featuredWord.examples.present ? { label: 'Present', text: featuredWord.examples.present.replace(new RegExp(featuredWord.word, 'gi'), '{word}'), word: featuredWord.word.toLowerCase() } : null,
        featuredWord.examples.future  ? { label: 'Future',  text: featuredWord.examples.future.replace(new RegExp(featuredWord.word, 'gi'), '{word}'),  word: featuredWord.word.toLowerCase() } : null,
      ].filter(Boolean) as { label: string; text: string; word: string }[]
    : [];

  const translations = featuredWord?.translations
    ? Object.entries(featuredWord.translations).map(([lang, native]) => ({ label: lang.charAt(0).toUpperCase() + lang.slice(1), native: native as string, romanized: '' }))
    : [];

  const storyExcerpt = (s: Story) => s.storyText.slice(0, 90) + '...';

  return (
    <AppLayout>
      <div className="min-h-screen bg-[var(--bg)]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">

          {/* Header */}
          <div className="flex flex-col gap-3 mb-5 sm:mb-8">
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <p className="text-xs font-semibold text-[var(--muted)] mb-1 uppercase tracking-wider">{dateStr}</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text)] leading-tight">
                {greeting}, {firstName}!
              </h1>
              <p className="text-sm text-[var(--text2)] mt-1">
                {streakData.streakCount > 0 ? `You're on a ${streakData.streakCount}-day streak — keep it alive!` : 'Start your learning streak today!'}
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="w-full">
              <SearchBar />
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
            className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-8">
            {quickStats.map(({ icon: Icon, label, value, sub, color, bg, onClick }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}
                onClick={onClick}
                className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl px-3 sm:px-4 py-3 sm:py-3.5 hover:border-[var(--primary)] hover:shadow-[var(--shadow)] transition-all duration-200 cursor-pointer group">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="min-w-0 text-center sm:text-left">
                  <p className="text-base sm:text-lg font-extrabold text-[var(--text)] leading-none">{value}</p>
                  <p className="text-[9px] sm:text-[10px] text-[var(--muted)] mt-0.5 truncate">{label}</p>
                  <p className={`text-[9px] sm:text-[10px] font-semibold mt-0.5 ${color}`}>{sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            <div className="lg:col-span-2 space-y-4 sm:space-y-5">
              {/* Word of the Day */}
              {loadingWord ? (
                <><div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] h-72 skeleton" /><div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] h-48 skeleton" /></>
              ) : featuredWord ? (
                <>
                  <WordOfTheDay word={featuredWord.word} definition={featuredWord.meaning} translations={translations} wordNumber={featuredWord.totalSaved} />
                  {sentences.length > 0 && <ContextSentences sentences={sentences} />}
                </>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-[var(--primary)] via-[var(--blue)] to-[var(--fire)]" />
                  <div className="p-8 sm:p-12 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--primary-soft)] flex items-center justify-center mb-4"><BookOpen className="w-7 h-7 text-[var(--primary)]" /></div>
                    <h3 className="text-lg font-extrabold text-[var(--text)] mb-2">No Word of the Day yet</h3>
                    <p className="text-sm text-[var(--muted)] mb-5 max-w-xs">Save your first word to see it featured here.</p>
                    <button onClick={() => router.push('/saved')} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-[var(--primary-fg)] rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                      <Star className="w-4 h-4" /> Save Your First Word
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Saved Words Section */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--blue-soft)] flex items-center justify-center"><BookMarked className="w-3.5 h-3.5 text-[var(--blue)]" /></div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text)]">Saved Words</h3>
                      <p className="text-[10px] text-[var(--muted)]">{savedWords.length} words in your vault</p>
                    </div>
                  </div>
                  <button onClick={() => router.push('/saved')} className="flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:gap-2 transition-all">
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {savedWords.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-[var(--muted)] mb-3">No words saved yet</p>
                    <button onClick={() => router.push('/saved')} className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-fg)] rounded-xl text-xs font-bold hover:opacity-90 transition-opacity">Add Words</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
                    {savedWords.map((w, i) => {
                      const telugu = w.translations?.['telugu'] || w.translations?.['Telugu'] || Object.values(w.translations || {})[0] || '';
                      return (
                        <motion.div key={w._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          onClick={() => router.push('/saved')}
                          className="bg-[var(--card2)] rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-all cursor-pointer group">
                          <div className="h-20 bg-[var(--border)] overflow-hidden relative">
                            {w.image
                              ? <img src={w.image} alt={w.word} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              : <div className="w-full h-full bg-[var(--primary-soft)] flex items-center justify-center"><BookOpen className="w-6 h-6 text-[var(--primary)]" /></div>
                            }
                          </div>
                          <div className="p-2.5">
                            <p className="text-sm font-extrabold text-[var(--text)] truncate">{w.word}</p>
                            {telugu && <p className="text-[10px] text-[var(--primary)] truncate font-medium">{telugu}</p>}
                            <p className="text-[10px] text-[var(--muted)] truncate mt-0.5">{w.meaning || '—'}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Stories Section */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--primary-soft)] flex items-center justify-center"><BookOpen className="w-3.5 h-3.5 text-[var(--primary)]" /></div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text)]">AI Stories</h3>
                      <p className="text-[10px] text-[var(--muted)]">{stories.length} stories generated</p>
                    </div>
                  </div>
                  <button onClick={() => router.push('/stories')} className="flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:gap-2 transition-all">
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {stories.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-[var(--muted)] mb-3">No stories yet</p>
                    <button onClick={() => router.push('/stories')} className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-fg)] rounded-xl text-xs font-bold hover:opacity-90 transition-opacity">Generate Story</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                    {stories.map((s, i) => (
                      <motion.div key={s._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        onClick={() => router.push('/stories')}
                        className="bg-[var(--card2)] rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-all cursor-pointer group">
                        <div className="h-28 overflow-hidden relative">
                          {s.image
                            ? <img src={s.image} alt="story" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            : <div className="w-full h-full bg-gradient-to-br from-[var(--primary-soft)] to-[var(--blue-soft)] flex items-center justify-center"><BookOpen className="w-8 h-8 text-[var(--primary)]" /></div>
                          }
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-[var(--primary)] text-white text-[9px] font-bold rounded-full">AI Story</span>
                          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white/80 text-[9px]">
                            <Clock className="w-2.5 h-2.5" /> {Math.ceil(s.storyText.split(' ').length / 200)} min
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-bold text-[var(--text)] mb-1 line-clamp-1">{s.storyText.split('.')[0].slice(0, 50)}…</p>
                          <p className="text-[10px] text-[var(--text2)] line-clamp-2 leading-relaxed">{storyExcerpt(s)}</p>
                          <span className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[var(--primary)]">Read <ArrowRight className="w-3 h-3" /></span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right column */}
            <div className="space-y-4 sm:space-y-5">
              <MomentumCard streak={streakData.streakCount} wordsLearned={savedWords.length} streakDates={streakData.streakDates} />

              {/* Playlists Section */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[var(--fire-soft)] flex items-center justify-center"><ListMusic className="w-3 h-3 text-[var(--fire)]" /></div>
                    <p className="text-xs font-bold text-[var(--text)]">Playlists</p>
                  </div>
                  <button onClick={() => router.push('/playlists')} className="text-[10px] font-bold text-[var(--primary)] hover:underline">View all</button>
                </div>
                {playlists.length === 0 ? (
                  <div className="p-5 text-center">
                    <p className="text-xs text-[var(--muted)] mb-2">No playlists yet</p>
                    <button onClick={() => router.push('/playlists')} className="px-3 py-1.5 bg-[var(--primary)] text-[var(--primary-fg)] rounded-lg text-[10px] font-bold hover:opacity-90">Create Playlist</button>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {playlists.map((pl, i) => (
                      <motion.div key={pl._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                        onClick={() => router.push('/playlists')}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--card2)] transition-colors cursor-pointer group border border-transparent hover:border-[var(--border)]">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[var(--card2)] shrink-0">
                          {pl.image
                            ? <img src={pl.image} alt={pl.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><ListMusic className="w-5 h-5 text-[var(--fire)]" /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[var(--text)] truncate group-hover:text-[var(--primary)] transition-colors">{pl.name}</p>
                          <p className="text-[10px] text-[var(--muted)]">{Array.isArray(pl.items) ? pl.items.length : 0} words</p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); } router.push('/playlists'); }}
                          className="w-7 h-7 rounded-full bg-[var(--primary-soft)] flex items-center justify-center hover:bg-[var(--primary)] hover:text-white transition-all text-[var(--primary)] shrink-0">
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {featuredWord
                ? <SynonymsCard wordId={featuredWord._id} />
                : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary-soft)] flex items-center justify-center mb-3"><Flame className="w-5 h-5 text-[var(--primary)]" /></div>
                    <p className="text-sm font-bold text-[var(--text)] mb-1">Related Words</p>
                    <p className="text-xs text-[var(--muted)]">Save a word to see synonyms & antonyms</p>
                  </motion.div>
                )
              }

              {/* Daily Tip */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="bg-[var(--primary-soft)] border border-[var(--primary)]/20 rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] mb-1 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Daily Tip
                </p>
                <p className="text-xs text-[var(--text2)] leading-relaxed">
                  Try using today&apos;s word in a sentence when talking to someone. Active use boosts retention by 40%.
                </p>
                <button onClick={() => router.push('/streak')} className="mt-2 flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:gap-2 transition-all duration-200">
                  View streak <ChevronRight className="w-3 h-3" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
});

export default Home;
