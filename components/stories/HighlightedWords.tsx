'use client';
import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkCheck, Volume2, Trash2 } from 'lucide-react';

interface SavedWord { word: string; meaning: string; }

interface Props { savedWords?: SavedWord[]; onDelete?: (word: string) => void; }

const HighlightedWords = memo(function HighlightedWords({ savedWords = [], onDelete }: Props) {
  const [spoken, setSpoken] = useState<string | null>(null);

  const speak = (word: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US'; u.rate = 0.85;
    setSpoken(word);
    u.onend = () => setSpoken(null);
    window.speechSynthesis.speak(u);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 sm:p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--text)]">Words Saved from Story</h3>
        {savedWords.length > 0 && (
          <span className="text-[9px] font-bold uppercase tracking-wider bg-[var(--primary)] text-white px-2 py-0.5 rounded-full">
            {savedWords.length} saved
          </span>
        )}
      </div>

      {savedWords.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-2xl mb-2">📖</p>
          <p className="text-xs text-[var(--muted)]">Tap any word in the story to save it here</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {savedWords.map(w => (
              <motion.div
                key={w.word}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="bg-[var(--card2)] rounded-xl p-3 flex items-start gap-3"
              >
                <BookmarkCheck className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text)] capitalize">{w.word}</p>
                  {w.meaning && <p className="text-xs text-[var(--text2)] leading-snug mt-0.5 line-clamp-2">{w.meaning}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => speak(w.word)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      spoken === w.word ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border)] text-[var(--muted)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(w.word)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all bg-[var(--border)] text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
});

export default HighlightedWords;
