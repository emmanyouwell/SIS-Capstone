import Grade from '../models/Grade.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import Teacher from '../models/Teacher.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import { getGradeDescriptor, isGradeComplete, shouldPromoteStudent } from '../utils/gradeUtils.js';

// @desc    Get all grades
// @route   GET /api/v1/grades
// @access  Private
export const getGrades = async (req, res) => {
  try {
    const { studentId, subjectId, gradeLevel } = req.query;
    const filter = {};

    if (studentId) filter.studentId = studentId;
    if (subjectId) filter['grades.subjectId'] = subjectId;

    // Filter by gradeLevel through student relationship - only enrolled students
    if (gradeLevel) {
      const studentsInGrade = await Student.find({ 
        gradeLevel: parseInt(gradeLevel),
        enrollmentStatus: true 
      }).select('_id');
      const studentIds = studentsInGrade.map((s) => s._id);
      filter.studentId = { $in: studentIds };
    }

    // Students can only see their own grades (and must be enrolled)
    if (req.user.role === 'Student') {
      const student = await Student.findOne({ userId: req.user.id });
      if (student) {
        if (!student.enrollmentStatus) {
          return res.json({
            success: true,
            count: 0,
            data: [],
          });
        }
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

    // Fetch all matching grades first
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

    // Filter by current school year: get school year from each student's enrollment record
    // Get unique student IDs from the grades
    const gradeStudentIds = [...new Set(
      grades.map(g => {
        const studentId = g.studentId._id?.toString() || g.studentId.toString();
        return studentId;
      })
    )];

    // Get current school year for each student from their most recent enrollment
    const enrollments = await Enrollment.find({
      studentId: { $in: gradeStudentIds },
      status: 'enrolled',
    })
      .select('studentId schoolYear')
      .sort({ dateSubmitted: -1 });

    // Create a map of studentId -> current school year (most recent enrollment)
    const studentSchoolYearMap = new Map();
    enrollments.forEach((enrollment) => {
      const sid = enrollment.studentId.toString();
      // Only keep the most recent enrollment for each student
      if (!studentSchoolYearMap.has(sid)) {
        studentSchoolYearMap.set(sid, enrollment.schoolYear);
      }
    });

    // Filter grades to only include those matching the student's current school year
    const filteredGrades = grades.filter((grade) => {
      const studentId = grade.studentId._id?.toString() || grade.studentId.toString();
      const currentSchoolYear = studentSchoolYearMap.get(studentId);
      // Only include grades that match the student's current school year
      return currentSchoolYear && grade.schoolYear === currentSchoolYear;
    });

    res.json({
      success: true,
      count: filteredGrades.length,
      data: filteredGrades,
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
    // Check if student is enrolled
    const student = await Student.findById(req.body.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    if (!student.enrollmentStatus) {
      return res.status(400).json({ 
        message: 'Student is not enrolled. Cannot create grade record.' 
      });
    }

    // Get schoolYear from student's enrollment record (not from active enrollment period)
    // Enrollment periods are temporary, but enrollment records persist throughout the school year
    const Enrollment = (await import('../models/Enrollment.js')).default;
    const studentEnrollment = await Enrollment.findOne({
      studentId: req.body.studentId,
      status: 'enrolled', // Get the accepted enrollment
    }).sort({ dateSubmitted: -1 }); // Get most recent enrollment

    if (!studentEnrollment || !studentEnrollment.schoolYear) {
      return res.status(400).json({ 
        message: 'Student enrollment record not found or missing school year. Cannot create grade record.' 
      });
    }

    const schoolYear = studentEnrollment.schoolYear;

    // Check for existing grade for this student and school year
    const existingGrade = await Grade.findOne({
      studentId: req.body.studentId,
      schoolYear: schoolYear,
    });

    if (existingGrade) {
      return res.status(400).json({
        message: `Grade record already exists for this student for school year ${schoolYear}. Please update the existing record instead.`,
      });
    }

    req.body.schoolYear = schoolYear;
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

    // Check if grade is complete and update status
    const isComplete = isGradeComplete(grade.grades);
    if (isComplete) {
      grade.status = 'complete';
      await grade.save();
    }

    // Check if grade is complete and send message if needed
    if (isComplete && !grade.gradeCompleteMessageSent) {
      await sendGradeCompleteMessage(grade);
      grade.gradeCompleteMessageSent = true;
      await grade.save();
    }

    // Update student promotion status based on grades
    if (isComplete && grade.finalGrade !== null && grade.finalGrade !== undefined) {
      const shouldPromote = shouldPromoteStudent(grade);
      await Student.findByIdAndUpdate(grade.studentId, { isPromoted: shouldPromote });
    }

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

    // Store previous state to check if grade was complete before
    const wasComplete = isGradeComplete(grade.grades);

    // Update the grade document fields
    if (req.body.grades !== undefined) {
      grade.grades = req.body.grades;
    }
    if (req.body.remarks !== undefined) {
      grade.remarks = req.body.remarks;
    }
    if (req.body.comment !== undefined) {
      grade.comment = req.body.comment;
    }

    // Save the document to trigger pre('save') hook which recalculates finalGrade
    await grade.save();

    // Populate and return the updated grade
    await grade.populate({
      path: 'studentId',
      populate: {
        path: 'userId',
        select: 'firstName lastName middleName email',
      },
    });
    await grade.populate('grades.subjectId', 'subjectName gradeLevel');

    // Check if grade is now complete and update status
    const isNowComplete = isGradeComplete(grade.grades);
    if (isNowComplete) {
      grade.status = 'complete';
      await grade.save();
    } else {
      // If grades are no longer complete, set status back to incomplete
      grade.status = 'incomplete';
      await grade.save();
    }

    // Check if grade is now complete and send message if needed
    if (isNowComplete && !wasComplete && !grade.gradeCompleteMessageSent) {
      await sendGradeCompleteMessage(grade);
      grade.gradeCompleteMessageSent = true;
      await grade.save();
    }

    // Update student promotion status based on grades
    if (isNowComplete && grade.finalGrade !== null && grade.finalGrade !== undefined) {
      const shouldPromote = shouldPromoteStudent(grade);
      await Student.findByIdAndUpdate(grade.studentId, { isPromoted: shouldPromote });
    }

    res.json({
      success: true,
      data: grade,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Helper function to send grade complete message to student
 * @param {Object} grade - The grade document with populated studentId
 */
const sendGradeCompleteMessage = async (grade) => {
  try {
    let student;
    
    // Check if studentId is already populated
    if (grade.studentId && grade.studentId.userId) {
      // Student is already populated, use it directly
      student = grade.studentId;
      // Ensure userId is populated
      if (typeof student.userId === 'object' && student.userId._id) {
        // Already populated
      } else {
        // Need to populate userId
        await student.populate('userId', 'firstName lastName');
      }
    } else {
      // StudentId is just an ID, need to fetch and populate
      const studentId = grade.studentId._id || grade.studentId;
      student = await Student.findById(studentId).populate('userId', 'firstName lastName');
    }

    if (!student || !student.userId) {
      console.error('Student or userId not found for grade:', grade._id);
      return;
    }

    // Get grade descriptor and remarks
    const { descriptor, remarks } = getGradeDescriptor(grade.finalGrade);
    const finalGradeRounded = grade.finalGrade ? Math.round(grade.finalGrade) : 'N/A';

    // Get student name
    const studentName = student.userId.firstName + (student.userId.lastName ? ` ${student.userId.lastName}` : '');
    const userId = student.userId._id || student.userId;

    // Create message subject and content
    const subject = 'Grade Report Available';
    const messageText = `Dear ${studentName},

Your complete grade report is now available.

Final Grade: ${finalGradeRounded}
Descriptor: ${descriptor}
Remarks: ${remarks}

You can view your detailed grades in your student portal.

Thank you.`;

    // Find an admin user to send as sender (or use system)
    // For now, we'll use the first admin user or create a system message
    const adminUser = await User.findOne({ role: 'Admin' }).select('_id');
    
    // Create the message
    await Message.create({
      senderRole: 'Admin',
      senderId: adminUser?._id || userId, // Fallback to student's userId if no admin
      receiverRole: 'Student',
      receiverId: userId,
      subject,
      messageText,
      dateSent: new Date(),
      status: 'sent',
    });

    console.log(`Grade complete message sent to student: ${userId}`);
  } catch (error) {
    console.error('Error sending grade complete message:', error);
    // Don't throw error - we don't want to fail the grade update if message fails
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
