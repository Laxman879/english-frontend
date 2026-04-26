'use client';
import { memo } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const MasteredBanner = memo(function MasteredBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="relative overflow-hidden rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 sm:p-6 flex items-center gap-4 sm:gap-6"
    >
      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text)] leading-tight mb-1.5 sm:mb-2">
          Mastered 12 new<br />words today!
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text2)] leading-relaxed mb-4 sm:mb-5">
          You&apos;re on a 5-day streak. Keep pushing your limits with AI-generated stories using these words.
        </p>
        <button className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[var(--text)] text-[var(--bg)] rounded-full text-xs sm:text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all">
          Start AI Story Session
          <Zap className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Image */}
      <div className="hidden sm:block w-28 md:w-32 h-24 md:h-28 rounded-xl overflow-hidden shrink-0">
        <img
          src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80"
          alt="Books"
          className="w-full h-full object-cover"
        />
      </div>
    </motion.div>
  );
});

export default MasteredBanner;
