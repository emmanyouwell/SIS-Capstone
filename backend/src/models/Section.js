import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    sectionName: {
      type: String,
      required: true,
      trim: true,
    },
    gradeLevel: {
      type: Number,
      required: true,
      min: 7,
      max: 10,
    },
    adviserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    capacity: {
      type: Number,
      default: 40,
      min: 1,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Full'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
sectionSchema.index({ gradeLevel: 1 });
sectionSchema.index({ adviserId: 1 });
sectionSchema.index({ status: 1 });
// Compound index for unique grade-section combinations
sectionSchema.index({ gradeLevel: 1, sectionName: 1 }, { unique: true });

export default mongoose.model('Section', sectionSchema);

