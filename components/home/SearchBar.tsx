'use client';
import { memo, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock, ArrowRight, Hash } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const trending = [
  { word: 'Ephemeral',   category: 'Adjective' },
  { word: 'Serendipity', category: 'Noun'      },
  { word: 'Tenacious',   category: 'Adjective' },
  { word: 'Eloquent',    category: 'Adjective' },
  { word: 'Melancholy',  category: 'Noun'      },
  { word: 'Resilient',   category: 'Adjective' },
];

const categoryColor: Record<string, string> = {
  Noun:      'bg-[var(--blue-soft)] text-[var(--blue)]',
  Adjective: 'bg-[var(--primary-soft)] text-[var(--primary)]',
  Verb:      'bg-[var(--fire-soft)] text-[var(--fire)]',
};

const SearchBar = memo(function SearchBar({
  onSearch,
  placeholder = 'Search any word...',
}: SearchBarProps) {
  const [value, setValue]   = useState('');
  const [focused, setFocused] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [recents, setRecents] = useState<string[]>(['Resilient', 'Ephemeral']);
  const inputRef    = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      value.length > 0
        ? trending.filter((t) => t.word.toLowerCase().startsWith(value.toLowerCase()))
        : [],
    [value]
  );

  const showDropdown = focused && (filtered.length > 0 || value.length === 0);
  const listItems    = value.length > 0 ? filtered.map((f) => f.word) : recents;

  const commit = useCallback(
    (word: string) => {
      setValue(word);
      onSearch?.(word);
      setFocused(false);
      setCursor(-1);
      setRecents((prev) => [word, ...prev.filter((r) => r !== word)].slice(0, 5));
    },
    [onSearch]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      setCursor(-1);
      onSearch?.(e.target.value);
    },
    [onSearch]
  );

  const clear = useCallback(() => {
    setValue('');
    setCursor(-1);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, listItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, -1));
      } else if (e.key === 'Enter' && cursor >= 0) {
        e.preventDefault();
        commit(listItems[cursor]);
      } else if (e.key === 'Escape') {
        setFocused(false);
      }
    },
    [showDropdown, listItems, cursor, commit]
  );

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative w-full">
      {/* Input */}
      <div
        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4 bg-[var(--input-bg)] border-2 rounded-2xl transition-all duration-200 ${
          focused
            ? 'border-[var(--primary)] shadow-[0_0_0_4px_var(--primary-soft)]'
            : 'border-[var(--border)] hover:border-[var(--text2)]'
        }`}
      >
        <motion.div animate={focused ? { scale: 1.15 } : { scale: 1 }} transition={{ duration: 0.15 }}>
          <Search className={`w-4 sm:w-5 h-4 sm:h-5 shrink-0 transition-colors ${focused ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`} />
        </motion.div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm sm:text-base text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none min-w-0"
        />

        <AnimatePresence mode="wait">
          {value ? (
            <motion.button
              key="clear"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              onClick={clear}
              className="w-7 h-7 rounded-full bg-[var(--border)] flex items-center justify-center hover:bg-[var(--muted)] transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5 text-[var(--text2)]" />
            </motion.button>
          ) : (
            <motion.kbd
              key="shortcut"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-xs text-[var(--muted)] font-mono shadow-sm shrink-0"
            >
              ⌘K
            </motion.kbd>
          )}
        </AnimatePresence>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full mt-2 w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-md)] overflow-hidden z-50"
          >
            {/* Section header */}
            <div className="flex items-center gap-2 px-4 sm:px-5 pt-3 sm:pt-4 pb-2">
              {value.length > 0 ? (
                <>
                  <Hash className="w-3.5 h-3.5 text-[var(--muted)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Suggestions</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-[var(--muted)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Recent Searches</span>
                </>
              )}
            </div>

            {/* Items */}
            <div className="pb-2">
              {(value.length > 0 ? filtered : trending.filter((t) => recents.includes(t.word))).map(
                ({ word, category }, i) => {
                  const isActive = cursor === i;
                  return (
                    <button
                      key={word}
                      onMouseDown={() => commit(word)}
                      onMouseEnter={() => setCursor(i)}
                      className={`w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 transition-colors duration-100 ${
                        isActive ? 'bg-[var(--card2)]' : 'hover:bg-[var(--card2)]'
                      }`}
                    >
                      <div className={`w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-[var(--primary-soft)]' : 'bg-[var(--card2)]'
                      }`}>
                        <Search className={`w-4 h-4 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`} />
                      </div>
                      <span className="flex-1 text-sm sm:text-base text-[var(--text)] text-left font-medium">{word}</span>
                      <span className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold ${categoryColor[category] ?? categoryColor['Noun']}`}>
                        {category}
                      </span>
                      {isActive && <ArrowRight className="w-4 h-4 text-[var(--primary)]" />}
                    </button>
                  );
                }
              )}
            </div>

            {/* Trending section */}
            {value.length === 0 && (
              <>
                <div className="h-px bg-[var(--border)] mx-4 sm:mx-5" />
                <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-2 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-[var(--fire)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Trending Today</span>
                </div>
                <div className="flex flex-wrap gap-2 px-4 sm:px-5 pb-4 sm:pb-5">
                  {trending.slice(0, 5).map(({ word, category }) => (
                    <button
                      key={word}
                      onMouseDown={() => commit(word)}
                      className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--card2)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] border border-[var(--border)] hover:border-[var(--primary)] rounded-full text-sm font-semibold text-[var(--text2)] transition-all duration-200"
                    >
                      <span className={`w-2 h-2 rounded-full ${categoryColor[category]?.split(' ')[0] ?? ''}`} />
                      {word}
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default SearchBar;
