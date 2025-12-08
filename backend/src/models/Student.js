import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    lrn: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    gradeLevel: {
      type: Number,
      required: false, // Can be added later via enrollment form
      min: 7,
      max: 10,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
    },
    guardianName: {
      type: String,
      trim: true,
    },
    guardianContact: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    enrollmentStatus: {
      type: Boolean,
      default: false,
    },
    subjects: [
      {
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
          required: true,
        },
        dateJoined: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
studentSchema.index({ userId: 1 });
studentSchema.index({ sectionId: 1 });
studentSchema.index({ gradeLevel: 1 });
studentSchema.index({ lrn: 1 });

export default mongoose.model('Student', studentSchema);

