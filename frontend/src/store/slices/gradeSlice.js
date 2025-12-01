import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchGrades = createAsyncThunk(
  'grades/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/grades', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch grades');
    }
  }
);

export const fetchGradeById = createAsyncThunk(
  'grades/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/grades/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch grade');
    }
  }
);

export const createGrade = createAsyncThunk(
  'grades/create',
  async (gradeData, { rejectWithValue }) => {
    try {
      const response = await api.post('/grades', gradeData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create grade');
    }
  }
);

export const updateGrade = createAsyncThunk(
  'grades/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/grades/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update grade');
    }
  }
);

export const deleteGrade = createAsyncThunk(
  'grades/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/grades/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete grade');
    }
  }
);

const initialState = {
  grades: [],
  selectedGrade: null,
  loading: false,
  error: null,
};

const gradeSlice = createSlice({
  name: 'grades',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedGrade: (state) => {
      state.selectedGrade = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all grades
      .addCase(fetchGrades.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGrades.fulfilled, (state, action) => {
        state.loading = false;
        state.grades = action.payload;
      })
      .addCase(fetchGrades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch grade by ID
      .addCase(fetchGradeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGradeById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedGrade = action.payload;
        const index = state.grades.findIndex((g) => g._id === action.payload._id);
        if (index !== -1) {
          state.grades[index] = action.payload;
        }
      })
      .addCase(fetchGradeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create grade
      .addCase(createGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGrade.fulfilled, (state, action) => {
        state.loading = false;
        state.grades.push(action.payload);
      })
      .addCase(createGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update grade
      .addCase(updateGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGrade.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.grades.findIndex((g) => g._id === action.payload._id);
        if (index !== -1) {
          state.grades[index] = action.payload;
        }
        if (state.selectedGrade && state.selectedGrade._id === action.payload._id) {
          state.selectedGrade = action.payload;
        }
      })
      .addCase(updateGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete grade
      .addCase(deleteGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGrade.fulfilled, (state, action) => {
        state.loading = false;
        state.grades = state.grades.filter((g) => g._id !== action.payload);
        if (state.selectedGrade && state.selectedGrade._id === action.payload) {
          state.selectedGrade = null;
        }
      })
      .addCase(deleteGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedGrade } = gradeSlice.actions;
export default gradeSlice.reducer;
