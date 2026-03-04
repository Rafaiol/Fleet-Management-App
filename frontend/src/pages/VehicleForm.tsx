import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Car, Save, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import BackButton from '@/components/BackButton';
import { AppDispatch, RootState } from '@/store';
import { fetchVehicleById, createVehicle, updateVehicle } from '@/store/slices/vehicleSlice';
import { fetchAlertsAsNotifications } from '@/store/slices/uiSlice';
import { Vehicle } from '@/types';

const VehicleForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const isEditMode = Boolean(id);
  const { currentVehicle, isLoading, isLoadingDetails } = useSelector((state: RootState) => state.vehicles);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<Vehicle>>({
    defaultValues: {
      status: 'active',
      bodyType: 'sedan',
      fuelType: 'gasoline',
      transmission: 'automatic',
      mileageUnit: 'km',
      currentMileage: 0
    }
  });

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchVehicleById(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && currentVehicle) {
      const formattedVehicle = {
        ...currentVehicle,
        registrationDate: currentVehicle.registrationDate ? currentVehicle.registrationDate.substring(0, 10) : undefined,
        registrationExpiry: currentVehicle.registrationExpiry ? currentVehicle.registrationExpiry.substring(0, 10) : undefined,
        insuranceExpiry: currentVehicle.insuranceExpiry ? currentVehicle.insuranceExpiry.substring(0, 10) : undefined,
        purchaseDate: currentVehicle.purchaseDate ? currentVehicle.purchaseDate.substring(0, 10) : undefined,
      };
      reset(formattedVehicle);
    }
  }, [currentVehicle, isEditMode, reset]);

  const onSubmit = async (data: Partial<Vehicle>) => {
    try {
      if (isEditMode && id) {
        await dispatch(updateVehicle({ id, data })).unwrap();
      } else {
        await dispatch(createVehicle(data)).unwrap();
      }
      dispatch(fetchAlertsAsNotifications());
      navigate('/vehicles');
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <BackButton to="/vehicles" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? t('vehicleForm.editTitle') : t('vehicleForm.addTitle')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEditMode ? t('vehicleForm.editSubtitle') : t('vehicleForm.addSubtitle')}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 page-fade-in stagger-1">
        <div className="card-aurora p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Car className="w-5 h-5 text-primary-600" />
            {t('vehicleForm.sections.general')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.make')} *
              </label>
              <input
                {...register('make', { required: t('vehicleForm.validation.makeRequired') })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Toyota"
              />
              {errors.make && <p className="mt-1 text-sm text-red-600">{errors.make.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.model')} *
              </label>
              <input
                {...register('model', { required: t('vehicleForm.validation.modelRequired') })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Camry"
              />
              {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.year')} *
              </label>
              <input
                type="number"
                {...register('year', {
                  required: t('vehicleForm.validation.yearRequired'),
                  min: { value: 1900, message: t('vehicleForm.validation.invalidYear') },
                  max: { value: new Date().getFullYear() + 1, message: t('vehicleForm.validation.invalidYear') }
                })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. 2023"
              />
              {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.plateNumber')} *
              </label>
              <input
                {...register('plateNumber', { required: t('vehicleForm.validation.plateRequired') })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white uppercase focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. ABC-123"
              />
              {errors.plateNumber && <p className="mt-1 text-sm text-red-600">{errors.plateNumber.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.vin')}
              </label>
              <input
                {...register('vin')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white uppercase focus:ring-2 focus:ring-primary-500"
                placeholder="17-character VIN"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.status')}
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">{t('vehicleForm.status.active')}</option>
                <option value="maintenance">{t('vehicleForm.status.maintenance')}</option>
                <option value="offline">{t('vehicleForm.status.offline')}</option>
                <option value="retired">{t('vehicleForm.status.retired')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-aurora p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('vehicleForm.sections.specifications')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.bodyType')}
              </label>
              <select
                {...register('bodyType')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white capitalize focus:ring-2 focus:ring-primary-500"
              >
                <option value="sedan">{t('vehicleForm.bodyType.sedan')}</option>
                <option value="suv">{t('vehicleForm.bodyType.suv')}</option>
                <option value="truck">{t('vehicleForm.bodyType.truck')}</option>
                <option value="van">{t('vehicleForm.bodyType.van')}</option>
                <option value="bus">{t('vehicleForm.bodyType.bus')}</option>
                <option value="motorcycle">{t('vehicleForm.bodyType.motorcycle')}</option>
                <option value="other">{t('vehicleForm.bodyType.other')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.fuelType')}
              </label>
              <select
                {...register('fuelType')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white capitalize focus:ring-2 focus:ring-primary-500"
              >
                <option value="gasoline">{t('vehicleForm.fuelType.gasoline')}</option>
                <option value="diesel">{t('vehicleForm.fuelType.diesel')}</option>
                <option value="electric">{t('vehicleForm.fuelType.electric')}</option>
                <option value="hybrid">{t('vehicleForm.fuelType.hybrid')}</option>
                <option value="lpg">{t('vehicleForm.fuelType.lpg')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.transmission')}
              </label>
              <select
                {...register('transmission')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white capitalize focus:ring-2 focus:ring-primary-500"
              >
                <option value="automatic">{t('vehicleForm.transmission.automatic')}</option>
                <option value="manual">{t('vehicleForm.transmission.manual')}</option>
                <option value="cvt">{t('vehicleForm.transmission.cvt')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.currentMileage')}
              </label>
              <input
                type="number"
                {...register('currentMileage', { min: 0 })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.mileageUnit')}
              </label>
              <select
                {...register('mileageUnit')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white uppercase focus:ring-2 focus:ring-primary-500"
              >
                <option value="km">{t('vehicleForm.mileageUnit.km')}</option>
                <option value="miles">{t('vehicleForm.mileageUnit.miles')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.color')}
              </label>
              <input
                {...register('color')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. White"
              />
            </div>
          </div>
        </div>

        <div className="card-aurora p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('vehicleForm.sections.registration')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.registrationDate')}
              </label>
              <input
                type="date"
                {...register('registrationDate')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.registrationExpiry')}
              </label>
              <input
                type="date"
                {...register('registrationExpiry')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.insuranceNumber')}
              </label>
              <input
                {...register('insuranceNumber')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white uppercase focus:ring-2 focus:ring-primary-500"
                placeholder="Policy Number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.insuranceExpiry')}
              </label>
              <input
                type="date"
                {...register('insuranceExpiry')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="card-aurora p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('vehicleForm.sections.financial')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.purchaseDate')}
              </label>
              <input
                type="date"
                {...register('purchaseDate')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('vehicleForm.fields.purchasePrice')}
              </label>
              <input
                type="number"
                {...register('purchasePrice', { min: 0 })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. 25000"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/vehicles')}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('vehicleForm.actions.cancel')}
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
            {isEditMode ? t('vehicleForm.actions.saveChanges') : t('vehicleForm.actions.create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
