import { useState, useEffect, useCallback } from 'react';
import { Store, Star, Users, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../api/axios.js';
import { useUrlState } from '../../hooks/useUrlState.js';
import { formatRating, formatDate, formatRelativeTime } from '../../lib/format.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import StatCard from '../../components/StatCard.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import SortableTh from '../../components/ui/SortableTh.jsx';
import RatingDistribution from '../../components/RatingDistribution.jsx';

export default function OwnerDashboard() {
  const [getParam, setParams] = useUrlState();

  const sortByParam = getParam('sortBy', 'ratedAt');
  const orderParam = getParam('order', 'desc');
  const pageParam = Number(getParam('page', '1'));
  const limitParam = Number(getParam('limit', '10'));

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/owner/dashboard', {
        params: {
          page: pageParam,
          limit: limitParam,
          sortBy: sortByParam,
          order: orderParam,
        },
      });
      setDashboardData(response.data);
    } catch {
      toast.error('Failed to load store dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [pageParam, limitParam, sortByParam, orderParam]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSort = (field) => {
    const nextOrder = sortByParam === field && orderParam === 'asc' ? 'desc' : 'asc';
    setParams({ sortBy: field, order: nextOrder, page: '1' });
  };

  const handlePageChange = (newPage) => {
    setParams({ page: String(newPage) });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Store Dashboard" description="Overview of your store ratings and customer reviews" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!dashboardData || !dashboardData.store) {
    return (
      <div className="space-y-6">
        <PageHeader title="Store Dashboard" description="Overview of your store ratings and customer reviews" />
        <EmptyState
          icon={Store}
          title="No store assigned yet"
          description="Your account is registered as a Store Owner, but no store is linked to your account yet. Please contact a system administrator to link your store."
        />
      </div>
    );
  }

  const { store, averageRating, ratingCount, distribution, raters } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title={store.name}
          description={`${store.address} ${store.category ? `• ${store.category.name}` : ''}`}
        />
        {store.category && (
          <div>
            <Badge variant="brand">{store.category.name}</Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Average Rating"
          value={formatRating(averageRating)}
          icon={Star}
          subtitle={averageRating ? `${averageRating} out of 5 stars` : 'No ratings yet'}
        />
        <StatCard
          title="Total Reviews"
          value={ratingCount}
          icon={Users}
          subtitle="Customer responses received"
        />
        <StatCard
          title="Written Comments"
          value={raters.data.filter((r) => r.comment).length}
          icon={MessageSquare}
          subtitle="Reviews with written feedback"
        />
      </div>

      <Card className="p-5">
        <h3 className="text-base font-semibold text-ink mb-4">Rating Breakdown</h3>
        <RatingDistribution distribution={distribution} totalCount={ratingCount} />
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">Customer Reviews</h3>
          <span className="text-xs text-muted font-medium">
            Showing {raters.data.length} of {raters.meta.total} ratings
          </span>
        </div>

        {raters.data.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No customer ratings yet"
            description="When users rate your store, their ratings and reviews will appear here."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-line bg-bg/50">
                    <SortableTh
                      field="name"
                      currentSort={sortByParam}
                      currentOrder={orderParam}
                      onSort={handleSort}
                    >
                      Customer
                    </SortableTh>
                    <SortableTh
                      field="value"
                      currentSort={sortByParam}
                      currentOrder={orderParam}
                      onSort={handleSort}
                    >
                      Rating
                    </SortableTh>
                    <th className="px-4 py-3 text-xs font-semibold text-muted tracking-wider uppercase">
                      Comment
                    </th>
                    <SortableTh
                      field="ratedAt"
                      currentSort={sortByParam}
                      currentOrder={orderParam}
                      onSort={handleSort}
                    >
                      Date
                    </SortableTh>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {raters.data.map((rater) => (
                    <tr key={rater.id} className="hover:bg-bg/40 transition-colors">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-ink">{rater.name}</div>
                        <div className="text-xs text-muted">{rater.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-ink">{rater.value}</span>
                          <Star className="w-4 h-4 fill-star text-star" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink max-w-xs break-words">
                        {rater.comment ? (
                          <span>{rater.comment}</span>
                        ) : (
                          <span className="text-xs text-muted italic">No comment provided</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                        <div title={formatDate(rater.ratedAt)}>{formatRelativeTime(rater.ratedAt)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={raters.meta.page}
              totalPages={raters.meta.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </Card>
    </div>
  );
}
