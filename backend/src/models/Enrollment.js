import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schoolYear: {
      type: String,
      required: true,
    },
    withLRN: {
      type: Boolean,
      default: false,
    },
    returningBalikAral: {
      type: Boolean,
      default: false,
    },
    gradeLevelToEnroll: {
      type: Number,
      required: true,
      min: 7,
      max: 10,
    },
    // Learner Information
    psaCertificateNo: String,
    learnerReferenceNo: String,
    lastName: String,
    firstName: String,
    middleName: String,
    sex: String,
    birthdate: Date,
    age: Number,
    placeOfBirth: String,
    motherTongue: String,
    religion: String,
    extensionName: String,
    indigenousPeoples: Boolean,
    family4Ps: Boolean,
    fourPsHouseholdId: String,
    // Addresses
    currentAddress: {
      houseNo: String,
      barangay: String,
      municipality: String,
      province: String,
      zipCode: String,
      country: String,
    },
    permanentAddress: {
      houseNo: String,
      barangay: String,
      municipality: String,
      province: String,
      zipCode: String,
      country: String,
    },
    // Parent/Guardian Info
    fatherInfo: {
      lastName: String,
      firstName: String,
      middleName: String,
      contact: String,
    },
    motherInfo: {
      lastName: String,
      firstName: String,
      middleName: String,
      contact: String,
    },
    guardianInfo: {
      lastName: String,
      firstName: String,
      middleName: String,
      contact: String,
    },
    // Documents
    attachments: [
      {
        name: String,
        url: String,
        cloudinaryId: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'enrolled', 'declined'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Enrollment', enrollmentSchema);

