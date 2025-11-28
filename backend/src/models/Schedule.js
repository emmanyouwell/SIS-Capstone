import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    grade: {
      type: Number,
      required: true,
      min: 7,
      max: 10,
    },
    section: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    adviser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    schoolYear: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique schedule entries
scheduleSchema.index({ grade: 1, section: 1, timeSlot: 1, day: 1, schoolYear: 1 }, { unique: true });

export default mongoose.model('Schedule', scheduleSchema);

