import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Grade from '../models/Grade.js';
import Student from '../models/Student.js';
import LoginLog from '../models/LoginLog.js';

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

// @desc    Get login statistics
// @route   GET /api/v1/users/stats/logins
// @access  Private (Admin)
export const getLoginStats = async (req, res) => {
  try {
    const { role } = req.query;
    
    const filter = { status: 'Active' };
    if (role) {
      filter.role = role;
    }

    // Get all active users with their login counts
    const users = await User.find(filter)
      .select('totalLogins role firstName lastName email')
      .sort({ totalLogins: -1 });

    // Calculate statistics
    const totalUsers = users.length;
    const totalLogins = users.reduce((sum, user) => sum + (user.totalLogins || 0), 0);
    const averageLogins = totalUsers > 0 ? (totalLogins / totalUsers).toFixed(2) : 0;

    // Group by role if no specific role filter
    let roleStats = {};
    if (!role) {
      const roles = ['Student', 'Teacher', 'Admin'];
      roles.forEach(r => {
        const roleUsers = users.filter(u => u.role === r);
        roleStats[r] = {
          count: roleUsers.length,
          totalLogins: roleUsers.reduce((sum, u) => sum + (u.totalLogins || 0), 0),
          averageLogins: roleUsers.length > 0 
            ? (roleUsers.reduce((sum, u) => sum + (u.totalLogins || 0), 0) / roleUsers.length).toFixed(2)
            : 0
        };
      });
    }

    // Top users by login count
    const topUsers = users.slice(0, 10).map(user => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      totalLogins: user.totalLogins || 0,
    }));

    res.json({
      success: true,
      data: {
        totalUsers,
        totalLogins,
        averageLogins,
        roleStats,
        topUsers,
        allUsers: users.map(user => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          totalLogins: user.totalLogins || 0,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get daily login counts for a date range
// @route   GET /api/v1/users/stats/logins/daily
// @access  Private (Admin)
export const getDailyLoginStats = async (req, res) => {
  try {
    const { startDate, endDate, role } = req.query;

    // Helper function to parse date string as local date (avoiding UTC interpretation)
    const parseLocalDate = (dateString) => {
      if (!dateString) return null;
      const parts = dateString.split('-').map(Number);
      if (parts.length !== 3) return null;
      // Create date in local timezone (month is 0-indexed)
      return new Date(parts[0], parts[1] - 1, parts[2]);
    };

    // Default to last 7 days if no dates provided
    let end, start;
    if (endDate) {
      end = parseLocalDate(endDate);
      if (!end) {
        return res.status(400).json({ message: 'Invalid endDate format. Use YYYY-MM-DD' });
      }
      // Set to end of day
      end.setHours(23, 59, 59, 999);
    } else {
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    if (startDate) {
      start = parseLocalDate(startDate);
      if (!start) {
        return res.status(400).json({ message: 'Invalid startDate format. Use YYYY-MM-DD' });
      }
      // Set to start of day
      start.setHours(0, 0, 0, 0);
    } else {
      start = new Date();
      start.setDate(start.getDate() - 6); // 6 days ago + today = 7 days
      start.setHours(0, 0, 0, 0);
    }

    // Build filter
    const filter = {
      loginDate: {
        $gte: start,
        $lte: end,
      },
    };

    if (role) {
      filter.role = role;
    }

    // Get all login logs in the date range
    const loginLogs = await LoginLog.find(filter).sort({ loginDate: 1 });

    // Group by date and role
    const dailyStats = {};
    const roleFilter = role || null;

    loginLogs.forEach((log) => {
      // Convert loginDate to local date string (YYYY-MM-DD)
      // MongoDB stores dates in UTC, so we need to convert to local timezone
      const logDate = new Date(log.loginDate);
      
      // Get local date components (this handles timezone conversion)
      const year = logDate.getFullYear();
      const month = String(logDate.getMonth() + 1).padStart(2, '0');
      const day = String(logDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          date: dateKey,
          total: 0,
          byRole: {
            Student: 0,
            Teacher: 0,
            Admin: 0,
          },
        };
      }

      dailyStats[dateKey].total += 1;
      if (log.role && log.role in dailyStats[dateKey].byRole) {
        dailyStats[dateKey].byRole[log.role] += 1;
      }
    });

    // Convert to array and fill in missing dates
    const result = [];
    
    // Use the actual start and end dates to generate the range
    const currentDate = new Date(start);
    const endDateObj = new Date(end);
    
    // Loop through all dates including the end date
    while (currentDate <= endDateObj) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      if (dailyStats[dateKey]) {
        if (roleFilter) {
          result.push({
            date: dateKey,
            count: dailyStats[dateKey].byRole[roleFilter] || 0,
          });
        } else {
          result.push({
            date: dateKey,
            count: dailyStats[dateKey].total,
            byRole: dailyStats[dateKey].byRole,
          });
        }
      } else {
        // Fill in missing dates with zero counts
        if (roleFilter) {
          result.push({
            date: dateKey,
            count: 0,
          });
        } else {
          result.push({
            date: dateKey,
            count: 0,
            byRole: {
              Student: 0,
              Teacher: 0,
              Admin: 0,
            },
          });
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Format dates for response (use local date strings)
    const formatDateString = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    res.json({
      success: true,
      data: {
        startDate: formatDateString(start),
        endDate: formatDateString(end),
        role: roleFilter,
        dailyStats: result,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

