import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vehicleApi } from '@/services/api';
import { Vehicle } from '@/types';
import { toast } from 'react-toastify';

interface VehicleState {
  vehicles: Vehicle[];
  currentVehicle: Vehicle | null;
  maintenanceHistory: any[];
  stats: any;
  makes: string[];
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

const initialState: VehicleState = {
  vehicles: [],
  currentVehicle: null,
  maintenanceHistory: [],
  stats: null,
  makes: [],
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
export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchAll',
  async (params: any | undefined, { rejectWithValue }) => {
    try {
      const response = await vehicleApi.getAll(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicles');
    }
  }
);

export const fetchVehicleById = createAsyncThunk(
  'vehicles/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await vehicleApi.getById(id);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicle');
    }
  }
);

export const createVehicle = createAsyncThunk(
  'vehicles/create',
  async (data: Partial<Vehicle>, { rejectWithValue }) => {
    try {
      const response = await vehicleApi.create(data);
      toast.success('Vehicle created successfully!');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create vehicle';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateVehicle = createAsyncThunk(
  'vehicles/update',
  async ({ id, data }: { id: string; data: Partial<Vehicle> }, { rejectWithValue }) => {
    try {
      const response = await vehicleApi.update(id, data);
      toast.success('Vehicle updated successfully!');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update vehicle';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  'vehicles/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await vehicleApi.delete(id);
      toast.success('Vehicle deleted successfully!');
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete vehicle';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchVehicleStats = createAsyncThunk(
  'vehicles/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehicleApi.getStats();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicle stats');
    }
  }
);

export const fetchVehicleMakes = createAsyncThunk(
  'vehicles/fetchMakes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehicleApi.getMakes();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicle makes');
    }
  }
);

export const updateVehicleMileage = createAsyncThunk(
  'vehicles/updateMileage',
  async ({ id, mileage }: { id: string; mileage: number }, { rejectWithValue }) => {
    try {
      const response = await vehicleApi.updateMileage(id, mileage);
      toast.success('Mileage updated successfully!');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update mileage';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    clearCurrentVehicle: (state) => {
      state.currentVehicle = null;
      state.maintenanceHistory = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchVehicles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicles = action.payload.data;
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch by ID
      .addCase(fetchVehicleById.pending, (state) => {
        state.isLoadingDetails = true;
        state.error = null;
      })
      .addCase(fetchVehicleById.fulfilled, (state, action) => {
        state.isLoadingDetails = false;
        state.currentVehicle = action.payload.vehicle;
        state.maintenanceHistory = action.payload.maintenanceHistory;
      })
      .addCase(fetchVehicleById.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createVehicle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicles.unshift(action.payload);
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateVehicle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.vehicles.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
        if (state.currentVehicle?.id === action.payload.id) {
          state.currentVehicle = action.payload;
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteVehicle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vehicles = state.vehicles.filter(v => v.id !== action.payload);
        if (state.currentVehicle?.id === action.payload) {
          state.currentVehicle = null;
        }
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Stats
      .addCase(fetchVehicleStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchVehicleStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchVehicleStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Makes
      .addCase(fetchVehicleMakes.fulfilled, (state, action) => {
        state.makes = action.payload;
      })
      // Update mileage
      .addCase(updateVehicleMileage.fulfilled, (state, action) => {
        if (state.currentVehicle) {
          state.currentVehicle.currentMileage = action.payload.currentMileage;
        }
      });
  },
});

export const { clearCurrentVehicle, clearError } = vehicleSlice.actions;
export default vehicleSlice.reducer;
