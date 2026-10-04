import { useState, useEffect, useCallback } from 'react';
import { Plus, Star } from 'lucide-react';
import { api } from '../../api/axios.js';
import { useUrlState } from '../../hooks/useUrlState.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { formatRating } from '../../lib/format.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import SortableTh from '../../components/ui/SortableTh.jsx';
import AddStoreModal from './AddStoreModal.jsx';

export default function AdminStores() {
  const [getParam, setParams] = useUrlState();

  const nameParam = getParam('name', '');
  const emailParam = getParam('email', '');
  const addressParam = getParam('address', '');
  const categoryParam = getParam('categoryId', '');
  const sortByParam = getParam('sortBy', 'createdAt');
  const orderParam = getParam('order', 'desc');
  const pageParam = Number(getParam('page', '1'));
  const limitParam = Number(getParam('limit', '10'));

  const [nameInput, setNameInput] = useState(nameParam);
  const [emailInput, setEmailInput] = useState(emailParam);
  const [addressInput, setAddressInput] = useState(addressParam);

  const debouncedName = useDebounce(nameInput, 300);
  const debouncedEmail = useDebounce(emailInput, 300);
  const debouncedAddress = useDebounce(addressInput, 300);

  const [storesData, setStoresData] = useState({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setParams({
      name: debouncedName || undefined,
      email: debouncedEmail || undefined,
      address: debouncedAddress || undefined,
      page: 1,
    });

  }, [debouncedName, debouncedEmail, debouncedAddress, setParams]);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/stores', {
        params: {
          name: nameParam || undefined,
          email: emailParam || undefined,
          address: addressParam || undefined,
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
  }, [nameParam, emailParam, addressParam, categoryParam, sortByParam, orderParam, pageParam, limitParam]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSort = (field) => {
    if (sortByParam === field) {
      setParams({ order: orderParam === 'asc' ? 'desc' : 'asc', page: 1 });
    } else {
      setParams({ sortBy: field, order: 'asc', page: 1 });
    }
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Store Management"
        description="View, search, filter, and add registered stores."
        action={
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>Add store</span>
          </Button>
        }
      />

      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Filter by store name..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <Input
            placeholder="Filter by email..."
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
          <Input
            placeholder="Filter by address..."
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          />
          <Select
            value={categoryParam}
            onChange={(e) => setParams({ categoryId: e.target.value || undefined, page: 1 })}
            options={categoryOptions}
          />
        </div>

        {isLoading ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : storesData.data.length === 0 ? (
          <EmptyState
            title="No stores found"
            description="Try changing your search filters or add a new store."
            action={
              <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                Add first store
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto border border-line rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg border-b border-line">
                <tr>
                  <SortableTh field="name" currentSort={sortByParam} currentOrder={orderParam} onSort={handleSort}>
                    Store Name
                  </SortableTh>
                  <SortableTh field="email" currentSort={sortByParam} currentOrder={orderParam} onSort={handleSort}>
                    Email
                  </SortableTh>
                  <SortableTh field="address" currentSort={sortByParam} currentOrder={orderParam} onSort={handleSort}>
                    Address
                  </SortableTh>
                  <SortableTh field="category" currentSort={sortByParam} currentOrder={orderParam} onSort={handleSort}>
                    Category
                  </SortableTh>
                  <SortableTh field="rating" currentSort={sortByParam} currentOrder={orderParam} onSort={handleSort}>
                    Rating
                  </SortableTh>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {storesData.data.map((s) => (
                  <tr key={s.id} className="hover:bg-bg/60 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-ink max-w-[200px] truncate">{s.name}</td>
                    <td className="px-4 py-3.5 text-muted max-w-[180px] truncate">{s.email}</td>
                    <td className="px-4 py-3.5 text-muted max-w-[220px] truncate">{s.address}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant="brand">{s.category?.name}</Badge>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 font-semibold text-ink">
                        <Star className="w-3.5 h-3.5 fill-star text-star" />
                        <span>{formatRating(s.rating)}</span>
                        <span className="text-muted text-[11px] font-normal">({s.ratingCount})</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={storesData.meta.page}
          limit={storesData.meta.limit}
          total={storesData.meta.total}
          totalPages={storesData.meta.totalPages}
          onPageChange={(p) => setParams({ page: p })}
          onLimitChange={(l) => setParams({ limit: l, page: 1 })}
        />
      </Card>

      <AddStoreModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchStores}
        categories={categories}
      />
    </div>
  );
}
