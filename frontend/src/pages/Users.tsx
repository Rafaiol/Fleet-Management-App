import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus,
  Search,
  User,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { AppDispatch, RootState } from '@/store';
import {
  fetchUsers,
  deleteUser,
  toggleUserStatus,
} from '@/store/slices/userSlice';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import ConfirmModal from '@/components/ConfirmModal';
import { useTranslation } from 'react-i18next';

const Users = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, isLoading, pagination } = useSelector(
    (state: RootState) => state.users
  );
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    isActive: '',
  });
  const [page, setPage] = useState(1);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    // Clean up filters to avoid sending empty strings
    const cleanFilters: Record<string, any> = {};
    if (filters.role) cleanFilters.role = filters.role;
    if (filters.isActive) cleanFilters.isActive = filters.isActive;

    dispatch(
      fetchUsers({
        page,
        limit: 10,
        search: debouncedSearch,
        ...cleanFilters,
      })
    );
  }, [dispatch, debouncedSearch, filters, page]);

  const handleDelete = (id: string) => {
    setUserToDelete(id);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteUser(userToDelete));
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    await dispatch(toggleUserStatus(id));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'technicien':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('users.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('users.description')}
          </p>
        </div>
        <Link
          to="/users/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('users.addUser')}
        </Link>
      </div>

      {/* Filters */}
      <div className="card-aurora p-4 page-fade-in stagger-1">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('users.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="">{t('users.filters.allRoles')}</option>
            <option value="admin">{t('users.filters.admin')}</option>
            <option value="user">{t('users.filters.user')}</option>
            <option value="technicien">{t('users.filters.technician')}</option>
          </select>
          <select
            value={filters.isActive}
            onChange={(e) =>
              setFilters({ ...filters, isActive: e.target.value })
            }
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="">{t('users.filters.allStatus')}</option>
            <option value="true">{t('users.filters.active')}</option>
            <option value="false">{t('users.filters.inactive')}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-aurora overflow-hidden page-fade-in stagger-2">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="w-[30%] text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('users.table.user')}
                </th>
                <th className="w-[15%] text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('users.table.role')}
                </th>
                <th className="w-[20%] text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('users.table.department')}
                </th>
                <th className="w-[15%] text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('users.table.status')}
                </th>
                <th className="w-[20%] text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('users.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>{t('users.table.noUsers')}</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.fullName}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full capitalize ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                      {user.department || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${user.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                      >
                        {user.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> {t('users.status.active')}
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> {t('users.status.inactive')}
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/users/${user.id}/edit`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {user.role !== 'admin' && user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">
              {t('common.resultsCount', {
                start: (page - 1) * pagination.limit + 1,
                end: Math.min(page * pagination.limit, pagination.total),
                total: pagination.total
              })}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                {t('common.previous')}
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('common.pageOf', { current: page, total: pagination.pages })}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        title={t('users.delete.title')}
        message={t('users.delete.message')}
        confirmText={t('users.delete.confirm')}
        cancelText={t('users.delete.cancel')}
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Users;
