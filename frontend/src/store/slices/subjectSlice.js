import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchAllSubjects = createAsyncThunk(
  'subjects/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/subjects', { params });
      return response.data.data; // Backend returns { success: true, count, data: subjects[] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subjects');
    }
  }
);

export const fetchSubjectById = createAsyncThunk(
  'subjects/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/subjects/${id}`);
      return response.data.data; // Backend returns { success: true, data: subject }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subject');
    }
  }
);

export const createSubject = createAsyncThunk(
  'subjects/create',
  async (subjectData, { rejectWithValue }) => {
    try {
      const response = await api.post('/subjects', subjectData);
      return response.data.data; // Backend returns { success: true, data: subject }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create subject');
    }
  }
);

export const updateSubject = createAsyncThunk(
  'subjects/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/subjects/${id}`, data);
      return response.data.data; // Backend returns { success: true, data: subject }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subject');
    }
  }
);

export const deleteSubject = createAsyncThunk(
  'subjects/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/subjects/${id}`);
      return id; // Return id to remove from state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete subject');
    }
  }
);

const initialState = {
  subjects: [],
  selectedSubject: null,
  loading: false,
  error: null,
};

const subjectSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedSubject: (state) => {
      state.selectedSubject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all subjects
      .addCase(fetchAllSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload;
      })
      .addCase(fetchAllSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch subject by ID
      .addCase(fetchSubjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSubject = action.payload;
        // Also update in subjects array if it exists
        const index = state.subjects.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.subjects[index] = action.payload;
        }
      })
      .addCase(fetchSubjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create subject
      .addCase(createSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects.push(action.payload);
      })
      .addCase(createSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update subject
      .addCase(updateSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.subjects.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.subjects[index] = action.payload;
        }
        // Update selectedSubject if it's the same
        if (state.selectedSubject && state.selectedSubject._id === action.payload._id) {
          state.selectedSubject = action.payload;
        }
      })
      .addCase(updateSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete subject
      .addCase(deleteSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = state.subjects.filter((s) => s._id !== action.payload);
        // Clear selectedSubject if it was deleted
        if (state.selectedSubject && state.selectedSubject._id === action.payload) {
          state.selectedSubject = null;
        }
      })
      .addCase(deleteSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedSubject } = subjectSlice.actions;
export default subjectSlice.reducer;

