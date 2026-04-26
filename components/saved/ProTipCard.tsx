'use client';
import { memo } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';

const ProTipCard = memo(function ProTipCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-[var(--fire-soft)] border border-[var(--fire)]/30 p-4 sm:p-5 flex flex-col gap-3"
    >
      {/* Plus button top right */}
      <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-md hover:opacity-90 active:scale-95 transition-all">
        <Plus className="w-4 h-4 text-[var(--primary-fg)]" />
      </button>

      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fire)] bg-[var(--fire)]/20 px-2 py-0.5 rounded-full">
          Pro Tip
        </span>
      </div>

      <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed pr-8">
        Review your &quot;Ephemeral&quot; list every evening. Science shows that spaced repetition before sleep increases retention by 30%.
      </p>

      <button className="flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:gap-2 active:opacity-80 transition-all mt-1">
        Learn more about learning
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
});

export default ProTipCard;
