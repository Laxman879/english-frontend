'use client';
import { memo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Check, Sun, Moon, Sparkles, Save, CheckCircle, Loader2, User, Mail, Bell, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import Image from 'next/image';

const LANGUAGES = [
  { code: 'Hindi',     flag: '🇮🇳' },
  { code: 'Telugu',    flag: '🇮🇳' },
  { code: 'Tamil',     flag: '🇮🇳' },
  { code: 'Kannada',   flag: '🇮🇳' },
  { code: 'Malayalam', flag: '🇮🇳' },
  { code: 'Bengali',   flag: '🇮🇳' },
  { code: 'Marathi',   flag: '🇮🇳' },
  { code: 'Gujarati',  flag: '🇮🇳' },
  { code: 'Punjabi',   flag: '🇮🇳' },
  { code: 'Odia',      flag: '🇮🇳' },
  { code: 'Urdu',      flag: '🇮🇳' },
  { code: 'Nepali',    flag: '🇳🇵' },
  { code: 'English',   flag: '🇬🇧' },
];

const THEMES = [
  { key: 'light',  label: 'Light',  icon: Sun      },
  { key: 'dark',   label: 'Dark',   icon: Moon     },
  { key: 'golden', label: 'Golden', icon: Sparkles },
] as const;

const REMINDER_TIMES = [
  { label: 'Early Bird',        time: '06:00 AM' },
  { label: 'Morning Rush',      time: '08:00 AM' },
  { label: 'Lunch Break',       time: '12:00 PM' },
  { label: 'Afternoon',         time: '03:00 PM' },
  { label: 'Evening Wind-down', time: '07:30 PM' },
  { label: 'Night Owl',         time: '10:00 PM' },
];

const Toggle = memo(function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${value ? 'bg-[var(--primary)]' : 'bg-[var(--card2)] border border-[var(--border)]'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${value ? 'left-6' : 'left-0.5'}`} />
    </button>
  );
});

export default memo(function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, logout }    = useAuth();
  const router              = useRouter();

  // Form state — initialized from user
  const [displayName,   setDisplayName]   = useState('');
  const [email,         setEmail]         = useState('');
  const [selectedLang,  setSelectedLang]  = useState('Hindi');
  const [reminders,     setReminders]     = useState(false);
  const [reminderTime,  setReminderTime]  = useState('08:00 AM');
  const [reminderRepeat,setReminderRepeat]= useState('daily');

  // UI state
  const [saving,          setSaving]          = useState(false);
  const [saveStatus,      setSaveStatus]      = useState<'idle'|'success'|'error'>('idle');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [originalData,    setOriginalData]    = useState<Record<string, string | boolean>>({});

  // Load user data on mount
  useEffect(() => {
    if (!user) return;
    const initial = {
      displayName:    user.name || '',
      email:          user.email || '',
      selectedLang:   (user as Record<string, unknown>).preferredLanguage as string || 'Hindi',
      reminders:      ((user as Record<string, unknown>).reminderFrequency as string || 'none') !== 'none',
      reminderTime:   (user as Record<string, unknown>).reminderTime as string || '08:00 AM',
      reminderRepeat: (user as Record<string, unknown>).reminderRepeat as string || 'daily',
    };
    setDisplayName(initial.displayName as string);
    setEmail(initial.email as string);
    setSelectedLang(initial.selectedLang as string);
    setReminders(initial.reminders as boolean);
    setReminderTime(initial.reminderTime as string);
    setReminderRepeat(initial.reminderRepeat as string);
    setOriginalData(initial);
  }, [user]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      await api.put('/auth/profile', {
        name:              displayName.trim(),
        preferredLanguage: selectedLang,
        reminderFrequency: reminders ? 'daily' : 'none',
        reminderTime,
        reminderRepeat,
      });
      setSaveStatus('success');
      setOriginalData({ displayName, email, selectedLang, reminders, reminderTime, reminderRepeat });
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } finally {
      setSaving(false);
    }
  }, [displayName, email, selectedLang, reminders, reminderTime, reminderRepeat]);

  const handleDiscard = useCallback(() => {
    setDisplayName(originalData.displayName as string);
    setEmail(originalData.email as string);
    setSelectedLang(originalData.selectedLang as string);
    setReminders(originalData.reminders as boolean);
    setReminderTime(originalData.reminderTime as string);
    setReminderRepeat(originalData.reminderRepeat as string);
    setSaveStatus('idle');
  }, [originalData]);

  const handleLogout = useCallback(() => {
    logout();
    router.replace('/login');
  }, [logout, router]);

  const isDirty = displayName !== originalData.displayName ||
    selectedLang !== originalData.selectedLang ||
    reminders !== originalData.reminders ||
    reminderTime !== originalData.reminderTime ||
    reminderRepeat !== originalData.reminderRepeat;

  return (
    <AppLayout>
      <div className="min-h-screen bg-[var(--bg)]">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 sm:mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] mb-1">Account Preferences</p>
            <div className="inline-flex items-center gap-1.5 bg-[var(--primary-soft)] text-[var(--primary)] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2">
              User Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text)]">
              Tailor Your <span className="text-[var(--primary)] font-extrabold italic">Momentum.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text2)] mt-2 max-w-md">
              Adjust your learning environment, set your language goals, and manage your daily educational cadence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

            {/* ── Left col ── */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-5">

              {/* Profile */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-lg">👤</span>
                  <h2 className="text-base font-extrabold text-[var(--text)]">Profile</h2>
                </div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--primary-soft)] flex items-center justify-center shrink-0">
                    {(user as Record<string, unknown>)?.avatarUrl
                      ? <Image src={(user as Record<string, unknown>).avatarUrl as string} alt={user?.name || ''} width={64} height={64} className="w-full h-full object-cover" />
                      : <span className="text-2xl font-extrabold text-[var(--primary)]">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                    }
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-[var(--text)]">{user?.name}</p>
                    <p className="text-xs text-[var(--muted)]">{user?.email}</p>
                    <span className="text-[10px] font-bold text-[var(--primary)] bg-[var(--primary-soft)] px-2 py-0.5 rounded-full mt-1 inline-block">Active Account</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5 flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Display Name
                    </label>
                    <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-soft)] transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> Email Address
                    </label>
                    <input value={email} disabled
                      className="w-full px-3 py-2.5 bg-[var(--card2)] border border-[var(--border)] rounded-xl text-sm text-[var(--muted)] cursor-not-allowed" />
                    <p className="text-[10px] text-[var(--muted)] mt-1">Email cannot be changed</p>
                  </div>
                </div>
              </motion.div>

              {/* Language */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                  <span className="text-lg">🌐</span>
                  <h2 className="text-base font-extrabold text-[var(--text)]">Target Language</h2>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-3">
                  Words will be translated to your selected language
                </p>
                <div className="relative">
                  <select
                    value={selectedLang}
                    onChange={e => setSelectedLang(e.target.value)}
                    className="w-full px-3 py-2.5 pr-9 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-sm font-semibold text-[var(--text)] focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-soft)] transition-all appearance-none cursor-pointer"
                  >
                    {LANGUAGES.map(({ code, flag }) => (
                      <option key={code} value={code}>{flag} {code}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
              </motion.div>

              {/* Appearance */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                  <span className="text-lg">🎨</span>
                  <h2 className="text-base font-extrabold text-[var(--text)]">Appearance</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {THEMES.map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setTheme(key)}
                      className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                        theme === key
                          ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
                          : 'border-[var(--border)] bg-[var(--card2)] hover:border-[var(--primary)]/50'
                      }`}>
                      <Icon className={`w-5 h-5 ${theme === key ? 'text-[var(--primary)]' : 'text-[var(--text2)]'}`} />
                      <span className={`text-xs font-bold ${theme === key ? 'text-[var(--primary)]' : 'text-[var(--text2)]'}`}>{label}</span>
                      {theme === key && <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ── Right col ── */}
            <div className="space-y-4 sm:space-y-5">

              {/* Reminders */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-4 h-4 text-[var(--primary)]" />
                  <h2 className="text-base font-extrabold text-[var(--text)]">Reminders</h2>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-[var(--text)]">Daily Reminders</span>
                  <Toggle value={reminders} onChange={() => setReminders(v => !v)} />
                </div>

                <AnimatePresence>
                  {reminders && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Preferred Time
                        </p>
                        <div className="space-y-1.5">
                          {REMINDER_TIMES.map(t => (
                            <button key={t.time} onClick={() => setReminderTime(t.time)}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                                reminderTime === t.time
                                  ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
                                  : 'border-[var(--border)] bg-[var(--card2)] hover:border-[var(--primary)]/50'
                              }`}>
                              <span className={`text-xs font-semibold ${reminderTime === t.time ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>{t.label}</span>
                              <span className={`text-xs font-bold ${reminderTime === t.time ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`}>{t.time}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Repeat</p>
                        <div className="flex gap-2">
                          {['daily', 'weekly', 'monthly'].map(r => (
                            <button key={r} onClick={() => setReminderRepeat(r)}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                                reminderRepeat === r
                                  ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]'
                                  : 'border-[var(--border)] bg-[var(--card2)] text-[var(--text2)] hover:border-[var(--primary)]/50'
                              }`}>
                              {r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Account Access */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-[var(--card)] rounded-2xl border border-red-500/20 p-4 sm:p-5">
                <h3 className="text-sm font-extrabold text-[var(--text)] mb-1">Account Access</h3>
                <p className="text-xs text-[var(--text2)] mb-3">Securely sign out of your profile</p>
                <button onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-500/20 active:scale-95 transition-all">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </motion.div>

              {/* Stats summary */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 sm:p-5">
                <h3 className="text-sm font-extrabold text-[var(--text)] mb-3">Your Settings</h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'Language',  value: selectedLang },
                    { label: 'Theme',     value: theme.charAt(0).toUpperCase() + theme.slice(1) },
                    { label: 'Reminders', value: reminders ? `${reminderTime} (${reminderRepeat})` : 'Off' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-[var(--muted)]">{label}</span>
                      <span className="text-xs font-bold text-[var(--text)]">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Save bar */}
          <div className="flex items-center justify-between gap-3 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[var(--border)]">
            <div>
              {saveStatus === 'error' && <p className="text-xs text-red-500 font-semibold">❌ Failed to save. Please try again.</p>}
              {!isDirty && saveStatus === 'idle' && <p className="text-xs text-[var(--muted)]">No unsaved changes</p>}
              {isDirty && <p className="text-xs text-[var(--primary)] font-semibold">● Unsaved changes</p>}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleDiscard} disabled={!isDirty}
                className="px-4 sm:px-5 py-2.5 text-sm font-semibold text-[var(--text2)] hover:text-[var(--text)] disabled:opacity-40 active:scale-95 transition-all">
                Discard
              </button>
              <button onClick={handleSave} disabled={saving || !isDirty}
                className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 ${
                  saveStatus === 'success'
                    ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
                    : 'bg-[var(--primary)] text-[var(--primary-fg)] hover:opacity-90'
                }`}>
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : saveStatus === 'success'
                  ? <><Check className="w-4 h-4" /> Saved!</>
                  : <><Save className="w-4 h-4" /> Save Preferences</>
                }
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }} transition={{ duration: 0.25 }}
              className="relative bg-[var(--card)] rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col items-center text-center z-10">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-5">
                <LogOut className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-extrabold text-[var(--text)] mb-2">Wait, leaving so soon?</h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-7">
                Are you sure you want to log out? Your momentum progress is saved!
              </p>
              <button onClick={() => setShowLogoutModal(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--primary)] text-white rounded-full text-sm font-bold hover:opacity-90 transition-opacity mb-3">
                <CheckCircle className="w-4 h-4" /> Keep Learning
              </button>
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--card2)] text-[var(--text2)] rounded-full text-sm font-semibold hover:bg-[var(--border)] transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
});
