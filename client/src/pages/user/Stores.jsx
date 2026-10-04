import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Star, MessageSquare, LayoutGrid, List, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../api/axios.js';
import { useUrlState } from '../../hooks/useUrlState.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { formatRating } from '../../lib/format.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import StarRating from '../../components/StarRating.jsx';
import CategoryChips from '../../components/CategoryChips.jsx';
import ReviewsDrawer from '../../components/ReviewsDrawer.jsx';

export default function UserStores() {
  const [getParam, setParams] = useUrlState();

  const searchParam = getParam('search', '');
  const categoryParam = getParam('categoryId', '');
  const sortByParam = getParam('sortBy', 'name');
  const orderParam = getParam('order', 'asc');
  const pageParam = Number(getParam('page', '1'));
  const limitParam = Number(getParam('limit', '10'));

  const [searchInput, setSearchInput] = useState(searchParam);
  const debouncedSearch = useDebounce(searchInput, 300);

  const [storesData, setStoresData] = useState({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  const [activeReviewStore, setActiveReviewStore] = useState(null);
  const [editingCommentStoreId, setEditingCommentStoreId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);

  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setParams({
      search: debouncedSearch || undefined,
      page: 1,
    });
  }, [debouncedSearch, setParams]);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/stores', {
        params: {
          search: searchParam || undefined,
          categoryId: categoryParam || undefined,
          sortBy: sortByParam,
          order: orderParam,
          page: pageParam,
          limit: limitParam,
        },
      });
      setStoresData(res.data);
    } catch {
      // Handled by interceptor
    } finally {
      setIsLoading(false);
    }
  }, [searchParam, categoryParam, sortByParam, orderParam, pageParam, limitParam]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleRateStore = async (storeId, newRatingValue) => {
    const storeIndex = storesData.data.findIndex((s) => s.id === storeId);
    if (storeIndex === -1) return;

    const previousStoresData = { ...storesData };
    const targetStore = storesData.data[storeIndex];

    const updatedList = [...storesData.data];
    updatedList[storeIndex] = {
      ...targetStore,
      myRating: newRatingValue,
    };

    setStoresData((prev) => ({ ...prev, data: updatedList }));

    try {
      const res = await api.put(`/stores/${storeId}/rating`, {
        value: newRatingValue,
      });

      const finalStores = [...storesData.data];
      finalStores[storeIndex] = {
        ...targetStore,
        overallRating: res.data.overallRating,
        ratingCount: res.data.ratingCount,
        myRating: res.data.myRating,
        myComment: res.data.myComment,
      };

      setStoresData((prev) => ({ ...prev, data: finalStores }));
      toast.success(`Rating submitted for ${targetStore.name}`);
    } catch (err) {
      setStoresData(previousStoresData);
      const msg = err.response?.data?.message || 'Failed to submit rating.';
      toast.error(msg);
    }
  };

  const handleOpenCommentEditor = (store) => {
    setEditingCommentStoreId(store.id);
    setCommentText(store.myComment || '');
  };

  const handleSaveComment = async (store) => {
    if (!store.myRating) {
      toast.error('Please submit a star rating before adding a comment.');
      return;
    }

    setIsSavingComment(true);
    try {
      const res = await api.put(`/stores/${store.id}/rating`, {
        value: store.myRating,
        comment: commentText,
      });

      const updatedStores = storesData.data.map((s) => {
        if (s.id === store.id) {
          return {
            ...s,
            myComment: res.data.myComment,
          };
        }
        return s;
      });

      setStoresData((prev) => ({ ...prev, data: updatedStores }));
      setEditingCommentStoreId(null);
      toast.success('Comment saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save comment.');
    } finally {
      setIsSavingComment(false);
    }
  };

  const sortOptions = [
    { value: 'name:asc', label: 'Name (A-Z)' },
    { value: 'name:desc', label: 'Name (Z-A)' },
    { value: 'rating:desc', label: 'Rating (High to Low)' },
    { value: 'top:desc', label: 'Top Rated (Weighted)' },
    { value: 'address:asc', label: 'Address (A-Z)' },
  ];

  const handleSortChange = (val) => {
    const [sortBy, order] = val.split(':');
    setParams({ sortBy, order, page: 1 });
  };

  const currentSortKey = `${sortByParam}:${orderParam}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Discover & Rate Stores"
        description="Search registered stores, filter by category, submit ratings, and read customer reviews."
      />

      <div className="space-y-4">
        <CategoryChips
          categories={categories}
          selectedCategory={categoryParam ? Number(categoryParam) : null}
          onSelect={(catId) => setParams({ categoryId: catId || undefined, page: 1 })}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-3 rounded-xl border border-line shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by store name or address..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <Select
              value={currentSortKey}
              onChange={(e) => handleSortChange(e.target.value)}
              options={sortOptions}
              className="py-1.5 text-xs w-48"
            />

            <div className="flex items-center p-1 rounded-lg bg-bg border border-line">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-surface text-brand-text shadow-sm' : 'text-muted hover:text-ink'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-surface text-brand-text shadow-sm' : 'text-muted hover:text-ink'
                }`}
                aria-label="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : storesData.data.length === 0 ? (
        <EmptyState
          title="No stores found"
          description="Try changing your search terms or category filter."
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {storesData.data.map((store) => (
            <Card key={store.id} className="flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-ink leading-snug">{store.name}</h3>
                  <Badge variant="brand">{store.category?.name}</Badge>
                </div>

                <div className="flex items-start gap-1.5 text-xs text-muted">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{store.address}</span>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-line">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-star text-star" />
                    <span className="text-sm font-extrabold text-ink">{formatRating(store.overallRating)}</span>
                    <span className="text-xs text-muted">({store.ratingCount} ratings)</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveReviewStore(store)}
                    className="text-xs px-2.5 py-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Reviews</span>
                  </Button>
                </div>

                <div className="p-3 rounded-lg bg-bg/80 border border-line space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink">Your rating:</span>
                    <StarRating
                      value={store.myRating || 0}
                      onChange={(newVal) => handleRateStore(store.id, newVal)}
                      size="sm"
                    />
                  </div>

                  {editingCommentStoreId === store.id ? (
                    <div className="space-y-2 pt-1">
                      <Textarea
                        rows={2}
                        maxLength={500}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a short review comment (optional)..."
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          isLoading={isSavingComment}
                          onClick={() => handleSaveComment(store)}
                          className="text-xs py-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save comment</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCommentStoreId(null)}
                          className="text-xs py-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </Button>
                      </div>
                    </div>
                  ) : store.myComment ? (
                    <div className="space-y-1">
                      <p className="text-xs text-ink italic bg-surface p-2 rounded border border-line">
                        &ldquo;{store.myComment}&rdquo;
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenCommentEditor(store)}
                        className="text-[11px] font-semibold text-brand-text hover:underline"
                      >
                        Edit comment
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenCommentEditor(store)}
                      className="text-xs text-brand-text hover:underline font-medium block"
                    >
                      + Add a written comment
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg border-b border-line">
                <tr>
                  <th className="px-4 py-3 font-semibold text-muted">Store Name</th>
                  <th className="px-4 py-3 font-semibold text-muted">Category</th>
                  <th className="px-4 py-3 font-semibold text-muted">Address</th>
                  <th className="px-4 py-3 font-semibold text-muted">Overall Rating</th>
                  <th className="px-4 py-3 font-semibold text-muted">Your Rating</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {storesData.data.map((store) => (
                  <tr key={store.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-ink">{store.name}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant="brand">{store.category?.name}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-muted max-w-[200px] truncate">{store.address}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 font-bold text-ink">
                        <Star className="w-3.5 h-3.5 fill-star text-star" />
                        <span>{formatRating(store.overallRating)}</span>
                        <span className="text-muted text-[11px] font-normal">({store.ratingCount})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StarRating
                        value={store.myRating || 0}
                        onChange={(newVal) => handleRateStore(store.id, newVal)}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveReviewStore(store)}
                        className="text-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Reviews</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Pagination
        page={storesData.meta.page}
        limit={storesData.meta.limit}
        total={storesData.meta.total}
        totalPages={storesData.meta.totalPages}
        onPageChange={(p) => setParams({ page: p })}
        onLimitChange={(l) => setParams({ limit: l, page: 1 })}
      />

      <ReviewsDrawer
        isOpen={Boolean(activeReviewStore)}
        onClose={() => setActiveReviewStore(null)}
        store={activeReviewStore}
      />
    </div>
  );
}
