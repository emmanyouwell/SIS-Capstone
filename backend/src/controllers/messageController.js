import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Get all messages
// @route   GET /api/v1/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { recipient, sender, read } = req.query;
    const filter = {
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id },
        { recipientIds: req.user.id },
      ],
      deletedBy: { $ne: req.user.id },
    };

    if (recipient) filter.recipient = recipient;
    if (sender) filter.sender = sender;
    if (read !== undefined) {
      if (read === 'true') {
        filter.readBy = { $elemMatch: { user: req.user.id } };
      } else {
        filter.readBy = { $not: { $elemMatch: { user: req.user.id } } };
      }
    }

    const messages = await Message.find(filter)
      .populate('sender', 'firstName lastName email profileImage')
      .populate('recipient', 'firstName lastName email profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single message
// @route   GET /api/v1/messages/:id
// @access  Private
export const getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'firstName lastName email profileImage')
      .populate('recipient', 'firstName lastName email profileImage');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user has access to this message
    const hasAccess =
      message.sender._id.toString() === req.user.id ||
      message.recipient?._id?.toString() === req.user.id ||
      message.recipientIds?.some((id) => id.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark as read if not already read by this user
    const alreadyRead = message.readBy.some(
      (r) => r.user.toString() === req.user.id
    );
    if (!alreadyRead) {
      message.readBy.push({ user: req.user.id });
      await message.save();
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create message
// @route   POST /api/v1/messages
// @access  Private
export const createMessage = async (req, res) => {
  try {
    req.body.sender = req.user.id;

    // Handle recipient types
    if (req.body.recipientType === 'All Students') {
      const students = await User.find({ role: 'Student' });
      req.body.recipientIds = students.map((s) => s._id);
    } else if (req.body.recipientType === 'All Teachers') {
      const teachers = await User.find({ role: 'Teacher' });
      req.body.recipientIds = teachers.map((t) => t._id);
    } else if (req.body.recipientType === 'Grade') {
      const students = await User.find({
        role: 'Student',
        grade: req.body.grade,
      });
      req.body.recipientIds = students.map((s) => s._id);
    } else if (req.body.recipientType === 'Section') {
      const students = await User.find({
        role: 'Student',
        grade: req.body.grade,
        section: req.body.section,
      });
      req.body.recipientIds = students.map((s) => s._id);
    }

    const message = await Message.create(req.body);
    await message.populate('sender', 'firstName lastName email profileImage');
    if (message.recipient) {
      await message.populate('recipient', 'firstName lastName email profileImage');
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update message
// @route   PATCH /api/v1/messages/:id
// @access  Private (Sender only)
export const updateMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can update
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this message' });
    }

    const updatedMessage = await Message.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('sender', 'firstName lastName email profileImage')
      .populate('recipient', 'firstName lastName email profileImage');

    res.json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete message (soft delete)
// @route   DELETE /api/v1/messages/:id
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Add user to deletedBy array
    if (!message.deletedBy.includes(req.user.id)) {
      message.deletedBy.push(req.user.id);
      await message.save();
    }

    res.json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

