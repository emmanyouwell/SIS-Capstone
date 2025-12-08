import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import { calculateTeachingLoad } from '../utils/teachingLoadCalculator.js';

// @desc    Get all teachers
// @route   GET /api/v1/teachers
// @access  Private
export const getTeachers = async (req, res) => {
  try {
    const { department } = req.query;
    const filter = {};

    if (department) filter.department = department;

    const teachers = await Teacher.find(filter)
      .populate('userId', 'firstName lastName middleName email contactNumber address dateOfBirth status')
      .sort({ createdAt: -1 });

    // Calculate and include teaching load for each teacher
    const teachersWithLoad = await Promise.all(
      teachers.map(async (teacher) => {
        const loadData = await calculateTeachingLoad(teacher._id);
        const teacherObj = teacher.toObject();
        teacherObj.calculatedTeachingLoad = loadData.dailyHours; // Keep for backward compatibility (max hours in a day)
        teacherObj.weeklyTeachingLoad = loadData.weeklyHours;
        teacherObj.dailyBreakdown = loadData.dailyBreakdown;
        teacherObj.isNearLimit = loadData.weeklyHours >= 25; // Warning if >= 25 hours/week
        return teacherObj;
      })
    );

    res.json({
      success: true,
      count: teachersWithLoad.length,
      data: teachersWithLoad,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single teacher
// @route   GET /api/v1/teachers/:id
// @access  Private
export const getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('userId', 'firstName lastName middleName email contactNumber address dateOfBirth status');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Calculate and include teaching load
    const loadData = await calculateTeachingLoad(teacher._id);
    const teacherObj = teacher.toObject();
    teacherObj.calculatedTeachingLoad = loadData.dailyHours; // Keep for backward compatibility (max hours in a day)
    teacherObj.weeklyTeachingLoad = loadData.weeklyHours;
    teacherObj.dailyBreakdown = loadData.dailyBreakdown;
    teacherObj.isNearLimit = loadData.weeklyHours >= 25; // Warning if >= 25 hours/week

    res.json({
      success: true,
      data: teacherObj,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create teacher
// @route   POST /api/v1/teachers
// @access  Private (Admin)
export const createTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    await teacher.populate('userId', 'firstName lastName middleName email contactNumber address dateOfBirth status');

    res.status(201).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update teacher
// @route   PATCH /api/v1/teachers/:id
// @access  Private (Admin)
export const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('userId', 'firstName lastName middleName email contactNumber address dateOfBirth status');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete teacher
// @route   DELETE /api/v1/teachers/:id
// @access  Private (Admin)
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    await teacher.deleteOne();

    res.json({
      success: true,
      message: 'Teacher deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

