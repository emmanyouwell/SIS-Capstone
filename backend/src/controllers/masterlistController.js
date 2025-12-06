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
    const masterlist = await Masterlist.create(req.body);
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

// @desc    Delete masterlist
// @route   DELETE /api/v1/masterlists/:id
// @access  Private (Admin)
export const deleteMasterlist = async (req, res) => {
  try {
    const masterlist = await Masterlist.findById(req.params.id);

    if (!masterlist) {
      return res.status(404).json({ message: 'Masterlist not found' });
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

