import Message from '../models/Message.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

// @desc    Get all messages
// @route   GET /api/v1/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { receiverId, receiverRole, status } = req.query;
    const filter = {
      $or: [
        { senderId: req.user.id },
        { receiverId: req.user.id },
        { receiverRole: req.user.role },
        { receiverRole: 'All' },
      ],
      status: { $ne: 'deleted' },
    };

    if (receiverId) filter.receiverId = receiverId;
    if (receiverRole) filter.receiverRole = receiverRole;
    if (status) filter.status = status;

    const messages = await Message.find(filter)
      .populate('senderId', 'firstName lastName email')
      .populate('receiverId', 'firstName lastName email')
      .sort({ dateSent: -1 });

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
      .populate('senderId', 'firstName lastName email')
      .populate('receiverId', 'firstName lastName email');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user has access to this message
    const hasAccess =
      message.senderId._id.toString() === req.user.id ||
      message.receiverId?._id?.toString() === req.user.id ||
      message.receiverRole === req.user.role ||
      message.receiverRole === 'All';

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark as read if not already read
    if (message.status === 'sent') {
      message.status = 'read';
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
    req.body.senderRole = req.user.role;
    req.body.senderId = req.user.id;
    req.body.dateSent = new Date();
    req.body.status = 'sent';

    // Handle receiver types
    if (req.body.receiverRole === 'All Students') {
      const students = await Student.find().populate('userId');
      req.body.receiverId = null; // No specific receiver
      req.body.receiverRole = 'All Students';
    } else if (req.body.receiverRole === 'All Teachers') {
      req.body.receiverId = null;
      req.body.receiverRole = 'All Teachers';
    } else if (req.body.receiverRole === 'All') {
      req.body.receiverId = null;
      req.body.receiverRole = 'All';
    }

    const message = await Message.create(req.body);
    await message.populate('senderId', 'firstName lastName email');
    if (message.receiverId) {
      await message.populate('receiverId', 'firstName lastName email');
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
    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this message' });
    }

    const updatedMessage = await Message.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('senderId', 'firstName lastName email')
      .populate('receiverId', 'firstName lastName email');

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

    // Only sender or receiver can delete
    const canDelete =
      message.senderId.toString() === req.user.id ||
      message.receiverId?.toString() === req.user.id;

    if (!canDelete) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    // Soft delete by updating status
    message.status = 'deleted';
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
