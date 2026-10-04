import { forwardRef, useId } from 'react';

const Textarea = forwardRef(function Textarea(
  { label, error, helperText, maxLength, value, className = '', ...props },
  ref
) {
  const generatedId = useId();
  const id = props.id || generatedId;
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-ink">
            {label}
          </label>
        )}
        {maxLength && (
          <span className="text-xs text-muted tabular-nums">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        ref={ref}
        id={id}
        maxLength={maxLength}
        value={value}
        className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-surface text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors ${
          error ? 'border-danger' : 'border-line'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {helperText && !error && <p className="text-xs text-muted">{helperText}</p>}
    </div>
  );
});

export default Textarea;
