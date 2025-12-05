import mongoose from 'mongoose';

const materialsSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    uploadedByRole: {
      type: String,
      enum: ['Student', 'Teacher', 'Admin'],
      required: true,
    },
    uploadedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    file: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
        required: true,
      },
    },
    dateUploaded: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
materialsSchema.index({ subjectId: 1 });
materialsSchema.index({ uploadedById: 1 });
materialsSchema.index({ dateUploaded: -1 });

export default mongoose.model('Materials', materialsSchema);

