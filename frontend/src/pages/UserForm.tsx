import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Save, User as UserIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { AppDispatch, RootState } from '@/store';
import { fetchUserById } from '@/store/slices/userSlice';
import { register as registerUser } from '@/store/slices/authSlice';
import { userApi } from '@/services/api';
import { toast } from 'react-toastify';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: 'admin' | 'user' | 'technicien';
  department?: string;
  phone?: string;
  permissions?: string[];
}

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const isEditMode = Boolean(id);
  const { currentUser, isLoadingDetails } = useSelector((state: RootState) => state.users);
  const { isLoading } = useSelector((state: RootState) => state.auth); // To get loading state for registration
  const isUpdating = useSelector((state: RootState) => state.users.isLoading);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<UserFormData>({
    defaultValues: {
      role: 'user',
      permissions: [],
    }
  });

  const selectedRole = watch('role');
  const selectedPermissions = watch('permissions') || [];

  const handlePermissionChange = (permission: string) => {
    if (selectedPermissions.includes(permission)) {
      setValue('permissions', selectedPermissions.filter(p => p !== permission), { shouldDirty: true });
    } else {
      setValue('permissions', [...selectedPermissions, permission], { shouldDirty: true });
    }
  };

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchUserById(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && currentUser) {
      reset({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        role: currentUser.role,
        department: currentUser.department || '',
        phone: currentUser.phone || '',
        permissions: currentUser.permissions || [],
      });
    }
  }, [currentUser, isEditMode, reset]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEditMode && id) {
        // Manually call update API since we want to handle it securely
        await userApi.update(id, {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          department: data.department,
          role: data.role,
          permissions: data.permissions,
        });
        toast.success('User updated successfully');
      } else {
        if (!data.password) {
          toast.error('Password is required for new users');
          return;
        }
        await dispatch(registerUser({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          role: data.role,
          department: data.department,
          phone: data.phone,
          permissions: data.permissions,
        })).unwrap();
      }
      navigate('/users');
    } catch (error) {
      // Errors handled by slice/api
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
        <button
          onClick={() => navigate('/users')}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit User' : 'Add New User'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEditMode ? 'Update user properties and roles' : 'Create an account for a new fleet management team member'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 page-fade-in stagger-1">
        <div className="card-aurora p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary-600" />
            Basic Profile Info
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <input
                {...register('firstName', { required: 'First name is required' })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                {...register('lastName', { required: 'Last name is required' })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                readOnly={isEditMode}
                className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${isEditMode ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              {isEditMode && <p className="mt-1 text-xs text-gray-500">Email cannot be changed after creation.</p>}
            </div>

            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="card-aurora p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Access & Assignment</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                System Role *
              </label>
              <select
                {...register('role', { required: 'Role is required' })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="user">Standard User</option>
                <option value="technicien">Technician</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <input
                {...register('department')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Workshop"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                {...register('phone')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Custom Permissions */}
          {selectedRole !== 'admin' && (
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Granular Permissions</h3>
              <p className="text-sm text-gray-500 mb-6">Grant individual privileges that override the base capabilities of the selected role.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'add_vehicles', label: 'Create Vehicles' },
                  { id: 'edit_vehicles', label: 'Edit Vehicles' },
                  { id: 'delete_vehicles', label: 'Delete Vehicles' },
                  { id: 'view_maintenance', label: 'View Maintenance Tab' },
                  { id: 'add_maintenance', label: 'Create Maintenance' },
                  { id: 'edit_maintenance', label: 'Edit Maintenance' },
                  { id: 'delete_maintenance', label: 'Delete Maintenance' },
                  { id: 'add_alerts', label: 'Create Alerts' },
                  { id: 'edit_alerts', label: 'Edit Alerts' },
                  { id: 'delete_alerts', label: 'Delete Alerts' },
                ].map((perm) => (
                  <label key={perm.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => handlePermissionChange(perm.id)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || isUpdating}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(isLoading || isUpdating) ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditMode ? 'Save User' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
