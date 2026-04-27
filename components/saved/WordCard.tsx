'use client';
import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Camera } from 'lucide-react';
import ImageUploader from '@/components/shared/ImageUploader';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { useWords } from '@/lib/WordsContext';

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

const WordCard = memo(function WordCard({ word, index, onDelete, onUpdate, onClick, dimmed }: WordCardProps) {
  const { updateWord, deleteWord } = useWords();
  const [editingImg, setEditingImg] = useState(false);
  const badgeClass = badgeColors[word.badge] ?? 'bg-[var(--card2)] text-[var(--text2)]';

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(word.id);
  };

  const doDelete = async () => {
    await import('@/lib/api').then(m => m.default.delete(`/words/${word.id}`));
    deleteWord(word.id);
    onDelete?.(word.id);
    setConfirmDeleteId(null);
  };

  const handleSaveImage = async (url: string) => {
    await import('@/lib/api').then(m => m.default.put(`/words/${word.id}`, { image: url }));
    const updated = { ...word, image: url };
    updateWord(updated);
    onUpdate?.(updated);
    setEditingImg(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      onClick={onClick}
      className={`relative bg-[var(--card)] rounded-2xl border border-[var(--border)] flex flex-col overflow-hidden cursor-pointer hover:border-[var(--primary)] hover:shadow-[var(--shadow)] transition-all duration-200 group ${dimmed ? 'opacity-40' : ''}`}
    >
      {/* Image */}
      <div className="relative h-28 bg-[var(--card2)] shrink-0">
        {word.image
          ? <img src={word.image} alt={word.word} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-3xl select-none">📖</div>
        }
        {/* Hover buttons on image */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
          <button
            onClick={e => { e.stopPropagation(); setEditingImg(v => !v); }}
            className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-all"
          >
            <Camera className="w-3.5 h-3.5 text-white" />
          </button>
          <button
            onClick={handleDelete}
            className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-red-500 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {editingImg && (
        <div onClick={e => e.stopPropagation()}>
          <ImageUploader onSave={handleSaveImage} onCancel={() => setEditingImg(false)} />
        </div>
      )}

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

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Delete this word?"
        message={`"${word.word}" will be permanently removed from your vocabulary vault.`}
        onConfirm={doDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </motion.div>
  );
});

export default WordCard;
