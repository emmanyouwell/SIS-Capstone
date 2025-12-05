import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    assignedOffice: {
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
adminSchema.index({ userId: 1 });
adminSchema.index({ employeeId: 1 });

export default mongoose.model('Admin', adminSchema);

