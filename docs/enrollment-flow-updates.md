# Enrollment Flow Updates Documentation

## Overview
This document outlines the comprehensive updates made to the enrollment flow of the SIS-Capstone project. These changes enhance the enrollment system with additional fields, enrollment status tracking, and restrictions to ensure data integrity.

## Table of Contents
1. [Schema Changes](#schema-changes)
2. [Enrollment Workflow](#enrollment-workflow)
3. [Restrictions Applied](#restrictions-applied)
4. [API Endpoints](#api-endpoints)
5. [Frontend Updates](#frontend-updates)
6. [Migration Notes](#migration-notes)

---

## Schema Changes

### User Model Updates
**File:** `backend/src/models/User.js`

**New Fields:**
- `sex` (String, required, enum: ['Male', 'Female'])
  - Required field for user gender
  - Used in enrollment forms and student records
  
- `extensionName` (String, optional, default: '')
  - Optional field for name extensions (e.g., Jr., III, Sr.)
  - Trimmed and validated

**Impact:**
- All new user registrations must include `sex`
- Existing users may need migration to add `sex` field
- Login/auth functionality remains unchanged

---

### Student Model Updates
**File:** `backend/src/models/Student.js`

**New Fields:**
- `enrollmentStatus` (Boolean, default: false)
  - Tracks whether a student has completed enrollment
  - Defaults to `false` for all new student accounts
  - Automatically set to `true` when enrollment form is created
  - Used to enforce enrollment restrictions

**Impact:**
- All new students default to `enrollmentStatus: false`
- Existing students may need migration to set appropriate status
- Critical for enrollment restriction enforcement

---

### Enrollment Model Updates
**File:** `backend/src/models/Enrollment.js`

**New Fields Added:**

#### Basic Information
- `psaCertificateNo` (String, optional)
  - PSA Birth Certificate number
  
- `placeOfBirth` (String, optional)
  - Student's place of birth
  
- `motherTongue` (String, optional)
  - Student's native language
  
- `religion` (String, optional)
  - Student's religious affiliation

#### Socio-Economic Information
- `indigenousPeople` (Boolean, default: false)
  - Whether student belongs to indigenous peoples
  
- `beneficiaryOf4Ps` (Boolean, default: false)
  - Whether family is beneficiary of 4Ps program
  
- `fourPsHouseholdId` (String, optional)
  - 4Ps Household ID number (required if beneficiaryOf4Ps is true)

#### Disability Information
- `learnerWithDisability` (Boolean, default: false)
  - Whether student has a disability
  
- `typeOfDisability` (Array of Strings, default: [])
  - Types of disabilities (supports multiple selections)
  - Common values: Visual, Hearing, Learning, Physical, Intellectual, Speech, Emotional, Other

#### Address Information
- `currentAddress` (String, optional)
  - Complete current address (constructed from address components)
  
- `permanentAddress` (String, optional)
  - Complete permanent address (may be same as current)

#### Returning Learner Fields (Optional)
- `lastGradeLevelCompleted` (Number, optional, min: 1, max: 12)
  - Last grade level the student completed
  
- `lastSchoolYearCompleted` (String, optional)
  - Last school year completed (e.g., "2023-2024")
  
- `lastSchoolAttended` (String, optional)
  - Name of last school attended
  
- `schoolId` (String, optional)
  - School ID of last school attended

#### Senior High School Fields (Optional)
- `semester` (String, optional)
  - Semester (1st or 2nd)
  
- `track` (String, optional)
  - Track (Academic, Technical-Vocational-Livelihood, Sports, Arts and Design)
  
- `strand` (String, optional)
  - Strand (for Academic track: STEM, ABM, HUMSS, GAS)
  
- `otherLearningModalities` (String, optional)
  - Other learning modalities (e.g., Distance Learning, Blended Learning)

**Impact:**
- Enrollment forms now capture comprehensive student information
- All fields are optional except those marked as required in validation
- Supports both Junior High School (Grade 7-10) and Senior High School (Grade 11-12) enrollment

---

## Enrollment Workflow

### Enrollment Creation Flow

1. **Student Submits Enrollment Form**
   - Student fills out enrollment form with all required fields
   - Form includes new fields: PSA cert, place of birth, mother tongue, religion, disability info, addresses, etc.
   - Form submission creates enrollment record with status: 'pending'

2. **Automatic Status Update**
   - When enrollment is created via `POST /api/v1/enrollments`
   - Student's `enrollmentStatus` is automatically set to `true`
   - This allows student to proceed with other operations

3. **Admin Review**
   - Admin reviews enrollment form
   - Admin can approve (status: 'enrolled') or decline (status: 'declined')
   - When approved, student's `gradeLevel` and `sectionId` are updated
   - When declined, `enrollmentStatus` is set back to `false`

### Enrollment Status States

- **Pending**: Initial state when enrollment form is submitted
- **Enrolled**: Admin-approved enrollment
- **Declined**: Admin-rejected enrollment

---

## Restrictions Applied

### Enrollment Status Enforcement

The following operations require `enrollmentStatus === true`:

#### 1. Section Assignment
**File:** `backend/src/controllers/studentController.js`
- **Restriction**: Cannot assign student to section if not enrolled
- **Error Message**: "Student is not enrolled. Cannot assign to section."

#### 2. Subject Assignment
**File:** `backend/src/controllers/studentController.js`
- **Restriction**: Cannot assign subjects to student if not enrolled
- **Error Message**: "Student must complete enrollment before proceeding. Cannot assign subjects."

#### 3. Masterlist Addition
**File:** `backend/src/controllers/masterlistController.js`
- **Restriction**: Cannot add student to masterlist if not enrolled
- **Error Message**: "Cannot add student(s) to masterlist. X student(s) are not enrolled."

#### 4. Grade Creation
**File:** `backend/src/controllers/gradeController.js`
- **Restriction**: Cannot create grade records for non-enrolled students
- **Error Message**: "Student is not enrolled. Cannot create grade record."

#### 5. Schedule Viewing
**File:** `backend/src/controllers/scheduleController.js`
- **Restriction**: Students cannot view schedules if not enrolled
- **Error Message**: "Student must complete enrollment before proceeding. Cannot view schedule."

#### 6. Grade Queries
**File:** `backend/src/controllers/gradeController.js`
- **Restriction**: Grade queries filter to only enrolled students
- Non-enrolled students are excluded from grade listings

---

## API Endpoints

### Enrollment Endpoints

#### GET /api/v1/enrollments
- **Description**: Get all enrollments (filtered by role)
- **Access**: Private
- **Query Parameters**: `status`, `gradeToEnroll`, `schoolYear`
- **Response**: Includes populated student and user data with new fields

#### GET /api/v1/enrollments/:id
- **Description**: Get single enrollment
- **Access**: Private
- **Response**: Full enrollment object with all new fields

#### POST /api/v1/enrollments
- **Description**: Create enrollment (self-enroll)
- **Access**: Private (Student role only)
- **Request Body**: Includes all new enrollment fields
- **Behavior**: Automatically sets `student.enrollmentStatus = true`
- **Response**: Created enrollment with populated data

#### PATCH /api/v1/enrollments/:id
- **Description**: Update enrollment (approve/decline)
- **Access**: Private (Admin role only)
- **Request Body**: Can update status, sectionId, and all enrollment fields
- **Behavior**: 
  - If status changed to 'enrolled': Updates student's gradeLevel, sectionId, and enrollmentStatus
  - If status changed to 'declined': Sets enrollmentStatus to false
- **Response**: Updated enrollment with populated data

#### DELETE /api/v1/enrollments/:id
- **Description**: Delete enrollment
- **Access**: Private (Admin, or Student for own pending enrollment)
- **Response**: Success message

### Student Endpoints

#### GET /api/v1/students
- **Description**: Get all students
- **Access**: Private
- **Response**: Includes `enrollmentStatus` and populated user data with `sex` and `extensionName`

#### PATCH /api/v1/students/:id
- **Description**: Update student
- **Access**: Private (Admin)
- **Restrictions**: Enforces enrollment status checks for section and subject assignments
- **Response**: Updated student with enrollmentStatus

### User Endpoints

#### POST /api/v1/auth/register
- **Description**: Register new user
- **Access**: Public (or Admin only in production)
- **Request Body**: Must include `sex` field (required)
- **Request Body**: May include `extensionName` field (optional)
- **Behavior**: New students default to `enrollmentStatus: false`

---

## Frontend Updates

### Redux Slices

#### enrollmentSlice.js
- **Status**: No changes required
- **Note**: Slice already handles enrollment data generically and will work with new fields

#### studentSlice.js
- **Status**: No changes required
- **Note**: Slice handles student data and will include `enrollmentStatus` automatically

#### userSlice.js
- **Status**: No changes required
- **Note**: Slice handles user data and will include `sex` and `extensionName` automatically

### UI Components

#### StudentEnrollment.jsx
**File:** `frontend/src/pages/student/StudentEnrollment.jsx`

**Updates:**
- Added form fields for all new enrollment schema fields
- Integrated with Redux `createEnrollment` action
- Added disability checkbox with multiple type selection
- Added returning learner section (conditional on `returningBalikAral`)
- Added Senior High School section (conditional on grade 11-12)
- Constructs `currentAddress` and `permanentAddress` from address components
- Validates required fields including new conditional validations

**New Form Sections:**
1. Disability Information (checkbox + multi-select)
2. Returning Learner Information (conditional)
3. Senior High School Information (conditional)

#### AdminEnrollmentPending.jsx
**File:** `frontend/src/pages/admin/AdminEnrollmentPending.jsx`

**Updates:**
- Added display for all new enrollment fields
- Shows disability information when applicable
- Shows returning learner information when applicable
- Shows SHS information for grade 11-12 enrollments
- Displays 4Ps Household ID when applicable
- Displays type of disability as comma-separated list

---

## Migration Notes

### Database Migration Required

#### For Existing Users
```javascript
// Add sex field to existing users (set default or update manually)
db.users.updateMany(
  { sex: { $exists: false } },
  { $set: { sex: "Male" } } // Or appropriate default
)
```

#### For Existing Students
```javascript
// Add enrollmentStatus to existing students
// Option 1: Set all to false (requires re-enrollment)
db.students.updateMany(
  { enrollmentStatus: { $exists: false } },
  { $set: { enrollmentStatus: false } }
)

// Option 2: Set to true if they have an active enrollment
db.students.updateMany(
  { 
    enrollmentStatus: { $exists: false },
    // Add condition based on your enrollment records
  },
  { $set: { enrollmentStatus: true } }
)
```

#### For Existing Enrollments
```javascript
// New fields will be undefined/null for existing enrollments
// This is acceptable as all new fields are optional
// No migration needed unless you want to backfill data
```

### Code Migration

1. **Update Registration Forms**
   - Ensure all user registration forms include `sex` field (required)
   - Add `extensionName` field (optional)

2. **Update Student Creation**
   - Ensure new students default to `enrollmentStatus: false`
   - Update any student creation forms/APIs

3. **Update Enrollment Forms**
   - Update enrollment forms to include all new fields
   - Ensure proper validation for conditional fields

4. **Update Admin Views**
   - Update admin enrollment review pages to display new fields
   - Ensure proper handling of optional fields

### Testing Checklist

- [ ] User registration with `sex` field
- [ ] Student creation defaults to `enrollmentStatus: false`
- [ ] Enrollment creation sets `enrollmentStatus: true`
- [ ] Section assignment blocked for non-enrolled students
- [ ] Subject assignment blocked for non-enrolled students
- [ ] Masterlist addition blocked for non-enrolled students
- [ ] Grade creation blocked for non-enrolled students
- [ ] Schedule viewing blocked for non-enrolled students
- [ ] Enrollment form submission with all new fields
- [ ] Admin enrollment review displays all new fields
- [ ] Returning learner fields display conditionally
- [ ] SHS fields display conditionally
- [ ] Disability information saved and displayed correctly
- [ ] Address fields constructed correctly

---

## Summary

This update significantly enhances the enrollment system by:

1. **Adding comprehensive enrollment fields** to capture detailed student information
2. **Implementing enrollment status tracking** to ensure data integrity
3. **Enforcing enrollment restrictions** across all student-related operations
4. **Supporting both JHS and SHS** enrollment with appropriate fields
5. **Maintaining backward compatibility** with optional fields and defaults

All changes follow existing project patterns, naming conventions, and code style. The system is now more robust and provides better data collection and validation.

---

## Support

For questions or issues related to these updates, please refer to:
- Backend documentation: `backend/BACKEND_DOCUMENTATION.md`
- API endpoints: See API Endpoints section above
- Frontend components: See Frontend Updates section above

