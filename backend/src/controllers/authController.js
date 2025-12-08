import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Admin from '../models/Admin.js';

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public (or Admin only in production)
export const register = async (req, res) => {
  try {
    const { firstName, lastName, middleName, email, password, role, status, contactNumber, address, dateOfBirth, ...roleSpecificData } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      middleName: middleName || '',
      email,
      password,
      role,
      status: status || 'Active',
      contactNumber,
      address,
      dateOfBirth,
      sex: req.body.sex,
      extensionName: req.body.extensionName || '',
    });

    // Create role-specific record
    if (role === 'Student') {
      const studentData = {
        userId: user._id,
        enrollmentStatus: false, // New students default to not enrolled
      };
      // LRN and gradeLevel are optional - can be added later via enrollment form
      if (roleSpecificData.lrn) {
        studentData.lrn = roleSpecificData.lrn;
      }
      if (roleSpecificData.gradeLevel) {
        studentData.gradeLevel = roleSpecificData.gradeLevel;
      }
      if (roleSpecificData.sectionId) {
        studentData.sectionId = roleSpecificData.sectionId;
      }
      // Guardian fields are optional - can be added later via enrollment form
      if (roleSpecificData.guardianName) {
        studentData.guardianName = roleSpecificData.guardianName;
      }
      if (roleSpecificData.guardianContact) {
        studentData.guardianContact = roleSpecificData.guardianContact;
      }
      await Student.create(studentData);
    } else if (role === 'Teacher') {
      await Teacher.create({
        userId: user._id,
        employeeId: roleSpecificData.employeeId,
        department: roleSpecificData.department,
        position: roleSpecificData.position,
        // teachingLoad is now automatically calculated from schedules, not set during registration
        emergencyContactName: roleSpecificData.emergencyContactName,
        emergencyContactNumber: roleSpecificData.emergencyContactNumber,
      });
    } else if (role === 'Admin') {
      await Admin.create({
        userId: user._id,
        employeeId: roleSpecificData.employeeId,
        position: roleSpecificData.position,
        department: roleSpecificData.department,
        assignedOffice: roleSpecificData.assignedOffice,
      });
    }

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
      // Find student by LRN, then get user
      const student = await Student.findOne({ lrn: studentId }).populate('userId');
      if (student && student.userId) {
        user = await User.findById(student.userId._id).select('+password');
      }
    } else {
      // Find user by email
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
    const user = await User.findById(req.user.id);

    // Get role-specific data
    let roleData = null;
    if (user.role === 'Student') {
      roleData = await Student.findOne({ userId: user._id })
        .populate('sectionId', 'sectionName gradeLevel')
        .populate('subjects.subjectId', 'subjectName gradeLevel');
    } else if (user.role === 'Teacher') {
      roleData = await Teacher.findOne({ userId: user._id });
    } else if (user.role === 'Admin') {
      roleData = await Admin.findOne({ userId: user._id });
    }

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
        contactNumber: user.contactNumber,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        roleData,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
