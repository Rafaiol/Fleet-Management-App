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
    isAdmin: user?.role === 'admin',
    isTechnicien: user?.role === 'technicien',
  };
};
