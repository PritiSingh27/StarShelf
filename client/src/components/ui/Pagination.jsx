import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button.jsx';
import Select from './Select.jsx';

export default function Pagination({
  page = 1,
  limit = 10,
  total = 0,
  totalPages = 1,
  onPageChange,
  onLimitChange,
}) {
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-1 text-xs text-muted border-t border-line mt-4">
      <div className="flex items-center gap-2">
        <span>Showing <strong className="font-semibold text-ink tabular-nums">{start}</strong> to <strong className="font-semibold text-ink tabular-nums">{end}</strong> of <strong className="font-semibold text-ink tabular-nums">{total}</strong> results</span>
        {onLimitChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Per page:</span>
            <Select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              options={[
                { value: 10, label: '10' },
                { value: 20, label: '20' },
                { value: 50, label: '50' },
              ]}
              className="py-1 px-2 text-xs w-auto"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>
        <span className="px-2 font-medium text-ink tabular-nums">
          Page {page} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
