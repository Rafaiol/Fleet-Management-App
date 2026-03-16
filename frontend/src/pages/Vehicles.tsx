import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Car,
  Edit,
  Trash2,
  FileText,
  Loader2,
} from 'lucide-react';

import { AppDispatch, RootState } from '@/store';
import {
  fetchVehicles,
  deleteVehicle,
  fetchVehicleMakes,
} from '@/store/slices/vehicleSlice';
import { useDebounce, useAuth } from '@/hooks';
import ConfirmModal from '@/components/ConfirmModal';
import { useTranslation } from 'react-i18next';

const Vehicles = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles, makes, isLoading, pagination } = useSelector(
    (state: RootState) => state.vehicles
  );
  const { canAddVehicles, canEditVehicles, canDeleteVehicles } = useAuth();
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState({
    status: initialStatus,
    make: '',
  });
  const [page, setPage] = useState(1);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync the UI search state if the URL changes 
  // (e.g. typing a new search in the header while already on the vehicles page)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setSearch(urlSearch);
  }, [searchParams]);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    dispatch(fetchVehicleMakes());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchVehicles({
        page,
        limit: 10,
        search: debouncedSearch,
        ...filters,
      })
    );
  }, [dispatch, debouncedSearch, filters, page]);

  const handleDelete = (id: string) => {
    setVehicleToDelete(id);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteVehicle(vehicleToDelete));
    } finally {
      setIsDeleting(false);
      setVehicleToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'offline':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('vehicles.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('vehicles.description')}
          </p>
        </div>
        {canAddVehicles && (
          <Link
            to="/vehicles/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('vehicles.addVehicle')}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card-aurora p-4 page-fade-in stagger-1">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('vehicles.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{t('vehicles.filters.allStatus')}</option>
            <option value="active">{t('vehicles.filters.active')}</option>
            <option value="maintenance">{t('vehicles.filters.maintenance')}</option>
            <option value="offline">{t('vehicles.filters.offline')}</option>
            <option value="retired">{t('vehicles.filters.retired')}</option>
          </select>

          {/* Make Filter */}
          <select
            value={filters.make}
            onChange={(e) => setFilters({ ...filters, make: e.target.value })}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{t('vehicles.filters.allMakes')}</option>
            {makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="card-aurora overflow-hidden page-fade-in stagger-2">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full table-fixed min-w-[1000px]">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="w-[30%] text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('vehicles.table.vehicle')}
                </th>
                <th className="w-[15%] text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('vehicles.table.plateNumber')}
                </th>
                <th className="w-[15%] text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('vehicles.table.status')}
                </th>
                <th className="w-[15%] text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('vehicles.table.mileage')}
                </th>
                <th className="w-[10%] text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('vehicles.table.fuelType')}
                </th>
                <th className="w-[15%] text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('vehicles.table.actions')}
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
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>{t('vehicles.table.noVehicles')}</p>
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {vehicle.make} {vehicle.model}
                          </p>
                          <p className="text-sm text-gray-500">{vehicle.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-mono">
                      {vehicle.plateNumber}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                          vehicle.status
                        )}`}
                      >
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                      {vehicle.currentMileage.toLocaleString()} {vehicle.mileageUnit}
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300 capitalize">
                      {vehicle.fuelType}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/vehicles/${vehicle.id}`}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                        {canEditVehicles && (
                          <Link
                            to={`/vehicles/${vehicle.id}/edit`}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}
                        {canDeleteVehicles && (
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
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
              Showing {(page - 1) * pagination.limit + 1} to{' '}
              {Math.min(page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.previous')}
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('common.pageOf', { current: page, total: pagination.pages })}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!vehicleToDelete}
        onClose={() => setVehicleToDelete(null)}
        onConfirm={confirmDelete}
        title={t('vehicles.delete.title')}
        message={t('vehicles.delete.message')}
        confirmText={t('vehicles.delete.confirm')}
        cancelText={t('vehicles.delete.cancel')}
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Vehicles;
