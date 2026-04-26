'use client';
import { memo, useState, useCallback, useEffect } from 'react';
import { Play, Pause, Camera, Pencil, Trash2, Check, X, BookmarkPlus } from 'lucide-react';
import api from '@/lib/api';
import ImageUploader from '@/components/shared/ImageUploader';
import ConfirmModal from '@/components/shared/ConfirmModal';

interface Props {
  storyId?: string;
  initialText?: string;
  initialImage?: string;
  onDelete?: () => void;
  onWordSaved?: (word: string) => void;
}

// Tokenize text into words and non-words (spaces, punctuation)
function tokenize(text: string): { value: string; isWord: boolean }[] {
  return text.split(/(\b[a-zA-Z]+\b)/).map(v => ({
    value: v,
    isWord: /^[a-zA-Z]+$/.test(v),
  }));
}

const StoryContent = memo(function StoryContent({
  storyId = 'current', initialText = '', initialImage = '', onDelete, onWordSaved,
}: Props) {
  const [playing, setPlaying]             = useState(false);
  const [storyImage, setStoryImage]       = useState(initialImage);
  const [editingImg, setEditingImg]       = useState(false);
  const [storyText, setStoryText]         = useState(initialText);
  const [editing, setEditing]             = useState(false);
  const [editText, setEditText]           = useState(initialText);
  const [saving, setSaving]               = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [savedWords, setSavedWords]       = useState<Set<string>>(new Set());
  const [savingWord, setSavingWord]       = useState<string | null>(null);
  const [tooltip, setTooltip]             = useState<string | null>(null);

  // Load existing saved word names to know which are already saved
  useEffect(() => {
    api.get('/words').then(r => {
      setSavedWords(new Set(r.data.map((w: { word: string }) => w.word.toLowerCase())));
    }).catch(() => {});
  }, []);

  const handleWordClick = useCallback(async (word: string) => {
    const key = word.toLowerCase();
    if (savedWords.has(key) || savingWord === key) return;
    setSavingWord(key);
    try {
      // Generate word with AI (meaning + examples + image)
      await api.post('/words/generate', { word });
      setSavedWords(prev => new Set([...prev, key]));
      setTooltip(key);
      setTimeout(() => setTooltip(null), 2000);
      onWordSaved?.(word);
    } catch {
      // fallback: save basic word
      try {
        await api.post('/words', { word, meaning: '' });
        setSavedWords(prev => new Set([...prev, key]));
        onWordSaved?.(word);
      } catch {}
    } finally {
      setSavingWord(null);
    }
  }, [savedWords, savingWord, onWordSaved]);

  const togglePlay = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
    } else {
      const u = new SpeechSynthesisUtterance(storyText);
      u.lang = 'en-US'; u.rate = 0.9;
      u.onend = () => setPlaying(false);
      u.onerror = () => setPlaying(false);
      window.speechSynthesis.speak(u);
      setPlaying(true);
    }
  }, [playing, storyText]);

  const handleSaveImage = useCallback(async (url: string) => {
    await api.put(`/stories/${storyId}`, { image: url });
    setStoryImage(url);
    setEditingImg(false);
  }, [storyId]);

  const handleSaveEdit = useCallback(async () => {
    setSaving(true);
    try {
      await api.put(`/stories/${storyId}`, { storyText: editText });
      setStoryText(editText);
      setEditing(false);
    } finally { setSaving(false); }
  }, [storyId, editText]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await api.delete(`/stories/${storyId}`);
      onDelete?.();
    } finally { setDeleting(false); setConfirmDelete(false); }
  }, [storyId, onDelete]);

  const renderText = (text: string) =>
    text.split('\n\n').filter(Boolean).map((para, pi) => (
      <p key={pi} className="leading-8">
        {tokenize(para).map((token, ti) => {
          if (!token.isWord) return <span key={ti}>{token.value}</span>;
          const key = token.value.toLowerCase();
          const isSaved = savedWords.has(key);
          const isSaving = savingWord === key;
          const justSaved = tooltip === key;
          return (
            <span key={ti} className="relative inline-block">
              <button
                onClick={() => handleWordClick(token.value)}
                disabled={isSaved || isSaving}
                className={`relative inline-flex items-center gap-0.5 rounded px-0.5 transition-all cursor-pointer group/word ${
                  isSaved
                    ? 'bg-[var(--primary-soft)] text-[var(--primary)] font-semibold'
                    : isSaving
                    ? 'bg-[var(--card2)] text-[var(--muted)] animate-pulse'
                    : 'hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]'
                }`}
              >
                {token.value}
              </button>
              {/* Saved tooltip */}
              {justSaved && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap z-10 pointer-events-none">
                  Saved!
                </span>
              )}
            </span>
          );
        })}
      </p>
    ));

  return (
    <>
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] flex flex-col overflow-hidden">

        {/* Story image */}
        <div className="relative h-44 bg-[var(--card2)] group">
          {storyImage
            ? <img src={storyImage} alt="Story" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[var(--muted)]">
                <span className="text-3xl">📖</span>
                <span className="text-xs">No image yet</span>
              </div>
          }
          <button onClick={() => setEditingImg(v => !v)}
            className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
            <div className="flex items-center gap-2 bg-white/90 rounded-full px-3 py-1.5">
              <Camera className="w-4 h-4 text-gray-700" />
              <span className="text-xs font-semibold text-gray-700">Change Image</span>
            </div>
          </button>
        </div>

        {editingImg && <ImageUploader onSave={handleSaveImage} onCancel={() => setEditingImg(false)} />}

        <div className="p-4 sm:p-6 flex flex-col gap-4">

          {/* Hint */}
          {!editing && (
            <p className="text-[10px] text-[var(--muted)] flex items-center gap-1">
              <BookmarkPlus className="w-3 h-3" />
              Tap any word to save it to your vocabulary
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => { setEditing(v => !v); setEditText(storyText); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card2)] text-[var(--text2)] text-xs font-semibold hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] transition-all">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card2)] text-[var(--text2)] text-xs font-semibold hover:bg-red-500/10 hover:text-red-500 transition-all">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>

          {/* Story text */}
          {editing ? (
            <div className="space-y-3">
              <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={10}
                className="w-full px-4 py-3 text-sm bg-[var(--card2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-all resize-none leading-7" />
              <div className="flex gap-2">
                <button onClick={handleSaveEdit} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50">
                  <Check className="w-3.5 h-3.5" />{saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[var(--card2)] text-[var(--text2)] rounded-xl text-xs font-semibold hover:bg-[var(--border)]">
                  <X className="w-3.5 h-3.5" />Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-[var(--text)] space-y-4">
              {renderText(storyText)}
            </div>
          )}

          {/* Audio player */}
          <div className="bg-[var(--card2)] rounded-xl px-4 py-3 flex items-center gap-3">
            <button onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-[var(--text)] flex items-center justify-center shrink-0 hover:opacity-80 active:scale-95 transition-all">
              {playing
                ? <Pause className="w-4 h-4 text-[var(--bg)]" />
                : <Play className="w-4 h-4 text-[var(--bg)] fill-[var(--bg)] ml-0.5" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Narration: US Male</p>
              <p className="text-[10px] text-[var(--muted)]">{playing ? 'Playing…' : '(Natural)'}</p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Delete this story?"
        message="This story will be permanently deleted and cannot be recovered."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        loading={deleting}
      />
    </>
  );
});

export default StoryContent;
