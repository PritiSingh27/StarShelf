import { forwardRef, useId } from 'react';

const Select = forwardRef(function Select(
  { label, error, options = [], className = '', ...props },
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
      <select
        ref={ref}
        id={id}
        className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors ${
          error ? 'border-danger' : 'border-line'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Select;
