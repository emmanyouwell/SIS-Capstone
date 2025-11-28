import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchAnnouncements = createAsyncThunk(
  'announcements/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/announcements', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch announcements');
    }
  }
);

export const fetchAnnouncement = createAsyncThunk(
  'announcements/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/announcements/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch announcement');
    }
  }
);

export const createAnnouncement = createAsyncThunk(
  'announcements/create',
  async (announcementData, { rejectWithValue }) => {
    try {
      const response = await api.post('/announcements', announcementData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create announcement');
    }
  }
);

export const updateAnnouncement = createAsyncThunk(
  'announcements/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/announcements/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update announcement');
    }
  }
);

export const deleteAnnouncement = createAsyncThunk(
  'announcements/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/announcements/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete announcement');
    }
  }
);

const initialState = {
  announcements: [],
  currentAnnouncement: null,
  loading: false,
  error: null,
};

const announcementSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrent: (state) => {
      state.currentAnnouncement = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch one
      .addCase(fetchAnnouncement.fulfilled, (state, action) => {
        state.currentAnnouncement = action.payload;
      })
      // Create
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.announcements.unshift(action.payload);
      })
      // Update
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        const index = state.announcements.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.announcements[index] = action.payload;
        }
        if (state.currentAnnouncement?._id === action.payload._id) {
          state.currentAnnouncement = action.payload;
        }
      })
      // Delete
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.announcements = state.announcements.filter((a) => a._id !== action.payload);
      });
  },
});

export const { clearError, clearCurrent } = announcementSlice.actions;
export default announcementSlice.reducer;

