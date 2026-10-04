import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../api/axios.js';
import { useUrlState } from '../../hooks/useUrlState.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { formatDate } from '../../lib/format.js';
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
import AddUserModal from './AddUserModal.jsx';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [getParam, setParams] = useUrlState();

  const nameParam = getParam('name', '');
  const emailParam = getParam('email', '');
  const addressParam = getParam('address', '');
  const roleParam = getParam('role', '');
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

  const [usersData, setUsersData] = useState({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setParams({
      name: debouncedName || undefined,
      email: debouncedEmail || undefined,
      address: debouncedAddress || undefined,
      page: 1,
    });

  }, [debouncedName, debouncedEmail, debouncedAddress, setParams]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: {
          name: nameParam || undefined,
          email: emailParam || undefined,
          address: addressParam || undefined,
          role: roleParam || undefined,
          sortBy: sortByParam,
          order: orderParam,
          page: pageParam,
          limit: limitParam,
        },
      });
      setUsersData(res.data);
    } catch {
      // Handled by interceptor
    } finally {
      setIsLoading(false);
    }
  }, [nameParam, emailParam, addressParam, roleParam, sortByParam, orderParam, pageParam, limitParam]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortByParam === field) {
      setParams({ order: orderParam === 'asc' ? 'desc' : 'asc', page: 1 });
    } else {
      setParams({ sortBy: field, order: 'asc', page: 1 });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="User Management"
        description="Filter, sort, and inspect registered users across all roles."
        action={
          <Button onClick={() => setIsAddModalOpen(true)}>
            <UserPlus className="w-4 h-4" />
            <span>Add user</span>
          </Button>
        }
      />

      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Filter by name..."
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
            value={roleParam}
            onChange={(e) => setParams({ role: e.target.value || undefined, page: 1 })}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'USER', label: 'Normal User' },
              { value: 'OWNER', label: 'Store Owner' },
              { value: 'ADMIN', label: 'System Admin' },
            ]}
          />
        </div>

        {isLoading ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : usersData.data.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Try changing your search filters or add a new user."
            action={
              <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                Add first user
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto border border-line rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg border-b border-line">
                <tr>
                  <SortableTh field="name" currentSort={sortByParam} currentOrder={orderParam} onSort={handleSort}>
                    Name
                  </SortableTh>
                  <SortableTh field="email" currentSort={sortByParam} currentOrder={orderParam} onSort={handleSort}>
                    Email
                  </SortableTh>
                  <SortableTh field="address" currentSort={sortByParam} currentOrder={orderParam} onSort={handleSort}>
                    Address
                  </SortableTh>
                  <SortableTh field="role" currentSort={sortByParam} currentOrder={orderParam} onSort={handleSort}>
                    Role
                  </SortableTh>
                  <SortableTh field="createdAt" currentSort={sortByParam} currentOrder={orderParam} onSort={handleSort}>
                    Joined
                  </SortableTh>
                  <th className="px-4 py-3 text-right text-muted font-semibold">Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {usersData.data.map((u) => {
                  const roleVar = u.role === 'ADMIN' ? 'admin' : u.role === 'OWNER' ? 'owner' : 'user';
                  return (
                    <tr
                      key={u.id}
                      onClick={() => navigate(`/admin/users/${u.id}`)}
                      className="hover:bg-bg/60 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5 font-semibold text-ink max-w-[180px] truncate">{u.name}</td>
                      <td className="px-4 py-3.5 text-muted max-w-[180px] truncate">{u.email}</td>
                      <td className="px-4 py-3.5 text-muted max-w-[200px] truncate">{u.address}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={roleVar}>{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-muted whitespace-nowrap">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3.5 text-right">
                        {u.emailVerified ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted inline" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={usersData.meta.page}
          limit={usersData.meta.limit}
          total={usersData.meta.total}
          totalPages={usersData.meta.totalPages}
          onPageChange={(p) => setParams({ page: p })}
          onLimitChange={(l) => setParams({ limit: l, page: 1 })}
        />
      </Card>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
