import Enrollment from '../models/Enrollment.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

/**
 * Auto-fill enrollment data from student information
 * @param {Object} student - Student document with populated userId
 * @param {Object} enrollmentData - Existing enrollment data (will be merged)
 * @returns {Object} Enrollment data with auto-filled personal information
 */
const autoFillFromStudent = (student, enrollmentData = {}) => {
  const user = student.userId;
  const filledData = {
    ...enrollmentData,
    // Personal information snapshot
    firstName: enrollmentData.firstName || user?.firstName || '',
    middleName: enrollmentData.middleName || user?.middleName || '',
    lastName: enrollmentData.lastName || user?.lastName || '',
    extensionName: enrollmentData.extensionName || user?.extensionName || '',
    sex: enrollmentData.sex || user?.sex || '',
    dateOfBirth: enrollmentData.dateOfBirth || user?.dateOfBirth || null,
    lrn: enrollmentData.lrn || student?.lrn || '',
    currentAddress: enrollmentData.currentAddress || user?.address || '',
    permanentAddress: enrollmentData.permanentAddress || user?.address || '',
    guardianName: enrollmentData.guardianName || student?.guardianName || '',
    guardianContact: enrollmentData.guardianContact || student?.guardianContact || '',
  };
  return filledData;
};

/**
 * Validate enrollment data based on grade level requirements
 * @param {Object} enrollmentData - Enrollment data to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
const validateEnrollmentByGrade = (enrollmentData) => {
  const errors = [];
  const gradeLevel = enrollmentData.gradeLevelToEnroll || enrollmentData.gradeToEnroll;

  // Basic required fields for all enrollments
  if (!enrollmentData.schoolYear) {
    errors.push('School year is required');
  }
  if (!gradeLevel) {
    errors.push('Grade level to enroll is required');
  }
  if (typeof enrollmentData.withLRN !== 'boolean') {
    errors.push('With LRN field is required');
  }
  if (typeof enrollmentData.returning !== 'boolean') {
    errors.push('Returning field is required');
  }

  // For Grade 8 and above, check returning learner fields
  if (gradeLevel >= 8) {
    if (enrollmentData.returning === true) {
      if (!enrollmentData.lastGradeLevelCompleted) {
        errors.push('Last grade level completed is required for returning learners');
      }
      if (!enrollmentData.lastSchoolYearCompleted) {
        errors.push('Last school year completed is required for returning learners');
      }
      if (!enrollmentData.lastSchoolEnrolled && !enrollmentData.lastSchoolAttended) {
        errors.push('Last school enrolled is required for returning learners');
      }
      if (!enrollmentData.schoolId) {
        errors.push('School ID is required for returning learners');
      }
    }

  }

  // Personal information is always required (snapshot)
  if (!enrollmentData.firstName) {
    errors.push('First name is required');
  }
  if (!enrollmentData.lastName) {
    errors.push('Last name is required');
  }
  if (!enrollmentData.sex) {
    errors.push('Sex is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// @desc    Get all enrollments
// @route   GET /api/v1/enrollments
// @access  Private
export const getEnrollments = async (req, res) => {
  try {
    const { status, gradeToEnroll, schoolYear } = req.query;
    const filter = {};

    // Students can only see their own enrollments
    if (req.user.role === 'Student') {
      const student = await Student.findOne({ userId: req.user.id });
      if (student) {
        filter.studentId = student._id;
      } else {
        return res.json({
          success: true,
          count: 0,
          data: [],
        });
      }
    }

    if (status) filter.status = status;
    if (gradeToEnroll) filter.gradeToEnroll = parseInt(gradeToEnroll);
    if (schoolYear) filter.schoolYear = schoolYear;

    const enrollments = await Enrollment.find(filter)
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName middleName email contactNumber sex extensionName',
        },
      })
      .sort({ dateSubmitted: -1 });

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single enrollment
// @route   GET /api/v1/enrollments/:id
// @access  Private
export const getEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName middleName email contactNumber sex extensionName',
        },
      });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Students can only view their own enrollments
    if (req.user.role === 'Student') {
      const student = await Student.findOne({ userId: req.user.id });
      if (!student || enrollment.studentId._id.toString() !== student._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create enrollment (self-enroll)
// @route   POST /api/v1/enrollments
// @access  Private (Student)
export const createEnrollment = async (req, res) => {
  try {
    // Students can only create their own enrollment
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }

    // Auto-fill from student data
    const enrollmentData = autoFillFromStudent(student, req.body);
    enrollmentData.studentId = student._id;
    enrollmentData.dateSubmitted = new Date();
    
    // Sync grade fields
    if (enrollmentData.gradeLevelToEnroll && !enrollmentData.gradeToEnroll) {
      enrollmentData.gradeToEnroll = enrollmentData.gradeLevelToEnroll;
    }
    if (enrollmentData.gradeToEnroll && !enrollmentData.gradeLevelToEnroll) {
      enrollmentData.gradeLevelToEnroll = enrollmentData.gradeToEnroll;
    }

    // Validate enrollment data
    const validation = validateEnrollmentByGrade(enrollmentData);
    if (!validation.valid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const enrollment = await Enrollment.create(enrollmentData);
    
    // Update student's LRN if provided in enrollment form (even if student was created without LRN)
    const studentUpdate = {
      enrollmentStatus: true,
    };
    if (enrollmentData.lrn && enrollmentData.lrn.trim() !== '') {
      studentUpdate.lrn = enrollmentData.lrn.trim();
    }
    
    // Automatically update student's enrollmentStatus and LRN when enrollment is created
    await Student.findByIdAndUpdate(student._id, studentUpdate);

    await enrollment.populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'firstName lastName middleName email contactNumber sex extensionName dateOfBirth address',
      },
    });

    res.status(201).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create enrollment (Admin)
// @route   POST /api/v1/enrollments/admin
// @access  Private (Admin)
export const adminCreateEnrollment = async (req, res) => {
  try {
    // Require studentId
    if (!req.body.studentId) {
      return res.status(400).json({
        message: 'Student account required before creating enrollment form.',
      });
    }

    // Verify student exists
    const student = await Student.findById(req.body.studentId)
      .populate('userId', 'firstName lastName middleName email contactNumber sex extensionName dateOfBirth address');
    
    if (!student) {
      return res.status(404).json({
        message: 'Student account required before creating enrollment form.',
      });
    }

    // Auto-fill from student data
    const enrollmentData = autoFillFromStudent(student, req.body);
    enrollmentData.studentId = student._id;
    enrollmentData.dateSubmitted = new Date();
    enrollmentData.status = 'pending'; // Admin-created enrollments start as pending
    
    // Sync grade fields
    if (enrollmentData.gradeLevelToEnroll && !enrollmentData.gradeToEnroll) {
      enrollmentData.gradeToEnroll = enrollmentData.gradeLevelToEnroll;
    }
    if (enrollmentData.gradeToEnroll && !enrollmentData.gradeLevelToEnroll) {
      enrollmentData.gradeLevelToEnroll = enrollmentData.gradeToEnroll;
    }

    // Validate enrollment data
    const validation = validateEnrollmentByGrade(enrollmentData);
    if (!validation.valid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const enrollment = await Enrollment.create(enrollmentData);
    
    // Update student's LRN if provided in enrollment form (even if student was created without LRN)
    const studentUpdate = {
      enrollmentStatus: true,
    };
    if (enrollmentData.lrn && enrollmentData.lrn.trim() !== '') {
      studentUpdate.lrn = enrollmentData.lrn.trim();
    }
    
    // Automatically update student's enrollmentStatus and LRN when enrollment is created
    await Student.findByIdAndUpdate(student._id, studentUpdate);

    await enrollment.populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'firstName lastName middleName email contactNumber sex extensionName dateOfBirth address',
      },
    });

    res.status(201).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update enrollment (approve/decline)
// @route   PATCH /api/v1/enrollments/:id
// @access  Private (Admin)
export const updateEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // If status is being changed to 'enrolled', update student's gradeLevel, sectionId, and enrollmentStatus
    if (req.body.status === 'enrolled' && enrollment.status !== 'enrolled') {
      const Student = (await import('../models/Student.js')).default;
      const gradeLevel = enrollment.gradeLevelToEnroll || enrollment.gradeToEnroll;
      const studentUpdate = {
        gradeLevel: gradeLevel,
        sectionId: req.body.sectionId,
        enrollmentStatus: true,
      };
      // Update LRN if provided in the enrollment update
      if (req.body.lrn && req.body.lrn.trim() !== '') {
        studentUpdate.lrn = req.body.lrn.trim();
      }
      await Student.findByIdAndUpdate(enrollment.studentId, studentUpdate);
    }
    
    // Update student's LRN if provided in enrollment update (even if not changing status)
    if (req.body.lrn && req.body.lrn.trim() !== '') {
      await Student.findByIdAndUpdate(enrollment.studentId, {
        lrn: req.body.lrn.trim(),
      });
    }

    // If status is being changed to 'declined', set enrollmentStatus to false
    if (req.body.status === 'declined' && enrollment.status !== 'declined') {
      const Student = (await import('../models/Student.js')).default;
      await Student.findByIdAndUpdate(enrollment.studentId, {
        enrollmentStatus: false,
      });
    }

    const updatedEnrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName middleName email contactNumber sex extensionName',
        },
      });

    res.json({
      success: true,
      data: updatedEnrollment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete enrollment
// @route   DELETE /api/v1/enrollments/:id
// @access  Private (Admin, Student - own enrollment)
export const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Students can only delete their own pending enrollments
    if (req.user.role === 'Student') {
      const student = await Student.findOne({ userId: req.user.id });
      if (!student || enrollment.studentId.toString() !== student._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (enrollment.status !== 'pending') {
        return res.status(403).json({ message: 'Cannot delete non-pending enrollment' });
      }
    }

    await enrollment.deleteOne();

    res.json({
      success: true,
      message: 'Enrollment deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

