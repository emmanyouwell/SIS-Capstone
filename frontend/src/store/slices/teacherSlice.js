import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchAllTeachers = createAsyncThunk(
  'teachers/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/teachers', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teachers');
    }
  }
);

export const fetchTeacherById = createAsyncThunk(
  'teachers/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/teachers/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teacher');
    }
  }
);

export const createTeacher = createAsyncThunk(
  'teachers/create',
  async (teacherData, { rejectWithValue }) => {
    try {
      const response = await api.post('/teachers', teacherData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create teacher');
    }
  }
);

export const updateTeacher = createAsyncThunk(
  'teachers/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/teachers/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update teacher');
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  'teachers/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/teachers/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete teacher');
    }
  }
);

const initialState = {
  teachers: [],
  selectedTeacher: null,
  loading: false,
  error: null,
};

const teacherSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedTeacher: (state) => {
      state.selectedTeacher = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all teachers
      .addCase(fetchAllTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload;
      })
      .addCase(fetchAllTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch teacher by ID
      .addCase(fetchTeacherById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTeacher = action.payload;
        const index = state.teachers.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.teachers[index] = action.payload;
        }
      })
      .addCase(fetchTeacherById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create teacher
      .addCase(createTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeacher.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers.push(action.payload);
      })
      .addCase(createTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update teacher
      .addCase(updateTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.teachers.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.teachers[index] = action.payload;
        }
        if (state.selectedTeacher && state.selectedTeacher._id === action.payload._id) {
          state.selectedTeacher = action.payload;
        }
      })
      .addCase(updateTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete teacher
      .addCase(deleteTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = state.teachers.filter((t) => t._id !== action.payload);
        if (state.selectedTeacher && state.selectedTeacher._id === action.payload) {
          state.selectedTeacher = null;
        }
      })
      .addCase(deleteTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedTeacher } = teacherSlice.actions;
export default teacherSlice.reducer;

