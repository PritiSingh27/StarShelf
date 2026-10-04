import { Link, useLocation } from 'react-router-dom';
import { Store, LayoutDashboard, Users, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from '../ThemeToggle.jsx';
import ProfileMenu from './ProfileMenu.jsx';

export default function TopNav() {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [];
  if (user) {
    if (user.role === 'ADMIN') {
      navLinks.push(
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/stores', label: 'Stores', icon: ShoppingBag }
      );
    } else if (user.role === 'OWNER') {
      navLinks.push({ path: '/owner', label: 'Dashboard', icon: LayoutDashboard });
    } else {
      navLinks.push({ path: '/stores', label: 'Stores', icon: ShoppingBag });
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-line">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-black text-lg text-ink tracking-tight">
            <div className="p-1.5 rounded-lg bg-brand text-white">
              <Store className="w-5 h-5" />
            </div>
            <span>StarShelf</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-brand-soft text-brand-text font-bold'
                        : 'text-muted hover:text-ink hover:bg-bg'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && <ProfileMenu />}
        </div>
      </div>
    </header>
  );
}
