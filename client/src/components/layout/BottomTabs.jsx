import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function BottomTabs() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navLinks = [];
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

  if (navLinks.length === 0) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-md border-t border-line px-2 py-1 flex items-center justify-around pb-safe">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? 'text-brand-text font-bold' : 'text-muted hover:text-ink'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-brand-text' : 'text-muted'}`} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
