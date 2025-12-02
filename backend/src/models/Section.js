import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: Number,
      required: true,
      min: 7,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique grade-section combinations
sectionSchema.index({ grade: 1, name: 1 }, { unique: true });

export default mongoose.model('Section', sectionSchema);

