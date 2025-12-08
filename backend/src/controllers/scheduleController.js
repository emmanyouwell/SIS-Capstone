import Schedule from '../models/Schedule.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Subject from '../models/Subject.js';

// @desc    Get schedule by section ID (helper function)
// @access  Private
const getScheduleBySectionId = async (sectionId) => {
  let schedule = await Schedule.findOne({ sectionId })
    .populate('sectionId', 'sectionName gradeLevel')
    .populate({
      path: 'schedule.subjectId',
      populate: {
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      },
    });

  // If no schedule exists, return empty structure
  if (!schedule) {
    return {
      sectionId,
      schedule: [],
    };
  }

  return schedule;
};

// @desc    Get all schedules (for backward compatibility with students/teachers)
// @route   GET /api/v1/schedules
// @access  Private
export const getSchedules = async (req, res) => {
  try {
    const { sectionId, subjectId, day } = req.query;
    let filter = {};

    if (sectionId) filter.sectionId = sectionId;

    // Students see schedules for their section and enrolled subjects
    if (req.user.role === 'Student') {
      const student = await Student.findOne({ userId: req.user.id }).populate('subjects.subjectId');
      if (!student) {
        return res.json({
          success: true,
          count: 0,
          data: [],
        });
      }
      
      // Check if student is enrolled
      if (!student.enrollmentStatus) {
        return res.status(400).json({ 
          message: 'Student must complete enrollment before proceeding. Cannot view schedule.' 
        });
      }
      
      if (student && student.sectionId) {
        filter.sectionId = student.sectionId;
      } else {
        return res.json({
          success: true,
          count: 0,
          data: [],
        });
      }
    }

    // Teachers see schedules for subjects they teach
    let teacherSubjectIds = [];
    if (req.user.role === 'Teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (teacher) {
        // Get all subjects taught by this teacher
        const teacherSubjects = await Subject.find({ teacherId: { $in: [teacher._id] } }).select('_id');
        teacherSubjectIds = teacherSubjects.map((s) => s._id.toString());
        
        if (teacherSubjectIds.length === 0) {
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

    // Fetch schedule documents
    const scheduleDocs = await Schedule.find(filter)
      .populate('sectionId', 'sectionName gradeLevel')
      .populate({
        path: 'schedule.subjectId',
        populate: {
          path: 'teacherId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email',
          },
        },
      });

    // Transform to old format for backward compatibility
    let flattenedSchedules = [];
    
    scheduleDocs.forEach((scheduleDoc) => {
      if (scheduleDoc.schedule && scheduleDoc.schedule.length > 0) {
        scheduleDoc.schedule.forEach((entry) => {
          // Apply filters
          if (subjectId && entry.subjectId?._id?.toString() !== subjectId.toString()) {
            return;
          }
          if (day && entry.day !== day) {
            return;
          }

          // For teachers, filter by their subjects
          if (req.user.role === 'Teacher' && teacherSubjectIds.length > 0) {
            const entrySubjectId = entry.subjectId?._id?.toString();
            if (!teacherSubjectIds.includes(entrySubjectId)) {
              return;
            }
          }

          // For students, filter by enrolled subjects
          if (req.user.role === 'Student') {
            // This is already handled by sectionId filter, but we can add subject filtering here if needed
          }

          // Transform to old format
          flattenedSchedules.push({
            _id: `${scheduleDoc._id}_${entry._id || Math.random()}`,
            sectionId: scheduleDoc.sectionId,
            subjectId: entry.subjectId,
            day: entry.day,
            startTime: entry.startTime,
            endTime: entry.endTime,
            createdAt: scheduleDoc.createdAt,
            updatedAt: scheduleDoc.updatedAt,
          });
        });
      }
    });

    // Sort by day and startTime
    flattenedSchedules.sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.startTime.localeCompare(b.startTime);
    });

    res.json({
      success: true,
      count: flattenedSchedules.length,
      data: flattenedSchedules,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create schedule for a section
// @route   POST /api/v1/schedules
// @access  Private (Admin)
export const createSchedule = async (req, res) => {
  try {
    const { sectionId, schedule = [] } = req.body;

    if (!sectionId) {
      return res.status(400).json({ message: 'sectionId is required' });
    }

    // Check if schedule already exists for this section
    const existingSchedule = await Schedule.findOne({ sectionId });
    if (existingSchedule) {
      return res.status(400).json({ message: 'Schedule already exists for this section' });
    }

    const scheduleDoc = await Schedule.create({
      sectionId,
      schedule,
    });

    await scheduleDoc.populate('sectionId', 'sectionName gradeLevel');
    await scheduleDoc.populate({
      path: 'schedule.subjectId',
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
      data: scheduleDoc,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add schedule entry
// @route   PATCH /api/v1/schedules/:sectionId/add
// @access  Private (Admin)
export const addScheduleEntry = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const entry = req.body;

    if (!entry.subjectId || !entry.day || !entry.startTime || !entry.endTime) {
      return res.status(400).json({ 
        message: 'subjectId, day, startTime, and endTime are required' 
      });
    }

    let scheduleDoc = await Schedule.findOne({ sectionId });

    if (!scheduleDoc) {
      // Create new schedule document if it doesn't exist
      scheduleDoc = await Schedule.create({
        sectionId,
        schedule: [entry],
      });
    } else {
      // Add entry to existing schedule
      scheduleDoc.schedule.push(entry);
      await scheduleDoc.save();
    }

    await scheduleDoc.populate('sectionId', 'sectionName gradeLevel');
    await scheduleDoc.populate({
      path: 'schedule.subjectId',
      populate: {
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      },
    });

    res.json({
      success: true,
      data: scheduleDoc,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update schedule entry
// @route   PATCH /api/v1/schedules/:sectionId/update/:entryIndex
// @access  Private (Admin)
export const updateScheduleEntry = async (req, res) => {
  try {
    const { sectionId, entryIndex } = req.params;
    const entry = req.body;

    const scheduleDoc = await Schedule.findOne({ sectionId });

    if (!scheduleDoc) {
      return res.status(404).json({ message: 'Schedule not found for this section' });
    }

    const index = parseInt(entryIndex, 10);
    if (isNaN(index) || index < 0 || index >= scheduleDoc.schedule.length) {
      return res.status(400).json({ message: 'Invalid entry index' });
    }

    // Update the entry
    if (entry.subjectId) scheduleDoc.schedule[index].subjectId = entry.subjectId;
    if (entry.day) scheduleDoc.schedule[index].day = entry.day;
    if (entry.startTime) scheduleDoc.schedule[index].startTime = entry.startTime;
    if (entry.endTime) scheduleDoc.schedule[index].endTime = entry.endTime;

    await scheduleDoc.save();

    await scheduleDoc.populate('sectionId', 'sectionName gradeLevel');
    await scheduleDoc.populate({
      path: 'schedule.subjectId',
      populate: {
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      },
    });

    res.json({
      success: true,
      data: scheduleDoc,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove schedule entry
// @route   PATCH /api/v1/schedules/:sectionId/remove/:entryIndex
// @access  Private (Admin)
export const removeScheduleEntry = async (req, res) => {
  try {
    const { sectionId, entryIndex } = req.params;

    const scheduleDoc = await Schedule.findOne({ sectionId });

    if (!scheduleDoc) {
      return res.status(404).json({ message: 'Schedule not found for this section' });
    }

    const index = parseInt(entryIndex, 10);
    if (isNaN(index) || index < 0 || index >= scheduleDoc.schedule.length) {
      return res.status(400).json({ message: 'Invalid entry index' });
    }

    // Remove the entry
    scheduleDoc.schedule.splice(index, 1);
    await scheduleDoc.save();

    await scheduleDoc.populate('sectionId', 'sectionName gradeLevel');
    await scheduleDoc.populate({
      path: 'schedule.subjectId',
      populate: {
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      },
    });

    res.json({
      success: true,
      data: scheduleDoc,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set full schedule (replace entire schedule array)
// @route   PATCH /api/v1/schedules/:sectionId/set
// @access  Private (Admin)
export const setFullSchedule = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { schedule } = req.body;

    if (!Array.isArray(schedule)) {
      return res.status(400).json({ message: 'schedule must be an array' });
    }

    let scheduleDoc = await Schedule.findOne({ sectionId });

    if (!scheduleDoc) {
      // Create new schedule document if it doesn't exist
      scheduleDoc = await Schedule.create({
        sectionId,
        schedule,
      });
    } else {
      // Replace entire schedule array
      scheduleDoc.schedule = schedule;
      await scheduleDoc.save();
    }

    await scheduleDoc.populate('sectionId', 'sectionName gradeLevel');
    await scheduleDoc.populate({
      path: 'schedule.subjectId',
      populate: {
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      },
    });

    res.json({
      success: true,
      data: scheduleDoc,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get schedule by ID or sectionId
// @route   GET /api/v1/schedules/:id
// @access  Private
// Tries to find by document ID first, then by sectionId
export const getSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // First, try to find by document ID
    let schedule = await Schedule.findById(id)
      .populate('sectionId', 'sectionName gradeLevel')
      .populate({
        path: 'schedule.subjectId',
        populate: {
          path: 'teacherId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email',
          },
        },
      });

    // If not found by document ID, try by sectionId
    if (!schedule) {
      schedule = await getScheduleBySectionId(id);
    }

    // getScheduleBySectionId always returns an object (even if empty), so we always have a result
    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete schedule document
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
