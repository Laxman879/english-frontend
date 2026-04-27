'use client';
import { memo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Pencil, Trash2, Check, Camera } from 'lucide-react';
import api from '@/lib/api';
import { type Word } from './WordCard';
import ImageUploader from '@/components/shared/ImageUploader';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { useWords } from '@/lib/WordsContext';

interface Props {
  word: Word | null;
  onClose: () => void;
  onUpdate: (updated: Word) => void;
  onDelete: (id: string) => void;
}

const WordDetailModal = memo(function WordDetailModal({ word, onClose, onUpdate, onDelete }: Props) {
  const { updateWord, deleteWord } = useWords();
  const [editing, setEditing]         = useState(false);
  const [editingImg, setEditingImg]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [saving, setSaving]           = useState(false);

  const [wordVal, setWordVal]     = useState(word?.word || '');
  const [meaning, setMeaning]     = useState(word?.translation || '');
  const [past, setPast]           = useState(word?.examples?.past || '');
  const [present, setPresent]     = useState(word?.examples?.present || '');
  const [future, setFuture]       = useState(word?.examples?.future || '');
  const [image, setImage]         = useState(word?.image || '');
  const [translations, setTranslations] = useState<Record<string, string>>(word?.translations || {});

  // Sync state when word changes (different word opened, or same word updated)
  useEffect(() => {
    if (!word) return;
    setWordVal(word.word || '');
    setMeaning(word.translation || '');
    setPast(word.examples?.past || '');
    setPresent(word.examples?.present || '');
    setFuture(word.examples?.future || '');
    setImage(word.image || '');
    setTranslations(word.translations || {});
  }, [word?.id, word?.word, word?.translation, word?.image, word?.examples, word?.translations]);

  // Reset editing mode only when a different word is opened
  useEffect(() => {
    setEditing(false);
    setEditingImg(false);
  }, [word?.id]);

  const speak = useCallback(() => {
    if (!word || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(wordVal);
    u.lang = 'en-US'; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }, [wordVal, word]);

  const handleSave = useCallback(async () => {
    if (!word) return;
    setSaving(true);
    try {
      await api.put(`/words/${word.id}`, { word: wordVal, meaning, translations });
      await api.put(`/words/${word.id}/examples`, { past, present, future });
      const updated = { ...word, word: wordVal, translation: meaning, image, examples: { past, present, future }, translations };
      updateWord(updated);
      onUpdate(updated);
      setEditing(false);
    } finally { setSaving(false); }
  }, [word, wordVal, meaning, past, present, future, image, translations, onUpdate, updateWord]);

  const handleSaveImage = useCallback(async (url: string) => {
    if (!word) return;
    await api.put(`/words/${word.id}`, { image: url });
    setImage(url);
    const updated = { ...word, image: url };
    updateWord(updated);
    onUpdate(updated);
    setEditingImg(false);
  }, [word, onUpdate, updateWord]);

  const handleDelete = useCallback(async () => {
    if (!word) return;
    setDeleting(true);
    try {
      await api.delete(`/words/${word.id}`);
      deleteWord(word.id);
      onDelete(word.id);
      onClose();
    } finally { setDeleting(false); setConfirmDelete(false); }
  }, [word, onDelete, onClose, deleteWord]);

  const inputCls = "w-full px-3 py-2 text-sm bg-[var(--card2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-all";

  return (
    <>
      <AnimatePresence>
        {word && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative bg-[var(--card)] rounded-3xl shadow-2xl w-full max-w-md z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Image */}
              <div className="relative h-48 bg-[var(--card2)] shrink-0 group">
                {image
                  ? <img src={image} alt={wordVal} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-5xl">📖</div>
                }
                {/* Top actions */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={() => setEditingImg(v => !v)}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-all">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={onClose}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-all">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                {/* Badge */}
                <div className="absolute bottom-3 left-3">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--primary)] text-white">
                    {word.badge}
                  </span>
                </div>
              </div>

              {/* Image uploader */}
              {editingImg && (
                <ImageUploader onSave={handleSaveImage} onCancel={() => setEditingImg(false)} />
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">

                {/* Word + actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {editing ? (
                      <input value={wordVal} onChange={e => setWordVal(e.target.value)}
                        className={inputCls + ' text-xl font-extrabold'} />
                    ) : (
                      <h2 className="text-2xl font-extrabold text-[var(--text)]">{wordVal}</h2>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={speak}
                      className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center hover:opacity-90 transition-all">
                      <Volume2 className="w-4 h-4 text-white" />
                    </button>
                    <button onClick={() => setEditing(v => !v)}
                      className="w-8 h-8 rounded-full bg-[var(--card2)] flex items-center justify-center hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] transition-all text-[var(--text2)]">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmDelete(true)}
                      className="w-8 h-8 rounded-full bg-[var(--card2)] flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all text-[var(--text2)]">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Meaning */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">Meaning</p>
                  {editing
                    ? <input value={meaning} onChange={e => setMeaning(e.target.value)} className={inputCls} />
                    : <p className="text-sm text-[var(--text2)] leading-relaxed">{meaning || '—'}</p>
                  }
                </div>

                {/* Translations */}
                {(editing ? Object.keys(translations).length > 0 : true) && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Translations</p>
                    {editing ? (
                      <div className="space-y-2">
                        {Object.entries(translations).map(([lang, val]) => (
                          <div key={lang} className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] w-20 shrink-0">{lang}</span>
                            <input
                              value={val}
                              onChange={e => setTranslations(prev => ({ ...prev, [lang]: e.target.value }))}
                              className={inputCls}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(word?.translations || {}).map(([lang, val]) => (
                          <div key={lang} className="bg-[var(--card2)] rounded-xl p-2.5">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--primary)] mb-0.5">{lang}</p>
                            <p className="text-sm font-semibold text-[var(--text)]">{val}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sentences */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Example Sentences</p>
                  <div className="space-y-2.5">
                    {([
                      { label: 'Past',    val: past,    set: setPast    },
                      { label: 'Present', val: present, set: setPresent },
                      { label: 'Future',  val: future,  set: setFuture  },
                    ] as const).map(({ label, val, set: setter }) => (
                      <div key={label} className="bg-[var(--card2)] rounded-2xl p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--primary)] mb-1">{label}</p>
                        {editing
                          ? <input value={val} onChange={e => setter(e.target.value)}
                              placeholder={`${label} tense sentence…`}
                              className="w-full bg-transparent text-sm text-[var(--text)] focus:outline-none placeholder:text-[var(--muted)]" />
                          : <p className="text-sm text-[var(--text)] leading-relaxed">{val || <span className="text-[var(--muted)] italic">No sentence added</span>}</p>
                        }
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save/Cancel when editing */}
                {editing && (
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[var(--primary)] text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50">
                      <Check className="w-4 h-4" />{saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button onClick={() => { setEditing(false); setWordVal(word.word); setMeaning(word.translation); setPast(word.examples?.past || ''); setPresent(word.examples?.present || ''); setFuture(word.examples?.future || ''); setTranslations(word.translations || {}); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[var(--card2)] text-[var(--text2)] rounded-xl text-sm font-semibold hover:bg-[var(--border)]">
                      <X className="w-4 h-4" />Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={confirmDelete}
        title="Delete this word?"
        message={`"${wordVal}" will be permanently removed from your vocabulary vault.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        loading={deleting}
      />
    </>
  );
});

export default WordDetailModal;
