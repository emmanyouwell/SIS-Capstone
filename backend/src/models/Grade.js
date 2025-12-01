import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    grades: {
      subjects: [
        {
          subject: {
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
    },
    remarks: { type: String, trim: true },
    status: {
      type: String,
      enum: ['completed', 'incomplete', 'failed'],
      default: 'incomplete',
    },
    finalGrade: { type: Number, min: 0, max: 100 },
  },
  {
    timestamps: true,
  }
);

// Calculate final grade before saving based on all subject quarters
gradeSchema.pre('save', async function () {
  const subjects = this.grades?.subjects || [];

  const allQuarterGrades = [];

  subjects.forEach((s) => {
    ['q1', 'q2', 'q3', 'q4'].forEach((q) => {
      const value = s[q];
      if (value !== null && value !== undefined) {
        allQuarterGrades.push(value);
      }
    });
  });

  if (allQuarterGrades.length > 0) {
    const sum = allQuarterGrades.reduce((acc, val) => acc + val, 0);
    this.finalGrade = sum / allQuarterGrades.length;
    if (this.finalGrade >= 75) {
      this.status = 'completed';
    } else {
      this.status = 'failed';
    }
  }

  
});

export default mongoose.model('Grade', gradeSchema);

