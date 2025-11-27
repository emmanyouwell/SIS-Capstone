import { useState, useEffect } from 'react';
import styles from './StudentEnrollment.module.css';

function StudentEnrollment() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    // School Year Section
    schoolYear: '',
    withLRN: false,
    returningBalikAral: false,
    gradeLevelToEnroll: '',
    
    // Learner Information
    psaCertificateNo: '',
    learnerReferenceNo: '',
    lastName: '',
    firstName: '',
    middleName: '',
    sex: '',
    birthdate: '',
    age: '',
    placeOfBirth: '',
    motherTongue: '',
    religion: '',
    extensionName: '',
    indigenousPeoples: false,
    family4Ps: false,
    fourPsHouseholdId: '',
    
    // Current Address
    currentHouseNo: '',
    currentBarangay: '',
    currentProvince: '',
    currentZipCode: '',
    currentMunicipality: '',
    currentCountry: '',
    
    // Permanent Address
    sameAsCurrent: false,
    permanentHouseNo: '',
    permanentBarangay: '',
    permanentProvince: '',
    permanentZipCode: '',
    permanentMunicipality: '',
    permanentCountry: '',
    
    // Parent's/Guardian's Information
    fatherLastName: '',
    fatherFirstName: '',
    fatherMiddleName: '',
    fatherContact: '',
    motherLastName: '',
    motherFirstName: '',
    motherMiddleName: '',
    motherContact: '',
    guardianLastName: '',
    guardianFirstName: '',
    guardianMiddleName: '',
    guardianContact: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill with student data (in a real app, this would come from API/auth context)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      firstName: 'Kiana Mae',
      lastName: 'Alvarez',
      middleName: 'L.',
      learnerReferenceNo: '823194756201',
      gradeLevelToEnroll: '8',
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleRadioChange = (e) => {
    setFormData(prev => ({
      ...prev,
      sex: e.target.value,
    }));
    if (errors.sex) {
      setErrors(prev => ({
        ...prev,
        sex: '',
      }));
    }
  };

  const handleSameAsCurrentChange = (e) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      sameAsCurrent: checked,
      ...(checked ? {
        permanentHouseNo: prev.currentHouseNo,
        permanentBarangay: prev.currentBarangay,
        permanentProvince: prev.currentProvince,
        permanentZipCode: prev.currentZipCode,
        permanentMunicipality: prev.currentMunicipality,
        permanentCountry: prev.currentCountry,
      } : {
        permanentHouseNo: '',
        permanentBarangay: '',
        permanentProvince: '',
        permanentZipCode: '',
        permanentMunicipality: '',
        permanentCountry: '',
      }),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required text fields
    const requiredFields = [
      'schoolYear', 'gradeLevelToEnroll', 'psaCertificateNo', 'learnerReferenceNo',
      'lastName', 'firstName', 'middleName', 'birthdate', 'age', 'placeOfBirth',
      'motherTongue', 'religion', 'currentHouseNo', 'currentBarangay', 'currentProvince',
      'currentZipCode', 'currentMunicipality', 'currentCountry',
      'fatherLastName', 'fatherFirstName', 'fatherMiddleName', 'fatherContact',
      'motherLastName', 'motherFirstName', 'motherMiddleName', 'motherContact',
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // Validate sex (radio button)
    if (!formData.sex) {
      newErrors.sex = 'Please select sex';
    }

    // Validate permanent address if not same as current
    if (!formData.sameAsCurrent) {
      const permanentFields = [
        'permanentHouseNo', 'permanentBarangay', 'permanentProvince',
        'permanentZipCode', 'permanentMunicipality', 'permanentCountry',
      ];
      permanentFields.forEach(field => {
        if (!formData[field] || formData[field].toString().trim() === '') {
          newErrors[field] = 'This field is required';
        }
      });
    }

    // Validate 4Ps ID if family is 4Ps beneficiary
    if (formData.family4Ps && (!formData.fourPsHouseholdId || formData.fourPsHouseholdId.trim() === '')) {
      newErrors.fourPsHouseholdId = '4Ps Household ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      // await enrollmentAPI.submitEnrollment(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Enrollment form submitted successfully!');
      setIsModalOpen(false);
      // Reset form or show success message
    } catch (error) {
      console.error('Error submitting enrollment:', error);
      alert('Failed to submit enrollment form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    if (!isModalOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  return (
    <>
    <div className={styles.mainContent}>
        <h1>Enrollment</h1>
        
        <div className={`${styles.enrollmentInfo} ${styles.fadeIn}`}>
          <div><strong>Name:</strong> Kiana Mae L. Alvarez</div>
          <div><strong>Grade & Section:</strong> 8-Lilac</div>
          <div><strong>LRN:</strong> 823194756201</div>
        </div>

        <div className={`${styles.enrollmentStatusBox} ${styles.slideIn}`}>
          <div className={styles.enrollmentStatusTitle}>Pending Enrollment</div>
          <button
            type="button"
            className={styles.enrollmentFormBtn}
            onClick={() => setIsModalOpen(true)}
          >
            Online Enrollment Form
          </button>
          <div className={styles.enrollmentSyNext}>S.Y. 2025 - 2026</div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleModalOverlayClick}>
          <div className={styles.modalContent}>
            <button
              className={styles.modalClose}
              onClick={handleCloseModal}
              aria-label="Close modal"
            >
              &times;
            </button>
            <img
              src="/images/logo.jpg"
              alt="School Logo"
              className={styles.modalLogo}
            />
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderRow}>
                <div>
                  <div><b>Name:</b> Kiana Mae A. Alvarez</div>
                  <div><b>LRN:</b> {formData.learnerReferenceNo || '0000000'}</div>
                </div>
                <div className={styles.modalHeaderRight}>
                  <div><b>Grade:</b> 7</div>
                  <div><b>Grade to Enroll:</b> 8</div>
                </div>
              </div>
            </div>
            <form className={styles.modalForm} onSubmit={handleSubmit}>
              {/* School Year Section */}
              <div className={styles.modalSection}>
                <div className={styles.modalRow}>
                  <label>School Year</label>
                  <input
                    type="text"
                    name="schoolYear"
                    value={formData.schoolYear}
                    onChange={handleInputChange}
                    style={{ width: '120px' }}
                    className={errors.schoolYear ? styles.inputError : ''}
                  />
                  <span style={{ marginLeft: '24px' }}>Check the appropriate box only</span>
                  <label style={{ marginLeft: '12px' }}>With LRN?</label>
                  <input
                    type="checkbox"
                    name="withLRN"
                    checked={formData.withLRN}
                    onChange={handleInputChange}
                  />
                  <label style={{ marginLeft: '12px' }}>Returning Balik-Aral?</label>
                  <input
                    type="checkbox"
                    name="returningBalikAral"
                    checked={formData.returningBalikAral}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Grade level to Enroll</label>
                  <input
                    type="text"
                    name="gradeLevelToEnroll"
                    value={formData.gradeLevelToEnroll}
                    onChange={handleInputChange}
                    style={{ width: '60px' }}
                    className={errors.gradeLevelToEnroll ? styles.inputError : ''}
                  />
                </div>
              </div>

              {/* Learner Information Section */}
              <div className={`${styles.modalSection} ${styles.sectionHeader}`}>
                LEARNER INFORMATION
              </div>
              <div className={styles.modalSection}>
                <div className={styles.modalRow}>
                  <label>PSA Certificate No.</label>
                  <input
                    type="text"
                    name="psaCertificateNo"
                    value={formData.psaCertificateNo}
                    onChange={handleInputChange}
                    style={{ width: '140px' }}
                    className={errors.psaCertificateNo ? styles.inputError : ''}
                  />
                  <label style={{ marginLeft: '24px' }}>Learner Reference No. (LRN)</label>
                  <input
                    type="text"
                    name="learnerReferenceNo"
                    value={formData.learnerReferenceNo}
                    onChange={handleInputChange}
                    style={{ width: '140px' }}
                    className={errors.learnerReferenceNo ? styles.inputError : ''}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Student's Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    style={{ width: '120px' }}
                    className={errors.lastName ? styles.inputError : ''}
                  />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    style={{ width: '120px' }}
                    className={errors.firstName ? styles.inputError : ''}
                  />
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    placeholder="Middle Name"
                    style={{ width: '120px' }}
                    className={errors.middleName ? styles.inputError : ''}
                  />
                  <label style={{ marginLeft: '24px' }}>Sex</label>
                  <input
                    type="radio"
                    name="sex"
                    value="Male"
                    checked={formData.sex === 'Male'}
                    onChange={handleRadioChange}
                  /> Male
                  <input
                    type="radio"
                    name="sex"
                    value="Female"
                    checked={formData.sex === 'Female'}
                    onChange={handleRadioChange}
                  /> Female
                  <label style={{ marginLeft: '24px' }}>Birthdate</label>
                  <input
                    type="text"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    placeholder="MM/DD/YYYY"
                    style={{ width: '110px' }}
                    className={errors.birthdate ? styles.inputError : ''}
                  />
                  <label style={{ marginLeft: '12px' }}>Age</label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    style={{ width: '40px' }}
                    className={errors.age ? styles.inputError : ''}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Place of Birth</label>
                  <input
                    type="text"
                    name="placeOfBirth"
                    value={formData.placeOfBirth}
                    onChange={handleInputChange}
                    style={{ width: '140px' }}
                    className={errors.placeOfBirth ? styles.inputError : ''}
                  />
                  <label style={{ marginLeft: '24px' }}>Mother Tongue</label>
                  <input
                    type="text"
                    name="motherTongue"
                    value={formData.motherTongue}
                    onChange={handleInputChange}
                    style={{ width: '120px' }}
                    className={errors.motherTongue ? styles.inputError : ''}
                  />
                  <label style={{ marginLeft: '24px' }}>Religion</label>
                  <input
                    type="text"
                    name="religion"
                    value={formData.religion}
                    onChange={handleInputChange}
                    style={{ width: '120px' }}
                    className={errors.religion ? styles.inputError : ''}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Extension Name (e.g. Jr., III)</label>
                  <input
                    type="text"
                    name="extensionName"
                    value={formData.extensionName}
                    onChange={handleInputChange}
                    placeholder="Leave blank if not applicable"
                    style={{ width: '180px' }}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Belonging to any indigenous Peoples?</label>
                  <input
                    type="checkbox"
                    name="indigenousPeoples"
                    checked={formData.indigenousPeoples}
                    onChange={handleInputChange}
                  />
                  <label style={{ marginLeft: '24px' }}>Is your family beneficiary of 4Ps?</label>
                  <input
                    type="checkbox"
                    name="family4Ps"
                    checked={formData.family4Ps}
                    onChange={handleInputChange}
                  />
                  {formData.family4Ps && (
                    <>
                      <label style={{ marginLeft: '24px' }}>If Yes, 4Ps Household ID number</label>
                      <input
                        type="text"
                        name="fourPsHouseholdId"
                        value={formData.fourPsHouseholdId}
                        onChange={handleInputChange}
                        style={{ width: '120px' }}
                        className={errors.fourPsHouseholdId ? styles.inputError : ''}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Address Section */}
              <div className={styles.modalSection}>
                <div className={styles.modalRow}>
                  <label>Current Address</label>
                  <input
                    type="text"
                    name="currentHouseNo"
                    value={formData.currentHouseNo}
                    onChange={handleInputChange}
                    placeholder="House No./Street"
                    style={{ width: '120px' }}
                    className={errors.currentHouseNo ? styles.inputError : ''}
                  />
                  <input
                    type="text"
                    name="currentBarangay"
                    value={formData.currentBarangay}
                    onChange={handleInputChange}
                    placeholder="Barangay"
                    style={{ width: '100px' }}
                    className={errors.currentBarangay ? styles.inputError : ''}
                  />
                  <input
                    type="text"
                    name="currentProvince"
                    value={formData.currentProvince}
                    onChange={handleInputChange}
                    placeholder="Province"
                    style={{ width: '100px' }}
                    className={errors.currentProvince ? styles.inputError : ''}
                  />
                  <input
                    type="text"
                    name="currentZipCode"
                    value={formData.currentZipCode}
                    onChange={handleInputChange}
                    placeholder="Zip Code"
                    style={{ width: '80px' }}
                    className={errors.currentZipCode ? styles.inputError : ''}
                  />
                  <input
                    type="text"
                    name="currentMunicipality"
                    value={formData.currentMunicipality}
                    onChange={handleInputChange}
                    placeholder="Municipality/City"
                    style={{ width: '120px' }}
                    className={errors.currentMunicipality ? styles.inputError : ''}
                  />
                  <input
                    type="text"
                    name="currentCountry"
                    value={formData.currentCountry}
                    onChange={handleInputChange}
                    placeholder="Country"
                    style={{ width: '100px' }}
                    className={errors.currentCountry ? styles.inputError : ''}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Permanent Address</label>
                  <input
                    type="checkbox"
                    name="sameAsCurrent"
                    checked={formData.sameAsCurrent}
                    onChange={handleSameAsCurrentChange}
                  /> Same with Current Address
                  {!formData.sameAsCurrent && (
                    <>
                      <input
                        type="text"
                        name="permanentHouseNo"
                        value={formData.permanentHouseNo}
                        onChange={handleInputChange}
                        placeholder="House No./Street"
                        style={{ width: '120px' }}
                        className={errors.permanentHouseNo ? styles.inputError : ''}
                      />
                      <input
                        type="text"
                        name="permanentBarangay"
                        value={formData.permanentBarangay}
                        onChange={handleInputChange}
                        placeholder="Barangay"
                        style={{ width: '100px' }}
                        className={errors.permanentBarangay ? styles.inputError : ''}
                      />
                      <input
                        type="text"
                        name="permanentProvince"
                        value={formData.permanentProvince}
                        onChange={handleInputChange}
                        placeholder="Province"
                        style={{ width: '100px' }}
                        className={errors.permanentProvince ? styles.inputError : ''}
                      />
                      <input
                        type="text"
                        name="permanentZipCode"
                        value={formData.permanentZipCode}
                        onChange={handleInputChange}
                        placeholder="Zip Code"
                        style={{ width: '80px' }}
                        className={errors.permanentZipCode ? styles.inputError : ''}
                      />
                      <input
                        type="text"
                        name="permanentMunicipality"
                        value={formData.permanentMunicipality}
                        onChange={handleInputChange}
                        placeholder="Municipality/City"
                        style={{ width: '120px' }}
                        className={errors.permanentMunicipality ? styles.inputError : ''}
                      />
                      <input
                        type="text"
                        name="permanentCountry"
                        value={formData.permanentCountry}
                        onChange={handleInputChange}
                        placeholder="Country"
                        style={{ width: '100px' }}
                        className={errors.permanentCountry ? styles.inputError : ''}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Parent's/Guardian's Information Section */}
              <div className={`${styles.modalSection} ${styles.sectionHeader}`}>
                PARENT'S/GUARDIAN'S INFORMATION
              </div>
              <div className={styles.modalSection}>
                <div className={styles.modalRow}>
                  <label>Father's Name</label>
                  <input
                    type="text"
                    name="fatherLastName"
                    value={formData.fatherLastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    style={{ width: '100px' }}
                    className={errors.fatherLastName ? styles.inputError : ''}
                  />
                  <input
                    type="text"
                    name="fatherFirstName"
                    value={formData.fatherFirstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    style={{ width: '100px' }}
                    className={errors.fatherFirstName ? styles.inputError : ''}
                  />
                  <input
                    type="text"
                    name="fatherMiddleName"
                    value={formData.fatherMiddleName}
                    onChange={handleInputChange}
                    placeholder="Middle Name"
                    style={{ width: '100px' }}
                    className={errors.fatherMiddleName ? styles.inputError : ''}
                  />
                  <label style={{ marginLeft: '24px' }}>Contact Number</label>
                  <input
                    type="text"
                    name="fatherContact"
                    value={formData.fatherContact}
                    onChange={handleInputChange}
                    style={{ width: '120px' }}
                    className={errors.fatherContact ? styles.inputError : ''}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Mother's Name</label>
                  <input
                    type="text"
                    name="motherLastName"
                    value={formData.motherLastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    style={{ width: '100px' }}
                    className={errors.motherLastName ? styles.inputError : ''}
                  />
                  <input
                    type="text"
                    name="motherFirstName"
                    value={formData.motherFirstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    style={{ width: '100px' }}
                    className={errors.motherFirstName ? styles.inputError : ''}
                  />
                  <input
                    type="text"
                    name="motherMiddleName"
                    value={formData.motherMiddleName}
                    onChange={handleInputChange}
                    placeholder="Middle Name"
                    style={{ width: '100px' }}
                    className={errors.motherMiddleName ? styles.inputError : ''}
                  />
                  <label style={{ marginLeft: '24px' }}>Contact Number</label>
                  <input
                    type="text"
                    name="motherContact"
                    value={formData.motherContact}
                    onChange={handleInputChange}
                    style={{ width: '120px' }}
                    className={errors.motherContact ? styles.inputError : ''}
                  />
                </div>
                <div className={styles.modalRow}>
                  <label>Guardian's Name</label>
                  <input
                    type="text"
                    name="guardianLastName"
                    value={formData.guardianLastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    style={{ width: '100px' }}
                  />
                  <input
                    type="text"
                    name="guardianFirstName"
                    value={formData.guardianFirstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    style={{ width: '100px' }}
                  />
                  <input
                    type="text"
                    name="guardianMiddleName"
                    value={formData.guardianMiddleName}
                    onChange={handleInputChange}
                    placeholder="Middle Name"
                    style={{ width: '100px' }}
                  />
                  <label style={{ marginLeft: '24px' }}>Contact Number</label>
                  <input
                    type="text"
                    name="guardianContact"
                    value={formData.guardianContact}
                    onChange={handleInputChange}
                    style={{ width: '120px' }}
                  />
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={styles.btnExit}
                >
                  Exit
                </button>
                <button
                  type="submit"
                  className={styles.btnSave}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
  );
}

export default StudentEnrollment;

