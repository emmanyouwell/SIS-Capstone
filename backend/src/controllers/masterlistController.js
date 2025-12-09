import Masterlist from '../models/Masterlist.js';

// Helper function to enrich students with LRN from Student model
const enrichStudentsWithLRN = async (students) => {
  if (!students || students.length === 0) return students;

  const Student = (await import('../models/Student.js')).default;
  const studentUserIds = students.map(s => s._id || s);
  
  // Fetch Student documents for these users
  const studentDocs = await Student.find({ userId: { $in: studentUserIds } })
    .select('userId lrn');
  
  // Create a map of userId -> lrn
  const lrnMap = new Map();
  studentDocs.forEach(student => {
    lrnMap.set(student.userId.toString(), student.lrn);
  });
  
  // Add LRN to each student object
  return students.map(student => {
    const studentObj = student.toObject ? student.toObject() : student;
    const userId = studentObj._id ? studentObj._id.toString() : studentObj.toString();
    return {
      ...studentObj,
      learnerReferenceNo: lrnMap.get(userId) || null,
    };
  });
};

// @desc    Get all masterlists
// @route   GET /api/v1/masterlists
// @access  Private
export const getMasterlists = async (req, res) => {
  try {
    const { grade, section, sectionId, schoolYear } = req.query;
    const filter = {};
    const Section = (await import('../models/Section.js')).default;

    if (grade) filter.grade = parseInt(grade);
    if (schoolYear) filter.schoolYear = schoolYear;
    
    // Handle section filtering: support both sectionId and section name (for backward compatibility)
    if (sectionId) {
      filter.section = sectionId;
    } else if (section) {
      // If section name is provided, find the section ID
      const sectionDoc = await Section.findOne({ sectionName: section });
      if (sectionDoc) {
        filter.section = sectionDoc._id;
      } else {
        // If section not found, return empty result
        return res.json({
          success: true,
          count: 0,
          data: [],
        });
      }
    }

    // Teachers can now view all masterlists for all sections
    // (Previously filtered to only show advisory or subject teacher masterlists)

    const masterlists = await Masterlist.find(filter)
      .populate('section', 'sectionName gradeLevel capacity status')
      .populate('students', 'firstName lastName middleName extensionName sex')
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

    // Enrich students with LRN for each masterlist
    const enrichedMasterlists = await Promise.all(
      masterlists.map(async (masterlist) => {
        const masterlistObj = masterlist.toObject();
        masterlistObj.students = await enrichStudentsWithLRN(masterlist.students);
        return masterlistObj;
      })
    );

    res.json({
      success: true,
      count: enrichedMasterlists.length,
      data: enrichedMasterlists,
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
      .populate('section', 'sectionName gradeLevel capacity status')
      .populate('students', 'firstName lastName middleName extensionName sex')
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

    // Enrich students with LRN
    const masterlistObj = masterlist.toObject();
    masterlistObj.students = await enrichStudentsWithLRN(masterlist.students);

    res.json({
      success: true,
      data: masterlistObj,
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

    // Handle section: accept sectionId directly, or convert section name to sectionId (for backward compatibility)
    let sectionId = req.body.sectionId || req.body.section;
    if (!sectionId) {
      return res.status(400).json({ 
        message: 'Section ID is required' 
      });
    }

    // If section is provided as a string (section name), convert it to sectionId
    if (typeof sectionId === 'string' && !sectionId.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a section name, not an ObjectId - find the section
      const section = await Section.findOne({
        sectionName: sectionId,
        gradeLevel: req.body.grade,
      });
      
      if (!section) {
        return res.status(400).json({ 
          message: `Section "${sectionId}" not found for grade ${req.body.grade}` 
        });
      }
      
      sectionId = section._id;
    }

    // Create masterlist with sectionId
    const masterlistData = {
      ...req.body,
      section: sectionId,
    };
    delete masterlistData.sectionId; // Remove sectionId from body if it was there

    const masterlist = await Masterlist.create(masterlistData);
    
    // Update Student documents with sectionId
    if (req.body.students && req.body.students.length > 0) {
      await Student.updateMany(
        { userId: { $in: req.body.students } },
        { $set: { sectionId: sectionId } }
      );
    }
    
    await masterlist.populate('section', 'sectionName gradeLevel capacity status');
    await masterlist.populate('students', 'firstName lastName middleName extensionName sex');
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

    // Enrich students with LRN
    const masterlistObj = masterlist.toObject();
    masterlistObj.students = await enrichStudentsWithLRN(masterlist.students);

    res.status(201).json({
      success: true,
      data: masterlistObj,
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

    // Handle section update: accept sectionId directly, or convert section name to sectionId
    let updateData = { ...req.body };
    if (req.body.sectionId || (req.body.section && typeof req.body.section === 'string' && !req.body.section.match(/^[0-9a-fA-F]{24}$/))) {
      let sectionId = req.body.sectionId || req.body.section;
      
      // If section is provided as a string (section name), convert it to sectionId
      if (typeof sectionId === 'string' && !sectionId.match(/^[0-9a-fA-F]{24}$/)) {
        const section = await Section.findOne({
          sectionName: sectionId,
          gradeLevel: req.body.grade || existingMasterlist.grade,
        });
        
        if (!section) {
          return res.status(400).json({ 
            message: `Section "${sectionId}" not found` 
          });
        }
        
        sectionId = section._id;
      }
      
      updateData.section = sectionId;
      delete updateData.sectionId;
    }

    const masterlist = await Masterlist.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('section', 'sectionName gradeLevel capacity status')
      .populate('students', 'firstName lastName middleName extensionName sex')
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

    // Get the section ID from the masterlist (populated or not)
    const sectionId = masterlist.section?._id || masterlist.section;

    // Update Student documents: set sectionId for added students, clear for removed
    if (addedStudentIds.length > 0 || removedStudentIds.length > 0) {
      // Update added students with sectionId
      if (addedStudentIds.length > 0 && sectionId) {
        await Student.updateMany(
          { userId: { $in: addedStudentIds } },
          { $set: { sectionId: sectionId } }
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

    // Enrich students with LRN
    const masterlistObj = masterlist.toObject();
    masterlistObj.students = await enrichStudentsWithLRN(masterlist.students);

    res.json({
      success: true,
      data: masterlistObj,
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

