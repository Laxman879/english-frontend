'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, BookOpen, Languages } from 'lucide-react';

const contentItems = [
  { id: 1, icon: BookOpen,  title: 'La Comida en México', subtitle: 'Short Story • Spanish' },
  { id: 2, icon: Languages, title: 'Explorar',            subtitle: 'Verb • Spanish'        },
  { id: 3, icon: Languages, title: 'Aventura',            subtitle: 'Noun • Spanish'        },
  { id: 4, icon: Languages, title: 'Desayuno',            subtitle: 'Noun • Spanish'        },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export default function CreatePlaylistModal({ open, onClose, onCreate }: Props) {
  const [name, setName]         = useState('');
  const [selected, setSelected] = useState<number[]>([1, 2, 3]);
  const [loading, setLoading]   = useState(false);

  const toggle = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreate(name.trim());
      setName('');
      setSelected([1, 2, 3]);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 16 }}
            transition={{ duration: 0.25 }}
            className="relative bg-[var(--card)] rounded-3xl shadow-2xl p-7 w-full max-w-md mx-4 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-[var(--text)]">Create New Playlist</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[var(--card2)] flex items-center justify-center hover:bg-[var(--border)] transition-colors"
              >
                <X className="w-4 h-4 text-[var(--text2)]" />
              </button>
            </div>

            {/* Playlist Name */}
            <div className="mb-5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-2 block">
                Playlist Name
              </label>
              <input
                type="text"
                placeholder="e.g., Morning Coffee Vocabulary"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--card2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 transition-all placeholder:text-[var(--muted)]"
              />
            </div>

            {/* Select Content */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Select Content
                </label>
                <span className="text-xs font-semibold text-[var(--primary)]">{selected.length} items selected</span>
              </div>

              <div className="space-y-2.5">
                {contentItems.map((item) => {
                  const isSelected = selected.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
                          : 'border-[var(--border)] bg-[var(--card2)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-[var(--primary)]/10' : 'bg-[var(--border)]'
                        }`}>
                          <item.icon className={`w-4 h-4 ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isSelected ? 'text-[var(--text)]' : 'text-[var(--text2)]'}`}>
                            {item.title}
                          </p>
                          <p className="text-xs text-[var(--muted)]">{item.subtitle}</p>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                        isSelected ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)] bg-transparent'
                      }`}>
                        {isSelected && <CheckCircle className="w-4 h-4 text-white fill-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold text-[var(--text2)] hover:text-[var(--text)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || loading}
                className="px-6 py-3 bg-[var(--primary)] text-white rounded-full text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Creating…' : 'Create Playlist'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
