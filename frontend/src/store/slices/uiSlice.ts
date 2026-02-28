import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from '@/services/api';
import { Theme } from '@/types';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  isMobile: boolean;
  notifications: {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }[];
  notificationsLoaded: boolean;
}
const initialState: UIState = {
  theme: 'light',
  sidebarOpen: true,
  isMobile: false,
  notifications: [],
  notificationsLoaded: false,
};

// Async Thunks
export const fetchAlertsAsNotifications = createAsyncThunk(
  'ui/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getAlerts();
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch alerts');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching alerts');
    }
  }
);

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);

        if (action.payload === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (action.payload === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // System preference
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
      if (action.payload) {
        state.sidebarOpen = false;
      }
    },
    addNotification: (state, action: PayloadAction<{
      type: 'info' | 'success' | 'warning' | 'error';
      title: string;
      message: string;
    }>) => {
      state.notifications.unshift({
        id: Date.now().toString(),
        ...action.payload,
        read: false,
        createdAt: new Date().toISOString(),
      });
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => {
        n.read = true;
      });
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAlertsAsNotifications.fulfilled, (state, action) => {
      // Remove previously loaded API alerts before adding the refreshed ones
      state.notifications = state.notifications.filter(n => !n.id.startsWith('alert-'));

      const newNotifications = action.payload.map((alert: any) => {
        let type: 'info' | 'success' | 'warning' | 'error' = 'info';

        switch (alert.severity) {
          case 'urgent': type = 'error'; break;
          case 'warning': type = 'warning'; break;
          case 'info': type = 'info'; break;
        }

        let title = 'Alert';
        switch (alert.type) {
          case 'maintenance_overdue': title = 'Maintenance Overdue'; break;
          case 'registration_expiring': title = 'Registration Expiring'; break;
          case 'insurance_expiring': title = 'Insurance Expiring'; break;
          case 'registration_expired': title = 'Registration Expired'; break;
          case 'insurance_expired': title = 'Insurance Expired'; break;
          case 'maintenance_scheduled': title = 'Upcoming Maintenance'; break;
        }

        return {
          id: `alert-${alert.type}-${alert.vehicle}-${new Date(alert.date).getTime()}`,
          type,
          title,
          message: alert.message,
          read: false,
          createdAt: new Date(alert.date).toISOString()
        };
      });

      // Add to store
      state.notifications = [...newNotifications, ...state.notifications];
      state.notificationsLoaded = true;
    });
  }
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setIsMobile,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  removeNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
