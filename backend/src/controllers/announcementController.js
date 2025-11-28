import Announcement from '../models/Announcement.js';

// @desc    Get all announcements
// @route   GET /api/v1/announcements
// @access  Private
export const getAnnouncements = async (req, res) => {
  try {
    const { recipient, pinned, type } = req.query;
    const filter = {};

    if (recipient) filter.recipient = recipient;
    if (pinned !== undefined) filter.pinned = pinned === 'true';
    if (type) filter.type = type;

    // Students and Teachers only see their own or "All" announcements
    if (req.user.role === 'Student' || req.user.role === 'Teacher') {
      filter.$or = [
        { recipient: 'All' },
        { recipient: req.user.role + 's' },
        { recipientIds: req.user._id },
      ];
    }

    const announcements = await Announcement.find(filter)
      .populate('sender', 'firstName lastName email')
      .sort({ pinned: -1, createdAt: -1 });

    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single announcement
// @route   GET /api/v1/announcements/:id
// @access  Private
export const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate(
      'sender',
      'firstName lastName email'
    );

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create announcement
// @route   POST /api/v1/announcements
// @access  Private (Admin, Teacher)
export const createAnnouncement = async (req, res) => {
  try {
    req.body.sender = req.user.id;

    const announcement = await Announcement.create(req.body);
    await announcement.populate('sender', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update announcement
// @route   PATCH /api/v1/announcements/:id
// @access  Private (Admin, Teacher - own announcements)
export const updateAnnouncement = async (req, res) => {
  try {
    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Teachers can only update their own announcements
    if (req.user.role === 'Teacher' && announcement.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this announcement' });
    }

    announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('sender', 'firstName lastName email');

    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/v1/announcements/:id
// @access  Private (Admin, Teacher - own announcements)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Teachers can only delete their own announcements
    if (req.user.role === 'Teacher' && announcement.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }

    await announcement.deleteOne();

    res.json({
      success: true,
      message: 'Announcement deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

