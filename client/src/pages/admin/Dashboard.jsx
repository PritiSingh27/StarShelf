import { useState, useEffect } from 'react';
import { Users, ShoppingBag, Star, Plus, FolderPlus, UserPlus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../api/axios.js';
import StatCard from '../../components/StatCard.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import AddUserModal from './AddUserModal.jsx';
import AddStoreModal from './AddStoreModal.jsx';
import AddCategoryModal from './AddCategoryModal.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, catRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/categories'),
      ]);
      setStats(statsRes.data);
      setCategories(catRes.data);
    } catch {
      // Handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="System Dashboard"
        description="Overview of platform users, stores, and ratings metrics."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => setIsUserModalOpen(true)}>
              <UserPlus className="w-4 h-4" />
              <span>Add user</span>
            </Button>
            <Button size="sm" onClick={() => setIsStoreModalOpen(true)}>
              <Plus className="w-4 h-4" />
              <span>Add store</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsCategoryModalOpen(true)}>
              <FolderPlus className="w-4 h-4" />
              <span>Add category</span>
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} />
          <StatCard title="Total Stores" value={stats?.totalStores || 0} icon={ShoppingBag} />
          <StatCard title="Total Ratings" value={stats?.totalRatings || 0} icon={Star} />
        </div>
      )}

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-ink">Ratings Submitted (Last 14 Days)</h2>
            <p className="text-xs text-muted">Daily volume of user ratings submitted across all stores.</p>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.ratingsPerDay || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-line)' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-line)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-line)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: 'var(--color-ink)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Ratings"
                  stroke="var(--color-brand)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <AddUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSuccess={fetchData}
      />
      <AddStoreModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        onSuccess={fetchData}
        categories={categories}
      />
      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
