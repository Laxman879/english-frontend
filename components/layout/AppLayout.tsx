'use client';
import { memo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import TeluguWordsDropdown from './TeluguWordsDropdown';
import { Flame } from 'lucide-react';
import api from '@/lib/api';

const AppLayout = memo(function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [streakCount, setStreakCount] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      api.get('/auth/streak-history')
        .then(r => setStreakCount(r.data.streakCount || 0))
        .catch(() => setStreakCount(0));
    }
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        {/* Top bar — desktop */}
        <div className="hidden lg:flex items-center justify-between px-6 py-2.5 border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-30">
          {/* Streak badge */}
          <button
            onClick={() => router.push('/streak')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--fire-soft)] border border-[var(--fire)]/20 hover:border-[var(--fire)]/60 transition-all group"
          >
            <Flame className="w-4 h-4 text-[var(--fire)] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-extrabold text-[var(--fire)]">
              {streakCount !== null ? streakCount : '—'}
            </span>
            <span className="text-xs text-[var(--fire)]/70 font-semibold">day streak</span>
          </button>

          <TeluguWordsDropdown />
        </div>
        <main className="flex-1 min-w-0 pt-[57px] lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
});

export default AppLayout;
