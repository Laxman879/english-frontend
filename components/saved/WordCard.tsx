'use client';
import { memo } from 'react';
import { motion } from 'framer-motion';

export interface Word {
  id: string;
  badge: string;
  word: string;
  translation: string;
  pronunciation: string;
  image?: string;
  examples?: { past?: string; present?: string; future?: string };
  translations?: Record<string, string>;
}

interface WordCardProps {
  word: Word;
  index: number;
  onDelete?: (id: string) => void;
  onUpdate?: (updated: Word) => void;
  onClick?: () => void;
  dimmed?: boolean;
}

const badgeColors: Record<string, string> = {
  'LEVEL B2': 'bg-[var(--fire-soft)] text-[var(--fire)]',
  'COMMON':   'bg-[var(--blue-soft)] text-[var(--blue)]',
  'LEVEL C1': 'bg-[var(--fire-soft)] text-[var(--fire)]',
  'VERB':     'bg-[var(--primary-soft)] text-[var(--primary)]',
  'IDIOM':    'bg-[var(--blue-soft)] text-[var(--blue)]',
  'PHRASE':   'bg-[var(--primary-soft)] text-[var(--primary)]',
};

const WordCard = memo(function WordCard({ word, index, onClick, dimmed }: WordCardProps) {
  const badgeClass = badgeColors[word.badge] ?? 'bg-[var(--card2)] text-[var(--text2)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      onClick={onClick}
      className={`bg-[var(--card)] rounded-2xl border border-[var(--border)] flex flex-col overflow-hidden cursor-pointer hover:border-[var(--primary)] hover:shadow-[var(--shadow)] transition-all duration-200 ${dimmed ? 'opacity-40' : ''}`}
    >
      {/* Image */}
      <div className="h-28 bg-[var(--card2)] shrink-0">
        {word.image
          ? <img src={word.image} alt={word.word} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-3xl select-none">📖</div>
        }
      </div>

      <div className="p-4 flex flex-col gap-2">
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full self-start ${badgeClass}`}>
          {word.badge}
        </span>
        <h3 className="text-base font-extrabold text-[var(--text)] leading-tight">{word.word}</h3>
        <p className="text-xs text-[var(--text2)] line-clamp-2">{word.translation}</p>
        {word.examples?.present && (
          <p className="text-[10px] text-[var(--muted)] italic line-clamp-1 mt-1">"{word.examples.present}"</p>
        )}
      </div>
    </motion.div>
  );
});

export default WordCard;
