import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks for new schedule structure
export const getScheduleBySection = createAsyncThunk(
  'schedules/getBySection',
  async (sectionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/schedules/${sectionId}`);
      return response.data.data; // Backend returns { success: true, data: schedule }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schedule');
    }
  }
);

export const createSchedule = createAsyncThunk(
  'schedules/create',
  async ({ sectionId, schedule = [] }, { rejectWithValue }) => {
    try {
      const response = await api.post('/schedules', { sectionId, schedule });
      return response.data.data; // Backend returns { success: true, data: schedule }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create schedule');
    }
  }
);

export const addScheduleEntry = createAsyncThunk(
  'schedules/addEntry',
  async ({ sectionId, entry }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/schedules/${sectionId}/add`, entry);
      return response.data.data; // Backend returns { success: true, data: schedule }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add schedule entry');
    }
  }
);

export const updateScheduleEntry = createAsyncThunk(
  'schedules/updateEntry',
  async ({ sectionId, entryIndex, entry }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/schedules/${sectionId}/update/${entryIndex}`,
        entry
      );
      return response.data.data; // Backend returns { success: true, data: schedule }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update schedule entry');
    }
  }
);

export const removeScheduleEntry = createAsyncThunk(
  'schedules/removeEntry',
  async ({ sectionId, entryIndex }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/schedules/${sectionId}/remove/${entryIndex}`);
      return response.data.data; // Backend returns { success: true, data: schedule }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove schedule entry');
    }
  }
);

export const setFullSchedule = createAsyncThunk(
  'schedules/setFull',
  async ({ sectionId, schedule, schoolYear }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/schedules/${sectionId}/set`, { schedule, schoolYear });
      return response.data.data; // Backend returns { success: true, data: schedule }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set schedule');
    }
  }
);

// Legacy thunks for backward compatibility (used by Student/Teacher views)
export const fetchAllSchedules = createAsyncThunk(
  'schedules/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/schedules', { params });
      return response.data.data; // Backend returns { success: true, count, data: schedules[] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schedules');
    }
  }
);

export const fetchScheduleById = createAsyncThunk(
  'schedules/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/schedules/${id}`);
      return response.data.data; // Backend returns { success: true, data: schedule }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schedule');
    }
  }
);

const initialState = {
  schedule: [], // Current schedule array (for section-based view)
  schedules: [], // Legacy: flattened schedules array (for student/teacher views)
  selectedSchedule: null, // Current schedule document
  loading: false,
  error: null,
};

const scheduleSlice = createSlice({
  name: 'schedules',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedSchedule: (state) => {
      state.selectedSchedule = null;
    },
    setSchedule: (state, action) => {
      state.schedule = action.payload;
    },
    addEntry: (state, action) => {
      state.schedule.push(action.payload);
    },
    updateEntry: (state, action) => {
      const { index, entry } = action.payload;
      if (state.schedule[index]) {
        state.schedule[index] = entry;
      }
    },
    removeEntry: (state, action) => {
      const index = action.payload;
      state.schedule.splice(index, 1);
    },
  },
  extraReducers: (builder) => {
    builder
      // Get schedule by section
      .addCase(getScheduleBySection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getScheduleBySection.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSchedule = action.payload;
        state.schedule = action.payload?.schedule || [];
      })
      .addCase(getScheduleBySection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create schedule
      .addCase(createSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSchedule = action.payload;
        state.schedule = action.payload?.schedule || [];
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add schedule entry
      .addCase(addScheduleEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addScheduleEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSchedule = action.payload;
        state.schedule = action.payload?.schedule || [];
      })
      .addCase(addScheduleEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update schedule entry
      .addCase(updateScheduleEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateScheduleEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSchedule = action.payload;
        state.schedule = action.payload?.schedule || [];
      })
      .addCase(updateScheduleEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove schedule entry
      .addCase(removeScheduleEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeScheduleEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSchedule = action.payload;
        state.schedule = action.payload?.schedule || [];
      })
      .addCase(removeScheduleEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Set full schedule
      .addCase(setFullSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setFullSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSchedule = action.payload;
        state.schedule = action.payload?.schedule || [];
      })
      .addCase(setFullSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Legacy: Fetch all schedules
      .addCase(fetchAllSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchAllSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Legacy: Fetch schedule by ID
      .addCase(fetchScheduleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScheduleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSchedule = action.payload;
        // Also update in schedules array if it exists
        const index = state.schedules.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.schedules[index] = action.payload;
        }
      })
      .addCase(fetchScheduleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSelectedSchedule,
  setSchedule,
  addEntry,
  updateEntry,
  removeEntry,
} = scheduleSlice.actions;
export default scheduleSlice.reducer;
