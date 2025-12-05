import Materials from '../models/Materials.js';
import Subject from '../models/Subject.js';
import Teacher from '../models/Teacher.js';

// @desc    Get all materials
// @route   GET /api/v1/materials
// @access  Private
export const getMaterials = async (req, res) => {
  try {
    const { subjectId } = req.query;
    const filter = {};

    if (subjectId) filter.subjectId = subjectId;

    // Teachers can only see materials for their subjects
    if (req.user.role === 'Teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (teacher) {
        // teacherId is now an array, use $in operator
        const teacherSubjects = await Subject.find({ teacherId: { $in: [teacher._id] } });
        const subjectIds = teacherSubjects.map((s) => s._id);
        filter.subjectId = { $in: subjectIds };
      } else {
        return res.json({
          success: true,
          count: 0,
          data: [],
        });
      }
    }

    const materials = await Materials.find(filter)
      .populate('subjectId', 'subjectName gradeLevel')
      .populate('uploadedById', 'firstName lastName email')
      .sort({ dateUploaded: -1 });

    res.json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single material
// @route   GET /api/v1/materials/:id
// @access  Private
export const getMaterial = async (req, res) => {
  try {
    const material = await Materials.findById(req.params.id)
      .populate('subjectId', 'subjectName gradeLevel')
      .populate('uploadedById', 'firstName lastName email');

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Teachers can only view materials for their subjects
    if (req.user.role === 'Teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (teacher) {
        const subject = await Subject.findById(material.subjectId);
        if (!subject) {
          return res.status(403).json({ message: 'Not authorized' });
        }
        // teacherId is now an array, check if teacher._id is in the array
        const teacherIds = Array.isArray(subject.teacherId) 
          ? subject.teacherId.map(id => id.toString())
          : [subject.teacherId?.toString()].filter(Boolean);
        if (!teacherIds.includes(teacher._id.toString())) {
          return res.status(403).json({ message: 'Not authorized' });
        }
      }
    }

    res.json({
      success: true,
      data: material,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create material
// @route   POST /api/v1/materials
// @access  Private (Admin, Teacher)
export const createMaterial = async (req, res) => {
  try {
    req.body.uploadedByRole = req.user.role;
    req.body.uploadedById = req.user.id;
    req.body.dateUploaded = new Date();

    // Teachers can only upload materials for their subjects
    if (req.user.role === 'Teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (teacher) {
        const subject = await Subject.findById(req.body.subjectId);
        if (!subject) {
          return res.status(403).json({ message: 'Not authorized to upload material for this subject' });
        }
        // teacherId is now an array, check if teacher._id is in the array
        const teacherIds = Array.isArray(subject.teacherId) 
          ? subject.teacherId.map(id => id.toString())
          : [subject.teacherId?.toString()].filter(Boolean);
        if (!teacherIds.includes(teacher._id.toString())) {
          return res.status(403).json({ message: 'Not authorized to upload material for this subject' });
        }
      } else {
        return res.status(403).json({ message: 'Teacher record not found' });
      }
    }

    const material = await Materials.create(req.body);
    await material.populate('subjectId', 'subjectName gradeLevel');
    await material.populate('uploadedById', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: material,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update material
// @route   PATCH /api/v1/materials/:id
// @access  Private (Admin, Teacher - own materials)
export const updateMaterial = async (req, res) => {
  try {
    const material = await Materials.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Teachers can only update their own materials or materials for their subjects
    if (req.user.role === 'Teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (teacher) {
        const subject = await Subject.findById(material.subjectId);
        const isOwnMaterial = material.uploadedById.toString() === req.user.id;
        // teacherId is now an array, check if teacher._id is in the array
        let isOwnSubject = false;
        if (subject) {
          const teacherIds = Array.isArray(subject.teacherId) 
            ? subject.teacherId.map(id => id.toString())
            : [subject.teacherId?.toString()].filter(Boolean);
          isOwnSubject = teacherIds.includes(teacher._id.toString());
        }

        if (!isOwnMaterial && !isOwnSubject) {
          return res.status(403).json({ message: 'Not authorized to update this material' });
        }
      } else {
        return res.status(403).json({ message: 'Teacher record not found' });
      }
    }

    const updatedMaterial = await Materials.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('subjectId', 'subjectName gradeLevel')
      .populate('uploadedById', 'firstName lastName email');

    res.json({
      success: true,
      data: updatedMaterial,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete material
// @route   DELETE /api/v1/materials/:id
// @access  Private (Admin, Teacher - own materials)
export const deleteMaterial = async (req, res) => {
  try {
    const material = await Materials.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Teachers can only delete their own materials or materials for their subjects
    if (req.user.role === 'Teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (teacher) {
        const subject = await Subject.findById(material.subjectId);
        const isOwnMaterial = material.uploadedById.toString() === req.user.id;
        // teacherId is now an array, check if teacher._id is in the array
        let isOwnSubject = false;
        if (subject) {
          const teacherIds = Array.isArray(subject.teacherId) 
            ? subject.teacherId.map(id => id.toString())
            : [subject.teacherId?.toString()].filter(Boolean);
          isOwnSubject = teacherIds.includes(teacher._id.toString());
        }

        if (!isOwnMaterial && !isOwnSubject) {
          return res.status(403).json({ message: 'Not authorized to delete this material' });
        }
      } else {
        return res.status(403).json({ message: 'Teacher record not found' });
      }
    }

    await material.deleteOne();

    res.json({
      success: true,
      message: 'Material deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

