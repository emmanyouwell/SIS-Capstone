import Schedule from '../models/Schedule.js';
import Student from '../models/Student.js';

// @desc    Get all schedules
// @route   GET /api/v1/schedules
// @access  Private
export const getSchedules = async (req, res) => {
  try {
    const { studentId, sectionId, day } = req.query;
    const filter = {};

    if (studentId) filter.studentId = studentId;
    if (sectionId) filter.sectionId = sectionId;
    if (day) filter.day = day;

    // Students see only their own schedule
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

    const schedules = await Schedule.find(filter)
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName middleName email',
        },
      })
      .populate('sectionId', 'sectionName gradeLevel')
      .populate({
        path: 'subjectId',
        populate: {
          path: 'teacherId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email',
          },
        },
      })
      .sort({ day: 1, startTime: 1 });

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
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName middleName email',
        },
      })
      .populate('sectionId', 'sectionName gradeLevel')
      .populate({
        path: 'subjectId',
        populate: {
          path: 'teacherId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email',
          },
        },
      });

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
    await schedule.populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'firstName lastName middleName email',
      },
    });
    await schedule.populate('sectionId', 'sectionName gradeLevel');
    await schedule.populate({
      path: 'subjectId',
      populate: {
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      },
    });

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
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'firstName lastName middleName email',
        },
      })
      .populate('sectionId', 'sectionName gradeLevel')
      .populate({
        path: 'subjectId',
        populate: {
          path: 'teacherId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email',
          },
        },
      });

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
