'use client';
import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Target, Zap } from 'lucide-react';

interface MomentumCardProps {
  streak?: number;
  wordsLearned?: number;
  retentionRate?: number;
  weeklyGoal?: number;
  weeklyDone?: number;
  progressBars?: number[];
  streakDates?: string[];
  onViewStats?: () => void;
}

const MomentumCard = memo(function MomentumCard({
  streak = 0,
  wordsLearned = 0,
  retentionRate = 0,
  weeklyGoal = 20,
  weeklyDone,
  progressBars,
  streakDates = [],
  onViewStats,
}: MomentumCardProps) {
  // Build last 7 days progress from streakDates
  const bars = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    const vals = progressBars || days.map(d => streakDates.includes(d) ? 100 : 0);
    return vals.map((val, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-1">
        <div className="w-full h-10 sm:h-12 bg-white/10 rounded-lg overflow-hidden flex items-end">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${val}%` }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
            className="w-full bg-white/60 rounded-lg"
          />
        </div>
        <span className="text-[8px] text-white/50">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
      </div>
    ));
  }, [progressBars, streakDates]);

  const done = weeklyDone ?? Math.min(wordsLearned, weeklyGoal);
  const weekPct = Math.round((done / weeklyGoal) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--primary)] via-[var(--primary-dk)] to-emerald-700 p-4 sm:p-5"
    >
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-0.5">Your Momentum</p>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-300" />
              <span className="text-white font-bold text-sm">{streak} day streak!</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
        </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Words</p>
            <p className="text-xl font-extrabold text-white">{wordsLearned}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Weekly Goal</p>
            <p className="text-xl font-extrabold text-white">{done}/{weeklyGoal}</p>
          </div>
        </div>

        {/* Weekly goal */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1 text-[10px] text-white/70 font-semibold uppercase tracking-wider">
              <Target className="w-3 h-3" /> Weekly Goal
            </div>
            <span className="text-[10px] text-white/70 font-bold">{done}/{weeklyGoal}</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weekPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex gap-1 mb-4 h-12 sm:h-16 items-end">{bars}</div>

        <button
          onClick={onViewStats}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-xs font-bold text-white hover:bg-white/30 active:scale-[0.98] transition-all w-full justify-center"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          VIEW FULL STATS
        </button>
      </div>
    </motion.div>
  );
});

export default MomentumCard;
