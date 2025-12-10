import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchAllStudents = createAsyncThunk(
  'students/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/students', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch students');
    }
  }
);

export const fetchStudentById = createAsyncThunk(
  'students/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/students/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch student');
    }
  }
);

export const createStudent = createAsyncThunk(
  'students/create',
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/students', studentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create student');
    }
  }
);

export const updateStudent = createAsyncThunk(
  'students/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/students/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update student');
    }
  }
);

export const deleteStudent = createAsyncThunk(
  'students/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/students/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete student');
    }
  }
);

export const deactivateStudent = createAsyncThunk(
  'students/deactivate',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/students/${id}/deactivate`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deactivate student');
    }
  }
);

const initialState = {
  students: [],
  selectedStudent: null,
  loading: false,
  error: null,
};

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedStudent: (state) => {
      state.selectedStudent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all students
      .addCase(fetchAllStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchAllStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch student by ID
      .addCase(fetchStudentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedStudent = action.payload;
        const index = state.students.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create student
      .addCase(createStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.students.push(action.payload);
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update student
      .addCase(updateStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.students.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
        if (state.selectedStudent && state.selectedStudent._id === action.payload._id) {
          state.selectedStudent = action.payload;
        }
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete student
      .addCase(deleteStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.students = state.students.filter((s) => s._id !== action.payload);
        if (state.selectedStudent && state.selectedStudent._id === action.payload) {
          state.selectedStudent = null;
        }
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Deactivate student
      .addCase(deactivateStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateStudent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.students.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
        if (state.selectedStudent && state.selectedStudent._id === action.payload._id) {
          state.selectedStudent = action.payload;
        }
      })
      .addCase(deactivateStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedStudent } = studentSlice.actions;
export default studentSlice.reducer;

