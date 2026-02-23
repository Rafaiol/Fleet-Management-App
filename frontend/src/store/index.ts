import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import vehicleReducer from './slices/vehicleSlice';
import maintenanceReducer from './slices/maintenanceSlice';
import dashboardReducer from './slices/dashboardSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicles: vehicleReducer,
    maintenance: maintenanceReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
    users: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setUser', 'auth/logout'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
