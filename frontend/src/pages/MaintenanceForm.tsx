import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Save, Wrench, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import BackButton from '@/components/BackButton';
import { AppDispatch, RootState } from '@/store';
import { fetchMaintenanceById, createMaintenance, updateMaintenance } from '@/store/slices/maintenanceSlice';
import { fetchVehicles } from '@/store/slices/vehicleSlice';
import { fetchAlertsAsNotifications } from '@/store/slices/uiSlice';
import { Maintenance } from '@/types';

const MaintenanceForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const isEditMode = Boolean(id);
  const { currentRecord, isLoading, isLoadingDetails } = useSelector((state: RootState) => state.maintenance);
  const { vehicles } = useSelector((state: RootState) => state.vehicles);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<Partial<Maintenance>>({
    defaultValues: {
      status: 'scheduled',
      priority: 'medium',
      type: 'general_inspection',
    }
  });

  useEffect(() => {
    dispatch(fetchVehicles({ limit: 100 }));
    if (isEditMode && id) {
      dispatch(fetchMaintenanceById(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && currentRecord) {
      const vehicleId = typeof currentRecord.vehicle === 'object' ? currentRecord.vehicle?.id : currentRecord.vehicle;
      reset({
        ...currentRecord,
        vehicle: vehicleId,
        scheduledDate: currentRecord.scheduledDate ? new Date(currentRecord.scheduledDate).toISOString().split('T')[0] : '',
      } as any);
    } else if (!isEditMode && location.state) {
      const { vehicleId, alertType } = location.state as { vehicleId: string, alertType: string };
      if (vehicleId) {
        let mappedType = 'general_inspection';
        if (alertType === 'maintenance_overdue' || alertType === 'maintenance_scheduled') {
          mappedType = 'general_inspection';
        }
        reset({
          vehicle: vehicleId,
          type: mappedType,
          priority: 'high',
          status: 'scheduled',
          scheduledDate: new Date().toISOString().split('T')[0]
        } as any);
      }
    }
  }, [currentRecord, isEditMode, reset, location.state]);

  const laborCost = watch('laborCost') || 0;
  const partsCost = watch('partsCost') || 0;

  useEffect(() => {
    const total = (Number(laborCost) || 0) + (Number(partsCost) || 0);
    setValue('totalCost', Number(total.toFixed(2)));
  }, [laborCost, partsCost, setValue]);

  const onSubmit = async (data: Partial<Maintenance>) => {
    try {
      if (isEditMode && id) {
        const payload = {
          vehicle: data.vehicle,
          type: data.type,
          scheduledDate: data.scheduledDate,
          status: data.status,
          priority: data.priority,
          description: data.description,
          laborCost: data.laborCost,
          partsCost: data.partsCost,
          totalCost: data.totalCost,
        };
        await dispatch(updateMaintenance({ id, data: payload })).unwrap();
      } else {
        await dispatch(createMaintenance(data)).unwrap();
      }
      dispatch(fetchAlertsAsNotifications());
      navigate('/maintenance');
    } catch (error) {
      // Error handled by redux toast
    }
  };

  if (isEditMode && isLoadingDetails) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <BackButton to="/maintenance" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? t('maintenanceForm.editTitle') : t('maintenanceForm.addTitle')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEditMode ? t('maintenanceForm.editSubtitle') : t('maintenanceForm.addSubtitle')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 page-fade-in stagger-1">
        <div className="card-aurora p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary-600" />
            {t('maintenanceForm.sections.serviceDetails')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('maintenanceForm.fields.vehicle')} *
              </label>
              <select
                {...register('vehicle', { required: t('maintenanceForm.validation.vehicleRequired') })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('maintenanceForm.fields.selectVehicle')}</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} - {v.make} {v.model}
                  </option>
                ))}
              </select>
              {errors.vehicle && <p className="mt-1 text-sm text-red-600">{errors.vehicle.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('maintenanceForm.fields.serviceType')} *
              </label>
              <select
                {...register('type', { required: t('maintenanceForm.validation.typeRequired') })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white capitalize focus:ring-2 focus:ring-primary-500"
              >
                <option value="oil_change">{t('maintenanceForm.types.oil_change')}</option>
                <option value="tire_rotation">{t('maintenanceForm.types.tire_rotation')}</option>
                <option value="brake_service">{t('maintenanceForm.types.brake_service')}</option>
                <option value="battery_replacement">{t('maintenanceForm.types.battery_replacement')}</option>
                <option value="general_inspection">{t('maintenanceForm.types.general_inspection')}</option>
                <option value="engine_repair">{t('maintenanceForm.types.engine_repair')}</option>
                <option value="chain_replacement">{t('maintenanceForm.types.chain_replacement')}</option>
                <option value="belt_replacement">{t('maintenanceForm.types.belt_replacement')}</option>
                <option value="brake_fluid_change">{t('maintenanceForm.types.brake_fluid_change')}</option>
                <option value="coolant_change">{t('maintenanceForm.types.coolant_change')}</option>
                <option value="transmission_repair">{t('maintenanceForm.types.transmission_repair')}</option>
                <option value="electrical_repair">{t('maintenanceForm.types.electrical_repair')}</option>
                <option value="other">{t('maintenanceForm.types.other')}</option>
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('maintenanceForm.fields.scheduledDate')} *
              </label>
              <input
                type="date"
                {...register('scheduledDate', { required: t('maintenanceForm.validation.dateRequired') })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
              {errors.scheduledDate && <p className="mt-1 text-sm text-red-600">{errors.scheduledDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('maintenanceForm.fields.status')}
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="scheduled">{t('maintenanceForm.status.scheduled')}</option>
                <option value="in_progress">{t('maintenanceForm.status.in_progress')}</option>
                <option value="completed">{t('maintenanceForm.status.completed')}</option>
                <option value="cancelled">{t('maintenanceForm.status.cancelled')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('maintenanceForm.fields.priority')}
              </label>
              <select
                {...register('priority')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">{t('maintenanceForm.priority.low')}</option>
                <option value="medium">{t('maintenanceForm.priority.medium')}</option>
                <option value="high">{t('maintenanceForm.priority.high')}</option>
                <option value="urgent">{t('maintenanceForm.priority.urgent')}</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('maintenanceForm.fields.description')} *
              </label>
              <textarea
                {...register('description', { required: t('maintenanceForm.validation.descriptionRequired') })}
                rows={4}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder={t('maintenanceForm.descriptionPlaceholder')}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        <div className="card-aurora p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('maintenanceForm.sections.costs')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('maintenanceForm.fields.laborCost')}
              </label>
              <input
                type="number"
                step="0.01"
                {...register('laborCost', { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('maintenanceForm.fields.partsCost')}
              </label>
              <input
                type="number"
                step="0.01"
                {...register('partsCost', { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('maintenanceForm.fields.totalCost')}
              </label>
              <input
                type="number"
                step="0.01"
                readOnly
                {...register('totalCost', { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-gray-900 dark:text-gray-200 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/maintenance')}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('maintenanceForm.actions.cancel')}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditMode ? t('maintenanceForm.actions.saveChanges') : t('maintenanceForm.actions.create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceForm;
