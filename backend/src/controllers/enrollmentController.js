import Enrollment from '../models/Enrollment.js';
import Student from '../models/Student.js';

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
          select: 'firstName lastName middleName email contactNumber',
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
          select: 'firstName lastName middleName email contactNumber',
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

    req.body.studentId = student._id;
    req.body.dateSubmitted = new Date();

    const enrollment = await Enrollment.create(req.body);
    await enrollment.populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'firstName lastName middleName email contactNumber',
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

    // If status is being changed to 'enrolled', update student's gradeLevel and sectionId
    if (req.body.status === 'enrolled' && enrollment.status !== 'enrolled') {
      const Student = (await import('../models/Student.js')).default;
      await Student.findByIdAndUpdate(enrollment.studentId, {
        gradeLevel: enrollment.gradeToEnroll,
        sectionId: req.body.sectionId,
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
          select: 'firstName lastName middleName email contactNumber',
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

