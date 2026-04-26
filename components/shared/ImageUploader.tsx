'use client';
import { useRef, useState } from 'react';
import { Check, X, Link, Upload } from 'lucide-react';
import api from '@/lib/api';

interface Props {
  onSave: (url: string) => Promise<void>;
  onCancel: () => void;
}

export default function ImageUploader({ onSave, onCancel }: Props) {
  const [tab, setTab]           = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [preview, setPreview]   = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const fileRef                 = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUrlInput(data.url);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const url = urlInput.trim();
    if (!url) return;
    setSaving(true);
    try { await onSave(url); } finally { setSaving(false); }
  };

  return (
    <div className="p-3 bg-[var(--card)] border-t border-[var(--border)] space-y-2">
      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--card2)] rounded-xl p-1">
        {(['file', 'url'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === t ? 'bg-[var(--card)] text-[var(--text)] shadow-sm' : 'text-[var(--muted)]'
            }`}
          >
            {t === 'file' ? <Upload className="w-3 h-3" /> : <Link className="w-3 h-3" />}
            {t === 'file' ? 'Upload File' : 'Paste URL'}
          </button>
        ))}
      </div>

      {/* File upload */}
      {tab === 'file' && (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[var(--border)] rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-[var(--primary)] transition-colors"
        >
          {preview
            ? <img src={preview} alt="preview" className="h-20 w-full object-cover rounded-lg" />
            : <>
                <Upload className="w-5 h-5 text-[var(--muted)]" />
                <p className="text-xs text-[var(--muted)] text-center">
                  Click to choose a photo<br />
                  <span className="text-[10px]">JPG, PNG, WEBP · max 5MB</span>
                </p>
              </>
          }
          {uploading && <p className="text-xs text-[var(--primary)] animate-pulse">Uploading…</p>}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      )}

      {/* URL input */}
      {tab === 'url' && (
        <input
          autoFocus
          type="text"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 text-sm bg-[var(--card2)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-all"
        />
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!urlInput.trim() || uploading || saving}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[var(--primary)] text-white rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Check className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : 'Save Image'}
        </button>
        <button
          onClick={onCancel}
          className="w-9 h-9 rounded-xl bg-[var(--card2)] flex items-center justify-center hover:bg-[var(--border)] transition-colors"
        >
          <X className="w-4 h-4 text-[var(--text2)]" />
        </button>
      </div>
    </div>
  );
}
