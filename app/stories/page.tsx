'use client';
import { memo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trash2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import StoryContent from '@/components/stories/StoryContent';
import StoryInsights from '@/components/stories/StoryInsights';
import HighlightedWords from '@/components/stories/HighlightedWords';
import KeepMomentumCard from '@/components/stories/KeepMomentumCard';
import GenerateStoryModal from '@/components/stories/GenerateStoryModal';
import ConfirmModal from '@/components/shared/ConfirmModal';
import api from '@/lib/api';

interface Story { _id: string; storyText: string; image?: string; }
interface SavedWord { word: string; meaning: string; }

const StoriesPage = memo(function StoriesPage() {
  const [stories, setStories]       = useState<Story[]>([]);
  const [loading, setLoading]       = useState(true);
  const [current, setCurrent]       = useState<Story | null>(null);
  const [storySavedWords, setStorySavedWords] = useState<SavedWord[]>([]);
  const [genModal, setGenModal]             = useState(false);

  const handleGenerated = useCallback((story: Story) => {
    setStories(prev => [story, ...prev]);
    setCurrent(story);
    setStorySavedWords([]);
  }, []);

  useEffect(() => {
    api.get('/stories').then(r => {
      setStories(r.data);
      if (r.data.length > 0) setCurrent(r.data[0]);
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = () => {
    setStories(prev => {
      const next = prev.filter(s => s._id !== current?._id);
      setCurrent(next[0] ?? null);
      return next;
    });
    setStorySavedWords([]);
  };

  const handleWordSaved = useCallback((word: string) => {
    // Fetch the word meaning to show in sidebar
    api.get('/words').then(r => {
      const found = r.data.find((w: { word: string; meaning: string }) =>
        w.word.toLowerCase() === word.toLowerCase()
      );
      if (found) {
        setStorySavedWords(prev => {
          if (prev.find(w => w.word.toLowerCase() === word.toLowerCase())) return prev;
          return [{ word: found.word, meaning: found.meaning || '' }, ...prev];
        });
      } else {
        setStorySavedWords(prev => {
          if (prev.find(w => w.word.toLowerCase() === word.toLowerCase())) return prev;
          return [{ word, meaning: '' }, ...prev];
        });
      }
    });
  }, []);

  const handleDeleteWord = useCallback((word: string) => {
    setStorySavedWords(prev => prev.filter(w => w.word.toLowerCase() !== word.toLowerCase()));
  }, []);

  const [confirmStoryId, setConfirmStoryId] = useState<string | null>(null);
  const [deletingStory, setDeletingStory]   = useState(false);
  const [confirmWord, setConfirmWord]       = useState<string | null>(null);

  const handleDeleteStory = useCallback(async () => {
    if (!confirmStoryId) return;
    setDeletingStory(true);
    try {
      await api.delete(`/stories/${confirmStoryId}`);
      setStories(prev => {
        const next = prev.filter(s => s._id !== confirmStoryId);
        if (current?._id === confirmStoryId) { setCurrent(next[0] ?? null); setStorySavedWords([]); }
        return next;
      });
    } finally { setDeletingStory(false); setConfirmStoryId(null); }
  }, [confirmStoryId, current]);

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] mb-1">Daily Momentum</p>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-2">
                The Emerald{' '}
                <span className="text-[var(--primary)] font-extrabold italic">Expedition</span>
              </h1>
              <p className="text-sm text-[var(--text2)] max-w-md">
                A personalized narrative woven with your current vocabulary goals and immersive linguistic challenges.
              </p>
            </motion.div>
              <div className="shrink-0">
                <button onClick={() => setGenModal(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-[var(--primary)] text-[var(--primary-fg)] rounded-full text-sm font-semibold shadow-lg hover:opacity-90 transition-opacity">
                  <Sparkles className="w-4 h-4" />
                  Generate New Story
                </button>
              </div>
          </div>

          {/* Story list tabs if multiple */}
          {stories.length > 1 && (
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {stories.map((s, i) => (
                <div key={s._id} className="shrink-0 flex items-center gap-1">
                  <button
                    onClick={() => setCurrent(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      current?._id === s._id
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--card)] border border-[var(--border)] text-[var(--text2)] hover:border-[var(--primary)]'
                    }`}
                  >
                    Story {i + 1}
                  </button>
                  <button
                    onClick={() => setConfirmStoryId(s._id)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 text-[var(--muted)] text-sm">Loading stories…</div>
          ) : !current ? (
            <div className="text-center py-20 text-[var(--muted)] text-sm">No stories yet. Generate your first one!</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-2 space-y-5">
                <StoryContent
                  key={current._id}
                  storyId={current._id}
                  initialText={current.storyText}
                  initialImage={current.image || ''}
                  onDelete={handleDelete}
                  onWordSaved={handleWordSaved}
                />
                <StoryInsights />
              </motion.div>
              <div className="space-y-5">
                <HighlightedWords savedWords={storySavedWords} onDelete={setConfirmWord} />
                <KeepMomentumCard />
              </div>
            </div>
          )}
        </div>

        <footer className="border-t border-[var(--border)] mt-8 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {['🧑', '👩', '👨'].map((e, i) => (
                <span key={i} className="w-6 h-6 rounded-full bg-[var(--card2)] border border-[var(--border)] flex items-center justify-center text-xs">{e}</span>
              ))}
            </div>
            <span>Joined by 14,000+ polyglots this week</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:text-[var(--text)] transition-colors">Privacy Policy</button>
            <button className="hover:text-[var(--text)] transition-colors">Terms of Service</button>
            <button className="hover:text-[var(--text)] transition-colors">Help Center</button>
          </div>
        </footer>
        <GenerateStoryModal open={genModal} onClose={() => setGenModal(false)} onGenerated={handleGenerated} />
        <ConfirmModal
          open={!!confirmStoryId}
          title="Delete this story?"
          message="This story will be permanently deleted and cannot be recovered."
          onConfirm={handleDeleteStory}
          onCancel={() => setConfirmStoryId(null)}
          loading={deletingStory}
        />
        <ConfirmModal
          open={!!confirmWord}
          title="Remove this word?"
          message={`"${confirmWord}" will be removed from your story words list.`}
          onConfirm={() => { handleDeleteWord(confirmWord!); setConfirmWord(null); }}
          onCancel={() => setConfirmWord(null)}
        />
      </div>
    </AppLayout>
  );
});

export default StoriesPage;
