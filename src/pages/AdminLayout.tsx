import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, LogOut, BarChart3, Radio, Sparkles, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import BrandMark from '../components/BrandMark';

const navItems = [
  { to: '/admin',             label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/admin/articles',    label: 'Articles',      icon: FileText },
  { to: '/admin/leads',       label: 'Leads',         icon: Users },
  { to: '/admin/trial-pool',  label: 'Trial Pool',    icon: Radio },
  { to: '/admin/analytics',   label: 'Analytics',     icon: BarChart3 },
  { to: '/admin/bot',         label: 'WhatsApp Bot',  icon: Settings },
  { to: '/admin/article-bot', label: 'Article Bot',   icon: Sparkles },
  { to: '/admin/reddit',      label: 'Reddit Scout',  icon: MessageSquare },
  { to: '/admin/pinterest-pins', label: 'Pinterest Pins', icon: ImageIcon },
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const nav = useNavigate();

  async function handleLogout() {
    await signOut();
    nav('/login');
  }

  return (
    <div className="min-h-screen bg-deep-black text-white flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <BrandMark className="w-9 h-9" variant="full" />
          <div>
            <p className="font-black text-sm tracking-tight">MediaHub</p>
            <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-600 font-bold">Admin</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-electric-blue/15 text-electric-blue border border-electric-blue/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-blue to-blue-800 flex items-center justify-center text-xs font-bold">
              {profile?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white truncate">{profile?.email}</p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
