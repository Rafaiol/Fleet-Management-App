import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { RootState, AppDispatch } from '@/store';
import { setTheme } from '@/store/slices/uiSlice';
import { Theme } from '@/types';

export const useTheme = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    // Apply theme on mount
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) {
      dispatch(setTheme(stored));
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      dispatch(setTheme('dark'));
    }
  }, [dispatch]);

  const handleSetTheme = useCallback(
    (newTheme: Theme) => {
      dispatch(setTheme(newTheme));
    },
    [dispatch]
  );

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  }, [dispatch, theme]);

  const isDark = theme === 'dark';

  return {
    theme,
    isDark,
    setTheme: handleSetTheme,
    toggleTheme,
  };
};
