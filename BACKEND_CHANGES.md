# Backend Changes Summary

This document summarizes all changes made to create a functional MERN backend scaffold for the SIS Capstone project.

## Overview

A complete MERN (MongoDB, Express, React, Node.js) backend has been scaffolded with:
- 9 Mongoose models
- Full CRUD API endpoints with role-based access control
- JWT authentication using Bearer tokens
- File upload support via Multer + Cloudinary
- Redux Toolkit integration in frontend
- Seed script for sample data

## Backend Structure

```
backend/
├── config/
│   ├── db.js                 # MongoDB connection
│   └── cloudinary.js         # Cloudinary + Multer setup
├── src/
│   ├── models/               # Mongoose models (9 models)
│   ├── controllers/          # Business logic (10 controllers)
│   ├── routes/               # Express routes (11 route files)
│   ├── middleware/           # Auth & role middleware
│   └── services/             # Cloudinary service
├── scripts/
│   └── seed.js               # Database seeding script
├── server.js                 # Express app entry point
├── package.json              # Dependencies
└── .env.example              # Environment variables template
```

## Models

### 1. User
- **Fields**: firstName, lastName, middleName, email, password, role, status, learnerReferenceNo, grade, section, subjects, profileImage
- **Role**: Student | Teacher | Admin
- **Methods**: `comparePassword()`, `generateJWT()`
- **Indexes**: email (unique), learnerReferenceNo (sparse unique)

### 2. Announcement
- **Fields**: subject, message, sender (User ref), recipient, recipientIds, image, pinned, type
- **Recipient Types**: All, Students, Teachers, Admin, Specific
- **Types**: general, message, announcement

### 3. Grade
- **Fields**: student (User ref), subject (Subject ref), gradeLevel, schoolYear, q1, q2, q3, q4, remarks, status, finalGrade
- **Status**: completed, incomplete, failed
- **Auto-calculates**: finalGrade and status based on quarter grades

### 4. Subject
- **Fields**: name, gradeLevel, teachers (User refs array), materials (array with attachments), description
- **Materials**: name, url, cloudinaryId, uploadedBy, uploadedAt

### 5. Schedule
- **Fields**: grade, section, timeSlot, day, subject (Subject ref), teacher (User ref), adviser (User ref), schoolYear
- **Days**: Monday, Tuesday, Wednesday, Thursday, Friday
- **Index**: Unique on (grade, section, timeSlot, day, schoolYear)

### 6. Enrollment
- **Fields**: student (User ref), schoolYear, withLRN, returningBalikAral, gradeLevelToEnroll, learner info, addresses, parent/guardian info, attachments, status, reviewedBy, reviewedAt, notes
- **Status**: pending, enrolled, declined

### 7. Masterlist
- **Fields**: grade, section, students (User refs array), adviser (User ref), schoolYear
- **Index**: Unique on (grade, section, schoolYear)

### 8. Notification
- **Fields**: type, message, recipient (User ref), read, link, metadata
- **Types**: Enrollment, Message, Announcement, Subject Materials, Grade, System

### 9. Message
- **Fields**: sender (User ref), recipient (User ref), recipientType, recipientIds, subject, message, attachments, read, readBy, deletedBy
- **Recipient Types**: User, All Students, All Teachers, Grade, Section

## API Endpoints

All endpoints are prefixed with `/api/v1`

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (Protected)

### Users (`/api/v1/users`)
- `GET /` - Get all users (Admin only)
- `GET /:id` - Get user by ID
- `POST /` - Create user (Admin only)
- `PATCH /:id` - Update user
- `DELETE /:id` - Delete user (Admin only)

### Announcements (`/api/v1/announcements`)
- `GET /` - Get all announcements (filtered by role)
- `GET /:id` - Get announcement by ID
- `POST /` - Create announcement (Admin, Teacher)
- `PATCH /:id` - Update announcement (Admin, Teacher - own only)
- `DELETE /:id` - Delete announcement (Admin, Teacher - own only)

### Grades (`/api/v1/grades`)
- `GET /` - Get all grades (role-filtered)
- `GET /:id` - Get grade by ID
- `POST /` - Create grade (Admin, Teacher)
- `PATCH /:id` - Update grade (Admin, Teacher)
- `DELETE /:id` - Delete grade (Admin, Teacher)

### Subjects (`/api/v1/subjects`)
- `GET /` - Get all subjects (role-filtered)
- `GET /:id` - Get subject by ID
- `POST /` - Create subject (Admin only)
- `PATCH /:id` - Update subject (Admin, Teacher - own subjects)
- `DELETE /:id` - Delete subject (Admin only)

### Schedules (`/api/v1/schedules`)
- `GET /` - Get all schedules (role-filtered)
- `GET /:id` - Get schedule by ID
- `POST /` - Create schedule (Admin only)
- `PATCH /:id` - Update schedule (Admin only)
- `DELETE /:id` - Delete schedule (Admin only)

### Enrollments (`/api/v1/enrollments`)
- `GET /` - Get all enrollments (role-filtered)
- `GET /:id` - Get enrollment by ID
- `POST /` - Create enrollment (Student - self-enroll)
- `PATCH /:id` - Update enrollment (Admin - approve/decline)
- `DELETE /:id` - Delete enrollment (Admin, Student - own pending only)

### Masterlists (`/api/v1/masterlists`)
- `GET /` - Get all masterlists
- `GET /:id` - Get masterlist by ID
- `POST /` - Create masterlist (Admin only)
- `PATCH /:id` - Update masterlist (Admin only)
- `DELETE /:id` - Delete masterlist (Admin only)

