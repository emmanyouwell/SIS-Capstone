import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import announcementReducer from './slices/announcementSlice';
import userReducer from './slices/userSlice';
import subjectReducer from './slices/subjectSlice';
import scheduleReducer from './slices/scheduleSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    announcements: announcementReducer,
    users: userReducer,
    subjects: subjectReducer,
    schedules: scheduleReducer,
  },
});

