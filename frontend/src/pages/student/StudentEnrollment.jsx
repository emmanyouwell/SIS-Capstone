import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createEnrollment, fetchAllEnrollments } from '../../store/slices/enrollmentSlice';
import { getMe } from '../../store/slices/authSlice';
import { fetchCurrentEnrollmentPeriod } from '../../store/slices/enrollmentPeriodSlice';
import BasicEnrollmentInfo from '../../components/enrollment/BasicEnrollmentInfo';
import ReturningLearners from '../../components/enrollment/ReturningLearners';
import styles from './StudentEnrollment.module.css';
import MessageModal from '../../components/MessageModal';

function StudentEnrollment() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { enrollments, loading: enrollmentsLoading } = useSelector((state) => state.enrollments);
  const { currentPeriod, isPeriodActive, loading: periodLoading } = useSelector(
    (state) => state.enrollmentPeriod
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ type: 'info', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Get student data
  const student = user?.roleData;
  const isPromoted = student?.isPromoted || false;
  const enrollmentStatus = student?.enrollmentStatus || false;
  const currentGradeLevel = student?.sectionId?.gradeLevel || student?.gradeLevel;
  const studentName = user ? `${user.firstName}${user.middleName ? ` ${user.middleName}` : ''} ${user.lastName}${user.extensionName ? ` ${user.extensionName}` : ''}`.trim() : '';
  const studentLRN = student?.lrn || 'N/A';
  const sectionName = student?.sectionId?.sectionName || 'N/A';

  // Get latest enrollment (create a copy before sorting to avoid mutating read-only array)
  const latestEnrollment = enrollments && enrollments.length > 0 
    ? [...enrollments].sort((a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted))[0]
    : null;

  // Initial form data structure
  const getInitialFormData = () => ({
    schoolYear: '',
    gradeLevelToEnroll: currentGradeLevel ? String(currentGradeLevel + 1) : '',
    withLRN: !!studentLRN && studentLRN !== 'N/A',
    returning: false,
    // Personal info (auto-filled from user)
    firstName: user?.firstName || '',
    middleName: user?.middleName || '',
    lastName: user?.lastName || '',
    extensionName: user?.extensionName || '',
    sex: user?.sex || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    lrn: studentLRN !== 'N/A' ? studentLRN : '',
    currentAddress: user?.address || '',
    permanentAddress: user?.address || '',
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
    guardianName: student?.guardianName || '',
    guardianContact: student?.guardianContact || '',
    // Returning learner fields
    lastGradeLevelCompleted: currentGradeLevel ? String(currentGradeLevel) : '',
    lastSchoolYearCompleted: '',
    lastSchoolEnrolled: '',
    schoolId: '',
  });

  const [formData, setFormData] = useState(getInitialFormData);

  // Fetch user data, enrollments, and enrollment period on mount
  useEffect(() => {
    if (!user?.roleData) {
      dispatch(getMe());
    }
    dispatch(fetchAllEnrollments());
    dispatch(fetchCurrentEnrollmentPeriod());
  }, [dispatch, user?.roleData]);

  // Auto-fill school year from active enrollment period
  useEffect(() => {
    if (currentPeriod && currentPeriod.schoolYear) {
      setFormData((prev) => ({
        ...prev,
        schoolYear: currentPeriod.schoolYear,
      }));
    }
  }, [currentPeriod]);

  // Auto-fill form data when user data and enrollments are available
  useEffect(() => {
    if (user && student) {
      // Get the latest enrollment to pre-fill form
      const latestEnrollmentData = latestEnrollment || {};
      
      setFormData((prev) => ({
        ...prev,
        // Basic enrollment info
        // School year is set from active enrollment period, don't override
        schoolYear: prev.schoolYear || latestEnrollmentData.schoolYear || '',
        gradeLevelToEnroll: latestEnrollmentData.gradeLevelToEnroll 
          ? String(latestEnrollmentData.gradeLevelToEnroll) 
          : (currentGradeLevel ? String(currentGradeLevel + 1) : ''),
        withLRN: latestEnrollmentData.withLRN !== undefined 
          ? latestEnrollmentData.withLRN 
          : (!!student.lrn),
        returning: latestEnrollmentData.returning || false,
        // Personal info (prefer enrollment data, fallback to user/student)
        firstName: latestEnrollmentData.firstName || user.firstName || '',
        middleName: latestEnrollmentData.middleName || user.middleName || '',
        lastName: latestEnrollmentData.lastName || user.lastName || '',
        extensionName: latestEnrollmentData.extensionName || user.extensionName || '',
        sex: latestEnrollmentData.sex || user.sex || '',
        dateOfBirth: latestEnrollmentData.dateOfBirth 
          ? new Date(latestEnrollmentData.dateOfBirth).toISOString().split('T')[0] 
          : (user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''),
        lrn: latestEnrollmentData.lrn || student.lrn || '',
        currentAddress: latestEnrollmentData.currentAddress || user.address || '',
        permanentAddress: latestEnrollmentData.permanentAddress || user.address || '',
        // Additional enrollment fields
        psaCertificateNo: latestEnrollmentData.psaCertificateNo || '',
        placeOfBirth: latestEnrollmentData.placeOfBirth || '',
        motherTongue: latestEnrollmentData.motherTongue || '',
        religion: latestEnrollmentData.religion || '',
        indigenousPeople: latestEnrollmentData.indigenousPeople || false,
        beneficiaryOf4Ps: latestEnrollmentData.beneficiaryOf4Ps || false,
        fourPsHouseholdId: latestEnrollmentData.fourPsHouseholdId || '',
        learnerWithDisability: latestEnrollmentData.learnerWithDisability || false,
        typeOfDisability: latestEnrollmentData.typeOfDisability || [],
        // Parent/Guardian information
        fatherName: latestEnrollmentData.fatherName || '',
        fatherContact: latestEnrollmentData.fatherContact || '',
        motherName: latestEnrollmentData.motherName || '',
        motherContact: latestEnrollmentData.motherContact || '',
        guardianName: latestEnrollmentData.guardianName || student.guardianName || '',
        guardianContact: latestEnrollmentData.guardianContact || student.guardianContact || '',
        // Returning learner fields
        lastGradeLevelCompleted: latestEnrollmentData.lastGradeLevelCompleted 
          ? String(latestEnrollmentData.lastGradeLevelCompleted) 
          : (currentGradeLevel ? String(currentGradeLevel) : ''),
        lastSchoolYearCompleted: latestEnrollmentData.lastSchoolYearCompleted || '',
        lastSchoolEnrolled: latestEnrollmentData.lastSchoolEnrolled || '',
        schoolId: latestEnrollmentData.schoolId || '',
      }));
    }
  }, [user, student, currentGradeLevel, latestEnrollment]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
        ? currentTypes.filter((t) => t !== disabilityType)
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

    // For Grade 8 and above, check returning learner fields if returning is true
    if (gradeLevel >= 8 && formData.returning === true) {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      const result = await dispatch(createEnrollment(enrollmentData));

      if (createEnrollment.fulfilled.match(result)) {
        const isUpdate = result.payload?.isUpdate || false;
        setMessageModalContent({
          type: 'success',
          message: isUpdate 
            ? 'Enrollment form updated successfully!'
            : 'Enrollment form submitted successfully!',
        });
        setShowMessageModal(true);
        setIsModalOpen(false);
        // Refresh enrollments
        dispatch(fetchAllEnrollments());
        // Reset form
        setFormData(getInitialFormData());
      } else {
        setMessageModalContent({
          type: 'error',
          message: result.payload || 'Failed to submit enrollment form. Please try again.',
        });
        setShowMessageModal(true);
      }
    } catch (error) {
      console.error('Error submitting enrollment:', error);
      setMessageModalContent({
        type: 'error',
        message: 'Failed to submit enrollment form. Please try again.',
      });
      setShowMessageModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  const getEnrollmentStatusDisplay = () => {
    if (!latestEnrollment) {
      return { status: 'No Enrollment', color: '#6b7280', icon: '📋' };
    }
    switch (latestEnrollment.status) {
      case 'pending':
        return { status: 'Pending', color: '#f59e0b', icon: '⏳' };
      case 'enrolled':
        return { status: 'Enrolled', color: '#10b981', icon: '✅' };
      case 'declined':
        return { status: 'Declined', color: '#ef4444', icon: '❌' };
      case 'not enrolled':
        return { status: 'Not Enrolled', color: '#6b7280', icon: '📋' };
      default:
        return { status: 'Unknown', color: '#6b7280', icon: '❓' };
    }
  };

  const statusDisplay = getEnrollmentStatusDisplay();
  const gradeLevel = parseInt(formData.gradeLevelToEnroll);
  const isGrade8Plus = gradeLevel >= 8;

  // Check if enrollment period is closed
  const isEnrollmentClosed = !periodLoading && !isPeriodActive;

  return (
    <>
      <div className={styles.mainContent}>
        <h1>Enrollment</h1>

        {/* Enrollment Period Closed Message */}
        {isEnrollmentClosed && (
          <div className={styles.enrollmentClosedBox}>
            <div className={styles.enrollmentClosedIcon}>🔒</div>
            <div className={styles.enrollmentClosedTitle}>Enrollment Period is Closed</div>
            <p className={styles.enrollmentClosedMessage}>
              Enrollment period is closed. Contact your administration for help.
            </p>
          </div>
        )}

        {/* Only show enrollment content if period is active */}
        {!isEnrollmentClosed && (
          <>

        {/* Student Information */}
        <div className={`${styles.enrollmentInfo} ${styles.fadeIn}`}>
          <div>
            <strong>Name:</strong> {studentName}
          </div>
          {currentGradeLevel && (
            <div>
              <strong>Current Grade & Section:</strong> {currentGradeLevel}
              {sectionName !== 'N/A' && `-${sectionName}`}
            </div>
          )}
          <div>
            <strong>LRN:</strong> {studentLRN}
          </div>
        </div>

        {/* Conditional UI based on isPromoted */}
        {isPromoted ? (
          /* When isPromoted === true: Show Returning Learner Form */
          <div className={`${styles.enrollmentStatusBox} ${styles.slideIn}`}>
            <div className={styles.enrollmentStatusTitle}>Enrollment for Next School Year</div>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
              You are eligible to enroll for the next school year. Please fill out the enrollment form below.
            </p>
            <button
              type="button"
              className={styles.enrollmentFormBtn}
              onClick={() => setIsModalOpen(true)}
            >
              Online Enrollment Form
            </button>
            {latestEnrollment && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f3f4f6', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  <strong>Latest Enrollment Status:</strong>{' '}
                  <span style={{ color: statusDisplay.color, fontWeight: '600' }}>
                    {statusDisplay.icon} {statusDisplay.status}
                  </span>
                </div>
                {latestEnrollment.schoolYear && (
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    <strong>School Year:</strong> {latestEnrollment.schoolYear}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* When isPromoted === false: Show Instructions and Status */
          <div className={`${styles.enrollmentStatusBox} ${styles.slideIn}`}>
            <div className={styles.enrollmentStatusTitle}>Enrollment Process</div>
            
            {/* Enrollment Status Indicator */}
            {latestEnrollment && (
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: `2px solid ${statusDisplay.color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{statusDisplay.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600', color: statusDisplay.color, fontSize: '1.1rem' }}>
                      {statusDisplay.status}
                    </div>
                    {latestEnrollment.schoolYear && (
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        School Year: {latestEnrollment.schoolYear}
                      </div>
                    )}
                  </div>
                </div>
                {latestEnrollment.remarks && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'white', borderRadius: '4px', fontSize: '0.875rem', color: '#4b5563' }}>
                    <strong>Remarks:</strong> {latestEnrollment.remarks}
                  </div>
                )}
              </div>
            )}

            {/* Instructions Section */}
            <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
              <h3 style={{ color: '#4c7a67', marginBottom: '1rem', fontSize: '1.1rem' }}>
                Next Steps for Enrollment
              </h3>
              <div style={{ background: '#f0f9ff', padding: '1.25rem', borderRadius: '8px', borderLeft: '4px solid #0ea5e9' }}>
                <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e40af', lineHeight: '1.8' }}>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <strong>Visit your Section Head</strong> to begin processing your enrollment requirements for the upcoming school year.
                  </li>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <strong>Wait for your enrollment status</strong> to be updated in the system.
                  </li>
                  <li>
                    <strong>You will receive a notification</strong> once the admin reviews and accepts your enrollment form.
                  </li>
                </ol>
              </div>
            </div>

            {/* Additional Info */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef3c7', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
              <strong>Note:</strong> Your enrollment status will be updated once all requirements are processed and approved by the administration.
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* Enrollment Modal - Only shown when isPromoted === true and period is active */}
      {isModalOpen && isPromoted && !isEnrollmentClosed && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={handleCloseModal} aria-label="Close modal">
              &times;
            </button>
            <img src="/images/logo.jpg" alt="School Logo" className={styles.modalLogo} />
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderRow}>
                <div>
                  <div>
                    <b>Name:</b> {studentName}
                  </div>
                  <div>
                    <b>LRN:</b> {studentLRN !== 'N/A' ? studentLRN : 'N/A'}
                  </div>
                </div>
                <div className={styles.modalHeaderRight}>
                  {currentGradeLevel && (
                    <div>
                      <b>Current Grade:</b> {currentGradeLevel}
                    </div>
                  )}
                  <div>
                    <b>Grade to Enroll:</b> {formData.gradeLevelToEnroll || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
            <form className={styles.modalForm} onSubmit={handleSubmit}>
              {/* Basic Enrollment Info */}
              <BasicEnrollmentInfo
                formData={formData}
                handleInputChange={handleInputChange}
                handleCheckboxChange={handleCheckboxChange}
                errors={errors}
                schoolYearReadOnly={true}
              />

              {/* Personal Information Section */}
              <div className={`${styles.modalSection} ${styles.sectionHeader}`}>
                PERSONAL INFORMATION (SNAPSHOT)
              </div>
              <div className={styles.modalSection}>
                <div className={styles.modalRow}>
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
                <div className={styles.modalRow}>
                  <label>Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.modalRow}>
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
                <div className={styles.modalRow}>
                  <label>Extension Name</label>
                  <input
                    type="text"
                    name="extensionName"
                    value={formData.extensionName}
                    onChange={handleInputChange}
                    placeholder="e.g., Jr., III"
                  />
                </div>
                <div className={styles.modalRow}>
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
                <div className={styles.modalRow}>
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>LRN</label>
                  <input
                    type="text"
                    name="lrn"
                    value={formData.lrn}
                    onChange={handleInputChange}
                    placeholder="Can be added later if not available"
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>PSA Birth Certificate No.</label>
                  <input
                    type="text"
                    name="psaCertificateNo"
                    value={formData.psaCertificateNo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Place of Birth</label>
                  <input
                    type="text"
                    name="placeOfBirth"
                    value={formData.placeOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Mother Tongue</label>
                  <input
                    type="text"
                    name="motherTongue"
                    value={formData.motherTongue}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Religion</label>
                  <input
                    type="text"
                    name="religion"
                    value={formData.religion}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.modalRow}>
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
                <div className={styles.modalRow}>
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
                    <div style={{ marginTop: '8px' }}>
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
                <div className={styles.modalRow}>
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
                <div className={styles.modalRow}>
                  <label>Current Address</label>
                  <input
                    type="text"
                    name="currentAddress"
                    value={formData.currentAddress}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Permanent Address</label>
                  <input
                    type="text"
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Father's Name</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Father's Contact Number</label>
                  <input
                    type="text"
                    name="fatherContact"
                    value={formData.fatherContact}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Mother's Name</label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Mother's Contact Number</label>
                  <input
                    type="text"
                    name="motherContact"
                    value={formData.motherContact}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Guardian Name</label>
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Guardian Contact</label>
                  <input
                    type="text"
                    name="guardianContact"
                    value={formData.guardianContact}
                    onChange={handleInputChange}
                  />
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

              {/* Modal Footer Buttons */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={styles.btnExit}
                  disabled={isSubmitting}
                >
                  Exit
                </button>
                <button
                  type="submit"
                  className={styles.btnSave}
                  disabled={isSubmitting || enrollmentsLoading}
                >
                  {isSubmitting || enrollmentsLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MessageModal
        show={showMessageModal}
        type={messageModalContent.type}
        message={messageModalContent.message}
        onClose={() => setShowMessageModal(false)}
      />
    </>
  );
}

export default StudentEnrollment;
