import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchAllMaterials = createAsyncThunk(
  'materials/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/materials', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch materials');
    }
  }
);

export const fetchMaterialById = createAsyncThunk(
  'materials/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/materials/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch material');
    }
  }
);

export const createMaterial = createAsyncThunk(
  'materials/create',
  async (materialData, { rejectWithValue }) => {
    try {
      const response = await api.post('/materials', materialData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create material');
    }
  }
);

export const updateMaterial = createAsyncThunk(
  'materials/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/materials/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update material');
    }
  }
);

export const deleteMaterial = createAsyncThunk(
  'materials/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/materials/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete material');
    }
  }
);

const initialState = {
  materials: [],
  selectedMaterial: null,
  loading: false,
  error: null,
};

const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedMaterial: (state) => {
      state.selectedMaterial = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all materials
      .addCase(fetchAllMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = action.payload;
      })
      .addCase(fetchAllMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch material by ID
      .addCase(fetchMaterialById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterialById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMaterial = action.payload;
        const index = state.materials.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) {
          state.materials[index] = action.payload;
        }
      })
      .addCase(fetchMaterialById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create material
      .addCase(createMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.materials.push(action.payload);
      })
      .addCase(createMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update material
      .addCase(updateMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMaterial.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.materials.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) {
          state.materials[index] = action.payload;
        }
        if (state.selectedMaterial && state.selectedMaterial._id === action.payload._id) {
          state.selectedMaterial = action.payload;
        }
      })
      .addCase(updateMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete material
      .addCase(deleteMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = state.materials.filter((m) => m._id !== action.payload);
        if (state.selectedMaterial && state.selectedMaterial._id === action.payload) {
          state.selectedMaterial = null;
        }
      });
  },
});

export const { clearError, clearSelectedMaterial } = materialsSlice.actions;
export default materialsSlice.reducer;

