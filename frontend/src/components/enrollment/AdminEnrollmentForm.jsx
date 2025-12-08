import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BasicEnrollmentInfo from './BasicEnrollmentInfo';
import ReturningLearners from './ReturningLearners';
import { adminCreateEnrollment } from '../../store/slices/enrollmentSlice';
import { fetchStudentById } from '../../store/slices/studentSlice';
import styles from './AdminEnrollmentForm.module.css';
import MessageModal from '../MessageModal';

function AdminEnrollmentForm({ studentId, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.enrollments);
  const { selectedStudent } = useSelector((state) => state.students);

  // Initial form data structure
  const getInitialFormData = (currentStudentId = null) => ({
    studentId: currentStudentId || studentId || '',
    schoolYear: '',
    gradeLevelToEnroll: '',
    withLRN: false,
    returning: false,
    // Personal info (will be auto-filled but editable)
    firstName: '',
    middleName: '',
    lastName: '',
    extensionName: '',
    sex: '',
    dateOfBirth: '',
    lrn: '',
    currentAddress: '',
    permanentAddress: '',
    // New enrollment fields
    psaCertificateNo: '',
    placeOfBirth: '',
    motherTongue: '',
    religion: '',
    indigenousPeople: false,
    beneficiaryOf4Ps: false,
    fourPsHouseholdId: '',
    learnerWithDisability: false,
    typeOfDisability: [],
    // Parent/Guardian information
    fatherName: '',
    fatherContact: '',
    motherName: '',
    motherContact: '',
    guardianName: '',
    guardianContact: '',
    // Returning learner fields
    lastGradeLevelCompleted: '',
    lastSchoolYearCompleted: '',
    lastSchoolEnrolled: '',
    schoolId: '',
  });

  const [formData, setFormData] = useState(() => getInitialFormData());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ type: 'info', message: '' });

  // Reset form when studentId changes
  useEffect(() => {
    setFormData(getInitialFormData(studentId));
    setErrors({});
    setIsSubmitting(false);
    setShowMessageModal(false);
    
    if (studentId) {
      dispatch(fetchStudentById(studentId));
    }
  }, [studentId, dispatch]);

  // Auto-fill from student data
  useEffect(() => {
    if (selectedStudent && selectedStudent.userId && selectedStudent._id === studentId) {
      const user = selectedStudent.userId;
      setFormData((prev) => ({
        ...prev,
        studentId: studentId || prev.studentId,
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        extensionName: user.extensionName || '',
        sex: user.sex || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        lrn: selectedStudent.lrn || '',
        currentAddress: user.address || '',
        permanentAddress: user.address || '',
        guardianName: selectedStudent.guardianName || '',
        guardianContact: selectedStudent.guardianContact || '',
      }));
    }
  }, [selectedStudent, studentId]);

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

    // For Grade 8 and above
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

    if (!formData.studentId) {
      setMessageModalContent({
        type: 'error',
        message: 'Student account required before creating enrollment form.',
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
      // Prepare enrollment data
      const enrollmentData = {
        studentId: formData.studentId,
        schoolYear: formData.schoolYear,
        gradeLevelToEnroll: parseInt(formData.gradeLevelToEnroll),
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
        // Returning learner fields (only if returning is true)
        ...(formData.returning && {
          lastGradeLevelCompleted: formData.lastGradeLevelCompleted ? parseInt(formData.lastGradeLevelCompleted) : undefined,
          lastSchoolYearCompleted: formData.lastSchoolYearCompleted || undefined,
          lastSchoolEnrolled: formData.lastSchoolEnrolled || undefined,
          schoolId: formData.schoolId || undefined,
        }),
      };

      const result = await dispatch(adminCreateEnrollment(enrollmentData));

      if (adminCreateEnrollment.fulfilled.match(result)) {
        setMessageModalContent({
          type: 'success',
          message: 'Enrollment form created successfully!',
        });
        setShowMessageModal(true);
        if (onSuccess) onSuccess(result.payload);
        // Reset form data after successful submission
        setFormData(getInitialFormData());
        setErrors({});
        // Close modal after a short delay to show success message
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      } else {
        setMessageModalContent({
          type: 'error',
          message: result.payload || 'Failed to create enrollment form. Please try again.',
        });
        setShowMessageModal(true);
      }
    } catch (error) {
      console.error('Error creating enrollment:', error);
      setMessageModalContent({
        type: 'error',
        message: 'Failed to create enrollment form. Please try again.',
      });
      setShowMessageModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const gradeLevel = parseInt(formData.gradeLevelToEnroll);
  const isGrade8Plus = gradeLevel >= 8;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close modal">
          &times;
        </button>
        <div className={styles.modalHeader}>
          <h2>Create Enrollment Form</h2>
          {selectedStudent && selectedStudent.userId && (
            <div className={styles.studentInfo}>
              <div>
                <strong>Student:</strong> {selectedStudent.userId.firstName} {selectedStudent.userId.lastName}
              </div>
              <div>
                <strong>LRN:</strong> {selectedStudent.lrn || 'N/A'}
              </div>
            </div>
          )}
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Basic Enrollment Info - Always shown */}
          <BasicEnrollmentInfo
            formData={formData}
            handleInputChange={handleInputChange}
            handleCheckboxChange={handleCheckboxChange}
            errors={errors}
          />

          {/* Personal Information - Always shown (snapshot) */}
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
                  <label>Mother Tongue</label>
                  <input
                    type="text"
                    name="motherTongue"
                    value={formData.motherTongue}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Religion</label>
                  <input
                    type="text"
                    name="religion"
                    value={formData.religion}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.checkboxRow}>
                  <label>
                    <input
                      type="checkbox"
                      name="indigenousPeople"
                      checked={formData.indigenousPeople}
                      onChange={handleCheckboxChange}
                    />
                    Belonging to any Indigenous Peoples?
                  </label>
                </div>
                <div className={styles.checkboxRow}>
                  <label>
                    <input
                      type="checkbox"
                      name="beneficiaryOf4Ps"
                      checked={formData.beneficiaryOf4Ps}
                      onChange={handleCheckboxChange}
                    />
                    Is your family beneficiary of 4Ps?
                  </label>
                  {formData.beneficiaryOf4Ps && (
                    <div className={styles.formRow} style={{ marginTop: '8px' }}>
                      <label>4Ps Household ID number</label>
                      <input
                        type="text"
                        name="fourPsHouseholdId"
                        value={formData.fourPsHouseholdId}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>
                <div className={styles.checkboxRow}>
                  <label>
                    <input
                      type="checkbox"
                      name="learnerWithDisability"
                      checked={formData.learnerWithDisability}
                      onChange={handleCheckboxChange}
                    />
                    Learner with Disability?
                  </label>
                  {formData.learnerWithDisability && (
                    <div style={{ marginTop: '8px', marginLeft: '20px' }}>
                      <label>Type of Disability (check all that apply):</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
                        {['Visual', 'Hearing', 'Learning', 'Physical', 'Intellectual', 'Speech', 'Emotional', 'Other'].map((type) => (
                          <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="checkbox"
                              checked={formData.typeOfDisability.includes(type)}
                              onChange={() => handleDisabilityChange(type)}
                            />
                            {type}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
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
                <div className={styles.formRow}>
                  <label>Father's Name</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Father's Contact Number</label>
                  <input
                    type="text"
                    name="fatherContact"
                    value={formData.fatherContact}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Mother's Name</label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Mother's Contact Number</label>
                  <input
                    type="text"
                    name="motherContact"
                    value={formData.motherContact}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Guardian Name</label>
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Guardian Contact</label>
                  <input
                    type="text"
                    name="guardianContact"
                    value={formData.guardianContact}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Returning Learners - Only for Grade 8+ and if returning is true */}
          {isGrade8Plus && formData.returning && (
            <ReturningLearners
              formData={formData}
              handleInputChange={handleInputChange}
              errors={errors}
            />
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
              {isSubmitting || loading ? 'Creating...' : 'Create Enrollment Form'}
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

export default AdminEnrollmentForm;


