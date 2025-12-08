# Enrollment Flow Documentation

## Overview
This document outlines the new enrollment workflow for the SIS-Capstone project. The enrollment system has been updated to support conditional forms based on grade level, admin-created enrollments, and automatic data population from student records.

## Table of Contents
1. [Enrollment Workflow](#enrollment-workflow)
2. [Schema Changes](#schema-changes)
3. [Field Requirements by Grade Level](#field-requirements-by-grade-level)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Admin Workflow](#admin-workflow)
7. [Validation Rules](#validation-rules)

---

## Enrollment Workflow

### 1. Student Account Creation
- **Who**: Admin only
- **Action**: Admin creates a student account
- **Result**: Student account is created with `enrollmentStatus: false`
- **Note**: No enrollment happens at this stage. Student must exist before an enrollment form can be created.

### 2. Enrollment Form Creation
- **Who**: Admin only
- **Action**: Admin creates a new enrollment form for a student
- **Entry Points**:
  - Admin Dashboard → "Pending Enrollment" section → "New Enrollment Form" button
  - Admin Student Accounts page → "Create Enrollment" button for each student
  - Student Profile page (when viewed by admin) → "Create Enrollment Form" button
- **Result**: Enrollment form is created with status `pending`

### 3. Form Types

#### Full Enrollment Form (Grade 7 or First-Time Enrollees)
- All enrollment fields are required
- Complete personal information
- Full address details
- Parent/Guardian information
- All optional fields (4Ps, disability, etc.)

#### Simplified Enrollment Form (Grade 8 and Above)
- Basic enrollment info (school year, grade level, with LRN, returning status)
- Personal information snapshot (always saved)
- Conditional fields based on selections:
  - **If returning = true**: Returning learner fields required
  - **If Grade 11-12**: SHS fields required

---

## Schema Changes

### Enrollment Model Updates

#### New Fields
- `gradeLevelToEnroll` (Number, required, min: 7, max: 12)
  - Primary field for grade level to enroll
  - Synced with `gradeToEnroll` for backward compatibility
- `withLRN` (Boolean, default: false)
  - Indicates if student has Learner Reference Number
- `returning` (Boolean, default: false)
  - Indicates if student is a returning learner (Balik-Aral)

#### Personal Information Snapshot (Always Saved)
- `firstName` (String)
- `middleName` (String)
- `lastName` (String)
- `extensionName` (String)
- `sex` (String, enum: ['Male', 'Female'])
- `dateOfBirth` (Date)
- `lrn` (String)
- `currentAddress` (String)
- `permanentAddress` (String)
- `guardianName` (String)
- `guardianContact` (String)

**Note**: Personal information is always saved as a snapshot in the enrollment document, even if the student has existing personal info. This ensures a record of the information at the time of enrollment.

#### Updated Fields
- `gradeToEnroll` (Number, min: 7, max: 12)
  - Updated to support Grade 11-12 (SHS)
- `lastSchoolEnrolled` (String)
  - New field for returning learners (alternative to `lastSchoolAttended`)

---

## Field Requirements by Grade Level

### All Grade Levels (Required)
- `schoolYear` (String)
- `gradeLevelToEnroll` (Number, 7-12)
- `withLRN` (Boolean)
- `returning` (Boolean)
- Personal information snapshot:
  - `firstName` (String)
  - `lastName` (String)
  - `sex` (String)

### Grade 8 and Above
If `returning === true`, the following fields are **required**:
- `lastGradeLevelCompleted` (Number, 1-12)
- `lastSchoolYearCompleted` (String)
- `lastSchoolEnrolled` (String) or `lastSchoolAttended` (String)
- `schoolId` (String)

### Grade 11-12 (SHS)
The following fields are **required**:
- `semester` (String, '1st' or '2nd')
- `track` (String, 'Academic', 'Technical-Vocational-Livelihood', 'Sports', 'Arts and Design')

If `track === 'Academic'`, the following is **required**:
- `strand` (String, 'STEM', 'ABM', 'HUMSS', 'GAS')

Optional:
- `otherLearningModalities` (String)

---

## API Endpoints

### GET /api/v1/enrollments
- **Description**: Get all enrollments (filtered by role)
- **Access**: Private
- **Query Parameters**: `status`, `gradeToEnroll`, `schoolYear`
- **Response**: Array of enrollment objects with populated student and user data

### GET /api/v1/enrollments/:id
- **Description**: Get single enrollment
- **Access**: Private
- **Response**: Enrollment object with all fields

### POST /api/v1/enrollments
- **Description**: Create enrollment (self-enroll by student)
- **Access**: Private (Student role only)
- **Request Body**: Enrollment data
- **Behavior**: 
  - Auto-fills personal information from student record
  - Validates fields based on grade level
  - Sets `student.enrollmentStatus = true`
- **Response**: Created enrollment object

### POST /api/v1/enrollments/admin
- **Description**: Create enrollment (admin-created)
- **Access**: Private (Admin role only)
- **Request Body**: Enrollment data with `studentId` (required)
- **Validation**: 
  - Requires `studentId` to exist
  - Returns error: "Student account required before creating enrollment form." if student not found
- **Behavior**:
  - Auto-fills personal information from student record
  - Validates fields based on grade level
  - Sets enrollment status to `pending`
  - Sets `student.enrollmentStatus = true`
- **Response**: Created enrollment object

### PATCH /api/v1/enrollments/:id
- **Description**: Update enrollment (approve/decline)
- **Access**: Private (Admin role only)
- **Request Body**: Can update status, sectionId, and all enrollment fields
- **Behavior**: 
  - If status changed to 'enrolled': Updates student's gradeLevel, sectionId, and enrollmentStatus
  - If status changed to 'declined': Sets enrollmentStatus to false
- **Response**: Updated enrollment object

### DELETE /api/v1/enrollments/:id
- **Description**: Delete enrollment
- **Access**: Private (Admin, Student - own enrollment)
- **Response**: Success message

---

## Frontend Components

### BasicEnrollmentInfo
- **Location**: `frontend/src/components/enrollment/BasicEnrollmentInfo.jsx`
- **Purpose**: Displays basic enrollment information (school year, grade level, with LRN, returning status)
- **Props**:
  - `formData`: Form data object
  - `handleInputChange`: Input change handler
  - `handleCheckboxChange`: Checkbox change handler
  - `errors`: Validation errors object

### ReturningLearners
- **Location**: `frontend/src/components/enrollment/ReturningLearners.jsx`
- **Purpose**: Displays returning learner information fields
- **Condition**: Only shown when `gradeLevelToEnroll >= 8` and `returning === true`
- **Fields**:
  - Last Grade Level Completed
  - Last School Year Completed
  - Last School Enrolled
  - School ID

### SHSLearners
- **Location**: `frontend/src/components/enrollment/SHSLearners.jsx`
- **Purpose**: Displays Senior High School information fields
- **Condition**: Only shown when `gradeLevelToEnroll >= 11` and `gradeLevelToEnroll <= 12`
- **Fields**:
  - Semester
  - Track
  - Strand (conditional, only if track is Academic)
  - Other Learning Modalities (optional)

### AdminEnrollmentForm
- **Location**: `frontend/src/components/enrollment/AdminEnrollmentForm.jsx`
- **Purpose**: Main enrollment form component for admin use
- **Features**:
  - Auto-fills personal information from student data
  - Conditional rendering based on grade level
  - Validation based on grade level requirements
  - Submits to `/api/v1/enrollments/admin` endpoint
- **Props**:
  - `studentId`: Student ID (optional, for auto-fill)
  - `onClose`: Close handler
  - `onSuccess`: Success callback

---

## Admin Workflow

### Creating Enrollment from Admin Dashboard

1. Navigate to Admin Dashboard → Enrollment
2. View "Pending Enrollment" section
3. Click "New Enrollment Form" button
4. Select student (if not pre-selected)
5. Fill out enrollment form:
   - Basic enrollment info
   - Personal information (auto-filled, editable)
   - Conditional fields based on grade level
6. Submit form
7. Enrollment is created with status `pending`

### Creating Enrollment from Student Profile

1. Navigate to Admin → Accounts → Students
2. Find student in the table
3. Click "Create Enrollment" button
4. Enrollment form opens with student data auto-filled
5. Fill out remaining required fields
6. Submit form
7. Enrollment is created with status `pending`

### Viewing Pending Enrollments

1. Navigate to Admin Dashboard → Enrollment
2. Click "VIEW" on "PENDING ENROLLMENT" card
3. View list of pending enrollments
4. Click "View form" to see enrollment details
5. Approve or decline enrollment

---

## Validation Rules

### Backend Validation

The `validateEnrollmentByGrade` function in `enrollmentController.js` enforces:

1. **Basic Requirements** (All grades):
   - School year is required
   - Grade level to enroll is required
   - With LRN field is required (boolean)
   - Returning field is required (boolean)
   - First name is required
   - Last name is required
   - Sex is required

2. **Grade 8+ Returning Learners**:
   - If `returning === true`:
     - Last grade level completed is required
     - Last school year completed is required
     - Last school enrolled is required
     - School ID is required

3. **Grade 11-12 (SHS)**:
   - Semester is required
   - Track is required
   - If track is Academic, strand is required

### Frontend Validation

Frontend validation mirrors backend validation and provides immediate feedback to users. Validation errors are displayed inline with form fields.

---

## Auto-Fill Logic

When creating an enrollment form, the system automatically fills personal information from the student record:

- `firstName` ← `student.userId.firstName`
- `middleName` ← `student.userId.middleName`
- `lastName` ← `student.userId.lastName`
- `extensionName` ← `student.userId.extensionName`
- `sex` ← `student.userId.sex`
- `dateOfBirth` ← `student.userId.dateOfBirth`
- `lrn` ← `student.lrn`
- `currentAddress` ← `student.userId.address`
- `permanentAddress` ← `student.userId.address`
- `guardianName` ← `student.guardianName`
- `guardianContact` ← `student.guardianContact`

All auto-filled fields are editable in the form, allowing admins to make corrections if needed.

---

## Error Messages

### Backend Errors

- **"Student account required before creating enrollment form."**
  - Occurs when `studentId` is missing or student doesn't exist
  - Returned by `POST /api/v1/enrollments/admin`

- **"Validation failed"**
  - Occurs when required fields are missing based on grade level
  - Includes array of specific validation errors

### Frontend Errors

- Validation errors are displayed inline with form fields
- General errors are shown in alert dialogs
- Network errors are handled gracefully with user-friendly messages

---

## Migration Notes

### Existing Enrollments

- Existing enrollments will continue to work with `gradeToEnroll` field
- New enrollments use `gradeLevelToEnroll` as primary field
- Pre-save hook syncs both fields for backward compatibility

### Student Enrollment Status

- When enrollment is created, `student.enrollmentStatus` is automatically set to `true`
- When enrollment is declined, `student.enrollmentStatus` is set to `false`
- When enrollment is approved, `student.enrollmentStatus` remains `true`

---

## Example API Requests

### Create Enrollment (Admin)

```http
POST /api/v1/enrollments/admin
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "studentId": "507f1f77bcf86cd799439011",
  "schoolYear": "2024-2025",
  "gradeLevelToEnroll": 8,
  "withLRN": true,
  "returning": true,
  "lastGradeLevelCompleted": 7,
  "lastSchoolYearCompleted": "2023-2024",
  "lastSchoolEnrolled": "Sample Elementary School",
  "schoolId": "123456",
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "M",
  "sex": "Male"
}
```

### Create Enrollment (SHS)

```http
POST /api/v1/enrollments/admin
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "studentId": "507f1f77bcf86cd799439011",
  "schoolYear": "2024-2025",
  "gradeLevelToEnroll": 11,
  "withLRN": true,
  "returning": false,
  "semester": "1st",
  "track": "Academic",
  "strand": "STEM",
  "firstName": "Jane",
  "lastName": "Smith",
  "sex": "Female"
}
```

---

## Best Practices

1. **Always create student account first**: Enrollment forms require an existing student account
2. **Verify student data**: Review auto-filled information before submitting
3. **Complete all required fields**: Validation will prevent submission if fields are missing
4. **Use appropriate form type**: Grade 8+ students use simplified forms
5. **Handle returning learners**: Ensure returning learner fields are completed when `returning === true`
6. **SHS requirements**: Always include semester, track, and strand (if Academic) for Grade 11-12

---

## Support

For issues or questions regarding the enrollment flow, please refer to:
- Backend: `backend/src/controllers/enrollmentController.js`
- Frontend: `frontend/src/components/enrollment/`
- Models: `backend/src/models/Enrollment.js`


