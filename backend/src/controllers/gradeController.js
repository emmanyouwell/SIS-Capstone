import Grade from '../models/Grade.js';
import User from '../models/User.js';
// @desc    Get all grades
// @route   GET /api/v1/grades
// @access  Private
export const getGrades = async (req, res) => {
  try {
    const { gradeLevel, schoolYear } = req.query;

    if (!gradeLevel) {
      return res.status(400).json({ message: "gradeLevel is required" });
    }

    // 1. Fetch all students for this grade level
    const students = await User.find({
      role: "Student",
      grade: parseInt(gradeLevel),
      status: "Active",
    }).select("firstName lastName learnerReferenceNo grade section");

    // If teacher: filter only students they teach
    let allowedSubjects = [];
    if (req.user.role === "Teacher") {
      allowedSubjects = req.user.subjects; // array of ObjectIds
    }

    // 2. Fetch all grades for students in this grade level
    const grades = await Grade.find({
      gradeLevel: parseInt(gradeLevel),
      ...(schoolYear && { schoolYear }),
      ...(req.user.role === "Teacher" && {
        "grades.subjects.subject": { $in: allowedSubjects },
      }),
    })
      .populate("student", "firstName lastName learnerReferenceNo grade section")
      .populate("grades.subjects.subject", "name gradeLevel");

    // Convert to a Map for fast lookup
    const gradeMap = new Map();
    grades.forEach((g) => gradeMap.set(g.student._id.toString(), g));

    // 3. Build final response: all students + optional grade record
    const result = students.map((student) => {
      const gradeRecord = gradeMap.get(student._id.toString()) || null;

      return {
        student,
        gradeRecord,
      };
    });

    res.json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching grades:", error);
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
      .populate('grades.subjects.subject', 'name gradeLevel');

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
    await grade.populate('student', 'firstName lastName learnerReferenceNo grade section');
    await grade.populate('grades.subjects.subject', 'name gradeLevel');

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
      const userSubjects = req.user.subjects || [];
      const hasAuthorizedSubject = (grade.grades?.subjects || []).some((s) =>
        userSubjects.some((subId) => s.subject?.toString() === subId.toString())
      );

      if (!hasAuthorizedSubject) {
        return res.status(403).json({ message: 'Not authorized to update this grade' });
      }
    }

    grade = await Grade.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('student', 'firstName lastName learnerReferenceNo grade section')
      .populate('grades.subjects.subject', 'name gradeLevel');

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
      const userSubjects = req.user.subjects || [];
      const hasAuthorizedSubject = (grade.grades?.subjects || []).some((s) =>
        userSubjects.some((subId) => s.subject?.toString() === subId.toString())
      );

      if (!hasAuthorizedSubject) {
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

