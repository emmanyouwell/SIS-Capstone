import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userRole: {
      type: String,
      enum: ['Student', 'Teacher', 'Admin'],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['unread', 'read'],
      default: 'unread',
    },
    type: {
      type: String,
      enum: ['message', 'grade', 'announcement', 'enrollment', 'other'],
      default: 'other',
    },
    link: {
      type: String,
      trim: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      // Can reference Message, Grade, Announcement, etc.
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
notificationSchema.index({ userId: 1 });
notificationSchema.index({ userRole: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ dateCreated: -1 });

export default mongoose.model('Notification', notificationSchema);

