import Section from '../models/Section.js';

// @desc    Get all sections
// @route   GET /api/v1/sections
// @access  Private
export const getSections = async (req, res) => {
  try {
    const { gradeLevel, status } = req.query;
    const filter = {};

    if (gradeLevel) filter.gradeLevel = parseInt(gradeLevel);
    if (status) filter.status = status;

    const sections = await Section.find(filter)
      .populate({
        path: 'adviserId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      })
      .sort({ gradeLevel: 1, sectionName: 1 });

    res.json({
      success: true,
      count: sections.length,
      data: sections,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single section
// @route   GET /api/v1/sections/:id
// @access  Private
export const getSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate({
        path: 'adviserId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      });

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.json({
      success: true,
      data: section,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create section
// @route   POST /api/v1/sections
// @access  Private (Admin)
export const createSection = async (req, res) => {
  try {
    const section = await Section.create(req.body);
    await section.populate({
      path: 'adviserId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email',
      },
    });

    res.status(201).json({
      success: true,
      data: section,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Section with this name already exists for this grade level',
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update section
// @route   PATCH /api/v1/sections/:id
// @access  Private (Admin)
export const updateSection = async (req, res) => {
  try {
    let section = await Section.findById(req.params.id);

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    section = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: 'adviserId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      });

    res.json({
      success: true,
      data: section,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Section with this name already exists for this grade level',
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete section
// @route   DELETE /api/v1/sections/:id
// @access  Private (Admin)
export const deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    await section.deleteOne();

    res.json({
      success: true,
      message: 'Section deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

