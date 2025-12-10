import mongoose from 'mongoose';
import { getGradeDescriptor } from '../utils/gradeUtils.js';

const gradeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolYear: {
      type: String,
      required: true,
    },
    grades: [
      {
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
          required: true,
        },
        q1: { type: Number, min: 0, max: 100 },
        q2: { type: Number, min: 0, max: 100 },
        q3: { type: Number, min: 0, max: 100 },
        q4: { type: Number, min: 0, max: 100 },
      },
    ],
    finalGrade: {
      type: Number,
      min: 0,
      max: 100,
    },
    remarks: {
      type: String,
      trim: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    dateRecorded: {
      type: Date,
      default: Date.now,
    },
    gradeCompleteMessageSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
gradeSchema.index({ studentId: 1 });
gradeSchema.index({ dateRecorded: -1 });
gradeSchema.index({ schoolYear: 1 });

// Compound unique index to prevent duplicate grades per student per school year
gradeSchema.index({ studentId: 1, schoolYear: 1 }, { unique: true });

// Calculate final grade before saving based on all subject quarters
gradeSchema.pre('save', async function () {
  const subjectGrades = this.grades || [];

  const allQuarterGrades = [];

  subjectGrades.forEach((sg) => {
    ['q1', 'q2', 'q3', 'q4'].forEach((q) => {
      const value = sg[q];
      if (value !== null && value !== undefined) {
        allQuarterGrades.push(value);
      }
    });
  });

  if (allQuarterGrades.length > 0) {
    const sum = allQuarterGrades.reduce((acc, val) => acc + val, 0);
    this.finalGrade = sum / allQuarterGrades.length;
    
    // Automatically set remarks based on final grade if not already set
    if (!this.remarks || this.remarks.trim() === '') {
      const { remarks } = getGradeDescriptor(this.finalGrade);
      this.remarks = remarks;
    }
  }
});

export default mongoose.model('Grade', gradeSchema);

