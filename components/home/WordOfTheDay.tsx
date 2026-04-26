'use client';
import { memo, useMemo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, Volume2, Sparkles, ChevronRight, RefreshCw } from 'lucide-react';

interface Translation { label: string; native: string; romanized: string; }
interface WordOfTheDayProps {
  word?: string;
  definition?: string;
  translations?: Translation[];
  wordNumber?: number;
  onSave?: () => void;
  onSpeak?: () => void;
}

const WordOfTheDay = memo(function WordOfTheDay({
  word = '', definition = '', translations = [], wordNumber, onSave, onSpeak,
}: WordOfTheDayProps) {
  const [saved, setSaved]       = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleSave = useCallback(() => { setSaved(v => !v); onSave?.(); }, [onSave]);

  const handleSpeak = useCallback(() => {
    if (onSpeak) { onSpeak(); return; }
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US'; u.rate = 0.85;
    setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [word, onSpeak]);

  const translationCards = useMemo(
    () => translations.map((t) => (
      <div key={t.label} className="bg-[var(--card2)] rounded-xl p-3 sm:p-4 text-center border border-transparent hover:border-[var(--primary)] transition-all duration-200 cursor-pointer group">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] mb-1.5 block">{t.label}</span>
        <p className="text-lg sm:text-xl font-bold text-[var(--text)] leading-tight">{t.native}</p>
        <p className="text-xs text-[var(--muted)] mt-1 font-mono">{t.romanized}</p>
      </div>
    )),
    [translations]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden"
    >
      {/* Coloured top strip */}
      <div className="h-1.5 bg-gradient-to-r from-[var(--primary)] via-[var(--blue)] to-[var(--fire)]" />

      <div className="p-4 sm:p-6 md:p-8">
        {/* Top row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--primary)] text-[var(--primary-fg)] text-[10px] font-bold uppercase tracking-wider rounded-full">
              <Sparkles className="w-3 h-3" /> Word of the Day
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-xl bg-[var(--card2)] flex items-center justify-center hover:bg-[var(--border)] transition-colors" title="New word">
              <RefreshCw className="w-3.5 h-3.5 text-[var(--text2)]" />
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                saved ? 'bg-[var(--primary-soft)] text-[var(--primary)]' : 'bg-[var(--card2)] text-[var(--text2)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]'
              }`}
            >
              {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Word */}
        <div className="mb-4">
          <div className="flex items-end gap-2 sm:gap-3 mb-2 flex-wrap">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[var(--text)] tracking-tight leading-none">{word}</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <motion.button
              onClick={handleSpeak}
              animate={speaking ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: speaking ? Infinity : 0, duration: 0.5 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                speaking ? 'bg-[var(--blue)] shadow-lg' : 'bg-[var(--blue-soft)] hover:bg-[var(--blue)]'
              }`}
            >
              <Volume2 className={`w-3.5 h-3.5 ${speaking ? 'text-white' : 'text-[var(--blue)]'}`} />
            </motion.button>
            {speaking && <span className="text-xs text-[var(--blue)] font-semibold animate-pulse">Playing…</span>}
          </div>
        </div>

        {/* Definition */}
        <div className="bg-[var(--card2)] rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border-l-4 border-[var(--primary)]">
          <p className="text-sm text-[var(--text)] leading-relaxed">{definition}</p>
        </div>

        {/* Translations */}
        <div className="mb-4 sm:mb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Translations</p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">{translationCards}</div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-[var(--border)]">
          <button className="flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:gap-2 transition-all duration-200">
            Full word details <ChevronRight className="w-3.5 h-3.5" />
          </button>
          {wordNumber !== undefined && (
            <span className="text-[10px] text-[var(--muted)]">Word #{wordNumber} of your journey</span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default WordOfTheDay;