### Notifications (`/api/v1/notifications`)
- `GET /` - Get user's notifications
- `GET /:id` - Get notification by ID (marks as read)
- `POST /` - Create notification (Admin only)
- `PATCH /:id` - Update notification (mark read/unread)
- `PATCH /read-all` - Mark all as read
- `DELETE /:id` - Delete notification

### Messages (`/api/v1/messages`)
- `GET /` - Get user's messages
- `GET /:id` - Get message by ID (marks as read)
- `POST /` - Create message
- `PATCH /:id` - Update message (sender only)
- `DELETE /:id` - Soft delete message

### Uploads (`/api/v1/uploads`)
- `POST /image` - Upload image/file (Protected)
- `DELETE /:publicId` - Delete file from Cloudinary (Protected)

## Authentication & Authorization

### JWT Authentication
- Token sent via `Authorization: Bearer <token>` header
- Token expiry: 7 days (configurable via `JWT_EXPIRE`)
- No cookies used

### Middleware
- `authMiddleware`: Verifies JWT token and attaches user to `req.user`
- `roleMiddleware(...roles)`: Restricts access to specified roles

### Role-Based Access Control

#### Admin
- Full access to all endpoints
- Can create/update/delete all resources
- Can manage users, enrollments, masterlists

#### Teacher
- Can create/update/delete own announcements
- Can create/update grades for assigned subjects
- Can update own subjects
- Can view schedules where they teach
- Can send messages

#### Student
- Read-only access to own data
- Can view own grades, enrollments, messages
- Can create own enrollment
- Can view announcements (All or Students)
- Can send messages

## File Uploads

### Implementation
- Uses `multer` for file parsing (memory storage)
- Uploads to Cloudinary via SDK
- Returns `{ url, public_id }` on success
- Supports images and PDFs (configurable)

### Endpoint
- `POST /api/v1/uploads/image` - Upload file
  - Body: `multipart/form-data` with `file` field
  - Response: `{ success: true, url: string, public_id: string }`

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/sis-capstone

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=5000
NODE_ENV=development
```

## Frontend Integration

### Redux Toolkit Setup
- **Store**: `frontend/src/store/store.js`
- **Auth Slice**: `frontend/src/store/slices/authSlice.js`
  - Actions: `login`, `register`, `getMe`, `logout`
- **Announcement Slice**: `frontend/src/store/slices/announcementSlice.js`
  - Actions: `fetchAnnouncements`, `createAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`

### API Wrapper
- **File**: `frontend/src/utils/api.js`
- Automatically attaches `Authorization` header from localStorage
- Handles 401 errors (redirects to login)
- Base URL: `VITE_API_URL` env var or `http://localhost:5000/api/v1`

### Protected Routes
- **Component**: `frontend/src/components/ProtectedRoute.jsx`
- Wraps routes requiring authentication
- Optional `allowedRoles` prop for role-based access

### Environment Variable
Add to `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Database Seeding

### Run Seed Script
```bash
cd backend
npm run seed
```

### Seed Data Includes
- 1 Admin user (admin@sis.com / admin123)
- 4 Teacher users
- 3 Student users
- 6 Subjects (Math, Science, English for grades 7 & 8)
- 2 Announcements
- Sample grades, masterlist, notifications, messages

## Running the Application

### Backend
```bash
cd backend
npm install
# Create .env file with required variables
npm run dev  # Development mode with nodemon
# or
npm start    # Production mode
```

### Frontend
```bash
cd frontend
npm install
# Create .env file with VITE_API_URL
npm run dev
```

## Dependencies Added

### Backend
- `bcryptjs` - Password hashing
- `cloudinary` - File upload service
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `express` - Web framework
- `jsonwebtoken` - JWT tokens
- `mongoose` - MongoDB ODM
- `multer` - File upload middleware
- `nodemon` - Development server (dev)

### Frontend
- `@reduxjs/toolkit` - Redux state management
- `axios` - HTTP client
- `react-redux` - React bindings for Redux

## Notes

1. **Password Hashing**: Passwords are automatically hashed before saving (User model pre-save hook)

2. **JWT Tokens**: Stored in localStorage on frontend, sent via Authorization header

3. **File Attachments**: All file attachments stored as `{ url, cloudinaryId }` objects

4. **Timestamps**: All models include `createdAt` and `updatedAt` (Mongoose timestamps)

5. **Soft Deletes**: Messages use soft delete (deletedBy array) instead of hard delete

6. **Role Filtering**: Many endpoints automatically filter results based on user role

7. **Auto-calculations**: Grade model auto-calculates finalGrade and status

8. **Unique Constraints**: LRN, email, and schedule combinations have unique indexes

## Next Steps

1. Update frontend login pages to use Redux auth actions
2. Replace mock data in frontend pages with API calls
3. Add error handling and loading states
4. Implement file upload UI components
5. Add form validation
6. Configure Cloudinary account
7. Set up MongoDB database
8. Add environment-specific configurations

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10  // For list endpoints
}
```

### Error Response
```json
{
  "message": "Error message here"
}
```

## Authentication Flow

1. User submits login form
2. Frontend calls `POST /api/v1/auth/login`
3. Backend validates credentials, returns JWT token
4. Frontend stores token in localStorage
5. All subsequent requests include `Authorization: Bearer <token>` header
6. Backend middleware validates token on protected routes
7. On 401 error, frontend redirects to login

