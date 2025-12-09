import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import announcementReducer from './slices/announcementSlice';
import userReducer from './slices/userSlice';
import studentReducer from './slices/studentSlice';
import teacherReducer from './slices/teacherSlice';
import adminReducer from './slices/adminSlice';
import subjectReducer from './slices/subjectSlice';
import materialsReducer from './slices/materialsSlice';
import scheduleReducer from './slices/scheduleSlice';
import gradeReducer from './slices/gradeSlice';
import masterlistReducer from './slices/masterlistSlice';
import sectionReducer from './slices/sectionSlice';
import enrollmentReducer from './slices/enrollmentSlice';
import enrollmentPeriodReducer from './slices/enrollmentPeriodSlice';
import messageReducer from './slices/messageSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    announcements: announcementReducer,
    users: userReducer,
    students: studentReducer,
    teachers: teacherReducer,
    admins: adminReducer,
    subjects: subjectReducer,
    materials: materialsReducer,
    schedules: scheduleReducer,
    grades: gradeReducer,
    masterlists: masterlistReducer,
    section: sectionReducer,
    enrollments: enrollmentReducer,
    enrollmentPeriod: enrollmentPeriodReducer,
    messages: messageReducer,
    notifications: notificationReducer,
  },
});

