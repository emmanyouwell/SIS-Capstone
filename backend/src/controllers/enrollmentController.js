import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';

// @desc    Get all enrollments
// @route   GET /api/v1/enrollments
// @access  Private
export const getEnrollments = async (req, res) => {
  try {
    const { status, gradeLevelToEnroll, schoolYear } = req.query;
    const filter = {};

    // Students can only see their own enrollments
    if (req.user.role === 'Student') {
      filter.student = req.user.id;
    }

    if (status) filter.status = status;
    if (gradeLevelToEnroll) filter.gradeLevelToEnroll = parseInt(gradeLevelToEnroll);
    if (schoolYear) filter.schoolYear = schoolYear;

    const enrollments = await Enrollment.find(filter)
      .populate('student', 'firstName lastName email learnerReferenceNo')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

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
      .populate('student', 'firstName lastName email learnerReferenceNo')
      .populate('reviewedBy', 'firstName lastName');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Students can only view their own enrollments
    if (req.user.role === 'Student' && enrollment.student._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
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
    req.body.student = req.user.id;

    const enrollment = await Enrollment.create(req.body);
    await enrollment.populate('student', 'firstName lastName email learnerReferenceNo');

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

    // If status is being changed to 'enrolled', update student's grade/section
    if (req.body.status === 'enrolled' && enrollment.status !== 'enrolled') {
      await User.findByIdAndUpdate(enrollment.student, {
        grade: enrollment.gradeLevelToEnroll,
        section: req.body.section || enrollment.section,
      });
    }

    req.body.reviewedBy = req.user.id;
    req.body.reviewedAt = new Date();

    const updatedEnrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('student', 'firstName lastName email learnerReferenceNo')
      .populate('reviewedBy', 'firstName lastName');

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
    if (req.user.role === 'Student' && enrollment.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'Student' && enrollment.status !== 'pending') {
      return res.status(403).json({ message: 'Cannot delete non-pending enrollment' });
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

