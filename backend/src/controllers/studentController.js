import Student from '../models/Student.js';
import User from '../models/User.js';

// @desc    Get all students
// @route   GET /api/v1/students
// @access  Private
export const getStudents = async (req, res) => {
  try {
    const { gradeLevel, sectionId } = req.query;
    const filter = {};

    if (gradeLevel) filter.gradeLevel = parseInt(gradeLevel);
    if (sectionId) filter.sectionId = sectionId;

    const students = await Student.find(filter)
      .populate('userId', 'firstName lastName middleName email contactNumber address dateOfBirth status')
      .populate('sectionId', 'sectionName gradeLevel')
      .populate('subjects.subjectId', 'subjectName gradeLevel')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single student
// @route   GET /api/v1/students/:id
// @access  Private
export const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'firstName lastName middleName email contactNumber address dateOfBirth status')
      .populate('sectionId', 'sectionName gradeLevel')
      .populate('subjects.subjectId', 'subjectName gradeLevel');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create student
// @route   POST /api/v1/students
// @access  Private (Admin)
export const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    await student.populate('userId', 'firstName lastName middleName email contactNumber address dateOfBirth status');
    await student.populate('sectionId', 'sectionName gradeLevel');

    res.status(201).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student
// @route   PATCH /api/v1/students/:id
// @access  Private (Admin)
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('userId', 'firstName lastName middleName email contactNumber address dateOfBirth status')
      .populate('sectionId', 'sectionName gradeLevel')
      .populate('subjects.subjectId', 'subjectName gradeLevel');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/v1/students/:id
// @access  Private (Admin)
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.deleteOne();

    res.json({
      success: true,
      message: 'Student deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

