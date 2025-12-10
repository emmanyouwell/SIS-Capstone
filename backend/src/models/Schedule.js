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
    },
    schedule: {
      type: [scheduleEntrySchema],
      default: [],
    },
    schoolYear: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
scheduleSchema.index({ sectionId: 1 });
scheduleSchema.index({ 'schedule.subjectId': 1 });
scheduleSchema.index({ 'schedule.day': 1 });
scheduleSchema.index({ schoolYear: 1 });
// Compound unique index: one schedule per section per school year
scheduleSchema.index({ sectionId: 1, schoolYear: 1 }, { unique: true });

export default mongoose.model('Schedule', scheduleSchema);

