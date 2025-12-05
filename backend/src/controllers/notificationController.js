import Notification from '../models/Notification.js';

// @desc    Get all notifications for current user
// @route   GET /api/v1/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {
      userId: req.user.id,
      userRole: req.user.role,
    };

    if (status) filter.status = status;

    const notifications = await Notification.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ dateCreated: -1 })
      .limit(100);

    res.json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single notification
// @route   GET /api/v1/notifications/:id
// @access  Private
export const getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('userId', 'firstName lastName email');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Users can only view their own notifications
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark as read when viewed
    if (notification.status === 'unread') {
      notification.status = 'read';
      await notification.save();
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create notification
// @route   POST /api/v1/notifications
// @access  Private (Admin, System)
export const createNotification = async (req, res) => {
  try {
    req.body.dateCreated = new Date();
    if (!req.body.status) {
      req.body.status = 'unread';
    }

    const notification = await Notification.create(req.body);
    await notification.populate('userId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update notification (mark as read/unread)
// @route   PATCH /api/v1/notifications/:id
// @access  Private
export const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Users can only update their own notifications
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('userId', 'firstName lastName email');

    res.json({
      success: true,
      data: updatedNotification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Users can only delete their own notifications
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/v1/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, userRole: req.user.role, status: 'unread' },
      { status: 'read' }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
