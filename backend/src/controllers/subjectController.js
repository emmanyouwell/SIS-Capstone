import Subject from '../models/Subject.js';

// @desc    Get all subjects
// @route   GET /api/v1/subjects
// @access  Private
export const getSubjects = async (req, res) => {
  try {
    const { gradeLevel } = req.query;
    const filter = {};

    if (gradeLevel) filter.gradeLevel = parseInt(gradeLevel);

    // Teachers see only their subjects
    if (req.user.role === 'Teacher') {
      filter.teachers = req.user.id;
    }

    const subjects = await Subject.find(filter)
      .populate('teachers', 'firstName lastName email')
      .populate('materials.uploadedBy', 'firstName lastName')
      .sort({ gradeLevel: 1, name: 1 });

    res.json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single subject
// @route   GET /api/v1/subjects/:id
// @access  Private
export const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('teachers', 'firstName lastName email')
      .populate('materials.uploadedBy', 'firstName lastName');

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({
      success: true,
      data: subject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create subject
// @route   POST /api/v1/subjects
// @access  Private (Admin)
export const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    await subject.populate('teachers', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update subject
// @route   PATCH /api/v1/subjects/:id
// @access  Private (Admin, Teacher - own subjects)
export const updateSubject = async (req, res) => {
  try {
    let subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Teachers can only update subjects they teach
    if (req.user.role === 'Teacher' && !subject.teachers.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this subject' });
    }

    // If materials array is being updated, check if we should append or replace
    // If the request has a single new material object (no _id), append it using $push
    if (req.body.materials && Array.isArray(req.body.materials)) {
      const material = req.body.materials[0];
      // Check if this is a single new material being added (has name, url/cloudinaryId, but no _id)
      const isNewMaterial = req.body.materials.length === 1 && 
        material && 
        material.name && 
        (material.url || material.cloudinaryId) &&
        !material._id; // No _id means it's a new material, not an existing one
      
      if (isNewMaterial) {
        // Append the new material using $push (atomic operation)
        const newMaterial = {
          ...material,
          uploadedAt: new Date(),
        };
        
        subject = await Subject.findByIdAndUpdate(
          req.params.id,
          { $push: { materials: newMaterial } },
          { new: true, runValidators: true }
        )
          .populate('teachers', 'firstName lastName email')
          .populate('materials.uploadedBy', 'firstName lastName');
      } else {
        // Replace entire materials array (for bulk updates or edits)
        subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        })
          .populate('teachers', 'firstName lastName email')
          .populate('materials.uploadedBy', 'firstName lastName');
      }
    } else {
      // Update other fields normally
      subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })
        .populate('teachers', 'firstName lastName email')
        .populate('materials.uploadedBy', 'firstName lastName');
    }

    res.json({
      success: true,
      data: subject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete subject
// @route   DELETE /api/v1/subjects/:id
// @access  Private (Admin)
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await subject.deleteOne();

    res.json({
      success: true,
      message: 'Subject deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

