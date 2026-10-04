import { Check, X } from 'lucide-react';

export default function PasswordStrength({ password = '' }) {
  if (!password) return null;

  const hasLength = password.length >= 8 && password.length <= 16;
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const passedCount = [hasLength, hasUpper, hasSpecial].filter(Boolean).length;

  let strengthLabel = 'Weak';
  let strengthColor = 'bg-danger';

  if (passedCount === 2) {
    strengthLabel = 'Medium';
    strengthColor = 'bg-amber-500';
  } else if (passedCount === 3) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
  }

  const rules = [
    { label: '8 to 16 characters', passed: hasLength },
    { label: 'At least one uppercase letter (A-Z)', passed: hasUpper },
    { label: 'At least one special character (!@#$...)', passed: hasSpecial },
  ];

  return (
    <div className="space-y-2 pt-1 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-muted font-medium">Password strength:</span>
        <span className="font-semibold text-ink">{strengthLabel}</span>
      </div>

      <div className="h-1.5 w-full bg-bg rounded-full overflow-hidden border border-line flex gap-1 p-0.5">
        <div className={`h-full rounded-full transition-all ${passedCount >= 1 ? strengthColor : 'bg-transparent'} w-1/3`} />
        <div className={`h-full rounded-full transition-all ${passedCount >= 2 ? strengthColor : 'bg-transparent'} w-1/3`} />
        <div className={`h-full rounded-full transition-all ${passedCount === 3 ? strengthColor : 'bg-transparent'} w-1/3`} />
      </div>

      <div className="space-y-1 pt-1">
        {rules.map((rule, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs">
            {rule.passed ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-muted shrink-0" />
            )}
            <span className={rule.passed ? 'text-ink font-medium' : 'text-muted'}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
