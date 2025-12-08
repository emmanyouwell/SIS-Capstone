import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchAllMessages = createAsyncThunk(
  'messages/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/messages', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const fetchMessageById = createAsyncThunk(
  'messages/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch message');
    }
  }
);

export const createMessage = createAsyncThunk(
  'messages/create',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await api.post('/messages', messageData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create message');
    }
  }
);

export const updateMessage = createAsyncThunk(
  'messages/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/messages/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update message');
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/messages/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete message');
    }
  }
);

export const fetchUnreadMessageCount = createAsyncThunk(
  'messages/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/messages/unread/count');
      return response.data.count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

const initialState = {
  messages: [],
  selectedMessage: null,
  unreadCount: 0,
  loading: false,
  error: null,
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedMessage: (state) => {
      state.selectedMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all messages
      .addCase(fetchAllMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchAllMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch message by ID
      .addCase(fetchMessageById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessageById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMessage = action.payload;
        const index = state.messages.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
      })
      .addCase(fetchMessageById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create message
      .addCase(createMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
      })
      .addCase(createMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update message
      .addCase(updateMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMessage.fulfilled, (state, action) => {
        state.loading = false;
        const updatedMessage = action.payload;
        const index = state.messages.findIndex((m) => m._id === updatedMessage._id);
        
        // Update message in array
        if (index !== -1) {
          // Check if message was previously unread before updating
          const wasUnread = state.messages[index].status === 'sent';
          state.messages[index] = updatedMessage;
          
          // If message status changed from 'sent' to 'read', decrease unread count
          if (wasUnread && updatedMessage.status === 'read' && state.unreadCount > 0) {
            state.unreadCount -= 1;
          }
        }
        
        // Update selected message if it's the same one
        if (state.selectedMessage && state.selectedMessage._id === updatedMessage._id) {
          state.selectedMessage = updatedMessage;
        }
      })
      .addCase(updateMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete message
      .addCase(deleteMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = state.messages.filter((m) => m._id !== action.payload);
        if (state.selectedMessage && state.selectedMessage._id === action.payload) {
          state.selectedMessage = null;
        }
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch unread message count
      .addCase(fetchUnreadMessageCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadMessageCount.rejected, (state) => {
        state.unreadCount = 0;
      });
  },
});

export const { clearError, clearSelectedMessage } = messageSlice.actions;
export default messageSlice.reducer;

