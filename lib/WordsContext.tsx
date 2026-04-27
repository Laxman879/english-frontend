'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from './api';

export interface Word {
  id: string;
  badge: string;
  word: string;
  translation: string;
  pronunciation: string;
  image?: string;
  examples?: { past?: string; present?: string; future?: string };
  translations?: Record<string, string>;
}

interface WordsContextType {
  words: Word[];
  loading: boolean;
  addWord: (w: Word) => void;
  updateWord: (w: Word) => void;
  deleteWord: (id: string) => void;
  deleteWords: (ids: string[]) => void;
}

const WordsCtx = createContext<WordsContextType>({
  words: [], loading: true,
  addWord: () => {}, updateWord: () => {}, deleteWord: () => {}, deleteWords: () => {},
});

export const useWords = () => useContext(WordsCtx);

function mapWord(w: Record<string, unknown>): Word {
  return {
    id: w._id as string,
    badge: 'COMMON',
    word: w.word as string,
    translation: (w.meaning as string) || '',
    pronunciation: (w.audioUrl as string) || '',
    image: (w.image as string) || '',
    examples: (w.examples as Word['examples']) || {},
    translations: (w.translations as Record<string, string>) || {},
  };
}

export function WordsProvider({ children }: { children: ReactNode }) {
  const [words, setWords]   = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/words')
      .then(r => setWords(r.data.map(mapWord)))
      .finally(() => setLoading(false));
  }, []);

  const addWord    = useCallback((w: Word) => setWords(prev => [w, ...prev]), []);
  const updateWord = useCallback((w: Word) => setWords(prev => prev.map(p => p.id === w.id ? w : p)), []);
  const deleteWord = useCallback((id: string) => setWords(prev => prev.filter(w => w.id !== id)), []);
  const deleteWords = useCallback((ids: string[]) => setWords(prev => prev.filter(w => !ids.includes(w.id))), []);

  return (
    <WordsCtx.Provider value={{ words, loading, addWord, updateWord, deleteWord, deleteWords }}>
      {children}
    </WordsCtx.Provider>
  );
}
