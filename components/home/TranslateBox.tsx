'use client';
import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Languages, Volume2, Loader2, Copy, Check } from 'lucide-react';
import api from '@/lib/api';

const LANGS = [
  { id: 'English', label: 'English',  speech: 'en-US' },
  { id: 'Telugu',  label: 'తెలుగు',   speech: 'te-IN' },
  { id: 'Hindi',   label: 'हिन्दी',    speech: 'hi-IN' },
] as const;

type LangId = (typeof LANGS)[number]['id'];

const speechOf = (id: string) => LANGS.find((l) => l.id === id)?.speech || 'en-US';

const TranslateBox = memo(function TranslateBox() {
  const [from, setFrom]       = useState<LangId>('English');
  const [to, setTo]           = useState<LangId>('Telugu');
  const [text, setText]       = useState('');
  const [result, setResult]   = useState<{ translation: string; meaning: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState(false);

  const swap = useCallback(() => {
    setFrom(to);
    setTo(from);
    setText(result?.translation || text);
    setResult(null);
    setError('');
  }, [to, from, result, text]);

  const translate = useCallback(async () => {
    const t = text.trim();
    if (!t || loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.post('/words/translate', { text: t, from, to });
      setResult({ translation: data.translation || '', meaning: data.meaning || '' });
    } catch {
      setError('Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [text, from, to, loading]);

  const speak = useCallback((value: string, langId: string) => {
    if (!('speechSynthesis' in window) || !value) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(value);
    u.lang = speechOf(langId);
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }, []);

  const copy = useCallback(() => {
    if (!result?.translation) return;
    navigator.clipboard?.writeText(result.translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [result]);

  const LangPicker = ({ value, onChange }: { value: LangId; onChange: (v: LangId) => void }) => (
    <div className="flex-1 flex gap-1 p-1 bg-[var(--card2)] rounded-xl">
      {LANGS.map((l) => (
        <button
          key={l.id}
          onClick={() => onChange(l.id)}
          className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
            value === l.id
              ? 'bg-[var(--primary)] text-[var(--primary-fg)] shadow-[0_2px_8px_var(--primary-soft)]'
              : 'text-[var(--text2)] hover:text-[var(--text)]'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-[var(--border)]">
        <div className="w-7 h-7 rounded-lg bg-[var(--primary-soft)] flex items-center justify-center">
          <Languages className="w-3.5 h-3.5 text-[var(--primary)]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--text)]">Translate</h3>
          <p className="text-[10px] text-[var(--muted)]">English ⇄ Telugu ⇄ Hindi</p>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        {/* Language selectors + swap */}
        <div className="flex items-center gap-2">
          <LangPicker value={from} onChange={(v) => { setFrom(v); if (v === to) setTo(from); }} />
          <button
            onClick={swap}
            aria-label="Swap languages"
            className="w-9 h-9 shrink-0 rounded-xl bg-[var(--card2)] border border-[var(--border)] flex items-center justify-center text-[var(--text2)] hover:text-[var(--primary)] hover:border-[var(--primary)] active:scale-90 transition-all"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
          <LangPicker value={to} onChange={(v) => { setTo(v); if (v === from) setFrom(to); }} />
        </div>

        {/* Input */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) translate(); }}
            placeholder={`Enter text in ${from}…`}
            rows={2}
            className="w-full resize-none px-3.5 py-3 pr-10 text-sm bg-[var(--input-bg)] border-2 border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-all"
          />
          {text && (
            <button
              onClick={() => speak(text, from)}
              aria-label="Listen"
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-[var(--card2)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Translate button */}
        <button
          onClick={translate}
          disabled={!text.trim() || loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--primary)] text-[var(--primary-fg)] rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 active:scale-[0.98] transition-all"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Translating…</> : <>Translate to {to}</>}
        </button>

        {/* Error */}
        {error && <p className="text-xs text-center font-semibold text-red-500">{error}</p>}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-[var(--primary-soft)] border border-[var(--primary)]/20 rounded-xl p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className={`flex-1 text-base font-bold text-[var(--text)] leading-relaxed break-words ${to !== 'English' ? 'telugu' : ''}`}>
                  {result.translation || '—'}
                </p>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => speak(result.translation, to)}
                    aria-label="Listen to translation"
                    className="w-7 h-7 rounded-lg bg-[var(--card)] flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={copy}
                    aria-label="Copy translation"
                    className="w-7 h-7 rounded-lg bg-[var(--card)] flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              {result.meaning && (
                <p className="text-xs text-[var(--text2)] mt-2 pt-2 border-t border-[var(--primary)]/15 leading-relaxed">
                  {result.meaning}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default TranslateBox;
