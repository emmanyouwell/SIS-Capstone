import Admin from '../models/Admin.js';
import User from '../models/User.js';

// @desc    Get all admins
// @route   GET /api/v1/admins
// @access  Private (Admin)
export const getAdmins = async (req, res) => {
  try {
    const { department } = req.query;
    const filter = {};

    if (department) filter.department = department;

    const admins = await Admin.find(filter)
      .populate('userId', 'firstName lastName middleName email contactNumber address dateOfBirth status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single admin
// @route   GET /api/v1/admins/:id
// @access  Private (Admin)
export const getAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .populate('userId', 'firstName lastName middleName email contactNumber address dateOfBirth status');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create admin
// @route   POST /api/v1/admins
// @access  Private (Admin)
export const createAdmin = async (req, res) => {
  try {
    const admin = await Admin.create(req.body);
    await admin.populate('userId', 'firstName lastName middleName email contactNumber address dateOfBirth status');

    res.status(201).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update admin
// @route   PATCH /api/v1/admins/:id
// @access  Private (Admin)
export const updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('userId', 'firstName lastName middleName email contactNumber address dateOfBirth status');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete admin
// @route   DELETE /api/v1/admins/:id
// @access  Private (Admin)
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    await admin.deleteOne();

    res.json({
      success: true,
      message: 'Admin deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Deactivate admin (set user status to Inactive)
// @route   PATCH /api/v1/admins/:id/deactivate
// @access  Private (Admin)
export const deactivateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).populate('userId');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (!admin.userId) {
      return res.status(404).json({ message: 'Associated user not found' });
    }

    // Set user status to Inactive
    admin.userId.status = 'Inactive';
    await admin.userId.save();

    res.json({
      success: true,
      message: 'Admin deactivated successfully',
      data: admin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

