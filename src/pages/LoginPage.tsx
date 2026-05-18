import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import BrandMark from '../components/BrandMark';

export default function LoginPage() {
  const { session, signIn, loading } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && session) {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/admin';
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    nav('/admin', { replace: true });
  }

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Ambient bg */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-electric-blue/15 rounded-full blur-[200px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-luxury-gold/8 rounded-full blur-[200px]" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 glass-card rounded-3xl p-10 w-full max-w-md shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <BrandMark className="w-14 h-14 mb-4" variant="full" />
          <h1 className="text-2xl font-black uppercase tracking-tighter">Admin Portal</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-600 font-bold mt-2">MediaHubAccess</p>
        </div>

        <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Email</label>
        <div className="relative mb-5">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-electric-blue/60 transition-colors"
            placeholder="admin@mediahubaccess.com"
          />
        </div>

        <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Password</label>
        <div className="relative mb-6">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-electric-blue/60 transition-colors"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-electric-blue hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_30px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Signing in…' : (<>Sign In <ArrowRight className="w-4 h-4" /></>)}
        </button>
      </form>
    </div>
  );
}
