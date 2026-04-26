'use client';
import { memo, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bookmark, BookOpen, ListMusic, Settings, LogOut, Zap, Flame } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const navItems = [
  { icon: Home,      label: 'Home',        path: '/'          },
  { icon: Bookmark,  label: 'Saved Words', path: '/saved'     },
  { icon: BookOpen,  label: 'AI Stories',  path: '/stories'   },
  { icon: ListMusic, label: 'Playlists',   path: '/playlists' },
  { icon: Flame,     label: 'Streak',      path: '/streak'    },
  { icon: Settings,  label: 'Settings',    path: '/settings'  },
];

const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => { logout(); router.replace('/login'); };

  const navLinks = useMemo(
    () =>
      navItems.map(({ icon: Icon, label, path }) => {
        const isActive = pathname === path;
        return (
          <Link
            key={label}
            href={path}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
              isActive
                ? 'bg-[var(--primary)] text-[var(--primary-fg)]'
                : 'text-[var(--text2)] hover:bg-[var(--card2)] hover:text-[var(--text)]'
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white/40 rounded-r-full" />
            )}
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        );
      }),
    [pathname]
  );

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-[var(--card)] border-r border-[var(--border)] justify-between sticky top-0 h-screen">
      {/* Logo */}
      <div className="p-5">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-xl bg-[var(--primary)] flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-[var(--primary-fg)]" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-[var(--text)] leading-none">Polyglot Punch</h1>
            <p className="text-[10px] text-[var(--muted)] mt-0.5">Mastering Momentum</p>
          </div>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-2 px-3">Menu</p>
        <nav className="space-y-1">{navLinks}</nav>
      </div>

      {/* Bottom */}
      <div className="p-5 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="w-8 h-8 rounded-full bg-[var(--primary-soft)] overflow-hidden flex items-center justify-center text-sm font-bold text-[var(--primary)] shrink-0">
            {user?.avatarUrl
              ? <Image src={user.avatarUrl} alt={user.name} width={32} height={32} className="w-full h-full object-cover" />
              : <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
            }
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[var(--text)] truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-[var(--muted)] truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
});

export default Sidebar;
