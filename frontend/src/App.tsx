import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, AppDispatch } from '@/store';
import { getMe } from '@/store/slices/authSlice';
import { setIsMobile, fetchAlertsAsNotifications } from '@/store/slices/uiSlice';

import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Vehicles from '@/pages/Vehicles';
import VehicleDetail from '@/pages/VehicleDetail';
import VehicleForm from '@/pages/VehicleForm';
import Maintenance from '@/pages/Maintenance';
import MaintenanceDetail from '@/pages/MaintenanceDetail';
import MaintenanceForm from '@/pages/MaintenanceForm';
import Users from '@/pages/Users';
import UserForm from '@/pages/UserForm';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Notifications from '@/pages/Notifications';
import AlertRules from '@/pages/AlertRules';
import NotFound from '@/pages/NotFound';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getMe());
      dispatch(fetchAlertsAsNotifications());
    }

    // Handle responsive layout
    const handleResize = () => {
      dispatch(setIsMobile(window.innerWidth < 1024));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/new" element={<VehicleForm />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/vehicles/:id/edit" element={<VehicleForm />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/maintenance/new" element={<MaintenanceForm />} />
          <Route path="/maintenance/:id" element={<MaintenanceDetail />} />
          <Route path="/maintenance/:id/edit" element={<MaintenanceForm />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Admin Only Routes */}
      <Route element={<ProtectedRoute requireAdmin />}>
        <Route element={<Layout />}>
          <Route path="/users" element={<Users />} />
          <Route path="/users/new" element={<UserForm />} />
          <Route path="/users/:id/edit" element={<UserForm />} />
        </Route>
      </Route>

      {/* Routes Requiring Specific Permissions */}
      <Route element={<ProtectedRoute requirePermission={['add_alerts', 'edit_alerts', 'delete_alerts']} />}>
        <Route element={<Layout />}>
          <Route path="/alert-rules" element={<AlertRules />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
