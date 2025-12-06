import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
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
  {
    timestamps: true,
  }
);

// Indexes for better query performance
scheduleSchema.index({ sectionId: 1 });
scheduleSchema.index({ subjectId: 1 });
scheduleSchema.index({ day: 1 });
scheduleSchema.index({ sectionId: 1, subjectId: 1, day: 1 }); // Compound index for efficient queries

export default mongoose.model('Schedule', scheduleSchema);

