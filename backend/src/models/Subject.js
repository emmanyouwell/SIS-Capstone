import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
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
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
subjectSchema.index({ teacherId: 1 });
subjectSchema.index({ sectionId: 1 });
subjectSchema.index({ gradeLevel: 1 });
subjectSchema.index({ status: 1 });
subjectSchema.index({ createdBy: 1 });

export default mongoose.model('Subject', subjectSchema);

