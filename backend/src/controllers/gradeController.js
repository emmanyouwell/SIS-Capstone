import Grade from '../models/Grade.js';

// @desc    Get all grades
// @route   GET /api/v1/grades
// @access  Private
export const getGrades = async (req, res) => {
  try {
    const { student, subject, gradeLevel, schoolYear } = req.query;
    const filter = {};

    // Students can only see their own grades
    if (req.user.role === 'Student') {
      filter.student = req.user.id;
    } else if (student) {
      filter.student = student;
    }

    if (subject) filter.subject = subject;
    if (gradeLevel) filter.gradeLevel = parseInt(gradeLevel);
    if (schoolYear) filter.schoolYear = schoolYear;

    // Teachers can only see grades for their subjects
    if (req.user.role === 'Teacher') {
      const userSubjects = req.user.subjects || [];
      filter.subject = { $in: userSubjects };
    }

    const grades = await Grade.find(filter)
      .populate('student', 'firstName lastName learnerReferenceNo grade section')
      .populate('subject', 'name gradeLevel')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: grades.length,
      data: grades,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single grade
// @route   GET /api/v1/grades/:id
// @access  Private
export const getGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('student', 'firstName lastName learnerReferenceNo grade section')
      .populate('subject', 'name gradeLevel');

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Students can only view their own grades
    if (req.user.role === 'Student' && grade.student._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: grade,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create grade
// @route   POST /api/v1/grades
// @access  Private (Admin, Teacher)
export const createGrade = async (req, res) => {
  try {
    const grade = await Grade.create(req.body);
    await grade.populate('student', 'firstName lastName learnerReferenceNo');
    await grade.populate('subject', 'name gradeLevel');

    res.status(201).json({
      success: true,
      data: grade,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update grade
// @route   PATCH /api/v1/grades/:id
// @access  Private (Admin, Teacher)
export const updateGrade = async (req, res) => {
  try {
    let grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Teachers can only update grades for their subjects
    if (req.user.role === 'Teacher') {
      const userSubjects = req.user.subjects || [];
      if (!userSubjects.includes(grade.subject)) {
        return res.status(403).json({ message: 'Not authorized to update this grade' });
      }
    }

    grade = await Grade.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('student', 'firstName lastName learnerReferenceNo')
      .populate('subject', 'name gradeLevel');

    res.json({
      success: true,
      data: grade,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete grade
// @route   DELETE /api/v1/grades/:id
// @access  Private (Admin, Teacher)
export const deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Teachers can only delete grades for their subjects
    if (req.user.role === 'Teacher') {
      const userSubjects = req.user.subjects || [];
      if (!userSubjects.includes(grade.subject)) {
        return res.status(403).json({ message: 'Not authorized to delete this grade' });
      }
    }

    await grade.deleteOne();

    res.json({
      success: true,
      message: 'Grade deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

