import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    teachingLoad: {
      type: Number,
      default: 0,
      min: 0,
    },
    emergencyContactName: {
      type: String,
      trim: true,
    },
    emergencyContactNumber: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
teacherSchema.index({ userId: 1 });
teacherSchema.index({ employeeId: 1 });
teacherSchema.index({ department: 1 });

export default mongoose.model('Teacher', teacherSchema);

