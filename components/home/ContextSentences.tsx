'use client';
import { memo, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Copy, Check, BookOpen } from 'lucide-react';

interface Sentence { label: string; text: string; word: string; }
interface ContextSentencesProps { sentences?: Sentence[]; }

const defaultSentences: Sentence[] = [
  { label: 'Past',    text: 'Despite the heavy storm, the ancient oak tree remained {word} and standing.', word: 'resilient' },
  { label: 'Present', text: 'She is incredibly {word}, managing her work and studies with a smile.',        word: 'resilient' },
  { label: 'Future',  text: 'Our economy will become more {word} as we diversify our energy sources.',     word: 'resilient' },
];

const tenseConfig: Record<string, { color: string; bg: string; dot: string; icon: string }> = {
  Past:    { color: 'text-[var(--blue)]',    bg: 'bg-[var(--blue-soft)]',    dot: 'bg-[var(--blue)]',    icon: '↩' },
  Present: { color: 'text-[var(--primary)]', bg: 'bg-[var(--primary-soft)]', dot: 'bg-[var(--primary)]', icon: '◉' },
  Future:  { color: 'text-[var(--fire)]',    bg: 'bg-[var(--fire-soft)]',    dot: 'bg-[var(--fire)]',    icon: '→' },
};

const ContextSentences = memo(function ContextSentences({ sentences = defaultSentences }: ContextSentencesProps) {
  const [active, setActive]   = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied]   = useState(false);

  const current  = sentences[active];
  const cfg      = tenseConfig[current.label] ?? tenseConfig['Present'];
  const parts    = current.text.split('{word}');
  const fullText = current.text.replace('{word}', current.word);

  const speak = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(fullText);
    u.lang = 'en-US'; u.rate = 0.9;
    setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [fullText]);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fullText]);

  const tabs = useMemo(
    () =>
      sentences.map((s, i) => {
        const c = tenseConfig[s.label] ?? tenseConfig['Present'];
        const isActive = active === i;
        return (
          <button
            key={s.label}
            onClick={() => setActive(i)}
            className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              isActive ? `${c.bg} ${c.color}` : 'text-[var(--text2)] hover:bg-[var(--card2)]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? c.dot : 'bg-[var(--muted)]'} transition-colors`} />
            {s.label}
          </button>
        );
      }),
    [sentences, active]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--primary-soft)] flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text)] leading-none">In Context</h3>
            <p className="text-[10px] text-[var(--muted)] mt-0.5">See how the word is used</p>
          </div>
        </div>
        {/* Tense tabs — scrollable on small screens */}
        <div className="flex items-center gap-1 bg-[var(--card2)] rounded-xl p-1 overflow-x-auto hide-scroll max-w-full">
          {tabs}
        </div>
      </div>

      <div className="h-px bg-[var(--border)] mx-4 sm:mx-6" />

      {/* Active sentence */}
      <div className="px-4 sm:px-6 py-4 sm:py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Tense label */}
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <span className={`text-lg font-mono ${cfg.color}`}>{cfg.icon}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
                {current.label} Tense
              </span>
            </div>

            {/* Sentence card */}
            <div className={`relative rounded-2xl border-l-4 ${cfg.dot.replace('bg-', 'border-')} bg-[var(--card2)] p-4 sm:p-5`}>
              <span className="absolute top-3 right-4 text-4xl leading-none text-[var(--border)] font-serif select-none">"</span>
              <p className="text-sm sm:text-base text-[var(--text)] leading-relaxed font-medium pr-6">
                {parts[0]}
                <span className={`font-extrabold ${cfg.color} underline decoration-2 underline-offset-4 mx-0.5`}>
                  {current.word}
                </span>
                {parts[1]}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--border)]">
                <button
                  onClick={speak}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    speaking
                      ? `${cfg.bg} ${cfg.color}`
                      : 'bg-[var(--card)] text-[var(--text2)] hover:bg-[var(--card2)] border border-[var(--border)]'
                  }`}
                >
                  <motion.div animate={speaking ? { scale: [1, 1.3, 1] } : {}} transition={{ repeat: Infinity, duration: 0.6 }}>
                    <Volume2 className="w-3.5 h-3.5" />
                  </motion.div>
                  {speaking ? 'Playing...' : 'Listen'}
                </button>

                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--card)] text-[var(--text2)] hover:bg-[var(--card2)] border border-[var(--border)] transition-all duration-200"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[var(--primary)]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>

                <span className="ml-auto text-[10px] text-[var(--muted)]">
                  {fullText.split(' ').length} words
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Timeline — other sentences */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-3">Other Tenses</p>
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--border)]" />
          <div className="space-y-2">
            {sentences.map((s, i) => {
              if (i === active) return null;
              const c = tenseConfig[s.label] ?? tenseConfig['Present'];
              const p = s.text.split('{word}');
              return (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="w-full text-left flex items-start gap-3 sm:gap-4 group"
                >
                  <div className={`w-3.5 h-3.5 rounded-full border-2 border-[var(--border)] group-hover:border-[var(--primary)] mt-1 shrink-0 transition-all duration-200 bg-[var(--card)]`} />
                  <div className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-[var(--border)] group-hover:border-[var(--primary)] group-hover:bg-[var(--primary-soft)] transition-all duration-200">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${c.color} block mb-1`}>{s.label}</span>
                    <p className="text-xs text-[var(--text2)] leading-relaxed line-clamp-1">
                      {p[0]}<strong className="text-[var(--text)] font-bold">{s.word}</strong>{p[1]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default ContextSentences;
