import { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  showText = false,
  className = '',
}) {
  const [hoverValue, setHoverValue] = useState(null);
  const [poppingIndex, setPoppingIndex] = useState(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  const handleSelect = (newValue) => {
    if (readOnly || !onChange) return;
    setPoppingIndex(newValue);
    setTimeout(() => setPoppingIndex(null), 300);
    onChange(newValue);
  };

  const handleKeyDown = (e) => {
    if (readOnly || !onChange) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(5, (value || 0) + 1);
      handleSelect(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(1, (value || 1) - 1);
      handleSelect(prev);
    }
  };

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={readOnly ? `Rating ${value} out of 5 stars` : 'Rate from 1 to 5 stars'}
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={handleKeyDown}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFull = displayValue >= starIndex;
        const isHalf = !isFull && displayValue >= starIndex - 0.5;
        const isPopping = poppingIndex !== null && starIndex <= poppingIndex;

        return (
          <button
            key={starIndex}
            type="button"
            disabled={readOnly}
            role={readOnly ? 'presentation' : 'radio'}
            aria-checked={value === starIndex}
            onClick={() => handleSelect(starIndex)}
            onMouseEnter={() => !readOnly && setHoverValue(starIndex)}
            onMouseLeave={() => !readOnly && setHoverValue(null)}
            className={`p-0.5 transition-transform ${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } ${isPopping ? 'animate-bounce' : ''}`}
          >
            {isFull ? (
              <Star className={`${sizes[size]} fill-star text-star`} />
            ) : isHalf ? (
              <StarHalf className={`${sizes[size]} fill-star text-star`} />
            ) : (
              <Star className={`${sizes[size]} text-line fill-surface`} />
            )}
          </button>
        );
      })}
      {showText && (
        <span className="ml-1.5 text-xs font-semibold text-ink tabular-nums">
          {value ? Number(value).toFixed(1) : 'Not rated'}
        </span>
      )}
    </div>
  );
}
