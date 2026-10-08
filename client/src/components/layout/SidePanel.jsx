import { Link, useLocation } from 'react-router-dom';
import { Store, LayoutDashboard, Users, ShoppingBag, UserCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from '../ThemeToggle.jsx';

export default function SidePanel() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [];
  if (user) {
    if (user.role === 'ADMIN') {
      navLinks.push(
        { path: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', label: 'User Directory', icon: Users },
        { path: '/admin/stores', label: 'Store Directory', icon: ShoppingBag }
      );
    } else if (user.role === 'OWNER') {
      navLinks.push(
        { path: '/owner', label: 'Owner Dashboard', icon: LayoutDashboard }
      );
    } else {
      navLinks.push(
        { path: '/stores', label: 'Stamp Discovery', icon: ShoppingBag }
      );
    }
    navLinks.push({ path: '/profile', label: 'My Profile', icon: UserCheck });
  }

  return (
    <aside className="w-full md:w-64 bg-surface border-b md:border-b-0 md:border-r border-line md:fixed md:inset-y-0 md:left-0 flex flex-col justify-between z-40 p-4 shadow-sm">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="stamp-perforated p-2 border border-line bg-secondary text-white shadow-2xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="stamp-font-title text-xl text-ink font-bold block leading-none">StarShelf</span>
              <span className="stamp-font-body text-[10px] text-muted tracking-widest uppercase block font-semibold mt-0.5">
                {user?.role || 'STAMP ALBUM'}
              </span>
            </div>
          </Link>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>

        {user && (
          <nav className="space-y-1.5" aria-label="Vertical navigation panel">
            <div className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
              Navigation Panel
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`stamp-perforated flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-bold transition-all border ${
                    isActive
                      ? 'bg-secondary text-white border-secondary shadow-2xs'
                      : 'bg-surface text-ink border-line hover:border-secondary/50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {user && (
        <div className="pt-4 border-t border-line/60 space-y-3">
          <div className="hidden md:flex items-center justify-between">
            <span className="text-xs text-muted font-medium">Theme Mode</span>
            <ThemeToggle />
          </div>

          <div className="p-3 rounded bg-bg/60 border border-line/60 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-ink truncate">{user.name}</div>
              <div className="text-[10px] text-muted truncate">{user.email}</div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded hover:bg-danger/10 text-muted hover:text-danger transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
