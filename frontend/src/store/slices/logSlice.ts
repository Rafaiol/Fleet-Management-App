import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logApi } from '@/services/api';
import { toast } from 'react-toastify';
import type { RootState } from '../index';

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
  filters: {
    search: string;
    action: string;
    resourceType: string;
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
  filters: {
    search: '',
    action: '',
    resourceType: '',
  },
};

export const fetchLogs = createAsyncThunk<any, any, { rejectValue: string }>(
  'logs/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await logApi.getAll(params);
      return {
        data: response.data,
        filters: {
          search: params.search || '',
          action: params.action || '',
          resourceType: params.resourceType || '',
        }
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity logs');
    }
  }
);

export const undoAction = createAsyncThunk<any, string, { rejectValue: string; state: RootState }>(
  'logs/undo',
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await logApi.undo(id);
      toast.success('Action undone successfully');

      // Refresh logs using current filter/search state
      const { logs } = getState();
      await dispatch(fetchLogs({
        page: logs.pagination.page,
        limit: logs.pagination.limit,
        search: logs.filters.search,
        action: logs.filters.action,
        resourceType: logs.filters.resourceType,
      })).unwrap();

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
        state.logs = action.payload.data.logs;
        state.pagination = {
          page: action.payload.data.page,
          pages: action.payload.data.pages,
          total: action.payload.data.total,
          limit: state.pagination.limit,
        };
        state.filters = action.payload.filters;
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
