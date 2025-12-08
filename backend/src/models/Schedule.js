import mongoose from 'mongoose';

const scheduleEntrySchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    day: {
      type: String,
      enum: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
      unique: true,
    },
    schedule: {
      type: [scheduleEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
scheduleSchema.index({ sectionId: 1 });
scheduleSchema.index({ 'schedule.subjectId': 1 });
scheduleSchema.index({ 'schedule.day': 1 });

export default mongoose.model('Schedule', scheduleSchema);

