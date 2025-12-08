import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchAllEnrollments = createAsyncThunk(
  'enrollments/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/enrollments', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch enrollments');
    }
  }
);

export const fetchEnrollmentById = createAsyncThunk(
  'enrollments/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/enrollments/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch enrollment');
    }
  }
);

export const createEnrollment = createAsyncThunk(
  'enrollments/create',
  async (enrollmentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/enrollments', enrollmentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create enrollment');
    }
  }
);

export const adminCreateEnrollment = createAsyncThunk(
  'enrollments/adminCreate',
  async (enrollmentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/enrollments/admin', enrollmentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create enrollment');
    }
  }
);

export const updateEnrollment = createAsyncThunk(
  'enrollments/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/enrollments/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update enrollment');
    }
  }
);

export const deleteEnrollment = createAsyncThunk(
  'enrollments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/enrollments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete enrollment');
    }
  }
);

const initialState = {
  enrollments: [],
  selectedEnrollment: null,
  loading: false,
  error: null,
};

const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedEnrollment: (state) => {
      state.selectedEnrollment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all enrollments
      .addCase(fetchAllEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchAllEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch enrollment by ID
      .addCase(fetchEnrollmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEnrollment = action.payload;
        const index = state.enrollments.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) {
          state.enrollments[index] = action.payload;
        }
      })
      .addCase(fetchEnrollmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create enrollment
      .addCase(createEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEnrollment.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments.push(action.payload);
      })
      .addCase(createEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Admin create enrollment
      .addCase(adminCreateEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminCreateEnrollment.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments.push(action.payload);
      })
      .addCase(adminCreateEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update enrollment
      .addCase(updateEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEnrollment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.enrollments.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) {
          state.enrollments[index] = action.payload;
        }
        if (state.selectedEnrollment && state.selectedEnrollment._id === action.payload._id) {
          state.selectedEnrollment = action.payload;
        }
      })
      .addCase(updateEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete enrollment
      .addCase(deleteEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEnrollment.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = state.enrollments.filter((e) => e._id !== action.payload);
        if (state.selectedEnrollment && state.selectedEnrollment._id === action.payload) {
          state.selectedEnrollment = null;
        }
      })
      .addCase(deleteEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedEnrollment } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;

