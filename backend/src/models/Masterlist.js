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
      ref: 'Teacher',
    },
    schoolYear: {
      type: String,
      required: true,
    },
    subjectTeachers: [
      {
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
          required: true,
        },
        teacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Teacher',
          required: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for unique grade-section-schoolYear combinations
masterlistSchema.index({ grade: 1, section: 1, schoolYear: 1 }, { unique: true });

export default mongoose.model('Masterlist', masterlistSchema);

