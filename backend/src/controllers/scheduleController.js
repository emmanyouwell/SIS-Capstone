import Schedule from '../models/Schedule.js';

// @desc    Get all schedules
// @route   GET /api/v1/schedules
// @access  Private
export const getSchedules = async (req, res) => {
  try {
    const { grade, section, schoolYear } = req.query;
    const filter = {};

    if (grade) filter.grade = parseInt(grade);
    if (section) filter.section = section;
    if (schoolYear) filter.schoolYear = schoolYear;

    // Students see only their grade/section schedule
    if (req.user.role === 'Student') {
      filter.grade = req.user.grade;
      filter.section = req.user.section;
    }

    // Teachers see only schedules where they teach
    if (req.user.role === 'Teacher') {
      filter.teacher = req.user.id;
    }

    const schedules = await Schedule.find(filter)
      .populate('subject', 'name gradeLevel')
      .populate('teacher', 'firstName lastName')
      .populate('adviser', 'firstName lastName')
      .sort({ grade: 1, section: 1, day: 1, timeSlot: 1 });

    res.json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single schedule
// @route   GET /api/v1/schedules/:id
// @access  Private
export const getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('subject', 'name gradeLevel')
      .populate('teacher', 'firstName lastName')
      .populate('adviser', 'firstName lastName');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create schedule
// @route   POST /api/v1/schedules
// @access  Private (Admin)
export const createSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    await schedule.populate('subject', 'name gradeLevel');
    await schedule.populate('teacher', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update schedule
// @route   PATCH /api/v1/schedules/:id
// @access  Private (Admin)
export const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('subject', 'name gradeLevel')
      .populate('teacher', 'firstName lastName')
      .populate('adviser', 'firstName lastName');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete schedule
// @route   DELETE /api/v1/schedules/:id
// @access  Private (Admin)
export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    await schedule.deleteOne();

    res.json({
      success: true,
      message: 'Schedule deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

