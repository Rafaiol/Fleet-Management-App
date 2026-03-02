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

const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
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
        <p className="text-gray-500">Vehicle not found</p>
        <button
          onClick={() => navigate('/vehicles')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Back to Vehicles
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
            Export PDF
          </button>
          {canEditVehicles && (
            <Link
              to={`/vehicles/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
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
            <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
          </div>
          <span
            className={`inline-flex px-3 py-1 text-sm font-medium rounded-full capitalize ${getStatusColor(
              currentVehicle.status
            )}`}
          >
            {currentVehicle.status}
          </span>
        </div>

        <div className="card-aurora p-6 page-fade-in stagger-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Gauge className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Mileage</span>
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
            <span className="text-sm text-gray-500 dark:text-gray-400">Fuel Type</span>
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
            {currentVehicle.fuelType}
          </p>
        </div>

        <div className="card-aurora p-6 page-fade-in stagger-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Transmission</span>
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
            {currentVehicle.transmission}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 page-fade-in stagger-5">
        {/* Vehicle Details */}
        <div className="card-aurora p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Vehicle Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">VIN</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {currentVehicle.vin || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Color</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {currentVehicle.color || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Body Type</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">
                {currentVehicle.bodyType}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Engine Size</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {currentVehicle.engineSize ? `${currentVehicle.engineSize}L` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Registration Expiry</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {currentVehicle.registrationExpiry
                  ? new Date(currentVehicle.registrationExpiry).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Insurance Expiry</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {currentVehicle.insuranceExpiry
                  ? new Date(currentVehicle.insuranceExpiry).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Maintenance History */}
        <div className="card-aurora p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Maintenance
            </h3>
            <Link
              to="/maintenance"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              View All
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
                      {record.type?.replace(/_/g, ' ')}
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
                    {record.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No maintenance records</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
