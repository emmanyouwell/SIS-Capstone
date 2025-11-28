import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    gradeLevel: {
      type: Number,
      required: true,
      min: 7,
      max: 10,
    },
    schoolYear: {
      type: String,
      required: true,
    },
    q1: {
      type: Number,
      min: 0,
      max: 100,
    },
    q2: {
      type: Number,
      min: 0,
      max: 100,
    },
    q3: {
      type: Number,
      min: 0,
      max: 100,
    },
    q4: {
      type: Number,
      min: 0,
      max: 100,
    },
    remarks: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['completed', 'incomplete', 'failed'],
      default: 'incomplete',
    },
    finalGrade: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate final grade before saving
gradeSchema.pre('save', function (next) {
  const grades = [this.q1, this.q2, this.q3, this.q4].filter(
    (g) => g !== null && g !== undefined
  );
  if (grades.length > 0) {
    this.finalGrade = grades.reduce((a, b) => a + b, 0) / grades.length;
    if (this.finalGrade >= 75) {
      this.status = 'completed';
    } else {
      this.status = 'failed';
    }
  }
  next();
});

export default mongoose.model('Grade', gradeSchema);

