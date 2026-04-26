'use client';
import { memo } from 'react';
import { motion } from 'framer-motion';

interface StoryInsightsProps {
  difficulty?: string;
  difficultyLabel?: string;
  wordCount?: number;
  readingTime?: number;
}

const StoryInsights = memo(function StoryInsights({
  difficulty = 'B2',
  difficultyLabel = 'UPPER INT.',
  wordCount = 412,
  readingTime = 4,
}: StoryInsightsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 sm:p-5 space-y-3 sm:space-y-4"
    >
      <h3 className="text-sm font-bold text-[var(--text)]">Story Insights</h3>

      {/* Difficulty */}
      <div className="flex items-center justify-between bg-[var(--card2)] rounded-xl px-3 sm:px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary-soft)] flex items-center justify-center shrink-0">
            <span className="text-xs">📚</span>
          </div>
          <span className="text-sm font-medium text-[var(--text)]">Difficulty</span>
        </div>
        <div className="bg-[var(--primary)] rounded-lg px-2.5 py-1 text-center shrink-0">
          <p className="text-[9px] font-bold text-[var(--primary-fg)] leading-tight">{difficulty}</p>
          <p className="text-[9px] font-bold text-[var(--primary-fg)] leading-tight uppercase">{difficultyLabel}</p>
        </div>
      </div>

      {/* Word Count */}
      <div className="flex items-center justify-between bg-[var(--card2)] rounded-xl px-3 sm:px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--blue-soft)] flex items-center justify-center shrink-0">
            <span className="text-xs">💬</span>
          </div>
          <span className="text-sm font-medium text-[var(--text)]">Word Count</span>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold text-[var(--text)] leading-none">{wordCount}</p>
          <p className="text-[10px] text-[var(--muted)]">words</p>
        </div>
      </div>

      {/* Reading Time */}
      <div className="flex items-center justify-between bg-[var(--card2)] rounded-xl px-3 sm:px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--fire-soft)] flex items-center justify-center shrink-0">
            <span className="text-xs">⏱️</span>
          </div>
          <span className="text-sm font-medium text-[var(--text)]">Reading Time</span>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold text-[var(--text)] leading-none">{readingTime}</p>
          <p className="text-[10px] text-[var(--muted)]">min</p>
        </div>
      </div>
    </motion.div>
  );
});

export default StoryInsights;
