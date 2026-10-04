import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Badge from '../ui/Badge.jsx';

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const roleVariant = user.role === 'ADMIN' ? 'admin' : user.role === 'OWNER' ? 'owner' : 'user';

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-bg transition-colors focus:outline-none focus:ring-2 focus:ring-brand"
      >
        <div className="w-8 h-8 rounded-full bg-brand-soft text-brand-text font-bold text-xs flex items-center justify-center border border-brand/20">
          {initials}
        </div>
        <span className="hidden sm:block text-xs font-semibold text-ink max-w-[120px] truncate">
          {user.name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-surface p-2 shadow-xl z-50 divide-y divide-line">
          <div className="px-3 py-2 space-y-1">
            <p className="text-xs font-bold text-ink truncate">{user.name}</p>
            <p className="text-xs text-muted truncate">{user.email}</p>
            <div className="pt-1">
              <Badge variant={roleVariant}>{user.role}</Badge>
            </div>
          </div>
          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-ink hover:bg-bg rounded-lg transition-colors"
            >
              <User className="w-4 h-4 text-muted" />
              <span>Profile settings</span>
            </Link>
          </div>
          <div className="pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
