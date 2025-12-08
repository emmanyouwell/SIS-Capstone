import Masterlist from '../models/Masterlist.js';

// @desc    Get all masterlists
// @route   GET /api/v1/masterlists
// @access  Private
export const getMasterlists = async (req, res) => {
  try {
    const { grade, section, schoolYear } = req.query;
    const filter = {};

    if (grade) filter.grade = parseInt(grade);
    if (section) filter.section = section;
    if (schoolYear) filter.schoolYear = schoolYear;

    const masterlists = await Masterlist.find(filter)
      .populate('students', 'firstName lastName learnerReferenceNo grade section sex')
      .populate({
        path: 'adviser',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .populate('subjectTeachers.subject', 'subjectName gradeLevel')
      .populate({
        path: 'subjectTeachers.teacher',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .sort({ grade: 1, section: 1 });

    res.json({
      success: true,
      count: masterlists.length,
      data: masterlists,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single masterlist
// @route   GET /api/v1/masterlists/:id
// @access  Private
export const getMasterlist = async (req, res) => {
  try {
    const masterlist = await Masterlist.findById(req.params.id)
      .populate('students', 'firstName lastName learnerReferenceNo grade section')
      .populate({
        path: 'adviser',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .populate('subjectTeachers.subject', 'subjectName gradeLevel')
      .populate({
        path: 'subjectTeachers.teacher',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      });

    if (!masterlist) {
      return res.status(404).json({ message: 'Masterlist not found' });
    }

    res.json({
      success: true,
      data: masterlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create masterlist
// @route   POST /api/v1/masterlists
// @access  Private (Admin)
export const createMasterlist = async (req, res) => {
  try {
    const Student = (await import('../models/Student.js')).default;
    const Section = (await import('../models/Section.js')).default;
    
    // Check if all students are enrolled
    if (req.body.students && req.body.students.length > 0) {
      const students = await Student.find({ 
        userId: { $in: req.body.students } 
      });
      
      const notEnrolled = students.filter(s => !s.enrollmentStatus);
      if (notEnrolled.length > 0) {
        return res.status(400).json({ 
          message: `Cannot add student(s) to masterlist. ${notEnrolled.length} student(s) are not enrolled.` 
        });
      }
    }

    const masterlist = await Masterlist.create(req.body);
    
    // Update Student documents with sectionId
    if (req.body.students && req.body.students.length > 0 && req.body.section && req.body.grade) {
      // Find the Section document by sectionName and gradeLevel
      const section = await Section.findOne({
        sectionName: req.body.section,
        gradeLevel: req.body.grade,
      });
      
      if (section) {
        // Update all Student documents where userId is in the students array
        await Student.updateMany(
          { userId: { $in: req.body.students } },
          { $set: { sectionId: section._id } }
        );
      }
    }
    
    await masterlist.populate('students', 'firstName lastName learnerReferenceNo');
    await masterlist.populate({
      path: 'adviser',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    });
    await masterlist.populate('subjectTeachers.subject', 'subjectName gradeLevel');
    await masterlist.populate({
      path: 'subjectTeachers.teacher',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    });

    res.status(201).json({
      success: true,
      data: masterlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update masterlist
// @route   PATCH /api/v1/masterlists/:id
// @access  Private (Admin)
export const updateMasterlist = async (req, res) => {
  try {
    const Student = (await import('../models/Student.js')).default;
    const Section = (await import('../models/Section.js')).default;
    
    // Get the existing masterlist to compare students
    const existingMasterlist = await Masterlist.findById(req.params.id);
    if (!existingMasterlist) {
      return res.status(404).json({ message: 'Masterlist not found' });
    }
    
    // Check if students being added are enrolled
    if (req.body.students && req.body.students.length > 0) {
      const students = await Student.find({ 
        userId: { $in: req.body.students } 
      });
      
      const notEnrolled = students.filter(s => !s.enrollmentStatus);
      if (notEnrolled.length > 0) {
        return res.status(400).json({ 
          message: `Cannot add student(s) to masterlist. ${notEnrolled.length} student(s) are not enrolled.` 
        });
      }
    }

    // Determine which students were added and removed
    const existingStudentIds = (existingMasterlist.students || []).map(s => 
      s.toString ? s.toString() : s
    );
    const newStudentIds = (req.body.students || []).map(s => 
      s.toString ? s.toString() : s
    );
    
    const addedStudentIds = newStudentIds.filter(id => !existingStudentIds.includes(id));
    const removedStudentIds = existingStudentIds.filter(id => !newStudentIds.includes(id));

    const masterlist = await Masterlist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('students', 'firstName lastName learnerReferenceNo grade section')
      .populate({
        path: 'adviser',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .populate('subjectTeachers.subject', 'subjectName gradeLevel')
      .populate({
        path: 'subjectTeachers.teacher',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      });

    // Update Student documents: set sectionId for added students, clear for removed
    if (addedStudentIds.length > 0 || removedStudentIds.length > 0) {
      // Find the Section document by sectionName and gradeLevel
      const section = await Section.findOne({
        sectionName: existingMasterlist.section,
        gradeLevel: existingMasterlist.grade,
      });
      
      if (section) {
        // Update added students with sectionId
        if (addedStudentIds.length > 0) {
          await Student.updateMany(
            { userId: { $in: addedStudentIds } },
            { $set: { sectionId: section._id } }
          );
        }
        
        // Clear sectionId for removed students
        if (removedStudentIds.length > 0) {
          await Student.updateMany(
            { userId: { $in: removedStudentIds } },
            { $set: { sectionId: null } }
          );
        }
      }
    }

    res.json({
      success: true,
      data: masterlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete masterlist
// @route   DELETE /api/v1/masterlists/:id
// @access  Private (Admin)
export const deleteMasterlist = async (req, res) => {
  try {
    const Student = (await import('../models/Student.js')).default;
    const masterlist = await Masterlist.findById(req.params.id);

    if (!masterlist) {
      return res.status(404).json({ message: 'Masterlist not found' });
    }

    // Clear sectionId for all students in this masterlist before deleting
    if (masterlist.students && masterlist.students.length > 0) {
      const studentIds = masterlist.students.map(s => 
        s.toString ? s.toString() : s
      );
      await Student.updateMany(
        { userId: { $in: studentIds } },
        { $set: { sectionId: null } }
      );
    }

    await masterlist.deleteOne();

    res.json({
      success: true,
      message: 'Masterlist deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

