import mongoose from 'mongoose';

const masterlistSchema = new mongoose.Schema(
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
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
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

// Compound index for unique grade-section-schoolYear combinations
masterlistSchema.index({ grade: 1, section: 1, schoolYear: 1 }, { unique: true });

export default mongoose.model('Masterlist', masterlistSchema);

