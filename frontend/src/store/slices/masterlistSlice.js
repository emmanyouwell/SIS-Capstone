import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchMasterlists = createAsyncThunk(
  'masterlists/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/masterlists', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch masterlists');
    }
  }
);

export const fetchMasterlistById = createAsyncThunk(
  'masterlists/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/masterlists/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch masterlist');
    }
  }
);

export const createMasterlist = createAsyncThunk(
  'masterlists/create',
  async (masterlistData, { rejectWithValue }) => {
    try {
      const response = await api.post('/masterlists', masterlistData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create masterlist');
    }
  }
);

export const updateMasterlist = createAsyncThunk(
  'masterlists/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/masterlists/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update masterlist');
    }
  }
);

export const deleteMasterlist = createAsyncThunk(
  'masterlists/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/masterlists/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete masterlist');
    }
  }
);

const initialState = {
  masterlists: [],
  selectedMasterlist: null,
  loading: false,
  error: null,
};

const masterlistSlice = createSlice({
  name: 'masterlists',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedMasterlist: (state) => {
      state.selectedMasterlist = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all masterlists
      .addCase(fetchMasterlists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterlists.fulfilled, (state, action) => {
        state.loading = false;
        state.masterlists = action.payload;
      })
      .addCase(fetchMasterlists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch masterlist by ID
      .addCase(fetchMasterlistById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterlistById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMasterlist = action.payload;
        const index = state.masterlists.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) {
          state.masterlists[index] = action.payload;
        }
      })
      .addCase(fetchMasterlistById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create masterlist
      .addCase(createMasterlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMasterlist.fulfilled, (state, action) => {
        state.loading = false;
        state.masterlists.push(action.payload);
      })
      .addCase(createMasterlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update masterlist
      .addCase(updateMasterlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMasterlist.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.masterlists.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) {
          state.masterlists[index] = action.payload;
        }
        if (state.selectedMasterlist && state.selectedMasterlist._id === action.payload._id) {
          state.selectedMasterlist = action.payload;
        }
      })
      .addCase(updateMasterlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete masterlist
      .addCase(deleteMasterlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMasterlist.fulfilled, (state, action) => {
        state.loading = false;
        state.masterlists = state.masterlists.filter((m) => m._id !== action.payload);
        if (state.selectedMasterlist && state.selectedMasterlist._id === action.payload) {
          state.selectedMasterlist = null;
        }
      })
      .addCase(deleteMasterlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedMasterlist } = masterlistSlice.actions;
export default masterlistSlice.reducer;
