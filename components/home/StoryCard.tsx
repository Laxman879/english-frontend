'use client';
import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';

interface StoryCardProps {
  imageUrl?: string;
  category?: string;
  title?: string;
  excerpt?: string;
  readingTime?: number;
  wordsCount?: number;
  progress?: number;
  empty?: boolean;
  onRead?: () => void;
}

const StoryCard = memo(function StoryCard({
  imageUrl = 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80',
  category = 'Daily Story',
  title,
  excerpt,
  readingTime,
  wordsCount,
  progress = 0,
  empty = false,
  onRead,
}: StoryCardProps) {
  if (empty) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
        className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 flex flex-col items-center text-center cursor-pointer hover:border-[var(--primary)] transition-all"
        onClick={onRead}
      >
        <div className="w-12 h-12 rounded-2xl bg-[var(--primary-soft)] flex items-center justify-center mb-3">
          <BookOpen className="w-5 h-5 text-[var(--primary)]" />
        </div>
        <p className="text-sm font-bold text-[var(--text)] mb-1">No stories yet</p>
        <p className="text-xs text-[var(--muted)] mb-3">Generate your first AI story from saved words</p>
        <span className="flex items-center gap-1 text-xs font-bold text-[var(--primary)]">
          Go to Stories <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden group cursor-pointer active:scale-[0.99] transition-transform"
      onClick={onRead}
    >
      {/* Image with overlay */}
      <div className="h-36 sm:h-40 overflow-hidden relative">
        <img
          src={imageUrl}
          alt={title || 'Story'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 bg-[var(--primary)] text-[var(--primary-fg)] text-[10px] font-bold uppercase tracking-wider rounded-full">
            {category}
          </span>
          <div className="flex items-center gap-1 text-white/80 text-[10px] font-medium">
            <Clock className="w-3 h-3" />
            {readingTime} min
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h4 className="text-sm font-bold text-[var(--text)] mb-1.5 group-hover:text-[var(--primary)] transition-colors">
          {title}
        </h4>
        <p className="text-xs text-[var(--text2)] leading-relaxed mb-3 line-clamp-2">{excerpt}</p>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
            <BookOpen className="w-3 h-3" />
            {wordsCount} vocab words
          </div>
          <span className="flex items-center gap-1 text-xs font-bold text-[var(--primary)] group-hover:gap-2 transition-all duration-200">
            Read <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Progress bar */}
        {progress > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-[var(--muted)] mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default StoryCard;
