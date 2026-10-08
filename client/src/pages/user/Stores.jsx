import { useState, useEffect, useCallback } from 'react';
import { Search, Compass, BookOpen, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../api/axios.js';
import { useUrlState } from '../../hooks/useUrlState.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import StoreStamp from '../../components/StoreStamp.jsx';
import StoreDetailModal from '../../components/StoreDetailModal.jsx';
import ThemeToggle from '../../components/ThemeToggle.jsx';

const SAMPLE_STAMPS = [
  {
    id: 'sample-brew-bound',
    name: 'Brew & Bound',
    category: 'Café & books',
    neighbourhood: 'OLD TOWN',
    rating: 4.8,
    reviewCount: 120,
    hours: 'Open until 10:00 PM',
    address: '42 Old Town Book Alley',
    tags: ['Single origin', 'Quiet corner', 'Books & Coffee'],
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    isSaved: true,
  },
  {
    id: 'sample-artisan-roast',
    name: 'Artisan Roast Studio',
    category: 'Specialty Coffee',
    neighbourhood: 'WEST END',
    rating: 4.7,
    reviewCount: 94,
    hours: 'Open until 8:00 PM',
    address: '108 West End Market St',
    tags: ['Pour Over', 'Espresso Bar'],
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    isSaved: false,
  },
  {
    id: 'sample-vintage-leaf',
    name: 'The Vintage Leaf',
    category: 'Tea House & Pastry',
    neighbourhood: 'EAST HARBOR',
    rating: 4.9,
    reviewCount: 210,
    hours: 'Open until 9:00 PM',
    address: '15 Harbor View Parade',
    tags: ['Organic Tea', 'Fresh Scones'],
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    isSaved: true,
  },
];

export default function UserStores() {
  const [getParam, setParams] = useUrlState();

  const searchParam = getParam('search', '');
  const categoryParam = getParam('categoryId', '');

  const [searchInput, setSearchInput] = useState(searchParam);
  const debouncedSearch = useDebounce(searchInput, 300);

  const [storesData, setStoresData] = useState({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedStampIds, setSavedStampIds] = useState(['sample-brew-bound', 'sample-vintage-leaf']);

  const [selectedDetailStore, setSelectedDetailStore] = useState(null);

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
      const response = await api.get('/stores', {
        params: {
          search: searchParam || undefined,
          categoryId: categoryParam || undefined,
          limit: 20,
        },
      });
      setStoresData(response.data);
    } catch {
      toast.error('Failed to load store stamps collection');
    } finally {
      setIsLoading(false);
    }
  }, [searchParam, categoryParam]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const toggleStampSave = (id) => {
    setSavedStampIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        toast.success('Removed stamp from collection');
        return prev.filter((item) => item !== id);
      }
      toast.success('Stamped! Added to your collection');
      return [...prev, id];
    });
  };

  const handleRateSubmit = async (storeId, rating, comment) => {
    try {
      await api.put(`/stores/${storeId}/rating`, { value: rating, comment });
      toast.success('Postcard review & rating submitted');
      fetchStores();
      setSelectedDetailStore(null);
    } catch {
      toast.error('Failed to submit rating review');
    }
  };

  const allStamps = [...SAMPLE_STAMPS, ...storesData.data.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category?.name || 'Store',
    neighbourhood: s.address ? s.address.split(',')[0].toUpperCase() : 'CITY CENTER',
    rating: s.overallRating || 4.5,
    reviewCount: s.ratingsCount || 10,
    address: s.address,
    userRating: s.userRating,
    userComment: s.userComment,
    isSaved: savedStampIds.includes(s.id),
  }))];

  const filteredStamps = allStamps.filter((stamp) => {
    const matchesSearch = !searchParam || stamp.name.toLowerCase().includes(searchParam.toLowerCase()) || stamp.neighbourhood.toLowerCase().includes(searchParam.toLowerCase());
    const matchesCategory = !categoryParam || String(stamp.category).toLowerCase().includes(String(categoryParam).toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const rotations = [-0.8, 0.6, -0.4, 0.8, -0.6, 0.4];

  return (
    <div className="min-h-screen bg-bg text-ink p-4 sm:p-8 space-y-6">
      <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur-md pb-4 pt-2 border-b border-line/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="stamp-perforated w-10 h-10 border border-line flex items-center justify-center text-secondary bg-surface shadow-2xs">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h1 className="stamp-font-title text-2xl sm:text-3xl text-ink tracking-tight">
                Philatelist's Store & Café Album
              </h1>
              <p className="stamp-font-body text-xs text-muted font-medium">
                Collectible stamp catalog of local stores and quiet cafes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search stamps or neighbourhood..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded border border-line bg-surface text-ink placeholder:text-muted focus:outline-none"
              />
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setParams({ categoryId: undefined, page: 1 })}
            className={`stamp-perforated px-3 py-1.5 text-xs font-bold border transition-colors shadow-2xs shrink-0 ${
              !categoryParam ? 'bg-secondary text-white border-secondary' : 'bg-surface text-ink border-line hover:border-secondary'
            }`}
          >
            All Stamps ({allStamps.length})
          </button>
          {categories.map((cat) => {
            const isActive = String(categoryParam) === String(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setParams({ categoryId: cat.id, page: 1 })}
                className={`stamp-perforated px-3 py-1.5 text-xs font-bold border transition-colors shadow-2xs shrink-0 ${
                  isActive ? 'bg-secondary text-white border-secondary' : 'bg-surface text-ink border-line hover:border-secondary'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 6].map((idx) => (
              <div key={idx} className="stamp-perforated h-72 border border-line bg-surface/50 animate-pulse" />
            ))}
          </div>
        ) : filteredStamps.length === 0 ? (
          <div className="stamp-perforated border-2 border-dashed border-line p-12 text-center rounded-sm bg-surface/40 my-8 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="stamp-font-title text-2xl text-ink">No stamps collected yet</h2>
            <p className="stamp-font-body text-xs text-muted max-w-sm mx-auto">
              No matching postage stamps found for your current search or category filter in the album.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setParams({ categoryId: undefined, search: undefined });
              }}
              className="px-4 py-2 rounded bg-primary text-white text-xs font-bold hover:opacity-90"
            >
              Reset Album Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            {filteredStamps.map((stamp, idx) => (
              <StoreStamp
                key={stamp.id}
                name={stamp.name}
                category={stamp.category}
                neighbourhood={stamp.neighbourhood}
                rating={stamp.rating}
                reviewCount={stamp.reviewCount}
                isSaved={savedStampIds.includes(stamp.id)}
                image={stamp.image}
                rotation={rotations[idx % rotations.length]}
                onSaveToggle={() => toggleStampSave(stamp.id)}
                onClick={() => setSelectedDetailStore(stamp)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedDetailStore && (
        <StoreDetailModal
          store={selectedDetailStore}
          isSaved={savedStampIds.includes(selectedDetailStore.id)}
          onSaveToggle={() => toggleStampSave(selectedDetailStore.id)}
          onClose={() => setSelectedDetailStore(null)}
          onRateSubmit={handleRateSubmit}
        />
      )}
    </div>
  );
}
