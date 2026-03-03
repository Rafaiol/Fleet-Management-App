import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logApi } from '@/services/api';
import { toast } from 'react-toastify';

export interface ActivityLog {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT';
  resourceType: string;
  resourceId: string;
  description: string;
  previousState?: any;
  newState?: any;
  undone: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LogState {
  logs: ActivityLog[];
  isLoading: boolean;
  isUndoing: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

const initialState: LogState = {
  logs: [],
  isLoading: false,
  isUndoing: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 0,
    limit: 20,
  },
};

export const fetchLogs = createAsyncThunk<any, any, { rejectValue: string }>(
  'logs/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await logApi.getAll(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity logs');
    }
  }
);

export const undoAction = createAsyncThunk<any, string, { rejectValue: string }>(
  'logs/undo',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await logApi.undo(id);
      toast.success('Action undone successfully');
      // Refresh logs after un-doing
      dispatch(fetchLogs({ page: 1, limit: 20 }));
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to undo action';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const logSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch logs
      .addCase(fetchLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload.logs;
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total,
          limit: state.pagination.limit,
        };
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Undo Action
      .addCase(undoAction.pending, (state) => {
        state.isUndoing = true;
      })
      .addCase(undoAction.fulfilled, (state) => {
        state.isUndoing = false;
      })
      .addCase(undoAction.rejected, (state, action) => {
        state.isUndoing = false;
        state.error = action.payload as string;
      });
  },
});

export default logSlice.reducer;
