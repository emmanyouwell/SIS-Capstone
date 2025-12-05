import User from '../models/User.js';

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public (or Admin only in production)
export const register = async (req, res) => {
  try {
    const { firstName, lastName, middleName, email, password, role, learnerReferenceNo, grade, section } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check LRN uniqueness for students
    if (role === 'Student' && learnerReferenceNo) {
      const existingLRN = await User.findOne({ learnerReferenceNo });
      if (existingLRN) {
        return res.status(400).json({ message: 'LRN already exists' });
      }
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      middleName: middleName || '',
      email,
      password,
      role,
      learnerReferenceNo: role === 'Student' ? learnerReferenceNo : undefined,
      grade: role === 'Student' ? grade : undefined,
      section: role === 'Student' ? section : undefined,
    });

    const token = user.generateJWT();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        email: user.email,
        role: user.role,
        status: user.status,
        learnerReferenceNo: user.learnerReferenceNo,
        grade: user.grade,
        section: user.section,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { studentId, email, password } = req.body;
    let user = null;

    if (!password) {
      return res.status(400).json({ message: 'Please provide password' });
    }


    if (studentId) {
      user = await User.findOne({ learnerReferenceNo: studentId }).select('+password');
    }
    else {
      // Find user and include password for comparison
      user = await User.findOne({ email }).select('+password');
    }


    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'Inactive') {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = user.generateJWT();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        email: user.email,
        role: user.role,
        status: user.status,
        learnerReferenceNo: user.learnerReferenceNo,
        grade: user.grade,
        section: user.section,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('subjects');

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        email: user.email,
        role: user.role,
        status: user.status,
        learnerReferenceNo: user.learnerReferenceNo,
        grade: user.grade,
        section: user.section,
        profileImage: user.profileImage,
        subjects: user.subjects,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

