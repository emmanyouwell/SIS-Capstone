import Subject from '../models/Subject.js';

// @desc    Get all subjects
// @route   GET /api/v1/subjects
// @access  Private
export const getSubjects = async (req, res) => {
  try {
    const { gradeLevel, sectionId, status } = req.query;
    const filter = {};

    if (gradeLevel) filter.gradeLevel = parseInt(gradeLevel);
    if (sectionId) filter.sectionId = sectionId;
    if (status) filter.status = status;

    // Teachers see only their subjects
    if (req.user.role === 'Teacher') {
      // Find teacher by userId
      const Teacher = (await import('../models/Teacher.js')).default;
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (teacher) {
        filter.teacherId = teacher._id;
      } else {
        // If teacher not found, return empty
        return res.json({
          success: true,
          count: 0,
          data: [],
        });
      }
    }

    const subjects = await Subject.find(filter)
      .populate('teacherId', 'userId employeeId department')
      .populate({
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      })
      .populate('sectionId', 'sectionName gradeLevel')
      .populate('createdBy', 'firstName lastName email')
      .sort({ gradeLevel: 1, subjectName: 1 });

    res.json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single subject
// @route   GET /api/v1/subjects/:id
// @access  Private
export const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('teacherId', 'userId employeeId department')
      .populate({
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      })
      .populate('sectionId', 'sectionName gradeLevel')
      .populate('createdBy', 'firstName lastName email');

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({
      success: true,
      data: subject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create subject
// @route   POST /api/v1/subjects
// @access  Private (Admin)
export const createSubject = async (req, res) => {
  try {
    // Set createdBy to current user
    req.body.createdBy = req.user.id;

    const subject = await Subject.create(req.body);
    await subject.populate([
      { path: 'teacherId', select: 'userId employeeId department' },
      {
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      },
      { path: 'sectionId', select: 'sectionName gradeLevel' },
      { path: 'createdBy', select: 'firstName lastName email' },
    ]);

    res.status(201).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update subject
// @route   PATCH /api/v1/subjects/:id
// @access  Private (Admin, Teacher - own subjects)
export const updateSubject = async (req, res) => {
  try {
    let subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Teachers can only update subjects they teach
    if (req.user.role === 'Teacher') {
      const Teacher = (await import('../models/Teacher.js')).default;
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher || subject.teacherId.toString() !== teacher._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this subject' });
      }
    }

    subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('teacherId', 'userId employeeId department')
      .populate({
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      })
      .populate('sectionId', 'sectionName gradeLevel')
      .populate('createdBy', 'firstName lastName email');

    res.json({
      success: true,
      data: subject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete subject
// @route   DELETE /api/v1/subjects/:id
// @access  Private (Admin)
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await subject.deleteOne();

    res.json({
      success: true,
      message: 'Subject deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

