import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminEnrollmentPending.module.css';

function AdminEnrollmentPending() {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);

  // Mock data for pending students
  const pendingStudents = [
    { id: 'kiana', name: 'Kiana Mae L. Alvarez', grade: 'Grade 7' },
    { id: 'haven', name: 'Haven Joy E. Dayola', grade: 'Grade 9' },
    { id: 'krystoff', name: 'Krystoff A. Morales', grade: 'Grade 8' },
  ];

  // Mock data for pending enrollments by grade
  const pendingGradeData = {
    8: {
      total: 2,
      students: [
        { name: 'Kiana Mae L. Alvarez', currentGrade: 'Grade 7', enrollingTo: 'Grade 8', lrn: '0000000' },
        { name: 'Krystoff A. Morales', currentGrade: 'Grade 8', enrollingTo: 'Grade 8', lrn: '0000001' }
      ]
    },
    9: {
      total: 1,
      students: [
        { name: 'Haven Joy E. Dayola', currentGrade: 'Grade 9', enrollingTo: 'Grade 9', lrn: '0000002' }
      ]
    },
    10: {
      total: 0,
      students: []
    }
  };

  const handleViewForm = (studentId) => {
    setSelectedStudent(studentId);
    setShowEnrollModal(true);
  };

  const handleAccept = () => {
    // TODO: Implement API call to accept enrollment
    alert('Student was successfully enrolled!');
    setShowEnrollModal(false);
    setSelectedStudent(null);
  };

  const handleDecline = () => {
    // TODO: Implement API call to decline enrollment
    alert('Enrollment declined.');
    setShowEnrollModal(false);
    setSelectedStudent(null);
  };

  const handleGradeClick = (grade) => {
    setSelectedGrade(grade);
    setShowGradeModal(true);
  };

  const handleBack = () => {
    navigate('/admin/enrollment');
  };

  // Mock enrollment form data
  const getStudentForm = (studentId) => {
    const forms = {
      kiana: {
        name: 'Kiana Mae L. Alvarez',
        lrn: '0000000',
        grade: '7',
        gradeToEnroll: '8',
        schoolYear: '2023-2024',
        hasLRN: true,
        isReturning: false,
        psaNo: '1234567890',
        lastName: 'Alvarez',
        firstName: 'Kiana Mae',
        middleName: 'L.',
        sex: 'Female',
        birthdate: '01/01/2010',
        age: '13',
        placeOfBirth: 'Cityname',
        motherTongue: 'Tagalog',
        religion: 'Catholic',
        extensionName: '',
        isIndigenous: false,
        is4Ps: false,
        currentAddress: '123 Main St, Barangay, City, Province, 1000',
        permanentAddress: '123 Main St, Barangay, City, Province, 1000',
        fatherName: 'Juan Alvarez',
        fatherContact: '09123456789',
        motherName: 'Maria Alvarez',
        motherContact: '09987654321',
        guardianName: '',
        guardianContact: '',
        attachedFile: 'Alvarez_reportcard.pdf',
        fileSize: '3.0MB'
      },
      haven: {
        name: 'Haven Joy E. Dayola',
        lrn: '0000002',
        grade: '9',
        gradeToEnroll: '9',
        schoolYear: '2023-2024',
        hasLRN: true,
        isReturning: false,
        psaNo: '1234567891',
        lastName: 'Dayola',
        firstName: 'Haven Joy',
        middleName: 'E.',
        sex: 'Female',
        birthdate: '02/15/2009',
        age: '14',
        placeOfBirth: 'Cityname',
        motherTongue: 'Tagalog',
        religion: 'Catholic',
        extensionName: '',
        isIndigenous: false,
        is4Ps: false,
        currentAddress: '456 Oak St, Barangay, City, Province, 1000',
        permanentAddress: '456 Oak St, Barangay, City, Province, 1000',
        fatherName: 'John Dayola',
        fatherContact: '09111111111',
        motherName: 'Jane Dayola',
        motherContact: '09222222222',
        guardianName: '',
        guardianContact: '',
        attachedFile: 'Dayola_reportcard.pdf',
        fileSize: '2.5MB'
      },
      krystoff: {
        name: 'Krystoff A. Morales',
        lrn: '0000001',
        grade: '8',
        gradeToEnroll: '8',
        schoolYear: '2023-2024',
        hasLRN: true,
        isReturning: false,
        psaNo: '1234567892',
        lastName: 'Morales',
        firstName: 'Krystoff',
        middleName: 'A.',
        sex: 'Male',
        birthdate: '03/20/2010',
        age: '13',
        placeOfBirth: 'Cityname',
        motherTongue: 'Tagalog',
        religion: 'Catholic',
        extensionName: '',
        isIndigenous: false,
        is4Ps: false,
        currentAddress: '789 Pine St, Barangay, City, Province, 1000',
        permanentAddress: '789 Pine St, Barangay, City, Province, 1000',
        fatherName: 'Pedro Morales',
        fatherContact: '09333333333',
        motherName: 'Ana Morales',
        motherContact: '09444444444',
        guardianName: '',
        guardianContact: '',
        attachedFile: 'Morales_reportcard.pdf',
        fileSize: '2.8MB'
      }
    };
    return forms[studentId] || null;
  };

  const studentForm = selectedStudent ? getStudentForm(selectedStudent) : null;
  const gradeData = selectedGrade ? pendingGradeData[selectedGrade] : null;

  return (
    <div className={styles.mainContent}>
      <div className={styles.pendingCard}>
        <table className={styles.pendingTable}>
          <tbody>
            {pendingStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.grade}</td>
                <td>
                  <button
                    className={styles.pendingViewBtn}
                    onClick={() => handleViewForm(student.id)}
                  >
                    View form
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.pendingViewall}>
          <a href="#" onClick={(e) => { e.preventDefault(); }}>
            &raquo; view all
          </a>
        </div>
      </div>

      <div className={styles.pendingCard} style={{ marginTop: '24px' }}>
        <div className={styles.pendingUpcomingLabel}>
          View pending enrollment for upcoming:
        </div>
        <div className={styles.pendingGradeBtnRow}>
          <button
            className={`${styles.pendingGradeBtn} ${styles.grade8}`}
            onClick={() => handleGradeClick(8)}
          >
            Grade 8
          </button>
          <button
            className={`${styles.pendingGradeBtn} ${styles.grade9}`}
            onClick={() => handleGradeClick(9)}
          >
            Grade 9
          </button>
          <button
            className={`${styles.pendingGradeBtn} ${styles.grade10}`}
            onClick={() => handleGradeClick(10)}
          >
            Grade 10
          </button>
        </div>
      </div>

      <button
        className={styles.backFabBtn}
        onClick={handleBack}
        title="Back"
      >
        <svg width="32" height="32" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      {/* Enrollment Form Modal */}
      {showEnrollModal && studentForm && (
        <div className={styles.enrollModal} onClick={() => setShowEnrollModal(false)}>
          <div className={styles.enrollModalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => setShowEnrollModal(false)}
            >
              &times;
            </button>
            <div className={styles.enrollmentForm}>
              <div className={styles.formHeader}>
                <div>
                  <div>Name: {studentForm.name}</div>
                  <div>LRN: {studentForm.lrn}</div>
                </div>
                <div>
                  <div>Grade: {studentForm.grade}</div>
                  <div>Grade to Enroll: {studentForm.gradeToEnroll}</div>
                </div>
              </div>

              <form className={styles.enrollForm}>
                <div className={styles.formSection}>
                  <div className={styles.formRow}>
                    <label>
                      <strong>School Year</strong>
                      <input type="text" value={studentForm.schoolYear} readOnly />
                    </label>
                    <label>
                      <strong>Grade level to Enroll</strong>
                      <input type="text" value={studentForm.gradeToEnroll} readOnly />
                    </label>
                    <div className={styles.checkboxGroup}>
                      <span>With LRN?</span>
                      <label>
                        <input type="checkbox" checked={studentForm.hasLRN} readOnly />
                        Yes
                      </label>
                      <label>
                        <input type="checkbox" checked={!studentForm.hasLRN} readOnly />
                        No
                      </label>
                    </div>
                    <div className={styles.checkboxGroup}>
                      <span>Returning (Balik-Aral)?</span>
                      <label>
                        <input type="checkbox" checked={studentForm.isReturning} readOnly />
                        Yes
                      </label>
                      <label>
                        <input type="checkbox" checked={!studentForm.isReturning} readOnly />
                        No
                      </label>
                    </div>
                  </div>
                </div>

                <div className={styles.sectionHeader}>LEARNER INFORMATION</div>

                <div className={styles.formRow}>
                  <label>
                    PSA Certificate No.
                    <input type="text" value={studentForm.psaNo} readOnly />
                  </label>
                  <label>
                    Learner Reference No. (LRN)
                    <input type="text" value={studentForm.lrn} readOnly />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>
                    Last Name
                    <input type="text" value={studentForm.lastName} readOnly />
                  </label>
                  <label>
                    First Name
                    <input type="text" value={studentForm.firstName} readOnly />
                  </label>
                  <label>
                    Middle Name
                    <input type="text" value={studentForm.middleName} readOnly />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>
                    Sex
                    <div className={styles.radioGroup}>
                      <label>
                        <input type="radio" checked={studentForm.sex === 'Female'} readOnly />
                        Female
                      </label>
                      <label>
                        <input type="radio" checked={studentForm.sex === 'Male'} readOnly />
                        Male
                      </label>
                    </div>
                  </label>
                  <label>
                    Birthdate
                    <input type="text" value={studentForm.birthdate} readOnly />
                  </label>
                  <label>
                    Age
                    <input type="text" value={studentForm.age} readOnly />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>
                    Place of Birth
                    <input type="text" value={studentForm.placeOfBirth} readOnly />
                  </label>
                  <label>
                    Mother Tongue
                    <input type="text" value={studentForm.motherTongue} readOnly />
                  </label>
                  <label>
                    Religion
                    <input type="text" value={studentForm.religion} readOnly />
                  </label>
                </div>

                <label>
                  Extension Name (if any)
                  <input type="text" value={studentForm.extensionName} readOnly />
                </label>

                <div className={styles.checkboxGroup}>
                  <span>Belonging to any Indigenous Peoples?</span>
                  <label>
                    <input type="checkbox" checked={studentForm.isIndigenous} readOnly />
                    Yes
                  </label>
                  <label>
                    <input type="checkbox" checked={!studentForm.isIndigenous} readOnly />
                    No
                  </label>
                </div>

                <div className={styles.checkboxGroup}>
                  <span>Is your family beneficiary of 4Ps?</span>
                  <label>
                    <input type="checkbox" checked={studentForm.is4Ps} readOnly />
                    Yes
                  </label>
                  <label>
                    <input type="checkbox" checked={!studentForm.is4Ps} readOnly />
                    No
                  </label>
                </div>

                <label>
                  Current Address
                  <input type="text" value={studentForm.currentAddress} readOnly />
                </label>

                <label>
                  Permanent Address
                  <input type="text" value={studentForm.permanentAddress} readOnly />
                </label>

                <div className={styles.sectionHeader}>PARENT'S/GUARDIAN'S INFORMATION</div>

                <div className={styles.formRow}>
                  <label>
                    Father's Name
                    <input type="text" value={studentForm.fatherName} readOnly />
                  </label>
                  <label>
                    Contact Number
                    <input type="text" value={studentForm.fatherContact} readOnly />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>
                    Mother's Name
                    <input type="text" value={studentForm.motherName} readOnly />
                  </label>
                  <label>
                    Contact Number
                    <input type="text" value={studentForm.motherContact} readOnly />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>
                    Guardian's Name
                    <input type="text" value={studentForm.guardianName || ''} readOnly />
                  </label>
                  <label>
                    Contact Number
                    <input type="text" value={studentForm.guardianContact || ''} readOnly />
                  </label>
                </div>

                <div className={styles.attachedFile}>
                  Attached File:{' '}
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    {studentForm.attachedFile}
                  </a>
                  <span> ({studentForm.fileSize})</span>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.declineBtn}
                    onClick={handleDecline}
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    className={styles.acceptBtn}
                    onClick={handleAccept}
                  >
                    Accept
                  </button>
                </div>

                <div className={styles.notesSection}>
                  <label>
                    Notes:
                    <input type="text" placeholder="(Optional)" />
                  </label>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Grade Details Modal */}
      {showGradeModal && gradeData && (
        <div className={styles.gradeModal} onClick={() => setShowGradeModal(false)}>
          <div className={styles.gradeModalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => setShowGradeModal(false)}
            >
              &times;
            </button>
            <h3 className={styles.modalTitle}>
              Grade {selectedGrade} - Pending Enrollment
            </h3>
            <div className={styles.modalStats}>
              <div className={styles.modalStatsLabel}>Total Pending Students</div>
              <div className={styles.modalStatsCount}>{gradeData.total}</div>
            </div>
            <div className={styles.modalSection}>
              <div className={styles.modalSectionTitle}>Pending Students List:</div>
              <div className={styles.pendingStudentsList}>
                {gradeData.students.length === 0 ? (
                  <div className={styles.emptyState}>
                    No pending enrollments for this grade.
                  </div>
                ) : (
                  gradeData.students.map((student, index) => (
                    <div key={index} className={styles.studentCard}>
                      <div className={styles.studentInfo}>
                        <div className={styles.studentName}>{student.name}</div>
                        <div className={styles.studentDetails}>LRN: {student.lrn}</div>
                        <div className={styles.studentDetails}>
                          Current: {student.currentGrade} → Enrolling to: {student.enrollingTo}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => setShowGradeModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEnrollmentPending;

