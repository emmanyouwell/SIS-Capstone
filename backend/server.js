import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';

// Import routes
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import announcementRoutes from './src/routes/announcementRoutes.js';
import gradeRoutes from './src/routes/gradeRoutes.js';
import subjectRoutes from './src/routes/subjectRoutes.js';
import scheduleRoutes from './src/routes/scheduleRoutes.js';
import enrollmentRoutes from './src/routes/enrollmentRoutes.js';
import masterlistRoutes from './src/routes/masterlistRoutes.js';
import sectionRoutes from './src/routes/sectionRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import messageRoutes from './src/routes/messageRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/grades', gradeRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/masterlists', masterlistRoutes);
app.use('/api/v1/sections', sectionRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/uploads', uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

