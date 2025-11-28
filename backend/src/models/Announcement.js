import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: String,
      enum: ['All', 'Students', 'Teachers', 'Admin', 'Specific'],
      default: 'All',
    },
    recipientIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    image: {
      url: String,
      cloudinaryId: String,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['general', 'message', 'announcement'],
      default: 'announcement',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Announcement', announcementSchema);

