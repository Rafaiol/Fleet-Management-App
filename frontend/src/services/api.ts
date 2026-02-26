import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = (error.response?.data as { message?: string })?.message || 'An error occurred';

    // Handle specific error codes
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please log in again.');
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
    department?: string;
  }) => api.post('/auth/register', data),

  getMe: () => api.get('/auth/me'),

  updatePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/update-password', { currentPassword, newPassword }),

  logout: () => api.post('/auth/logout'),

  refreshToken: () => api.post('/auth/refresh'),
};

// User API
export const userApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }) => api.get('/users', { params }),

  getById: (id: string) => api.get(`/users/${id}`),

  update: (id: string, data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    department: string;
    role: string;
    isActive: boolean;
  }>) => api.put(`/users/${id}`, data),

  delete: (id: string) => api.delete(`/users/${id}`),

  getStats: () => api.get('/users/stats/overview'),

  toggleStatus: (id: string) => api.put(`/users/${id}/toggle-status`),
};

// Vehicle API
export const vehicleApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    make?: string;
    fuelType?: string;
    bodyType?: string;
    yearFrom?: number;
    yearTo?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => api.get('/vehicles', { params }),

  getById: (id: string) => api.get(`/vehicles/${id}`),

  create: (data: Partial<{
    plateNumber: string;
    make: string;
    model: string;
    year: number;
    vin?: string;
    color?: string;
    bodyType: string;
    fuelType: string;
    transmission: string;
    engineSize?: number;
    registrationDate?: string;
    registrationExpiry?: string;
    insuranceNumber?: string;
    insuranceExpiry?: string;
    status: string;
    currentMileage: number;
    notes?: string;
  }>) => api.post('/vehicles', data),

  update: (id: string, data: Partial<{
    plateNumber?: string;
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
    color?: string;
    bodyType?: string;
    fuelType?: string;
    transmission?: string;
    engineSize?: number;
    registrationDate?: string;
    registrationExpiry?: string;
    insuranceNumber?: string;
    insuranceExpiry?: string;
    status?: string;
    currentMileage?: number;
    notes?: string;
  }>) => api.put(`/vehicles/${id}`, data),

  delete: (id: string) => api.delete(`/vehicles/${id}`),

  getStats: () => api.get('/vehicles/stats/overview'),

  getMakes: () => api.get('/vehicles/filters/makes'),

  updateMileage: (id: string, mileage: number) =>
    api.put(`/vehicles/${id}/mileage`, { mileage }),

  getNeedingMaintenance: (days?: number) =>
    api.get('/vehicles/maintenance/due', { params: { days } }),
};

// Maintenance API
export const maintenanceApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    vehicle?: string;
    status?: string;
    type?: string;
    priority?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => api.get('/maintenance', { params }),

  getById: (id: string) => api.get(`/maintenance/${id}`),

  create: (data: {
    vehicle: string;
    type: string;
    scheduledDate: string;
    description: string;
    priority?: string;
    mileageAtService?: number;
    serviceProvider?: {
      name?: string;
      address?: string;
      phone?: string;
      email?: string;
    };
    technician?: string;
    partsUsed?: Array<{
      name: string;
      partNumber?: string;
      quantity: number;
      unitPrice: number;
    }>;
    laborHours?: number;
    laborRate?: number;
    notes?: string;
  }) => api.post('/maintenance', data),

  update: (id: string, data: Partial<{
    type?: string;
    scheduledDate?: string;
    description?: string;
    priority?: string;
    status?: string;
    workPerformed?: string;
    mileageAtService?: number;
    completionDate?: string;
    partsUsed?: Array<{
      name: string;
      partNumber?: string;
      quantity: number;
      unitPrice: number;
    }>;
    laborHours?: number;
    laborRate?: number;
    totalCost?: number;
    notes?: string;
  }>) => api.put(`/maintenance/${id}`, data),

  delete: (id: string) => api.delete(`/maintenance/${id}`),

  getStats: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/maintenance/stats/overview', { params }),

  getTypes: () => api.get('/maintenance/filters/types'),

  getTimeline: (vehicleId: string, limit?: number) =>
    api.get(`/maintenance/vehicle/${vehicleId}/timeline`, { params: { limit } }),

  complete: (id: string, data: {
    workPerformed: string;
    mileageAtService?: number;
    completionDate?: string;
    totalCost?: number;
  }) => api.put(`/maintenance/${id}/complete`, data),
};

// Dashboard API
export const dashboardApi = {
  getOverview: () => api.get('/dashboard/overview'),

  getTrends: (months?: number) =>
    api.get('/dashboard/trends', { params: { months } }),

  getVehicleStatus: () => api.get('/dashboard/vehicle-status'),

  getMaintenanceTypes: () => api.get('/dashboard/maintenance-types'),

  getCostAnalysis: (months?: number) =>
    api.get('/dashboard/cost-analysis', { params: { months } }),

  getAlerts: () => api.get('/dashboard/alerts'),
};

// Report API
export const reportApi = {
  generateVehicleReport: (vehicleId: string) =>
    api.get(`/reports/vehicle/${vehicleId}`, { responseType: 'blob' }),

  generateMaintenanceReport: (maintenanceId: string) =>
    api.get(`/reports/maintenance/${maintenanceId}`, { responseType: 'blob' }),

  generateFleetSummary: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/reports/fleet-summary', { params, responseType: 'blob' }),

  generateVehiclesActivityReport: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/reports/vehicles-activity', { params, responseType: 'blob' }),

  generateMaintenanceActivityReport: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/reports/maintenance-activity', { params, responseType: 'blob' }),
};

export default api;
