'use client';
import { memo, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Flame, ChevronLeft, ChevronRight, Trophy, Zap, Calendar, Target } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

interface StreakData {
  streakCount: number;
  streakDates: string[];
  lastStreakDate: string | null;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default memo(function StreakPage() {
  const { user } = useAuth();
  const [data, setData]           = useState<StreakData>({ streakCount: 0, streakDates: [], lastStreakDate: null });
  const [loading, setLoading]     = useState(true);
  const scrollRef                 = useRef<HTMLDivElement>(null);
  const today                     = new Date();
  const currentYear               = today.getFullYear();

  useEffect(() => {
    api.get('/auth/streak-history')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Scroll to current month on load
  useEffect(() => {
    if (!scrollRef.current) return;
    const monthEl = scrollRef.current.querySelector(`[data-month="${today.getMonth()}"]`);
    monthEl?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [loading]);

  const streakSet = new Set(data.streakDates);

  const totalDays   = data.streakDates.length;
  const longestStreak = (() => {
    if (!data.streakDates.length) return 0;
    const sorted = [...data.streakDates].sort();
    let max = 1, cur = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diff = (curr.getTime() - prev.getTime()) / 86400000;
      cur = diff === 1 ? cur + 1 : 1;
      max = Math.max(max, cur);
    }
    return max;
  })();

  const thisMonthDays = data.streakDates.filter(d => d.startsWith(`${currentYear}-${String(today.getMonth() + 1).padStart(2, '0')}`)).length;

  const stats = [
    { icon: Flame,    label: 'Current Streak', value: `${data.streakCount}d`, color: 'text-[var(--fire)]',    bg: 'bg-[var(--fire-soft)]'    },
    { icon: Trophy,   label: 'Longest Streak', value: `${longestStreak}d`,    color: 'text-[var(--primary)]', bg: 'bg-[var(--primary-soft)]' },
    { icon: Calendar, label: 'Total Days',      value: String(totalDays),      color: 'text-[var(--blue)]',    bg: 'bg-[var(--blue-soft)]'    },
    { icon: Target,   label: 'This Month',      value: String(thisMonthDays),  color: 'text-[var(--fire)]',    bg: 'bg-[var(--fire-soft)]'    },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-[var(--bg)]">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] mb-1">Learning Journey</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text)]">
              Your <span className="text-[var(--fire)] italic">Streak</span>
            </h1>
            <p className="text-sm text-[var(--text2)] mt-1">
              {user?.name?.split(' ')[0]}, every day counts — keep the fire burning!
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 sm:mb-8"
          >
            {stats.map(({ icon: Icon, label, value, color, bg }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-[var(--text)] leading-none">{loading ? '—' : value}</p>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">{label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Hero streak banner */}
          {data.streakCount > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-5 mb-6 sm:mb-8">
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> On Fire
                  </p>
                  <p className="text-4xl font-extrabold text-white">{data.streakCount} <span className="text-2xl">days</span></p>
                  <p className="text-white/80 text-sm mt-1">Current learning streak</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Flame className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.div>
          )}

          {/* 12-month horizontal scroll calendar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden mb-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-sm font-extrabold text-[var(--text)]">{currentYear} Activity</h2>
                <p className="text-[10px] text-[var(--muted)]">Scroll to see all months</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-[var(--muted)]">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[var(--primary)] inline-block" /> Active</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[var(--card2)] border border-[var(--border)] inline-block" /> Inactive</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[var(--fire)] inline-block" /> Today</span>
              </div>
            </div>

            {/* Scroll buttons */}
            <div className="relative">
              <button onClick={() => scrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[var(--card)] border border-[var(--border)] shadow flex items-center justify-center hover:bg-[var(--card2)] transition-colors">
                <ChevronLeft className="w-4 h-4 text-[var(--text2)]" />
              </button>
              <button onClick={() => scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[var(--card)] border border-[var(--border)] shadow flex items-center justify-center hover:bg-[var(--card2)] transition-colors">
                <ChevronRight className="w-4 h-4 text-[var(--text2)]" />
              </button>

              <div ref={scrollRef} className="flex gap-4 overflow-x-auto hide-scroll px-10 py-5 scroll-smooth">
                {MONTHS.map((monthName, monthIdx) => {
                  const daysInMonth  = getDaysInMonth(currentYear, monthIdx);
                  const firstDay     = getFirstDayOfMonth(currentYear, monthIdx);
                  const isCurrentMonth = monthIdx === today.getMonth();
                  const monthActive  = data.streakDates.filter(d => d.startsWith(`${currentYear}-${String(monthIdx + 1).padStart(2, '0')}`)).length;

                  return (
                    <div key={monthIdx} data-month={monthIdx} className={`shrink-0 w-52 rounded-2xl border p-3 transition-all ${isCurrentMonth ? 'border-[var(--primary)] bg-[var(--primary-soft)]/30' : 'border-[var(--border)] bg-[var(--card2)]'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className={`text-xs font-extrabold ${isCurrentMonth ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>{monthName} {currentYear}</p>
                        {monthActive > 0 && (
                          <span className="text-[9px] font-bold bg-[var(--primary)] text-white px-1.5 py-0.5 rounded-full">{monthActive}d</span>
                        )}
                      </div>

                      {/* Day headers */}
                      <div className="grid grid-cols-7 gap-0.5 mb-1">
                        {DAYS.map(d => (
                          <div key={d} className="text-center text-[8px] font-bold text-[var(--muted)]">{d[0]}</div>
                        ))}
                      </div>

                      {/* Day cells */}
                      <div className="grid grid-cols-7 gap-0.5">
                        {Array.from({ length: firstDay }).map((_, i) => (
                          <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day      = i + 1;
                          const dateStr  = `${currentYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const isToday  = dateStr === today.toISOString().split('T')[0];
                          const isActive = streakSet.has(dateStr);
                          const isFuture = new Date(dateStr) > today;

                          return (
                            <div key={day} title={dateStr}
                              className={`w-full aspect-square rounded-sm flex items-center justify-center text-[8px] font-bold transition-all ${
                                isToday   ? 'bg-[var(--fire)] text-white ring-1 ring-[var(--fire)] ring-offset-1' :
                                isActive  ? 'bg-[var(--primary)] text-white' :
                                isFuture  ? 'bg-transparent' :
                                'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)]'
                              }`}>
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Recent activity list */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="text-sm font-extrabold text-[var(--text)]">Recent Activity</h2>
              <p className="text-[10px] text-[var(--muted)]">Last 14 days</p>
            </div>
            <div className="p-4">
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 14 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (13 - i));
                  const dateStr  = d.toISOString().split('T')[0];
                  const isActive = streakSet.has(dateStr);
                  const isToday  = i === 13;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                        isToday   ? 'bg-[var(--fire)] text-white shadow-lg' :
                        isActive  ? 'bg-[var(--primary)] text-white' :
                        'bg-[var(--card2)] border border-[var(--border)] text-[var(--muted)]'
                      }`}>
                        {isActive ? <Flame className="w-4 h-4" /> : d.getDate()}
                      </div>
                      <span className="text-[9px] text-[var(--muted)]">{DAYS[d.getDay()][0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </AppLayout>
  );
});
