import mongoose from 'mongoose';

const enrollmentPeriodSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    schoolYear: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
enrollmentPeriodSchema.index({ startDate: 1, endDate: 1 });
enrollmentPeriodSchema.index({ isActive: 1 });

// Virtual to check if period is currently active based on dates
enrollmentPeriodSchema.virtual('isCurrentlyActive').get(function () {
  if (!this.isActive) return false;
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

// Method to check if a date is within the enrollment period
enrollmentPeriodSchema.methods.isDateInPeriod = function (date = new Date()) {
  if (!this.isActive) return false;
  const checkDate = new Date(date);
  return checkDate >= this.startDate && checkDate <= this.endDate;
};

export default mongoose.model('EnrollmentPeriod', enrollmentPeriodSchema);


