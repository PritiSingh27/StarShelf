import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme selection"
      className="inline-flex items-center p-1 rounded-lg bg-bg border border-line text-xs font-medium"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(opt.value)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand ${
              isActive
                ? 'bg-surface text-brand-text shadow-sm font-semibold'
                : 'text-muted hover:text-ink'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
