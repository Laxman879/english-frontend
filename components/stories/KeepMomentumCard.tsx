'use client';
import { memo } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface KeepMomentumCardProps {
  masteredPct?: number;
  onQuiz?: () => void;
}

const KeepMomentumCard = memo(function KeepMomentumCard({
  masteredPct = 65,
  onQuiz,
}: KeepMomentumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--primary)] to-emerald-700 p-4 sm:p-5 text-[var(--primary-fg)]"
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6" />

      <h3 className="text-base sm:text-lg font-extrabold leading-tight mb-2 relative z-10">
        Keep the<br />Momentum!
      </h3>
      <p className="text-xs text-white/80 leading-relaxed mb-4 sm:mb-5 relative z-10">
        You&apos;ve mastered {masteredPct}% of the words in this story. Ready for a quiz?
      </p>
      <button
        onClick={onQuiz}
        className="relative z-10 flex items-center justify-center gap-2 w-full py-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-xs font-semibold hover:bg-white/30 active:scale-[0.98] transition-all"
      >
        <Zap className="w-3.5 h-3.5" />
        Take Story Quiz
      </button>
    </motion.div>
  );
});

export default KeepMomentumCard;
