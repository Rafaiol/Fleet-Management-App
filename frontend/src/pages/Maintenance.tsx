import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Wrench,
  Loader2,
  FileText,
  Edit,
  Trash2,
} from 'lucide-react';

import { AppDispatch, RootState } from '@/store';
import {
  fetchMaintenance,
  fetchMaintenanceTypes,
  deleteMaintenance,
} from '@/store/slices/maintenanceSlice';
import { useDebounce, useAuth } from '@/hooks';
import ConfirmModal from '@/components/ConfirmModal';
import { useTranslation } from 'react-i18next';

const Maintenance = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { records, types, isLoading, pagination } = useSelector(
    (state: RootState) => state.maintenance
  );
  const { canAddMaintenance, canEditMaintenance, canDeleteMaintenance } = useAuth();
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: initialStatus,
    type: '',
    priority: '',
  });
  const [page, setPage] = useState(1);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    dispatch(fetchMaintenanceTypes());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchMaintenance({
        page,
        limit: 10,
        search: debouncedSearch,
        ...filters,
      })
    );
  }, [dispatch, debouncedSearch, filters, page]);

  const handleDelete = (id: string) => {
    setRecordToDelete(id);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteMaintenance(recordToDelete));
    } finally {
      setIsDeleting(false);
      setRecordToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('maintenance.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('maintenance.description')}
          </p>
        </div>
        {canAddMaintenance && (
          <Link
            to="/maintenance/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('maintenance.newRecord')}
          </Link>
        )}
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
              placeholder={t('maintenance.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="">{t('maintenance.filters.allStatus')}</option>
            <option value="scheduled">{t('maintenance.filters.scheduled')}</option>
            <option value="in_progress">{t('maintenance.filters.inProgress')}</option>
            <option value="completed">{t('maintenance.filters.completed')}</option>
            <option value="cancelled">{t('maintenance.filters.cancelled')}</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="">{t('maintenance.filters.allTypes')}</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Maintenance Table */}
      <div className="card-aurora overflow-hidden page-fade-in stagger-2">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full table-fixed min-w-[1000px] lg:min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="w-[20%] text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('maintenance.table.vehicle')}
                </th>
                <th className="w-[15%] text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('maintenance.table.type')}
                </th>
                <th className="w-[15%] text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('maintenance.table.status')}
                </th>
                <th className="w-[15%] text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('maintenance.table.date')}
                </th>
                <th className="w-[15%] text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('maintenance.table.cost')}
                </th>
                <th className="w-[20%] text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('maintenance.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>{t('maintenance.table.noRecords')}</p>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {(record.vehicle as any)?.plateNumber || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(record.vehicle as any)?.make} {(record.vehicle as any)?.model}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300 capitalize">
                      {record.type?.replace(/_/g, ' ')}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {record.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                      {new Date(record.scheduledDate).toISOString().split('T')[0]}
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                      ${record.totalCost?.toFixed(2) || '0.00'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/maintenance/${record.id}`}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title={t('maintenance.actions.viewDetails')}
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                        {canEditMaintenance && (
                          <Link
                            to={`/maintenance/${record.id}/edit`}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title={t('maintenance.actions.edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}
                        {canDeleteMaintenance && (
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title={t('maintenance.actions.delete')}
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
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={confirmDelete}
        title={t('maintenance.delete.title')}
        message={t('maintenance.delete.message')}
        confirmText={t('maintenance.delete.confirm')}
        cancelText={t('maintenance.delete.cancel')}
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Maintenance;
