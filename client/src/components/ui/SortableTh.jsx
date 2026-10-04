import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function SortableTh({
  children,
  field,
  currentSort,
  currentOrder,
  onSort,
  className = '',
}) {
  const isSorted = currentSort === field;

  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-muted tracking-wider uppercase ${className}`}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1.5 hover:text-ink transition-colors focus:outline-none focus:text-ink"
      >
        <span>{children}</span>
        {isSorted ? (
          currentOrder === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5 text-brand" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-brand" />
          )
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
        )}
      </button>
    </th>
  );
}
