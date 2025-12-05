import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchAllAdmins = createAsyncThunk(
  'admins/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admins', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admins');
    }
  }
);

export const fetchAdminById = createAsyncThunk(
  'admins/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admins/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin');
    }
  }
);

export const createAdmin = createAsyncThunk(
  'admins/create',
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admins', adminData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create admin');
    }
  }
);

export const updateAdmin = createAsyncThunk(
  'admins/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admins/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update admin');
    }
  }
);

export const deleteAdmin = createAsyncThunk(
  'admins/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admins/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete admin');
    }
  }
);

const initialState = {
  admins: [],
  selectedAdmin: null,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admins',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedAdmin: (state) => {
      state.selectedAdmin = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all admins
      .addCase(fetchAllAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload;
      })
      .addCase(fetchAllAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch admin by ID
      .addCase(fetchAdminById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAdmin = action.payload;
        const index = state.admins.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.admins[index] = action.payload;
        }
      })
      .addCase(fetchAdminById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create admin
      .addCase(createAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admins.push(action.payload);
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update admin
      .addCase(updateAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.admins.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.admins[index] = action.payload;
        }
        if (state.selectedAdmin && state.selectedAdmin._id === action.payload._id) {
          state.selectedAdmin = action.payload;
        }
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete admin
      .addCase(deleteAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = state.admins.filter((a) => a._id !== action.payload);
        if (state.selectedAdmin && state.selectedAdmin._id === action.payload) {
          state.selectedAdmin = null;
        }
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedAdmin } = adminSlice.actions;
export default adminSlice.reducer;

