'use client';
import { memo, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, ArrowLeftRight } from 'lucide-react';
import api from '@/lib/api';

interface SynonymsCardProps {
  wordId?: string;
  onSelect?: (word: string) => void;
}

const SynonymsCard = memo(function SynonymsCard({ wordId, onSelect }: SynonymsCardProps) {
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [antonyms, setAntonyms] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wordId) return;
    setLoading(true);
    api.get(`/words/${wordId}/related`)
      .then(r => {
        setSynonyms(r.data.synonyms || []);
        setAntonyms(r.data.antonyms || []);
      })
      .catch(() => { setSynonyms([]); setAntonyms([]); })
      .finally(() => setLoading(false));
  }, [wordId]);

  const speak = useCallback((word: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(word));
  }, []);

  const handleSelect = useCallback((word: string) => () => {
    setSelected(word); speak(word); onSelect?.(word);
  }, [onSelect, speak]);

  if (!wordId) return null;

  if (loading) {
    return (
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[var(--primary-soft)] flex items-center justify-center">
            <ArrowLeftRight className="w-3.5 h-3.5 text-[var(--primary)]" />
          </div>
          <p className="text-sm font-bold text-[var(--text)]">Related Words</p>
        </div>
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-7 rounded-full skeleton" />)}
        </div>
      </div>
    );
  }

  if (!synonyms.length && !antonyms.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4">
        <div className="w-7 h-7 rounded-lg bg-[var(--primary-soft)] flex items-center justify-center">
          <ArrowLeftRight className="w-3.5 h-3.5 text-[var(--primary)]" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[var(--text)] leading-none">Related Words</h4>
          <p className="text-[10px] text-[var(--muted)] mt-0.5">Tap to hear pronunciation</p>
        </div>
      </div>

      <div className="h-px bg-[var(--border)] mx-4 sm:mx-5" />

      <div className="p-4 sm:p-5 space-y-4">
        {synonyms.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Synonyms</p>
              <span className="text-[10px] font-bold text-[var(--primary)] bg-[var(--primary-soft)] px-2 py-0.5 rounded-full">{synonyms.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {synonyms.map(word => (
                <button key={word} onClick={handleSelect(word)}
                  className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                    selected === word
                      ? 'bg-[var(--primary)] text-[var(--primary-fg)] shadow-sm'
                      : 'border border-[var(--border)] text-[var(--text2)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)]'
                  }`}>
                  {selected === word && <Volume2 className="w-3 h-3" />}
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {synonyms.length > 0 && antonyms.length > 0 && <div className="h-px bg-[var(--border)]" />}

        {antonyms.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Antonyms</p>
              <span className="text-[10px] font-bold text-[var(--fire)] bg-[var(--fire-soft)] px-2 py-0.5 rounded-full">{antonyms.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {antonyms.map(word => (
                <button key={word} onClick={handleSelect(word)}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 active:scale-95 ${
                    selected === word
                      ? 'bg-[var(--fire)] text-white border-[var(--fire)] shadow-sm'
                      : 'border-[var(--border)] text-[var(--text2)] hover:border-[var(--fire)] hover:text-[var(--fire)] hover:bg-[var(--fire-soft)]'
                  }`}>
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {selected && (
          <p className="text-[10px] text-[var(--muted)] text-center pt-1">
            🔊 Playing: <span className="font-bold text-[var(--text)]">{selected}</span>
          </p>
        )}
      </div>
    </motion.div>
  );
});

export default SynonymsCard;
