import Schedule from '../models/Schedule.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Subject from '../models/Subject.js';

// @desc    Get all schedules
// @route   GET /api/v1/schedules
// @access  Private
export const getSchedules = async (req, res) => {
  try {
    const { sectionId, subjectId, day } = req.query;
    const filter = {};

    if (sectionId) filter.sectionId = sectionId;
    if (subjectId) filter.subjectId = subjectId;
    if (day) filter.day = day;

    // Students see schedules for their section and enrolled subjects
    if (req.user.role === 'Student') {
      const student = await Student.findOne({ userId: req.user.id }).populate('subjects.subjectId');
      if (student && student.sectionId) {
        filter.sectionId = student.sectionId;
        // Filter by subjects the student is enrolled in
        if (student.subjects && student.subjects.length > 0) {
          const enrolledSubjectIds = student.subjects.map((s) => s.subjectId._id || s.subjectId);
          filter.subjectId = { $in: enrolledSubjectIds };
        } else {
          // If student has no enrolled subjects, return empty
          return res.json({
            success: true,
            count: 0,
            data: [],
          });
        }
      } else {
        return res.json({
          success: true,
          count: 0,
          data: [],
        });
      }
    }

    // Teachers see schedules for subjects they teach
    if (req.user.role === 'Teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (teacher) {
        // Get all subjects taught by this teacher (teacherId is an array)
        const teacherSubjects = await Subject.find({ teacherId: { $in: [teacher._id] } }).select('_id');
        const subjectIds = teacherSubjects.map((s) => s._id);
        
        if (subjectIds.length > 0) {
          filter.subjectId = { $in: subjectIds };
        } else {
          // If teacher has no subjects, return empty
          return res.json({
            success: true,
            count: 0,
            data: [],
          });
        }
      } else {
        return res.json({
          success: true,
          count: 0,
          data: [],
        });
      }
    }

    const schedules = await Schedule.find(filter)
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
