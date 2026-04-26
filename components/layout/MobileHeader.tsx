'use client';
import { memo, useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bookmark, BookOpen, ListMusic, Settings, LogOut, Menu, X, Zap, Search, ChevronRight, Flame } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import TeluguWordsDropdown from './TeluguWordsDropdown';
import api from '@/lib/api';

const navItems = [
  { icon: Home,      label: 'Home',        path: '/',          desc: 'Dashboard & word of the day' },
  { icon: Bookmark,  label: 'Saved Words', path: '/saved',     desc: 'Your personal vocabulary'    },
  { icon: BookOpen,  label: 'AI Stories',  path: '/stories',   desc: 'Learn through narratives'    },
  { icon: ListMusic, label: 'Playlists',   path: '/playlists', desc: 'Curated word collections'    },
  { icon: Flame,     label: 'Streak',      path: '/streak',    desc: 'Your learning streak'        },
  { icon: Settings,  label: 'Settings',    path: '/settings',  desc: 'Preferences & themes'        },
];

const MobileHeader = memo(function MobileHeader() {
  const [open, setOpen]                   = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue]     = useState('');
  const pathname  = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const toggle    = useCallback(() => setOpen((v) => !v), []);
  const close     = useCallback(() => setOpen(false), []);
  const { user, logout } = useAuth();
  const router = useRouter();
  const handleLogout = useCallback(() => { logout(); router.replace('/login'); }, [logout, router]);
  const [streakCount, setStreakCount] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      api.get('/auth/streak-history')
        .then(r => setStreakCount(r.data.streakCount || 0))
        .catch(() => setStreakCount(0));
    }
  }, [user]);

  const navLinks = useMemo(
    () =>
      navItems.map(({ icon: Icon, label, path, desc }, i) => {
        const isActive = pathname === path;
        return (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
          >
            <Link
              href={path}
              onClick={close}
              className={`group flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--primary)] text-[var(--primary-fg)] shadow-[0_4px_12px_var(--primary-soft)]'
                  : 'text-[var(--text2)] hover:bg-[var(--card2)] hover:text-[var(--text)]'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isActive ? 'bg-white/20' : 'bg-[var(--card2)] group-hover:bg-[var(--border)]'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-none mb-0.5">{label}</p>
                <p className={`text-[11px] truncate transition-colors ${
                  isActive ? 'text-[var(--primary-fg)]/70' : 'text-[var(--muted)]'
                }`}>{desc}</p>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 transition-all ${
                isActive ? 'opacity-70' : 'opacity-0 group-hover:opacity-40 group-hover:translate-x-0.5'
              }`} />
            </Link>
          </motion.div>
        );
      }),
    [pathname, close]
  );

  return (
    <div className="lg:hidden">
      {/* ── Fixed Top bar ── */}
      <div className="glass fixed top-0 left-0 right-0 z-40 border-b border-[var(--border)] bg-[var(--nav)]">
        <div className="flex items-center gap-3 px-4 py-3">

          {/* Hamburger */}
          <motion.button
            onClick={toggle}
            whileTap={{ scale: 0.92 }}
            className="w-10 h-10 shrink-0 rounded-2xl bg-[var(--card2)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--border)] transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-4 h-4 text-[var(--text)]" />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="w-4 h-4 text-[var(--text)]" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Logo — collapses when search is focused */}
          <AnimatePresence initial={false}>
            {!searchFocused && (
              <motion.div
                key="logo"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5 overflow-hidden shrink-0"
              >
                <div className="w-8 h-8 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-[0_2px_8px_var(--primary-soft)]">
                  <Zap className="w-4 h-4 text-[var(--primary-fg)]" />
                </div>
                <div className="whitespace-nowrap">
                  <p className="text-sm font-extrabold text-[var(--text)] leading-none tracking-tight">Polyglot Punch</p>
                  <p className="text-[10px] text-[var(--muted)] leading-none mt-0.5">Mastering Momentum</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search */}
          <div className={`flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border-2 transition-all duration-200 ${
            searchFocused
              ? 'bg-[var(--input-bg)] border-[var(--primary)] shadow-[0_0_0_4px_var(--primary-soft)]'
              : 'bg-[var(--card2)] border-[var(--border)] hover:border-[var(--text2)]'
          }`}>
            <motion.div animate={searchFocused ? { scale: 1.1 } : { scale: 1 }} transition={{ duration: 0.15 }}>
              <Search className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                searchFocused ? 'text-[var(--primary)]' : 'text-[var(--muted)]'
              }`} />
            </motion.div>
            <input
              ref={searchRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search any word…"
              className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none min-w-0"
            />
            <AnimatePresence>
              {searchValue && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                  onMouseDown={() => { setSearchValue(''); searchRef.current?.focus(); }}
                  className="w-5 h-5 rounded-full bg-[var(--border)] flex items-center justify-center shrink-0 hover:bg-[var(--muted)] transition-colors"
                >
                  <X className="w-3 h-3 text-[var(--text2)]" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Telugu Words Dropdown */}
          <TeluguWordsDropdown />

          {/* Streak badge */}
          <button
            onClick={() => router.push('/streak')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--fire-soft)] border border-[var(--fire)]/20 shrink-0"
          >
            <Flame className="w-3.5 h-3.5 text-[var(--fire)]" />
            <span className="text-xs font-extrabold text-[var(--fire)]">{streakCount ?? '—'}</span>
          </button>
        </div>
      </div>

      {/* ── Drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={close}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 left-0 h-full w-[300px] max-w-[85vw] bg-[var(--card)] border-r border-[var(--border)] z-50 flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-[0_4px_12px_var(--primary-soft)]">
                    <Zap className="w-5 h-5 text-[var(--primary-fg)]" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-[var(--text)] leading-none tracking-tight">Polyglot Punch</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">Mastering Momentum</p>
                  </div>
                </div>
                <button
                  onClick={close}
                  className="w-8 h-8 rounded-xl bg-[var(--card2)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--border)] transition-colors"
                >
                  <X className="w-4 h-4 text-[var(--text2)]" />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {navLinks}
              </nav>

              {/* Footer */}
              <div className="px-4 pb-6 pt-4 border-t border-[var(--border)] space-y-3">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-[var(--card2)]">
                  <div className="w-8 h-8 rounded-xl overflow-hidden bg-[var(--primary-soft)] flex items-center justify-center shrink-0">
                    {user?.avatarUrl
                      ? <Image src={user.avatarUrl} alt={user.name} width={32} height={32} className="w-full h-full object-cover" />
                      : <span className="text-sm font-bold text-[var(--primary)]">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--text)] truncate">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-[var(--muted)] truncate">{user?.email || ''}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/10 text-red-500 rounded-2xl text-sm font-bold hover:bg-red-500/20 active:scale-[0.98] transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

export default MobileHeader;
