import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Wrench,
  DollarSign,
  Clock,
  Download,
  Loader2,
} from 'lucide-react';

import BackButton from '@/components/BackButton';
import { AppDispatch, RootState } from '@/store';
import {
  fetchMaintenanceById,
  clearCurrentRecord,
} from '@/store/slices/maintenanceSlice';
import { reportApi } from '@/services/api';
import { useTranslation } from 'react-i18next';

const MaintenanceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { currentRecord, isLoadingDetails } = useSelector(
    (state: RootState) => state.maintenance
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchMaintenanceById(id));
    }
    return () => {
      dispatch(clearCurrentRecord());
    };
  }, [dispatch, id]);

  const handleDownloadReport = async () => {
    if (!id) return;
    try {
      const response = await reportApi.generateMaintenanceReport(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Maintenance-Report-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
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

  if (!currentRecord) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('maintenance.table.noRecords')}</p>
        <button
          onClick={() => navigate('/maintenance')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          {t('common.previous')}
        </button>
      </div>
    );
  }

  const vehicle = currentRecord.vehicle as any;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton to="/maintenance" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('maintenance.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {vehicle?.plateNumber} • {vehicle?.make} {vehicle?.model}
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadReport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          {t('reports.downloadPdf')}
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-aurora p-6 page-fade-in stagger-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('maintenance.table.status')}</span>
          </div>
          <span
            className={`inline-flex px-3 py-1 text-sm font-medium rounded-full capitalize ${getStatusColor(
              currentRecord.status
            )}`}
          >
            {t(`maintenanceForm.status.${currentRecord.status}`, { defaultValue: currentRecord.status.replace(/_/g, ' ') })}
          </span>
        </div>

        <div className="card-aurora p-6 page-fade-in stagger-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('maintenanceForm.fields.priority')}</span>
          </div>
          <span
            className={`inline-flex px-3 py-1 text-sm font-medium rounded-full capitalize ${getPriorityColor(
              currentRecord.priority
            )}`}
          >
            {t(`maintenanceForm.priority.${currentRecord.priority}`, { defaultValue: currentRecord.priority })}
          </span>
        </div>

        <div className="card-aurora p-6 page-fade-in stagger-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('maintenanceForm.fields.totalCost')}</span>
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            ${currentRecord.totalCost?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 page-fade-in stagger-4">
        {/* Maintenance Info */}
        <div className="card-aurora p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('maintenanceForm.sections.serviceDetails')}
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('maintenanceForm.fields.serviceType')}</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">
                {t(`maintenanceForm.types.${currentRecord.type}`, { defaultValue: currentRecord.type?.replace(/_/g, ' ') })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('maintenanceForm.fields.description')}</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {currentRecord.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('maintenanceForm.fields.scheduledDate')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(currentRecord.scheduledDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('maintenance.filters.completed')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentRecord.completionDate
                    ? new Date(currentRecord.completionDate).toLocaleDateString()
                    : t('common.none')}
                </p>
              </div>
            </div>
            {currentRecord.workPerformed && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('notes') || 'Work Performed'}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentRecord.workPerformed}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="card-aurora p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('maintenanceForm.sections.costs')}
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">{t('maintenanceForm.fields.laborCost')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${currentRecord.laborCost?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">{t('maintenanceForm.fields.partsCost')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${currentRecord.partsCost?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-900 dark:text-white">{t('maintenanceForm.fields.totalCost')}</span>
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                ${currentRecord.totalCost?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>

          {/* Parts Used */}
          {currentRecord.partsUsed && currentRecord.partsUsed.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {t('parts') || 'Parts Used'}
              </h4>
              <div className="space-y-2">
                {currentRecord.partsUsed.map((part, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {part.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {part.quantity} × ${part.unitPrice?.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${part.totalPrice?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDetail;
