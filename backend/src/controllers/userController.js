import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Grade from '../models/Grade.js';
import Student from '../models/Student.js';

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter).select('-password').sort({ lastName: 1, firstName: 1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private
export const getUser = async (req, res) => {
  try {
    // Students can only view their own profile
    if (req.user.role === 'Student' && req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private (Admin)
export const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = user.generateJWT();

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PATCH /api/v1/users/:id
// @access  Private
export const updateUser = async (req, res) => {
  try {
    // Students can only update their own profile (limited fields)
    if (req.user.role === 'Student' && req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Don't allow password update through this endpoint
    delete req.body.password;

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Deactivate user (set status to Inactive and cascade to related records)
// @route   PATCH /api/v1/users/:id/deactivate
// @access  Private (Admin)
export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set user status to Inactive
    user.status = 'Inactive';
    await user.save();

    // Cascade deactivation to related records
    // For students: deactivate enrollment forms
    if (user.role === 'Student') {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        // Update enrollment statuses to 'not enrolled' for pending/enrolled enrollments
        await Enrollment.updateMany(
          { 
            studentId: student._id,
            status: { $in: ['pending', 'enrolled'] }
          },
          { $set: { status: 'not enrolled' } }
        );
      }
    }

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

