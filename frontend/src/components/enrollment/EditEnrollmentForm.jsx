import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BasicEnrollmentInfo from './BasicEnrollmentInfo';
import ReturningLearners from './ReturningLearners';
import { updateEnrollment } from '../../store/slices/enrollmentSlice';
import { fetchCurrentEnrollmentPeriod } from '../../store/slices/enrollmentPeriodSlice';
import styles from './AdminEnrollmentForm.module.css';
import MessageModal from '../MessageModal';

function EditEnrollmentForm({ enrollment, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.enrollments);
  const { currentPeriod } = useSelector((state) => state.enrollmentPeriod);

  // Initialize form data from enrollment
  const getInitialFormData = () => {
    if (!enrollment) return {};
    
    return {
      schoolYear: enrollment.schoolYear || '',
      gradeLevelToEnroll: enrollment.gradeLevelToEnroll || enrollment.gradeToEnroll || '',
      withLRN: enrollment.withLRN || false,
      returning: enrollment.returning || false,
      // Personal info snapshot
      firstName: enrollment.firstName || '',
      middleName: enrollment.middleName || '',
      lastName: enrollment.lastName || '',
      extensionName: enrollment.extensionName || '',
      sex: enrollment.sex || '',
      dateOfBirth: enrollment.dateOfBirth ? new Date(enrollment.dateOfBirth).toISOString().split('T')[0] : '',
      lrn: enrollment.lrn || '',
      currentAddress: enrollment.currentAddress || '',
      permanentAddress: enrollment.permanentAddress || '',
      // New enrollment fields
      psaCertificateNo: enrollment.psaCertificateNo || '',
      placeOfBirth: enrollment.placeOfBirth || '',
      motherTongue: enrollment.motherTongue || '',
      religion: enrollment.religion || '',
      indigenousPeople: enrollment.indigenousPeople || false,
      beneficiaryOf4Ps: enrollment.beneficiaryOf4Ps || false,
      fourPsHouseholdId: enrollment.fourPsHouseholdId || '',
      learnerWithDisability: enrollment.learnerWithDisability || false,
      typeOfDisability: enrollment.typeOfDisability || [],
      // Parent/Guardian information
      fatherName: enrollment.fatherName || '',
      fatherContact: enrollment.fatherContact || '',
      motherName: enrollment.motherName || '',
      motherContact: enrollment.motherContact || '',
      guardianName: enrollment.guardianName || '',
      guardianContact: enrollment.guardianContact || '',
      // Returning learner fields (important for students enrolling to next school year)
      lastGradeLevelCompleted: enrollment.lastGradeLevelCompleted || '',
      lastSchoolYearCompleted: enrollment.lastSchoolYearCompleted || '',
      lastSchoolEnrolled: enrollment.lastSchoolEnrolled || '',
      schoolId: enrollment.schoolId || '',
    };
  };

  const [formData, setFormData] = useState(() => getInitialFormData());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ type: 'info', message: '' });

  // Fetch enrollment period on mount
  useEffect(() => {
    dispatch(fetchCurrentEnrollmentPeriod());
  }, [dispatch]);

  // Update school year from active enrollment period
  useEffect(() => {
    if (currentPeriod && currentPeriod.schoolYear) {
      setFormData((prev) => ({
        ...prev,
        schoolYear: currentPeriod.schoolYear,
      }));
    }
  }, [currentPeriod]);

  // Update form data when enrollment changes
  useEffect(() => {
    if (enrollment) {
      setFormData(getInitialFormData());
      setErrors({});
    }
  }, [enrollment]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleDisabilityChange = (disabilityType) => {
    setFormData((prev) => {
      const currentTypes = prev.typeOfDisability || [];
      const updatedTypes = currentTypes.includes(disabilityType)
        ? currentTypes.filter(t => t !== disabilityType)
        : [...currentTypes, disabilityType];
      return {
        ...prev,
        typeOfDisability: updatedTypes,
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    const gradeLevel = parseInt(formData.gradeLevelToEnroll);

    // Basic required fields
    if (!formData.schoolYear) {
      newErrors.schoolYear = 'School year is required';
    }
    if (!formData.gradeLevelToEnroll) {
      newErrors.gradeLevelToEnroll = 'Grade level to enroll is required';
    }
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.sex) {
      newErrors.sex = 'Sex is required';
    }

    // For Grade 8 and above, returning learner fields are important
    if (gradeLevel >= 8) {
      if (formData.returning === true) {
        if (!formData.lastGradeLevelCompleted) {
          newErrors.lastGradeLevelCompleted = 'Last grade level completed is required for returning learners';
        }
        if (!formData.lastSchoolYearCompleted) {
          newErrors.lastSchoolYearCompleted = 'Last school year completed is required for returning learners';
        }
        if (!formData.lastSchoolEnrolled) {
          newErrors.lastSchoolEnrolled = 'Last school enrolled is required for returning learners';
        }
        if (!formData.schoolId) {
          newErrors.schoolId = 'School ID is required for returning learners';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!enrollment || !enrollment._id) {
      setMessageModalContent({
        type: 'error',
        message: 'Enrollment data not found.',
      });
      setShowMessageModal(true);
      return;
    }

    if (!validateForm()) {
      setMessageModalContent({
        type: 'error',
        message: 'Please fill out all required fields.',
      });
      setShowMessageModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare enrollment update data
      const updateData = {
        schoolYear: formData.schoolYear,
        gradeLevelToEnroll: parseInt(formData.gradeLevelToEnroll),
        gradeToEnroll: parseInt(formData.gradeLevelToEnroll),
        withLRN: formData.withLRN,
        returning: formData.returning,
        // Personal info snapshot
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        extensionName: formData.extensionName,
        sex: formData.sex,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
        lrn: formData.lrn || undefined,
        currentAddress: formData.currentAddress,
        permanentAddress: formData.permanentAddress,
        // New enrollment fields
        psaCertificateNo: formData.psaCertificateNo || undefined,
        placeOfBirth: formData.placeOfBirth || undefined,
        motherTongue: formData.motherTongue || undefined,
        religion: formData.religion || undefined,
        indigenousPeople: formData.indigenousPeople || false,
        beneficiaryOf4Ps: formData.beneficiaryOf4Ps || false,
        fourPsHouseholdId: formData.beneficiaryOf4Ps ? (formData.fourPsHouseholdId || undefined) : undefined,
        learnerWithDisability: formData.learnerWithDisability || false,
        typeOfDisability: formData.learnerWithDisability ? (formData.typeOfDisability || []) : [],
        // Parent/Guardian information
        fatherName: formData.fatherName || undefined,
        fatherContact: formData.fatherContact || undefined,
        motherName: formData.motherName || undefined,
        motherContact: formData.motherContact || undefined,
        guardianName: formData.guardianName || undefined,
        guardianContact: formData.guardianContact || undefined,
        // Returning learner fields (important for students enrolling to next school year)
        ...(formData.returning && {
          lastGradeLevelCompleted: formData.lastGradeLevelCompleted ? parseInt(formData.lastGradeLevelCompleted) : undefined,
          lastSchoolYearCompleted: formData.lastSchoolYearCompleted || undefined,
          lastSchoolEnrolled: formData.lastSchoolEnrolled || undefined,
          schoolId: formData.schoolId || undefined,
        }),
      };

      const result = await dispatch(
        updateEnrollment({
          id: enrollment._id,
          data: updateData,
        })
      );

      if (updateEnrollment.fulfilled.match(result)) {
        setMessageModalContent({
          type: 'success',
          message: 'Enrollment form updated successfully!',
        });
        setShowMessageModal(true);
        if (onSuccess) onSuccess(result.payload);
        // Close modal after a short delay to show success message
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      } else {
        setMessageModalContent({
          type: 'error',
          message: result.payload || 'Failed to update enrollment form. Please try again.',
        });
        setShowMessageModal(true);
      }
    } catch (error) {
      console.error('Error updating enrollment:', error);
      setMessageModalContent({
        type: 'error',
        message: 'Failed to update enrollment form. Please try again.',
      });
      setShowMessageModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!enrollment) {
    return null;
  }

  const gradeLevel = parseInt(formData.gradeLevelToEnroll);
  const isGrade8Plus = gradeLevel >= 8;
  const studentName = enrollment.firstName && enrollment.lastName
    ? `${enrollment.firstName} ${enrollment.middleName || ''} ${enrollment.lastName} ${enrollment.extensionName || ''}`.trim()
    : enrollment.studentId?.userId
      ? `${enrollment.studentId.userId.firstName || ''} ${enrollment.studentId.userId.middleName || ''} ${enrollment.studentId.userId.lastName || ''} ${enrollment.studentId.userId.extensionName || ''}`.trim()
      : 'Unknown Student';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close modal">
          &times;
        </button>
        <div className={styles.modalHeader}>
          <h2>Edit Enrollment Form</h2>
          <div className={styles.studentInfo}>
            <div>
              <strong>Student:</strong> {studentName}
            </div>
            <div>
              <strong>LRN:</strong> {enrollment.lrn || enrollment.studentId?.lrn || 'N/A'}
            </div>
          </div>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Basic Enrollment Info - Always shown */}
          <BasicEnrollmentInfo
            formData={formData}
            handleInputChange={handleInputChange}
            handleCheckboxChange={handleCheckboxChange}
            errors={errors}
            schoolYearReadOnly={true}
          />

          {/* Personal Information - Display snapshot (read-only or editable) */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>PERSONAL INFORMATION (SNAPSHOT)</div>
            <div className={styles.formContent}>
              <div className={styles.formGrid}>
                <div className={styles.formRow}>
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={errors.firstName ? styles.inputError : ''}
                    required
                  />
                  {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
                </div>
                <div className={styles.formRow}>
                  <label>Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={errors.lastName ? styles.inputError : ''}
                    required
                  />
                  {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
                </div>
                <div className={styles.formRow}>
                  <label>Extension Name</label>
                  <input
                    type="text"
                    name="extensionName"
                    value={formData.extensionName}
                    onChange={handleInputChange}
                    placeholder="e.g., Jr., III"
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Sex *</label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    className={errors.sex ? styles.inputError : ''}
                    required
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.sex && <span className={styles.errorText}>{errors.sex}</span>}
                </div>
                <div className={styles.formRow}>
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>LRN</label>
                  <input
                    type="text"
                    name="lrn"
                    value={formData.lrn}
                    onChange={handleInputChange}
                    placeholder="Can be added later if not available"
                  />
                </div>
                {/* Other personal info fields - condensed view */}
                <div className={styles.formRow}>
                  <label>PSA Birth Certificate No.</label>
                  <input
                    type="text"
                    name="psaCertificateNo"
                    value={formData.psaCertificateNo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Place of Birth</label>
                  <input
                    type="text"
                    name="placeOfBirth"
                    value={formData.placeOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Current Address</label>
                  <input
                    type="text"
                    name="currentAddress"
                    value={formData.currentAddress}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Permanent Address</label>
                  <input
                    type="text"
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Returning Learners - IMPORTANT: Focus on this for students enrolling to next school year */}
          {isGrade8Plus && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>RETURNING LEARNER INFORMATION (IMPORTANT)</div>
              <div className={styles.formContent}>
                <div className={styles.checkboxRow} style={{ marginBottom: '1rem' }}>
                  <label>
                    <input
                      type="checkbox"
                      name="returning"
                      checked={formData.returning}
                      onChange={handleCheckboxChange}
                    />
                    <strong>Returning Learner (Balik-Aral)?</strong> - Check if student is enrolling to the next school year
                  </label>
                </div>
                {formData.returning && (
                  <ReturningLearners
                    formData={formData}
                    handleInputChange={handleInputChange}
                    errors={errors}
                  />
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.btnCancel}
              disabled={isSubmitting || loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? 'Updating...' : 'Update Enrollment Form'}
            </button>
          </div>
        </form>
      </div>
      <MessageModal
        show={showMessageModal}
        type={messageModalContent.type}
        message={messageModalContent.message}
        onClose={() => setShowMessageModal(false)}
      />
    </div>
  );
}

export default EditEnrollmentForm;

