import mongoose from 'mongoose';

const loginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['Student', 'Teacher', 'Admin'],
      required: true,
    },
    loginDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
loginLogSchema.index({ userId: 1 });
loginLogSchema.index({ loginDate: 1 });
loginLogSchema.index({ role: 1 });
loginLogSchema.index({ userId: 1, loginDate: 1 });

export default mongoose.model('LoginLog', loginLogSchema);

