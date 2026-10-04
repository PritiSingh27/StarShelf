import { Star } from 'lucide-react';

export default function RatingDistribution({ distribution = [], totalCount = 0 }) {
  const items = [5, 4, 3, 2, 1].map((starVal) => {
    const found = distribution.find((d) => d.rating === starVal);
    const count = found ? found.count : 0;
    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { rating: starVal, count, percentage };
  });

  return (
    <div className="space-y-2 text-xs">
      {items.map((item) => (
        <div key={item.rating} className="flex items-center gap-3">
          <div className="flex items-center gap-1 w-10 text-muted font-medium">
            <span>{item.rating}</span>
            <Star className="w-3.5 h-3.5 fill-star text-star" />
          </div>
          <div className="flex-1 h-2 rounded-full bg-bg overflow-hidden border border-line">
            <div
              className="h-full bg-star transition-all duration-300 rounded-full"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
          <span className="w-12 text-right text-muted tabular-nums font-mono">
            {item.count} ({item.percentage}%)
          </span>
        </div>
      ))}
    </div>
  );
}
