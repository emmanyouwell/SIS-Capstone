import Schedule from '../models/Schedule.js';
import Subject from '../models/Subject.js';

/**
 * Calculate teaching load for a teacher
 * @param {String} teacherId - The teacher's MongoDB ObjectId
 * @returns {Object} - Object with dailyHours (max hours in a single day), weeklyHours (total hours per week), and dailyBreakdown
 */
export const calculateTeachingLoad = async (teacherId) => {
  try {
    // Find all subjects taught by this teacher
    const subjects = await Subject.find({ teacherId: { $in: [teacherId] } }).select('_id');
    const subjectIds = subjects.map((s) => s._id);

    if (subjectIds.length === 0) {
      return { dailyHours: 0, weeklyHours: 0, dailyBreakdown: {} };
    }

    // Find all schedules that include these subjects
    const schedules = await Schedule.find({
      'schedule.subjectId': { $in: subjectIds },
    }).populate('schedule.subjectId');

    // Calculate hours per day
    const dailyBreakdown = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    let totalWeeklyHours = 0;

    schedules.forEach((scheduleDoc) => {
      if (scheduleDoc.schedule && Array.isArray(scheduleDoc.schedule)) {
        scheduleDoc.schedule.forEach((entry) => {
          // Check if this entry's subject is taught by the teacher
          const entrySubjectId = entry.subjectId?._id?.toString() || entry.subjectId?.toString();
          if (subjectIds.some((id) => id.toString() === entrySubjectId)) {
            // Calculate hours from startTime and endTime
            const hours = calculateHoursBetween(entry.startTime, entry.endTime);
            const day = entry.day;

            if (dailyBreakdown.hasOwnProperty(day)) {
              dailyBreakdown[day] += hours;
              totalWeeklyHours += hours;
            }
          }
        });
      }
    });

    // Find the maximum hours in a single day (handle edge case where all days are 0)
    const dailyValues = Object.values(dailyBreakdown);
    const dailyHours = dailyValues.length > 0 ? Math.max(...dailyValues) : 0;

    return {
      dailyHours: Math.round(dailyHours * 100) / 100, // Round to 2 decimal places
      weeklyHours: Math.round(totalWeeklyHours * 100) / 100,
      dailyBreakdown,
    };
  } catch (error) {
    console.error('Error calculating teaching load:', error);
    return { dailyHours: 0, weeklyHours: 0, dailyBreakdown: {} };
  }
};

/**
 * Calculate hours between two time strings
 * @param {String} startTime - Start time (e.g., "7:00 AM" or "7:00")
 * @param {String} endTime - End time (e.g., "8:00 AM" or "8:00")
 * @returns {Number} - Hours as a decimal number
 */
export const calculateHoursBetween = (startTime, endTime) => {
  try {
    const parseTime = (timeStr) => {
      if (!timeStr || typeof timeStr !== 'string') {
        throw new Error('Invalid time string');
      }

      // Normalize the time string
      let time = timeStr.trim();
      
      // Handle formats like "7:00-8:00" - take the first part
      if (time.includes('-')) {
        time = time.split('-')[0].trim();
      }

      // Extract AM/PM indicator (case insensitive)
      const hasAM = /am/gi.test(time);
      const hasPM = /pm/gi.test(time);
      
      // Remove AM/PM and trim
      time = time.replace(/AM|PM|am|pm/gi, '').trim();

      // Parse hours and minutes
      const [hoursStr, minutesStr = '0'] = time.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 12 || minutes < 0 || minutes >= 60) {
        throw new Error(`Invalid time format: ${timeStr}`);
      }

      // Convert to 24-hour format
      let adjustedHours = hours;
      
      if (hasPM) {
        // PM: add 12 hours except for 12 PM (noon)
        if (hours !== 12) {
          adjustedHours = hours + 12;
        }
        // 12 PM stays as 12
      } else if (hasAM) {
        // AM: 12 AM (midnight) becomes 0, others stay the same
        if (hours === 12) {
          adjustedHours = 0;
        }
        // Other AM times stay as-is
      }
      // If neither AM nor PM is specified, assume 24-hour format

      return adjustedHours + minutes / 60;
    };

    const start = parseTime(startTime);
    const end = parseTime(endTime);
    
    // Handle case where end time is next day (e.g., 11 PM to 1 AM)
    let diff = end - start;
    if (diff < 0) {
      diff += 24; // Next day
    }

    return diff;
  } catch (error) {
    console.error('Error parsing time:', error, { startTime, endTime });
    return 1; // Default to 1 hour if parsing fails
  }
};

/**
 * Update teaching load for a teacher in the database
 * @param {String} teacherId - The teacher's MongoDB ObjectId
 */
export const updateTeacherLoad = async (teacherId) => {
  try {
    const Teacher = (await import('../models/Teacher.js')).default;
    const loadData = await calculateTeachingLoad(teacherId);
    
    // Store weekly hours as the primary teaching load metric
    await Teacher.findByIdAndUpdate(teacherId, {
      teachingLoad: loadData.weeklyHours,
    });

    return loadData;
  } catch (error) {
    console.error('Error updating teacher load:', error);
    throw error;
  }
};

/**
 * Check if a teacher can be assigned more load (max 30 hours per week)
 * @param {String} teacherId - The teacher's MongoDB ObjectId
 * @param {Number} additionalHours - Additional hours to be assigned (per week)
 * @returns {Object} - { canAssign: boolean, currentLoad: number, message: string }
 */
export const canAssignLoad = async (teacherId, additionalHours = 0) => {
  try {
    const loadData = await calculateTeachingLoad(teacherId);
    const newLoad = loadData.weeklyHours + additionalHours;
    const maxLoad = 30; // Maximum 30 hours per week

    return {
      canAssign: newLoad <= maxLoad,
      currentLoad: loadData.weeklyHours,
      newLoad,
      maxLoad,
      message:
        newLoad > maxLoad
          ? `Cannot assign load. Teacher already has ${loadData.weeklyHours.toFixed(2)} hours/week. Adding ${additionalHours.toFixed(2)} hours would exceed the maximum of ${maxLoad} hours/week.`
          : `Current load: ${loadData.weeklyHours.toFixed(2)} hours/week. New load: ${newLoad.toFixed(2)} hours/week.`,
    };
  } catch (error) {
    console.error('Error checking load assignment:', error);
    return {
      canAssign: false,
      currentLoad: 0,
      newLoad: 0,
      maxLoad: 30,
      message: 'Error checking teaching load',
    };
  }
};

