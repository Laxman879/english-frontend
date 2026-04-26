'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Sparkles, Globe } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, user } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState<{ name: string; avatarUrl?: string; email: string } | null>(null);

  const handleGoogle = useGoogleLogin({
    onSuccess: async (res) => {
      try {
        setLoading(true);
        setError('');
        const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${res.access_token}` },
        });
        const profile = await r.json();
        await loginWithGoogle(res.access_token);
        showWelcome({ name: profile.name, avatarUrl: profile.picture, email: profile.email });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
        console.error('Google login error:', err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error('Google login error:', err);
      setError('Google sign-in failed. Please try again.');
    },
  });

  const showWelcome = (u: { name: string; avatarUrl?: string; email: string }) => {
    setWelcomeUser(u);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');
      await loginWithEmail(email, password);
      showWelcome({ name: data.user.name, avatarUrl: data.user.avatarUrl, email: data.user.email });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">

      {/* Welcome Modal */}
      <AnimatePresence>
        {welcomeUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center text-center"
            >
              {/* Confetti dots */}
              <div className="flex gap-1 mb-5">
                {['bg-[var(--primary)]','bg-[var(--blue)]','bg-[var(--fire)]','bg-[var(--primary)]','bg-[var(--blue)]'].map((c, i) => (
                  <motion.span key={i} className={`w-2 h-2 rounded-full ${c}`}
                    initial={{ y: 0 }} animate={{ y: [0, -8, 0] }}
                    transition={{ delay: i * 0.1, repeat: Infinity, duration: 1.2 }} />
                ))}
              </div>

              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[var(--primary)] shadow-lg">
                  {welcomeUser.avatarUrl ? (
                    <Image src={welcomeUser.avatarUrl} alt={welcomeUser.name} width={80} height={80} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[var(--primary-soft)] flex items-center justify-center text-2xl font-extrabold text-[var(--primary)]">
                      {welcomeUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center shadow">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-1">Welcome back</p>
              <h2 className="text-2xl font-extrabold text-[var(--text)] mb-1">{welcomeUser.name}</h2>
              <p className="text-sm text-[var(--muted)] mb-6">{welcomeUser.email}</p>

              <button
                onClick={() => router.replace('/')}
                className="w-full py-3 bg-[var(--primary)] text-[var(--primary-fg)] rounded-2xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
              >
                Let's Go
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--primary-soft)] mb-4">
            <Globe className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text)]">Welcome to LinguaFlow</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Sign in to continue</p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-lg p-8 space-y-5">
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-center">
              {error}
            </p>
          )}

          {/* Google */}
          <button
            onClick={() => handleGoogle()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 border border-[var(--border)] rounded-xl text-sm font-semibold hover:bg-[var(--card2)] transition-colors disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--muted)]">or</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--primary)] text-[var(--primary-fg)] rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Forgot */}
          <div className="text-center">
            <a href="#" className="text-xs text-[var(--primary)] hover:underline">Forgot password?</a>
          </div>

          {/* Sign up */}
          <p className="text-center text-xs text-[var(--muted)]">
            Need an account?{' '}
            <a href="/signup" className="text-[var(--primary)] font-semibold hover:underline">Sign up</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
