'use client';
import { memo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { type Word } from './WordCard';
import { useWords } from '@/lib/WordsContext';

const BADGES = ['COMMON', 'VERB', 'IDIOM', 'PHRASE', 'LEVEL B2', 'LEVEL C1'];

interface AddWordModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (word: Word) => void;
}

const empty = {
  badge: 'COMMON', word: '', translation: '', pronunciation: '',
  past: '', present: '', future: '', image: '',
};

const AddWordModal = memo(function AddWordModal({ open, onClose, onAdd }: AddWordModalProps) {
  const { addWord } = useWords();
  const [form, setForm]       = useState(empty);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [saving, setSaving]   = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => { if (open) { setForm(empty); setErrors({}); } }, [open]);

  const set = useCallback((field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  // AI auto-fill: generate meaning + sentences from word
  const handleAiFill = useCallback(async () => {
    if (!form.word.trim()) { setErrors({ word: 'Enter a word first' }); return; }
    setAiLoading(true);
    try {
      const { data } = await api.post('/words/generate', { word: form.word.trim() });
      setForm(prev => ({
        ...prev,
        translation: data.meaning || prev.translation,
        past: data.examples?.past || prev.past,
        present: data.examples?.present || prev.present,
        future: data.examples?.future || prev.future,
        image: data.image || prev.image,
      }));
    } catch {
      setErrors({ word: 'AI fill failed. Fill manually.' });
    } finally {
      setAiLoading(false);
    }
  }, [form.word]);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!form.word.trim()) e.word = 'Word is required';
    if (!form.translation.trim()) e.translation = 'Meaning is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const { data } = await api.post('/words', {
        word: form.word.trim(),
        meaning: form.translation.trim(),
        image: form.image.trim(),
        examples: { past: form.past, present: form.present, future: form.future },
      });
      const newWord: Word = {
        id: data._id,
        badge: form.badge,
        word: data.word,
        translation: data.meaning || '',
        pronunciation: data.audioUrl || '',
        image: data.image || '',
        examples: data.examples,
        translations: data.translations || {},
      };
      addWord(newWord);
      onAdd(newWord);
      onClose();
    } finally {
      setSaving(false);
    }
  }, [form, validate, onAdd, onClose]);

  const inputCls = (field: string) =>
    `w-full px-4 py-2.5 bg-[var(--input-bg)] border rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none transition-all ${
      errors[field] ? 'border-red-500' : 'border-[var(--border)] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-soft)]'
    }`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-4 bottom-4 sm:top-1/2 sm:-translate-y-1/2 sm:h-auto w-auto sm:w-full sm:max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--border)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] flex items-center justify-center">
                  <Plus className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-[var(--text)] leading-none">Add New Word</h2>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">Build your vocabulary vault</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[var(--card2)] flex items-center justify-center hover:bg-[var(--border)] transition-all text-[var(--text2)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable form */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* Badge */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {BADGES.map(b => (
                    <button key={b} onClick={() => set('badge', b)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
                        form.badge === b ? 'bg-[var(--primary)] text-[var(--primary-fg)]' : 'bg-[var(--card2)] text-[var(--text2)] hover:bg-[var(--border)]'
                      }`}>{b}</button>
                  ))}
                </div>
              </div>

              {/* Word + AI button */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1.5">Word *</label>
                <div className="flex gap-2">
                  <input type="text" value={form.word} onChange={e => set('word', e.target.value)}
                    placeholder="e.g. Serendipity" className={inputCls('word') + ' flex-1'} />
                  <button onClick={handleAiFill} disabled={aiLoading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[var(--primary-soft)] text-[var(--primary)] rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 shrink-0 transition-all">
                    <Sparkles className="w-3.5 h-3.5" />
                    {aiLoading ? 'Filling…' : 'AI Fill'}
                  </button>
                </div>
                {errors.word && <p className="text-[10px] text-red-500 mt-1">{errors.word}</p>}
              </div>

              {/* Meaning */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1.5">Meaning *</label>
                <input type="text" value={form.translation} onChange={e => set('translation', e.target.value)}
                  placeholder="e.g. The occurrence of events by chance" className={inputCls('translation')} />
                {errors.translation && <p className="text-[10px] text-red-500 mt-1">{errors.translation}</p>}
              </div>

              {/* Sentences */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-2">Example Sentences</label>
                <div className="space-y-2">
                  {(['past', 'present', 'future'] as const).map(tense => (
                    <div key={tense} className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase text-[var(--muted)] w-12">{tense}</span>
                      <input type="text" value={form[tense]} onChange={e => set(tense, e.target.value)}
                        placeholder={`${tense.charAt(0).toUpperCase() + tense.slice(1)} tense sentence…`}
                        className="w-full pl-16 pr-4 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-soft)] transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1.5">Image URL <span className="normal-case font-normal">(optional)</span></label>
                <input type="text" value={form.image} onChange={e => set('image', e.target.value)}
                  placeholder="https://…" className={inputCls('image')} />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[var(--border)] shrink-0">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text2)] hover:bg-[var(--card2)] transition-all">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-fg)] text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                {saving ? 'Adding…' : 'Add Word'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

export default AddWordModal;
