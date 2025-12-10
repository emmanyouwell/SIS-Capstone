import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    audience: {
      type: String,
      enum: ['All', 'Students', 'Teachers', 'Admin', 'Specific'],
      default: 'All',
    },
    datePosted: {
      type: Date,
      default: Date.now,
    },
    image: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
announcementSchema.index({ postedBy: 1 });
announcementSchema.index({ audience: 1 });
announcementSchema.index({ datePosted: -1 });

export default mongoose.model('Announcement', announcementSchema);

