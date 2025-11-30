import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchAllSchedules = createAsyncThunk(
  'schedules/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/schedules', { params });
      return response.data.data; // Backend returns { success: true, count, data: schedules[] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schedules');
    }
  }
);

export const fetchScheduleById = createAsyncThunk(
  'schedules/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/schedules/${id}`);
      return response.data.data; // Backend returns { success: true, data: schedule }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schedule');
    }
  }
);

export const createSchedule = createAsyncThunk(
  'schedules/create',
  async (scheduleData, { rejectWithValue }) => {
    try {
      const response = await api.post('/schedules', scheduleData);
      return response.data.data; // Backend returns { success: true, data: schedule }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create schedule');
    }
  }
);

export const updateSchedule = createAsyncThunk(
  'schedules/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/schedules/${id}`, data);
      return response.data.data; // Backend returns { success: true, data: schedule }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update schedule');
    }
  }
);

export const deleteSchedule = createAsyncThunk(
  'schedules/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/schedules/${id}`);
      return id; // Return id to remove from state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete schedule');
    }
  }
);

const initialState = {
  schedules: [],
  selectedSchedule: null,
  loading: false,
  error: null,
};

const scheduleSlice = createSlice({
  name: 'schedules',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedSchedule: (state) => {
      state.selectedSchedule = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all schedules
      .addCase(fetchAllSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchAllSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch schedule by ID
      .addCase(fetchScheduleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScheduleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSchedule = action.payload;
        // Also update in schedules array if it exists
        const index = state.schedules.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.schedules[index] = action.payload;
        }
      })
      .addCase(fetchScheduleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create schedule
      .addCase(createSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules.push(action.payload);
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update schedule
      .addCase(updateSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.schedules.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.schedules[index] = action.payload;
        }
        // Update selectedSchedule if it's the same
        if (state.selectedSchedule && state.selectedSchedule._id === action.payload._id) {
          state.selectedSchedule = action.payload;
        }
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete schedule
      .addCase(deleteSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = state.schedules.filter((s) => s._id !== action.payload);
        // Clear selectedSchedule if it was deleted
        if (state.selectedSchedule && state.selectedSchedule._id === action.payload) {
          state.selectedSchedule = null;
        }
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedSchedule } = scheduleSlice.actions;
export default scheduleSlice.reducer;

