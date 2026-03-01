import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from '@/services/api';
import { DashboardOverview, TrendData, Alert } from '@/types';

interface DashboardState {
  overview: DashboardOverview | null;
  trends: TrendData[];
  vehicleStatus: any[];
  maintenanceTypes: any[];
  costAnalysis: any;
  alerts: Alert[];
  isLoading: boolean;
  isLoadingAlerts: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  overview: null,
  trends: [],
  vehicleStatus: [],
  maintenanceTypes: [],
  costAnalysis: null,
  alerts: [],
  isLoading: false,
  isLoadingAlerts: false,
  error: null,
};

// Async thunks
export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getOverview();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard overview');
    }
  }
);

export const fetchDashboardTrends = createAsyncThunk(
  'dashboard/fetchTrends',
  async (months: number | undefined, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getTrends(months);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trends');
    }
  }
);

export const fetchVehicleStatus = createAsyncThunk(
  'dashboard/fetchVehicleStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getVehicleStatus();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicle status');
    }
  }
);

export const fetchMaintenanceTypes = createAsyncThunk(
  'dashboard/fetchMaintenanceTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getMaintenanceTypes();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance types');
    }
  }
);

export const fetchCostAnalysis = createAsyncThunk(
  'dashboard/fetchCostAnalysis',
  async (months: number | undefined, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getCostAnalysis(months);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cost analysis');
    }
  }
);

export const fetchAlerts = createAsyncThunk(
  'dashboard/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getAlerts();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch alerts');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Overview
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overview = action.payload;
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Trends
      .addCase(fetchDashboardTrends.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDashboardTrends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trends = action.payload;
      })
      .addCase(fetchDashboardTrends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Vehicle Status
      .addCase(fetchVehicleStatus.fulfilled, (state, action) => {
        state.vehicleStatus = action.payload;
      })
      // Maintenance Types
      .addCase(fetchMaintenanceTypes.fulfilled, (state, action) => {
        state.maintenanceTypes = action.payload;
      })
      // Cost Analysis
      .addCase(fetchCostAnalysis.fulfilled, (state, action) => {
        state.costAnalysis = action.payload;
      })
      // Alerts
      .addCase(fetchAlerts.pending, (state) => {
        state.isLoadingAlerts = true;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.isLoadingAlerts = false;
        state.alerts = action.payload;
      })
      .addCase(fetchAlerts.rejected, (state) => {
        state.isLoadingAlerts = false;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
