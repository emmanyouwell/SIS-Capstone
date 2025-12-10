import EnrollmentPeriod from '../models/EnrollmentPeriod.js';
import Student from '../models/Student.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Get current active enrollment period
// @route   GET /api/v1/enrollment-periods/current
// @access  Public (for students to check) / Private (for admin)
export const getCurrentEnrollmentPeriod = async (req, res) => {
  try {
    const now = new Date();
    const period = await EnrollmentPeriod.findOne({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ createdAt: -1 });

    if (!period) {
      return res.json({
        success: true,
        data: null,
        isActive: false,
      });
    }

    res.json({
      success: true,
      data: period,
      isActive: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all enrollment periods
// @route   GET /api/v1/enrollment-periods
// @access  Private (Admin)
export const getEnrollmentPeriods = async (req, res) => {
  try {
    const periods = await EnrollmentPeriod.find()
      .populate('createdBy', 'userId')
      .populate({
        path: 'createdBy',
        populate: {
          path: 'userId',
          select: 'firstName lastName',
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: periods.length,
      data: periods,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single enrollment period
// @route   GET /api/v1/enrollment-periods/:id
// @access  Private (Admin)
export const getEnrollmentPeriod = async (req, res) => {
  try {
    const period = await EnrollmentPeriod.findById(req.params.id).populate(
      'createdBy',
      'userId'
    );

    if (!period) {
      return res.status(404).json({ message: 'Enrollment period not found' });
    }

    res.json({
      success: true,
      data: period,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create enrollment period
// @route   POST /api/v1/enrollment-periods
// @access  Private (Admin)
export const createEnrollmentPeriod = async (req, res) => {
  try {
    const { startDate, endDate, schoolYear, description } = req.body;

    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Get admin ID
    const Admin = (await import('../models/Admin.js')).default;
    const admin = await Admin.findOne({ userId: req.user.id });
    if (!admin) {
      return res.status(403).json({ message: 'Admin record not found' });
    }

    // Get old active period's schoolYear before deactivating
    const oldActivePeriod = await EnrollmentPeriod.findOne({ isActive: true });
    const oldSchoolYear = oldActivePeriod?.schoolYear;

    // Deactivate all other active periods
    await EnrollmentPeriod.updateMany({ isActive: true }, { isActive: false });

    // Create new enrollment period
    const period = await EnrollmentPeriod.create({
      startDate: start,
      endDate: end,
      schoolYear,
      description,
      isActive: true,
      createdBy: admin._id,
    });

    // Reset all students' enrollmentStatus to false when new enrollment period is set
    // This ensures students need to enroll again for the new level and school year
    await Student.updateMany({}, { enrollmentStatus: false });

    // Delete enrollment forms for Grade 10 students who are promoted (they graduated)
    // These students completed Grade 10 and are moving on, so their enrollment forms should be deleted
    const grade10PromotedStudents = await Student.find({ 
      gradeLevel: 10, 
      isPromoted: true 
    }).select('_id');
    const grade10PromotedStudentIds = grade10PromotedStudents.map(s => s._id);
    
    if (grade10PromotedStudentIds.length > 0) {
      await Enrollment.deleteMany({ 
        studentId: { $in: grade10PromotedStudentIds } 
      });
    }

    // Delete old enrollment forms for the previous school year (except Grade 10 promoted who already had theirs deleted)
    // This prevents duplicate enrollment forms when students enroll for the new school year
    if (oldSchoolYear && oldSchoolYear !== schoolYear) {
      await Enrollment.deleteMany({ 
        schoolYear: oldSchoolYear,
        studentId: { $nin: grade10PromotedStudentIds }
      });
    }

    // Set all remaining enrollment documents to 'not enrolled' status
    // When a new enrollment period begins, it means the school year is over
    // All students (old and new) need to re-enroll, so all enrollment forms are set to 'not enrolled'
    await Enrollment.updateMany({}, { status: 'not enrolled' });

    await period.populate({
      path: 'createdBy',
      populate: {
        path: 'userId',
        select: 'firstName lastName',
      },
    });

    res.status(201).json({
      success: true,
      data: period,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update enrollment period
// @route   PATCH /api/v1/enrollment-periods/:id
// @access  Private (Admin)
export const updateEnrollmentPeriod = async (req, res) => {
  try {
    const period = await EnrollmentPeriod.findById(req.params.id);

    if (!period) {
      return res.status(404).json({ message: 'Enrollment period not found' });
    }

    const { startDate, endDate, isActive, schoolYear, description } = req.body;

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    }

    // Check if period is being activated (changing from inactive to active)
    const isBeingActivated = isActive === true && period.isActive === false;

    // If activating this period, deactivate all others
    if (isActive === true) {
      await EnrollmentPeriod.updateMany(
        { _id: { $ne: period._id }, isActive: true },
        { isActive: false }
      );
    }

    // Update period
    const updatedPeriod = await EnrollmentPeriod.findByIdAndUpdate(
      req.params.id,
      {
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(isActive !== undefined && { isActive }),
        ...(schoolYear !== undefined && { schoolYear }),
        ...(description !== undefined && { description }),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: 'createdBy',
      populate: {
        path: 'userId',
        select: 'firstName lastName',
      },
    });

    // If period is being activated (changing from inactive to active), reset enrollments
    // This ensures students need to enroll again for the new level and school year
    // When an enrollment period is activated, it means the school year is over
    if (isBeingActivated) {
      await Student.updateMany({}, { enrollmentStatus: false });
      
      // Delete enrollment forms for Grade 10 students who are promoted (they graduated)
      // These students completed Grade 10 and are moving on, so their enrollment forms should be deleted
      const grade10PromotedStudents = await Student.find({ 
        gradeLevel: 10, 
        isPromoted: true 
      }).select('_id');
      const grade10PromotedStudentIds = grade10PromotedStudents.map(s => s._id);
      
      if (grade10PromotedStudentIds.length > 0) {
        await Enrollment.deleteMany({ 
          studentId: { $in: grade10PromotedStudentIds } 
        });
      }
      
      // Set all remaining enrollment documents to 'not enrolled' status
      // All students (old and new) need to re-enroll, so all enrollment forms are set to 'not enrolled'
      await Enrollment.updateMany({}, { status: 'not enrolled' });
    }

    res.json({
      success: true,
      data: updatedPeriod,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete enrollment period
// @route   DELETE /api/v1/enrollment-periods/:id
// @access  Private (Admin)
export const deleteEnrollmentPeriod = async (req, res) => {
  try {
    const period = await EnrollmentPeriod.findById(req.params.id);

    if (!period) {
      return res.status(404).json({ message: 'Enrollment period not found' });
    }

    await period.deleteOne();

    res.json({
      success: true,
      message: 'Enrollment period deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


