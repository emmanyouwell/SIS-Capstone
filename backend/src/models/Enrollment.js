import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    gradeToEnroll: {
      type: Number,
      required: true,
      min: 7,
      max: 10, // Support Grade 7-10 only
    },
    gradeLevelToEnroll: {
      type: Number,
      required: true,
      min: 7,
      max: 10, // Support Grade 7-10 only
    },
    schoolYear: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'enrolled', 'declined'],
      default: 'pending',
    },
    withLRN: {
      type: Boolean,
      default: false,
    },
    returning: {
      type: Boolean,
      default: false,
    },
    dateSubmitted: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
    },
    // New enrollment fields
    psaCertificateNo: {
      type: String,
      trim: true,
    },
    placeOfBirth: {
      type: String,
      trim: true,
    },
    motherTongue: {
      type: String,
      trim: true,
    },
    religion: {
      type: String,
      trim: true,
    },
    indigenousPeople: {
      type: Boolean,
      default: false,
    },
    beneficiaryOf4Ps: {
      type: Boolean,
      default: false,
    },
    fourPsHouseholdId: {
      type: String,
      trim: true,
    },
    learnerWithDisability: {
      type: Boolean,
      default: false,
    },
    typeOfDisability: {
      type: [String],
      default: [],
    },
    currentAddress: {
      type: String,
      trim: true,
    },
    permanentAddress: {
      type: String,
      trim: true,
    },
    // Returning learner fields (optional)
    lastGradeLevelCompleted: {
      type: Number,
      min: 1,
      max: 10,
    },
    lastSchoolYearCompleted: {
      type: String,
      trim: true,
    },
    lastSchoolAttended: {
      type: String,
      trim: true,
    },
    lastSchoolEnrolled: {
      type: String,
      trim: true,
    },
    schoolId: {
      type: String,
      trim: true,
    },
    // Personal information snapshot (always saved)
    firstName: {
      type: String,
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    extensionName: {
      type: String,
      trim: true,
    },
    sex: {
      type: String,
      enum: ['Male', 'Female'],
    },
    dateOfBirth: {
      type: Date,
    },
    lrn: {
      type: String,
      trim: true,
    },
    guardianName: {
      type: String,
      trim: true,
    },
    guardianContact: {
      type: String,
      trim: true,
    },
    // Parent information
    fatherName: {
      type: String,
      trim: true,
    },
    fatherContact: {
      type: String,
      trim: true,
    },
    motherName: {
      type: String,
      trim: true,
    },
    motherContact: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to sync gradeToEnroll and gradeLevelToEnroll
enrollmentSchema.pre('save', async function () {
  // Sync gradeToEnroll with gradeLevelToEnroll for backward compatibility
  if (this.gradeLevelToEnroll && !this.gradeToEnroll) {
    this.gradeToEnroll = this.gradeLevelToEnroll;
  }
  if (this.gradeToEnroll && !this.gradeLevelToEnroll) {
    this.gradeLevelToEnroll = this.gradeToEnroll;
  }
  
});

// Indexes for better query performance
enrollmentSchema.index({ studentId: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ schoolYear: 1 });
enrollmentSchema.index({ dateSubmitted: -1 });

export default mongoose.model('Enrollment', enrollmentSchema);
