import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

type Props = {
  children: ReactNode;
  requireAdmin?: boolean;
};

export default function RequireAuth({ children, requireAdmin = false }: Props) {
  const { session, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-black">
        <div className="text-zinc-500 text-xs uppercase tracking-[0.3em] animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-black p-6">
        <div className="glass-card rounded-2xl p-10 max-w-md text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-red-400 font-bold mb-3">Access denied</p>
          <p className="text-zinc-400">Your account doesn't have admin privileges.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
