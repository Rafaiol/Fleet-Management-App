import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { maintenanceApi } from '@/services/api';
import { Maintenance } from '@/types';
import { toast } from 'react-toastify';

interface MaintenanceState {
  records: Maintenance[];
  currentRecord: Maintenance | null;
  stats: any;
  types: string[];
  timeline: any;
  isLoading: boolean;
  isLoadingDetails: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

const initialState: MaintenanceState = {
  records: [],
  currentRecord: null,
  stats: null,
  types: [],
  timeline: null,
  isLoading: false,
  isLoadingDetails: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 0,
    limit: 10,
  },
};

// Async thunks
export const fetchMaintenance = createAsyncThunk(
  'maintenance/fetchAll',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await maintenanceApi.getAll(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance records');
    }
  }
);

export const fetchMaintenanceById = createAsyncThunk(
  'maintenance/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await maintenanceApi.getById(id);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance record');
    }
  }
);

export const createMaintenance = createAsyncThunk(
  'maintenance/create',
  async (data: Partial<Maintenance>, { rejectWithValue }) => {
    try {
      const response = await maintenanceApi.create(data as any);
      toast.success('Maintenance record created successfully!');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create maintenance record';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateMaintenance = createAsyncThunk(
  'maintenance/update',
  async ({ id, data }: { id: string; data: Partial<Maintenance> }, { rejectWithValue }) => {
    try {
      const response = await maintenanceApi.update(id, data);
      toast.success('Maintenance record updated successfully!');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update maintenance record';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteMaintenance = createAsyncThunk(
  'maintenance/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await maintenanceApi.delete(id);
      toast.success('Maintenance record deleted successfully!');
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete maintenance record';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchMaintenanceStats = createAsyncThunk(
  'maintenance/fetchStats',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await maintenanceApi.getStats(params);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance stats');
    }
  }
);

export const fetchMaintenanceTypes = createAsyncThunk(
  'maintenance/fetchTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await maintenanceApi.getTypes();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance types');
    }
  }
);

export const fetchMaintenanceTimeline = createAsyncThunk(
  'maintenance/fetchTimeline',
  async ({ vehicleId, limit }: { vehicleId: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await maintenanceApi.getTimeline(vehicleId, limit);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance timeline');
    }
  }
);

export const completeMaintenance = createAsyncThunk(
  'maintenance/complete',
  async ({ id, data }: { 
    id: string; 
    data: { 
      workPerformed: string; 
      mileageAtService?: number; 
      completionDate?: string;
      totalCost?: number;
    } 
  }, { rejectWithValue }) => {
    try {
      const response = await maintenanceApi.complete(id, data);
      toast.success('Maintenance marked as completed!');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to complete maintenance';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    clearCurrentRecord: (state) => {
      state.currentRecord = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchMaintenance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMaintenance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = action.payload.data;
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchMaintenance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch by ID
      .addCase(fetchMaintenanceById.pending, (state) => {
        state.isLoadingDetails = true;
        state.error = null;
      })
      .addCase(fetchMaintenanceById.fulfilled, (state, action) => {
        state.isLoadingDetails = false;
        state.currentRecord = action.payload;
      })
      .addCase(fetchMaintenanceById.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createMaintenance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMaintenance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records.unshift(action.payload);
      })
      .addCase(createMaintenance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateMaintenance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMaintenance.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.records.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        if (state.currentRecord?.id === action.payload.id) {
          state.currentRecord = action.payload;
        }
      })
      .addCase(updateMaintenance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteMaintenance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMaintenance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = state.records.filter(r => r.id !== action.payload);
        if (state.currentRecord?.id === action.payload) {
          state.currentRecord = null;
        }
      })
      .addCase(deleteMaintenance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Stats
      .addCase(fetchMaintenanceStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMaintenanceStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchMaintenanceStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Types
      .addCase(fetchMaintenanceTypes.fulfilled, (state, action) => {
        state.types = action.payload;
      })
      // Timeline
      .addCase(fetchMaintenanceTimeline.fulfilled, (state, action) => {
        state.timeline = action.payload;
      })
      // Complete
      .addCase(completeMaintenance.fulfilled, (state, action) => {
        const index = state.records.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
        if (state.currentRecord?.id === action.payload.id) {
          state.currentRecord = action.payload;
        }
      });
  },
});

export const { clearCurrentRecord, clearError } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
