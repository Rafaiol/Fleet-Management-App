import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Car,
  Gauge,
  Fuel,
  Settings,
  Edit,
  Download,
  Wrench,
  Loader2,
} from 'lucide-react';

import BackButton from '@/components/BackButton';
import { AppDispatch, RootState } from '@/store';
import {
  fetchVehicleById,
  clearCurrentVehicle,
} from '@/store/slices/vehicleSlice';
import { reportApi } from '@/services/api';
import { useAuth } from '@/hooks';
import { useTranslation } from 'react-i18next';

const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { currentVehicle, maintenanceHistory, isLoadingDetails } = useSelector(
    (state: RootState) => state.vehicles
  );
  const { canEditVehicles } = useAuth();

  useEffect(() => {
    if (id) {
      dispatch(fetchVehicleById(id));
    }
    return () => {
      dispatch(clearCurrentVehicle());
    };
  }, [dispatch, id]);

  const handleDownloadReport = async () => {
    if (!id) return;
    try {
      const response = await reportApi.generateVehicleReport(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Vehicle-Report-${currentVehicle?.plateNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
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
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoadingDetails) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!currentVehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('vehicles.table.unknownVehicle')}</p>
        <button
          onClick={() => navigate('/vehicles')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          {t('common.previous')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton to="/vehicles" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentVehicle.make} {currentVehicle.model}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {currentVehicle.plateNumber} • {currentVehicle.year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('reports.downloadPdf')}
          </button>
          {canEditVehicles && (
            <Link
              to={`/vehicles/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              {t('common.edit')}
            </Link>
          )}
        </div>
      </div>

      {/* Vehicle Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-aurora p-6 page-fade-in stagger-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('vehicles.table.status')}</span>
          </div>
          <span
            className={`inline-flex px-3 py-1 text-sm font-medium rounded-full capitalize ${getStatusColor(
              currentVehicle.status
            )}`}
          >
            {t(`vehicleForm.status.${currentVehicle.status}`, { defaultValue: currentVehicle.status })}
          </span>
        </div>

        <div className="card-aurora p-6 page-fade-in stagger-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Gauge className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('vehicles.table.mileage')}</span>
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {currentVehicle.currentMileage.toLocaleString()} {currentVehicle.mileageUnit}
          </p>
        </div>

        <div className="card-aurora p-6 page-fade-in stagger-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Fuel className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('vehicles.table.fuelType')}</span>
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
            {t(`vehicleForm.fuelType.${currentVehicle.fuelType}`, { defaultValue: currentVehicle.fuelType })}
          </p>
        </div>

        <div className="card-aurora p-6 page-fade-in stagger-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('vehicleForm.fields.transmission')}</span>
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
            {t(`vehicleForm.transmission.${currentVehicle.transmission}`, { defaultValue: currentVehicle.transmission })}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 page-fade-in stagger-5">
        {/* Vehicle Details */}
        <div className="card-aurora p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('vehicleForm.sections.general')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('vehicleForm.fields.vin')}</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {currentVehicle.vin || t('common.none')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('vehicleForm.fields.color')}</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {currentVehicle.color || t('common.none')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('vehicleForm.fields.bodyType')}</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">
                {t(`vehicleForm.bodyType.${currentVehicle.bodyType}`, { defaultValue: currentVehicle.bodyType })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('vehicleForm.sections.specifications')}</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {currentVehicle.engineSize ? `${currentVehicle.engineSize}L` : t('common.none')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('vehicleForm.fields.registrationExpiry')}</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {currentVehicle.registrationExpiry
                  ? new Date(currentVehicle.registrationExpiry).toLocaleDateString()
                  : t('common.none')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('vehicleForm.fields.insuranceExpiry')}</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {currentVehicle.insuranceExpiry
                  ? new Date(currentVehicle.insuranceExpiry).toLocaleDateString()
                  : t('common.none')}
              </p>
            </div>
          </div>
        </div>

        {/* Maintenance History */}
        <div className="card-aurora p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('dashboard.upcomingMaintenance.title')}
            </h3>
            <Link
              to="/maintenance"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              {t('dashboard.upcomingMaintenance.viewAll')}
            </Link>
          </div>
          <div className="space-y-3">
            {maintenanceHistory?.length ? (
              maintenanceHistory.slice(0, 5).map((record: any) => (
                <div
                  key={record.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <Wrench className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {t(`maintenanceForm.types.${record.type}`, { defaultValue: record.type?.replace(/_/g, ' ') })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(record.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${record.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : record.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}
                  >
                    {t(`maintenanceForm.status.${record.status}`, { defaultValue: record.status })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">{t('dashboard.upcomingMaintenance.noMaintenance')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
