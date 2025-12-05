import Grade from '../models/Grade.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import Teacher from '../models/Teacher.js';

// @desc    Get all grades
// @route   GET /api/v1/grades
// @access  Private
export const getGrades = async (req, res) => {
  try {
    const { studentId, subjectId, gradeLevel } = req.query;
    const filter = {};

    if (studentId) filter.studentId = studentId;
    if (subjectId) filter['grades.subjectId'] = subjectId;

    // Filter by gradeLevel through student relationship
    if (gradeLevel) {
      const studentsInGrade = await Student.find({ gradeLevel: parseInt(gradeLevel) }).select('_id');
      const studentIds = studentsInGrade.map((s) => s._id);
      filter.studentId = { $in: studentIds };
    }

    // Students can only see their own grades
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

    // Teachers can only see grades for subjects they teach
    if (req.user.role === 'Teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (teacher) {
        // teacherId is now an array, use $in operator
        const teacherSubjects = await Subject.find({ teacherId: { $in: [teacher._id] } });
        const subjectIds = teacherSubjects.map((s) => s._id);
        filter['grades.subjectId'] = { $in: subjectIds };
      } else {
        return res.json({
          success: true,
          count: 0,
          data: [],
        });
      }
    }

    const grades = await Grade.find(filter)
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName middleName email',
        },
      })
      .populate('grades.subjectId', 'subjectName gradeLevel')
      .sort({ dateRecorded: -1 });

    res.json({
      success: true,
      count: grades.length,
      data: grades,
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single grade
// @route   GET /api/v1/grades/:id
// @access  Private
export const getGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName middleName email',
        },
      })
      .populate('grades.subjectId', 'subjectName gradeLevel');

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Students can only view their own grades
    if (req.user.role === 'Student') {
      const student = await Student.findOne({ userId: req.user.id });
      if (!student || grade.studentId._id.toString() !== student._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    // Teachers can only view grades for subjects they teach
    if (req.user.role === 'Teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (teacher) {
        // teacherId is now an array, use $in operator
        const teacherSubjects = await Subject.find({ teacherId: { $in: [teacher._id] } });
        const subjectIds = teacherSubjects.map((s) => s._id.toString());
        const hasAuthorizedSubject = grade.grades.some((g) =>
          subjectIds.includes(g.subjectId._id.toString())
        );
        if (!hasAuthorizedSubject) {
          return res.status(403).json({ message: 'Not authorized' });
        }
      }
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
    req.body.dateRecorded = new Date();

    const grade = await Grade.create(req.body);
    await grade.populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'firstName lastName middleName email',
      },
    });
    await grade.populate('grades.subjectId', 'subjectName gradeLevel');

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

    // Teachers can only update grades that include at least one of their subjects
    if (req.user.role === 'Teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (teacher) {
        // teacherId is now an array, use $in operator
        const teacherSubjects = await Subject.find({ teacherId: { $in: [teacher._id] } });
        const subjectIds = teacherSubjects.map((s) => s._id.toString());
        const hasAuthorizedSubject = grade.grades.some((g) =>
          subjectIds.includes(g.subjectId?.toString())
        );

        if (!hasAuthorizedSubject) {
          return res.status(403).json({ message: 'Not authorized to update this grade' });
        }
      } else {
        return res.status(403).json({ message: 'Teacher record not found' });
      }
    }

    grade = await Grade.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName middleName email',
        },
      })
      .populate('grades.subjectId', 'subjectName gradeLevel');

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

    // Teachers can only delete grades that include at least one of their subjects
    if (req.user.role === 'Teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (teacher) {
        // teacherId is now an array, use $in operator
        const teacherSubjects = await Subject.find({ teacherId: { $in: [teacher._id] } });
        const subjectIds = teacherSubjects.map((s) => s._id.toString());
        const hasAuthorizedSubject = grade.grades.some((g) =>
          subjectIds.includes(g.subjectId?.toString())
        );

        if (!hasAuthorizedSubject) {
          return res.status(403).json({ message: 'Not authorized to delete this grade' });
        }
      } else {
        return res.status(403).json({ message: 'Teacher record not found' });
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
