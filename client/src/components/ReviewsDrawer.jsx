import { useState, useEffect, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import { api } from '../api/axios.js';
import { formatRelativeTime } from '../lib/format.js';
import Drawer from './ui/Drawer.jsx';
import StarRating from './StarRating.jsx';
import Button from './ui/Button.jsx';
import Skeleton from './ui/Skeleton.jsx';
import EmptyState from './ui/EmptyState.jsx';

export default function ReviewsDrawer({ isOpen, onClose, store }) {
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchReviews = useCallback(async (page = 1) => {
    if (!store) return;
    if (page === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const res = await api.get(`/stores/${store.id}/reviews`, {
        params: { page, limit: 10 },
      });
      if (page === 1) {
        setReviews(res.data.data);
      } else {
        setReviews((prev) => [...prev, ...res.data.data]);
      }
      setMeta(res.data.meta);
    } catch {
      // Handled by interceptor
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [store]);

  useEffect(() => {
    if (isOpen && store) {
      fetchReviews(1);
    } else {
      setReviews([]);
    }
  }, [isOpen, store, fetchReviews]);

  const handleLoadMore = () => {
    if (meta.page < meta.totalPages) {
      fetchReviews(meta.page + 1);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={store ? `Reviews - ${store.name}` : 'Reviews'}>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          title="No written reviews yet"
          description="Be the first user to submit a rating with a written comment!"
        />
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl border border-line bg-surface space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">{rev.reviewerName}</span>
                  <span className="text-[11px] text-muted">{formatRelativeTime(rev.createdAt)}</span>
                </div>
                <StarRating value={rev.value} readOnly size="sm" />
                <p className="text-xs text-ink/90 leading-relaxed whitespace-pre-wrap">{rev.comment}</p>
              </div>
            ))}
          </div>

          {meta.page < meta.totalPages && (
            <div className="pt-2 text-center">
              <Button variant="outline" size="sm" isLoading={isLoadingMore} onClick={handleLoadMore}>
                <MessageSquare className="w-4 h-4" />
                <span>Load more reviews</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
