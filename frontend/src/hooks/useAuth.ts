import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '@/store';
import { login, logout, getMe, updatePassword, clearError } from '@/store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogin = useCallback(
    (email: string, password: string) => {
      return dispatch(login({ email, password }));
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const handleGetMe = useCallback(() => {
    return dispatch(getMe());
  }, [dispatch]);

  const handleUpdatePassword = useCallback(
    (currentPassword: string, newPassword: string) => {
      return dispatch(updatePassword({ currentPassword, newPassword }));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const isAdmin = user?.role === 'admin';
  const hasPermission = (permission: string) => isAdmin || (user?.permissions || []).includes(permission);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    getMe: handleGetMe,
    updatePassword: handleUpdatePassword,
    clearError: handleClearError,
    isAdmin,
    isTechnicien: user?.role === 'technicien',
    canAddVehicles: hasPermission('add_vehicles'),
    canEditVehicles: hasPermission('edit_vehicles'),
    canDeleteVehicles: hasPermission('delete_vehicles'),
    canViewMaintenance: hasPermission('view_maintenance'),
    canAddMaintenance: hasPermission('add_maintenance'),
    canEditMaintenance: hasPermission('edit_maintenance'),
    canDeleteMaintenance: hasPermission('delete_maintenance'),
    canAddAlerts: hasPermission('add_alerts'),
  };
};
