import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    gradeToEnroll: {
      type: Number,
      required: true,
      min: 7,
      max: 10,
    },
    schoolYear: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'enrolled', 'declined'],
      default: 'pending',
    },
    dateSubmitted: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
enrollmentSchema.index({ studentId: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ schoolYear: 1 });
enrollmentSchema.index({ dateSubmitted: -1 });

export default mongoose.model('Enrollment', enrollmentSchema);
