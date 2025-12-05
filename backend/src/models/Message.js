import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderRole: {
      type: String,
      enum: ['Student', 'Teacher', 'Admin'],
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverRole: {
      type: String,
      enum: ['Student', 'Teacher', 'Admin', 'All'],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    messageText: {
      type: String,
      required: true,
    },
    dateSent: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['sent', 'read', 'deleted'],
      default: 'sent',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1 });
messageSchema.index({ dateSent: -1 });
messageSchema.index({ status: 1 });

export default mongoose.model('Message', messageSchema);

