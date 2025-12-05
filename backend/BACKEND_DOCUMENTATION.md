# Backend Documentation

## Table of Contents
1. [Setup](#setup)
2. [Environment Variables](#environment-variables)
3. [Dependencies](#dependencies)
4. [Folder Structure](#folder-structure)
5. [API Documentation](#api-documentation)

---

## Setup

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Cloudinary account (for file uploads)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend root directory with the required environment variables (see [Environment Variables](#environment-variables) section).

4. Start the development server:
```bash
npm run dev
```

5. Or start the production server:
```bash
npm start
```

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon (auto-reload)
- `npm run seed` - Seed the database with initial data
- `npm run seed:users` - Seed the database with user data

### Server Configuration

- Default port: `5000` (configurable via `PORT` environment variable)
- Base API path: `/api/v1`
- Health check endpoint: `GET /health`

---

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/sis-capstone
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### Environment Variable Descriptions

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | No (defaults to 5000) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT token generation | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |

---

## Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.1.0 | Web framework |
| `mongoose` | ^9.0.0 | MongoDB ODM |
| `dotenv` | ^17.2.3 | Environment variable management |
| `jsonwebtoken` | ^9.0.2 | JWT authentication |
| `bcryptjs` | ^3.0.3 | Password hashing |
| `cors` | ^2.8.5 | Cross-origin resource sharing |
| `cookie-parser` | ^1.4.7 | Cookie parsing middleware |
| `cloudinary` | ^1.41.0 | Cloud-based image/file management |
| `multer` | ^1.4.5-lts.1 | File upload handling |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `nodemon` | ^3.1.11 | Development server with auto-reload |

---

## Folder Structure

```
backend/
├── config/                 # Configuration files
│   ├── db.js              # MongoDB connection
│   └── cloudinary.js      # Cloudinary configuration
├── scripts/               # Database seeding scripts
│   ├── seed.js
│   ├── seedGrades.js
│   └── seedUsers.js
├── src/
│   ├── config/            # Additional configuration
│   ├── controllers/       # Request handlers
│   │   ├── adminController.js
│   │   ├── announcementController.js
│   │   ├── authController.js
│   │   ├── enrollmentController.js
│   │   ├── gradeController.js
│   │   ├── masterlistController.js
│   │   ├── materialsController.js
│   │   ├── messageController.js
│   │   ├── notificationController.js
│   │   ├── scheduleController.js
│   │   ├── sectionController.js
│   │   ├── studentController.js
│   │   ├── subjectController.js
│   │   ├── teacherController.js
│   │   ├── uploadController.js
│   │   └── userController.js
│   ├── middleware/        # Custom middleware
│   │   └── authMiddleware.js
│   ├── models/            # Mongoose models
│   │   ├── Admin.js
│   │   ├── Announcement.js
│   │   ├── Enrollment.js
│   │   ├── Grade.js
│   │   ├── Masterlist.js
│   │   ├── Materials.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── Schedule.js
│   │   ├── Section.js
│   │   ├── Student.js
│   │   ├── Subject.js
│   │   ├── Teacher.js
│   │   └── User.js
│   ├── routes/            # API route definitions
│   │   ├── adminRoutes.js
│   │   ├── announcementRoutes.js
│   │   ├── authRoutes.js
│   │   ├── enrollmentRoutes.js
│   │   ├── gradeRoutes.js
│   │   ├── masterlistRoutes.js
│   │   ├── materialsRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── scheduleRoutes.js
│   │   ├── sectionRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── subjectRoutes.js
│   │   ├── teacherRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── userRoutes.js
│   ├── services/          # Business logic services
│   │   └── cloudinaryService.js
│   └── utils/             # Utility functions
├── server.js              # Application entry point
├── package.json           # Project dependencies
└── package-lock.json      # Dependency lock file
```

---

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error Response:**
```json
{
  "message": "Error message"
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## API Endpoints

### Health Check

#### GET /health
Check server status.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

### Authentication (`/api/v1/auth`)

#### POST /api/v1/auth/register
Register a new user.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Middle",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "Student",
  "contactNumber": "1234567890",
  "address": "123 Main St",
  "dateOfBirth": "2000-01-01",
  "lrn": "123456789012",           // For Student role
  "gradeLevel": "Grade 7",
  "sectionId": "section_id",
  "guardianName": "Parent Name",
  "guardianContact": "0987654321",
  "employeeId": "EMP001",          // For Teacher/Admin role
  "department": "Mathematics",     // For Teacher/Admin role
  "position": "Teacher",           // For Teacher/Admin role
  "assignedOffice": "Office 101"   // For Admin role
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "middleName": "Middle",
    "email": "john.doe@example.com",
    "role": "Student",
    "status": "Active"
  }
}
```

#### POST /api/v1/auth/login
Login user.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```
OR
```json
{
  "studentId": "123456789012",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "middleName": "Middle",
    "email": "john.doe@example.com",
    "role": "Student",
    "status": "Active"
  }
}
```

#### GET /api/v1/auth/me
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "Student",
    "status": "Active",
    "contactNumber": "1234567890",
    "address": "123 Main St",
    "dateOfBirth": "2000-01-01",
    "roleData": { ... }
  }
}
```

---

### Users (`/api/v1/users`)

All endpoints require authentication. Admin-only endpoints are marked.

#### GET /api/v1/users
Get all users (Admin only).

**Query Parameters:**
- `role` - Filter by role (Student, Teacher, Admin)
- `status` - Filter by status (Active, Inactive)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [ ... ]
}
```

#### GET /api/v1/users/:id
Get single user.

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

#### POST /api/v1/users
Create user (Admin only).

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "Teacher",
  ...
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "data": { ... }
}
```

#### PATCH /api/v1/users/:id
Update user.

**Request Body:**
```json
{
  "firstName": "Updated Name",
  "contactNumber": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

#### DELETE /api/v1/users/:id
Delete user (Admin only).

**Response:**
```json
{
  "success": true,
  "message": "User deleted"
}
```

---

### Admins (`/api/v1/admins`)

All endpoints require Admin role.

#### GET /api/v1/admins
Get all admins.

#### GET /api/v1/admins/:id
Get single admin.

#### POST /api/v1/admins
Create admin.

#### PATCH /api/v1/admins/:id
Update admin.

#### DELETE /api/v1/admins/:id
Delete admin.

---

### Students (`/api/v1/students`)

All endpoints require authentication. Create/Update/Delete require Admin role.

#### GET /api/v1/students
Get all students.

#### GET /api/v1/students/:id
Get single student.

#### POST /api/v1/students
Create student (Admin only).

#### PATCH /api/v1/students/:id
Update student (Admin only).

#### DELETE /api/v1/students/:id
Delete student (Admin only).

---

### Teachers (`/api/v1/teachers`)

All endpoints require authentication. Create/Update/Delete require Admin role.

#### GET /api/v1/teachers
Get all teachers.

#### GET /api/v1/teachers/:id
Get single teacher.

#### POST /api/v1/teachers
Create teacher (Admin only).

#### PATCH /api/v1/teachers/:id
Update teacher (Admin only).

#### DELETE /api/v1/teachers/:id
Delete teacher (Admin only).

---

### Subjects (`/api/v1/subjects`)

All endpoints require authentication. Create/Delete require Admin role. Update requires Admin or Teacher role.

#### GET /api/v1/subjects
Get all subjects.

#### GET /api/v1/subjects/:id
Get single subject.

#### POST /api/v1/subjects
Create subject (Admin only).

#### PATCH /api/v1/subjects/:id
Update subject (Admin, Teacher).

#### DELETE /api/v1/subjects/:id
Delete subject (Admin only).

---

### Sections (`/api/v1/sections`)

All endpoints require authentication. Create/Update/Delete require Admin role.

#### GET /api/v1/sections
Get all sections.

#### GET /api/v1/sections/:id
Get single section.

#### POST /api/v1/sections
Create section (Admin only).

#### PATCH /api/v1/sections/:id
Update section (Admin only).

#### DELETE /api/v1/sections/:id
Delete section (Admin only).

---

### Schedules (`/api/v1/schedules`)

All endpoints require authentication. Create/Update/Delete require Admin role.

#### GET /api/v1/schedules
Get all schedules.

#### GET /api/v1/schedules/:id
Get single schedule.

#### POST /api/v1/schedules
Create schedule (Admin only).

#### PATCH /api/v1/schedules/:id
Update schedule (Admin only).

#### DELETE /api/v1/schedules/:id
Delete schedule (Admin only).

---

### Enrollments (`/api/v1/enrollments`)

All endpoints require authentication. Create requires Student role. Update requires Admin role.

#### GET /api/v1/enrollments
Get all enrollments.

#### GET /api/v1/enrollments/:id
Get single enrollment.

#### POST /api/v1/enrollments
Create enrollment (Student only).

#### PATCH /api/v1/enrollments/:id
Update enrollment (Admin only).

#### DELETE /api/v1/enrollments/:id
Delete enrollment.

---

### Masterlists (`/api/v1/masterlists`)

All endpoints require authentication. Create/Update/Delete require Admin role.

#### GET /api/v1/masterlists
Get all masterlists.

#### GET /api/v1/masterlists/:id
Get single masterlist.

#### POST /api/v1/masterlists
Create masterlist (Admin only).

#### PATCH /api/v1/masterlists/:id
Update masterlist (Admin only).

#### DELETE /api/v1/masterlists/:id
Delete masterlist (Admin only).

---

### Grades (`/api/v1/grades`)

All endpoints require authentication. Create/Update/Delete require Admin or Teacher role.

#### GET /api/v1/grades
Get all grades.

#### GET /api/v1/grades/:id
Get single grade.

#### POST /api/v1/grades
Create grade (Admin, Teacher).

#### PATCH /api/v1/grades/:id
Update grade (Admin, Teacher).

#### DELETE /api/v1/grades/:id
Delete grade (Admin, Teacher).

---

### Announcements (`/api/v1/announcements`)

All endpoints require authentication. Create/Update/Delete require Admin or Teacher role.

#### GET /api/v1/announcements
Get all announcements.

#### GET /api/v1/announcements/:id
Get single announcement.

#### POST /api/v1/announcements
Create announcement (Admin, Teacher).

#### PATCH /api/v1/announcements/:id
Update announcement (Admin, Teacher).

#### DELETE /api/v1/announcements/:id
Delete announcement (Admin, Teacher).

---

### Materials (`/api/v1/materials`)

All endpoints require authentication. Create/Update/Delete require Admin or Teacher role.

#### GET /api/v1/materials
Get all materials.

#### GET /api/v1/materials/:id
Get single material.

#### POST /api/v1/materials
Create material (Admin, Teacher).

#### PATCH /api/v1/materials/:id
Update material (Admin, Teacher).

#### DELETE /api/v1/materials/:id
Delete material (Admin, Teacher).

---

### Messages (`/api/v1/messages`)

All endpoints require authentication.

#### GET /api/v1/messages
Get all messages.

#### GET /api/v1/messages/:id
Get single message.

#### POST /api/v1/messages
Create message.

#### PATCH /api/v1/messages/:id
Update message.

#### DELETE /api/v1/messages/:id
Delete message.

---

### Notifications (`/api/v1/notifications`)

All endpoints require authentication. Create requires Admin role.

#### GET /api/v1/notifications
Get all notifications.

#### GET /api/v1/notifications/:id
Get single notification.

#### POST /api/v1/notifications
Create notification (Admin only).

#### PATCH /api/v1/notifications/read-all
Mark all notifications as read.

#### PATCH /api/v1/notifications/:id
Update notification.

#### DELETE /api/v1/notifications/:id
Delete notification.

---

### Uploads (`/api/v1/uploads`)

All endpoints require authentication.

#### POST /api/v1/uploads/image
Upload an image file.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (file field)

**Response:**
```json
{
  "success": true,
  "url": "https://cloudinary-url.com/image.jpg",
  "public_id": "folder/image_id"
}
```

#### DELETE /api/v1/uploads/:publicId
Delete an uploaded file.

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "result": { ... }
}
```

---

## Authentication & Authorization

### JWT Token

JWT tokens are used for authentication. Tokens are generated upon login/registration and must be included in the Authorization header for protected routes.

### Role-Based Access Control

The system supports three roles:
- **Admin** - Full system access
- **Teacher** - Access to teaching-related resources
- **Student** - Limited access to personal resources

### Middleware

- `authMiddleware` - Verifies JWT token and attaches user to request
- `roleMiddleware(...roles)` - Restricts access to specific roles

### Account Status

Users with `status: 'Inactive'` cannot authenticate or access protected routes.

---

## Error Handling

The API uses centralized error handling. All errors are returned in a consistent format:

```json
{
  "message": "Error description"
}
```

Common error scenarios:
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `500` - Internal server error

---

## File Uploads

File uploads are handled via Cloudinary. The maximum file size is 10MB. Files are uploaded to memory and then streamed to Cloudinary.

Supported file types depend on Cloudinary configuration. Images are typically supported by default.

---

## Database

The application uses MongoDB with Mongoose ODM. Models are defined in `src/models/` and follow Mongoose schema patterns.

### Seeding

Use the provided seed scripts to populate the database:
- `npm run seed` - General seeding
- `npm run seed:users` - User-specific seeding

---

## Notes

- All timestamps are handled automatically by Mongoose
- Passwords are hashed using bcryptjs before storage
- JWT tokens should be stored securely on the client side
- The API uses ES modules (`import/export` syntax)
- CORS is enabled for cross-origin requests

---

## Support

For issues or questions, refer to the codebase or contact the development team.

