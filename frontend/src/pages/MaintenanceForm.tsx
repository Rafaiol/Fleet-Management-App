import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Save, Wrench, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

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
    dispatch(fetchVehicles({ limit: 100 })); // Load vehicles for the dropdown
    if (isEditMode && id) {
      dispatch(fetchMaintenanceById(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && currentRecord) {
      // Extract just the ID if the vehicle is populated as an object
      const vehicleId = typeof currentRecord.vehicle === 'object' ? currentRecord.vehicle?.id : currentRecord.vehicle;

      reset({
        ...currentRecord,
        vehicle: vehicleId,
        scheduledDate: currentRecord.scheduledDate ? new Date(currentRecord.scheduledDate).toISOString().split('T')[0] : '',
      } as any);
    } else if (!isEditMode && location.state) {
      // Handle "Go to Maintenance" routing from notifications
      const { vehicleId, alertType } = location.state as { vehicleId: string, alertType: string };
      if (vehicleId) {
        let mappedType = 'general_inspection';
        if (alertType === 'maintenance_overdue' || alertType === 'maintenance_scheduled') {
          // We could try to map specific maintenance due, but usually it's general
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
        // Only send editable fields to avoid 500 CastErrors from populated objects
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

      // Refresh global notifications (e.g., clearing a scheduled maintenance alert)
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
            {isEditMode ? 'Edit Maintenance Record' : 'New Maintenance Record'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEditMode ? 'Update maintenance information' : 'Schedule a new maintenance task'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 page-fade-in stagger-1">
        <div className="card-aurora p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary-600" />
            Service Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vehicle *
              </label>
              <select
                {...register('vehicle', { required: 'Vehicle is required' })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a vehicle...</option>
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
                Service Type *
              </label>
              <select
                {...register('type', { required: 'Type is required' })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white capitalize focus:ring-2 focus:ring-primary-500"
              >
                <option value="oil_change">Oil Change</option>
                <option value="tire_rotation">Tire Rotation</option>
                <option value="brake_service">Brake Service</option>
                <option value="battery_replacement">Battery Replacement</option>
                <option value="general_inspection">General Inspection</option>
                <option value="engine_repair">Engine Repair</option>
                <option value="other">Other</option>
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Scheduled Date *
              </label>
              <input
                type="date"
                {...register('scheduledDate', { required: 'Scheduled date is required' })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
              {errors.scheduledDate && <p className="mt-1 text-sm text-red-600">{errors.scheduledDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="Describe the maintenance issue or task..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        <div className="card-aurora p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Costs (Optional)</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Labor Cost ($)
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
                Parts Cost ($)
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
                Total Cost ($)
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
            Cancel
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
            {isEditMode ? 'Save Changes' : 'Create Record'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceForm;
