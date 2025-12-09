import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchCurrentEnrollmentPeriod = createAsyncThunk(
  'enrollmentPeriod/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/enrollment-periods/current');
      return {
        period: response.data.data,
        isActive: response.data.isActive,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch enrollment period');
    }
  }
);

export const fetchAllEnrollmentPeriods = createAsyncThunk(
  'enrollmentPeriod/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/enrollment-periods');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch enrollment periods');
    }
  }
);

export const fetchEnrollmentPeriodById = createAsyncThunk(
  'enrollmentPeriod/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/enrollment-periods/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch enrollment period');
    }
  }
);

export const createEnrollmentPeriod = createAsyncThunk(
  'enrollmentPeriod/create',
  async (periodData, { rejectWithValue }) => {
    try {
      const response = await api.post('/enrollment-periods', periodData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create enrollment period');
    }
  }
);

export const updateEnrollmentPeriod = createAsyncThunk(
  'enrollmentPeriod/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/enrollment-periods/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update enrollment period');
    }
  }
);

export const deleteEnrollmentPeriod = createAsyncThunk(
  'enrollmentPeriod/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/enrollment-periods/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete enrollment period');
    }
  }
);

const initialState = {
  currentPeriod: null,
  isPeriodActive: false,
  periods: [],
  selectedPeriod: null,
  loading: false,
  error: null,
};

const enrollmentPeriodSlice = createSlice({
  name: 'enrollmentPeriod',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedPeriod: (state) => {
      state.selectedPeriod = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch current enrollment period
      .addCase(fetchCurrentEnrollmentPeriod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentEnrollmentPeriod.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPeriod = action.payload.period;
        state.isPeriodActive = action.payload.isActive;
      })
      .addCase(fetchCurrentEnrollmentPeriod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isPeriodActive = false;
        state.currentPeriod = null;
      })
      // Fetch all enrollment periods
      .addCase(fetchAllEnrollmentPeriods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEnrollmentPeriods.fulfilled, (state, action) => {
        state.loading = false;
        state.periods = action.payload;
      })
      .addCase(fetchAllEnrollmentPeriods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch enrollment period by ID
      .addCase(fetchEnrollmentPeriodById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollmentPeriodById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPeriod = action.payload;
      })
      .addCase(fetchEnrollmentPeriodById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create enrollment period
      .addCase(createEnrollmentPeriod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEnrollmentPeriod.fulfilled, (state, action) => {
        state.loading = false;
        state.periods.unshift(action.payload);
        // Update current period if this is the active one
        const now = new Date();
        const period = action.payload;
        if (
          period.isActive &&
          new Date(period.startDate) <= now &&
          new Date(period.endDate) >= now
        ) {
          state.currentPeriod = period;
          state.isPeriodActive = true;
        }
      })
      .addCase(createEnrollmentPeriod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update enrollment period
      .addCase(updateEnrollmentPeriod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEnrollmentPeriod.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.periods.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.periods[index] = action.payload;
        }
        if (state.selectedPeriod && state.selectedPeriod._id === action.payload._id) {
          state.selectedPeriod = action.payload;
        }
        // Update current period if this is the active one
        const now = new Date();
        const period = action.payload;
        if (
          period.isActive &&
          new Date(period.startDate) <= now &&
          new Date(period.endDate) >= now
        ) {
          state.currentPeriod = period;
          state.isPeriodActive = true;
        } else if (state.currentPeriod && state.currentPeriod._id === period._id) {
          state.currentPeriod = null;
          state.isPeriodActive = false;
        }
      })
      .addCase(updateEnrollmentPeriod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete enrollment period
      .addCase(deleteEnrollmentPeriod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEnrollmentPeriod.fulfilled, (state, action) => {
        state.loading = false;
        state.periods = state.periods.filter((p) => p._id !== action.payload);
        if (state.selectedPeriod && state.selectedPeriod._id === action.payload) {
          state.selectedPeriod = null;
        }
        if (state.currentPeriod && state.currentPeriod._id === action.payload) {
          state.currentPeriod = null;
          state.isPeriodActive = false;
        }
      })
      .addCase(deleteEnrollmentPeriod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedPeriod } = enrollmentPeriodSlice.actions;
export default enrollmentPeriodSlice.reducer;


