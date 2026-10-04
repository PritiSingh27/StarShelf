import { forwardRef, useId } from 'react';

const Input = forwardRef(function Input(
  { label, error, helperText, className = '', type = 'text', ...props },
  ref
) {
  const generatedId = useId();
  const id = props.id || generatedId;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-ink">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-surface text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors ${
          error ? 'border-danger' : 'border-line'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {helperText && !error && <p className="text-xs text-muted">{helperText}</p>}
    </div>
  );
});

export default Input;
