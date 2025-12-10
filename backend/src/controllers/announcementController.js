import Announcement from '../models/Announcement.js';
import { deleteFromCloudinary } from '../services/cloudinaryService.js';

// @desc    Get all announcements
// @route   GET /api/v1/announcements
// @access  Private
export const getAnnouncements = async (req, res) => {
  try {
    const { audience } = req.query;
    const filter = {};

    if (audience) filter.audience = audience;

    // Students and Teachers only see their own or "All" announcements
    if (req.user.role === 'Student' || req.user.role === 'Teacher') {
      filter.$or = [
        { audience: 'All' },
        { audience: req.user.role + 's' },
      ];
    }

    const announcements = await Announcement.find(filter)
      .populate('postedBy', 'firstName lastName email')
      .sort({ datePosted: -1 });

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
      'postedBy',
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
    req.body.postedBy = req.user.id;
    req.body.datePosted = new Date();

    const announcement = await Announcement.create(req.body);
    await announcement.populate('postedBy', 'firstName lastName email');

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
    if (req.user.role === 'Teacher' && announcement.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this announcement' });
    }

    // If updating image, delete old image from Cloudinary
    if (req.body.image && req.body.image !== announcement.image && announcement.imagePublicId) {
      try {
        await deleteFromCloudinary(announcement.imagePublicId);
      } catch (error) {
        console.error('Error deleting old image from Cloudinary:', error);
        // Continue with update even if image deletion fails
      }
    }

    announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('postedBy', 'firstName lastName email');

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
    if (req.user.role === 'Teacher' && announcement.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }

    // Delete image from Cloudinary if it exists
    if (announcement.imagePublicId) {
      try {
        await deleteFromCloudinary(announcement.imagePublicId);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        // Continue with announcement deletion even if image deletion fails
      }
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

// @desc    Get announcement statistics
// @route   GET /api/v1/announcements/stats
// @access  Private (Admin)
export const getAnnouncementStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total announcements
    const total = await Announcement.countDocuments();

    // Today's announcements
    const todayCount = await Announcement.countDocuments({
      datePosted: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    // Upcoming events (announcements posted in the next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcoming = await Announcement.countDocuments({
      datePosted: {
        $gte: tomorrow,
        $lte: nextWeek,
      },
    });

    res.json({
      success: true,
      data: {
        total,
        today: todayCount,
        upcoming,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};