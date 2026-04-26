'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, loading }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.22 }}
            className="relative bg-[var(--card)] rounded-3xl shadow-2xl p-7 w-full max-w-sm mx-4 z-10 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-lg font-extrabold text-[var(--text)] mb-2">{title}</h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-7">{message}</p>
            <div className="flex gap-3 w-full">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--text2)] hover:bg-[var(--card2)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-3 rounded-full bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                {loading ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
