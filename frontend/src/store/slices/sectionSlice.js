import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const getAllSections = createAsyncThunk(
  'sections/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/sections', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sections');
    }
  }
);

export const createSection = createAsyncThunk(
  'sections/create',
  async (sectionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/sections', sectionData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create section');
    }
  }
);

export const updateSection = createAsyncThunk(
  'sections/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/sections/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update section');
    }
  }
);

export const deleteSection = createAsyncThunk(
  'sections/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/sections/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete section');
    }
  }
);

const initialState = {
  data: [],
  loading: false,
  error: null,
};

const sectionSlice = createSlice({
  name: 'section',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all sections
      .addCase(getAllSections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllSections.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getAllSections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create section
      .addCase(createSection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSection.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(createSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update section
      .addCase(updateSection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSection.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete section
      .addCase(deleteSection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSection.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteSection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = sectionSlice.actions;
export default sectionSlice.reducer;

